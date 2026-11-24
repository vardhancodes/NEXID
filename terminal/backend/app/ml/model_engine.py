import yfinance as yf
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from sklearn.linear_model import Ridge, LinearRegression, ElasticNet
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, ExtraTreesRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.svm import SVR
from sklearn.metrics import mean_absolute_error, mean_squared_error
from app.data.stock_provider import normalize_ticker

def compute_custom_features(df: pd.DataFrame, feature_config: Dict[str, Any]) -> pd.DataFrame:
    """
    Constructs strictly backward-looking features with ZERO look-ahead leakage.
    Configurable: lag days, rolling SMA/EMA windows, RSI period, Volatility window.
    """
    df = df.copy()
    close = df["Close"]
    volume = df["Volume"]

    # 1. Custom Lagged Returns
    lags = feature_config.get("lags", [1, 3, 5])
    for lag in lags:
        df[f"ret_{lag}d"] = close.pct_change(lag)

    # 2. Moving Average Ratios
    sma_windows = feature_config.get("smaWindows", [10, 50])
    for w in sma_windows:
        sma = close.rolling(w).mean()
        df[f"ratio_sma{w}"] = (close - sma) / (sma + 1e-9)

    # 3. RSI
    rsi_period = feature_config.get("rsiPeriod", 14)
    if feature_config.get("useRsi", True):
        delta = close.diff()
        gain = (delta.where(delta > 0, 0)).rolling(rsi_period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(rsi_period).mean()
        rs = gain / (loss + 1e-9)
        df[f"rsi_{rsi_period}"] = 100 - (100 / (1 + rs))

    # 4. Volatility
    vol_window = feature_config.get("volWindow", 10)
    if feature_config.get("useVolatility", True):
        df[f"vol_{vol_window}d"] = close.pct_change().rolling(vol_window).std()

    # 5. Volume Change
    if feature_config.get("useVolume", True):
        df["vol_change"] = volume.pct_change(1).replace([np.inf, -np.inf], 0)

    # 6. High-Low Spread
    if feature_config.get("useSpread", True):
        df["hl_spread"] = (df["High"] - df["Low"]) / (close + 1e-9)

    return df

def run_custom_ml_experiment(
    ticker: str,
    timeframe: str = "2Y",
    target_type: str = "price_5d",
    model_name: str = "random_forest",
    train_split_pct: float = 0.75, # Custom train/test split slider!
    hyperparameters: Dict[str, Any] = None,
    feature_config: Dict[str, Any] = None,
    market: str = "NSE"
) -> Dict[str, Any]:
    full_sym = normalize_ticker(ticker, market)
    period = "5y" if timeframe == "5Y" else "2y" if timeframe in ["2Y", "1Y"] else "1y"

    df_raw = yf.Ticker(full_sym).history(period=period, interval="1d")
    if df_raw.empty or len(df_raw) < 70:
        return {"error": f"Insufficient historical data for {full_sym}", "data": None}

    hyperparams = hyperparameters or {}
    f_config = feature_config or {
        "lags": [1, 3, 5],
        "smaWindows": [10, 50],
        "useRsi": True,
        "rsiPeriod": 14,
        "useVolatility": True,
        "volWindow": 10,
        "useVolume": True,
        "useSpread": True
    }

    df = compute_custom_features(df_raw, f_config)

    # Formulate prediction target
    if target_type == "direction_1d":
        df["target"] = (df["Close"].shift(-1) > df["Close"]).astype(int)
    elif target_type == "price_1d":
        df["target"] = df["Close"].shift(-1)
    elif target_type == "price_10d":
        df["target"] = df["Close"].shift(-10)
    else: # default price_5d
        df["target"] = df["Close"].shift(-5)

    feat_cols = [c for c in df.columns if c not in ["Open", "High", "Low", "Close", "Volume", "Dividends", "Stock Splits", "target"]]
    df_clean = df.dropna(subset=feat_cols + ["target"])

    if len(df_clean) < 40:
        return {"error": "Not enough valid samples after feature engineering", "data": None}

    # Custom Train/Test Split Ratio (Between 50% and 90%)
    split_ratio = min(max(train_split_pct, 0.50), 0.90)
    split_idx = int(len(df_clean) * split_ratio)
    train_df = df_clean.iloc[:split_idx]
    test_df = df_clean.iloc[split_idx:]

    X_train = train_df[feat_cols]
    y_train = train_df["target"]
    X_test = test_df[feat_cols]
    y_test = test_df["target"]

    # Model Instantiation (6+ real models with customizable hyperparameters)
    if model_name == "ridge":
        alpha = float(hyperparams.get("alpha", 1.0))
        model = Ridge(alpha=alpha)
    elif model_name == "elastic_net":
        alpha = float(hyperparams.get("alpha", 0.5))
        l1_ratio = float(hyperparams.get("l1_ratio", 0.5))
        model = ElasticNet(alpha=alpha, l1_ratio=l1_ratio)
    elif model_name == "gradient_boosting":
        n_est = int(hyperparams.get("n_estimators", 100))
        lr = float(hyperparams.get("learning_rate", 0.1))
        depth = int(hyperparams.get("max_depth", 3))
        model = GradientBoostingRegressor(n_estimators=n_est, learning_rate=lr, max_depth=depth, random_state=42)
    elif model_name == "extra_trees":
        n_est = int(hyperparams.get("n_estimators", 100))
        depth = int(hyperparams.get("max_depth", 6))
        model = ExtraTreesRegressor(n_estimators=n_est, max_depth=depth, random_state=42)
    elif model_name == "knn":
        k = int(hyperparams.get("n_neighbors", 5))
        weights = hyperparams.get("weights", "uniform")
        model = KNeighborsRegressor(n_neighbors=k, weights=weights)
    elif model_name == "svr":
        c_val = float(hyperparams.get("C", 1.0))
        model = SVR(C=c_val)
    else: # Default Random Forest
        n_est = int(hyperparams.get("n_estimators", 100))
        depth = int(hyperparams.get("max_depth", 6))
        model = RandomForestRegressor(n_estimators=n_est, max_depth=depth, random_state=42)

    # Train in real
    model.fit(X_train, y_train)

    # Predict
    preds = model.predict(X_test)

    # Naive Baseline
    if target_type.startswith("price"):
        baseline_preds = test_df["Close"].values
    else:
        baseline_preds = np.zeros_like(preds)

    # Real Metrics
    mae = float(mean_absolute_error(y_test, preds))
    rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
    baseline_mae = float(mean_absolute_error(y_test, baseline_preds))
    delta_vs_baseline = round(((baseline_mae - mae) / baseline_mae) * 100, 2) if baseline_mae else 0.0

    if target_type == "direction_1d":
        dir_acc = float(np.mean((preds > 0.5) == y_test) * 100)
    else:
        actual_delta = y_test.values - test_df["Close"].values
        pred_delta = preds - test_df["Close"].values
        dir_acc = float(np.mean(np.sign(actual_delta) == np.sign(pred_delta)) * 100)

    # Feature Importance
    importances = []
    if hasattr(model, "feature_importances_"):
        for f, imp in zip(feat_cols, model.feature_importances_):
            importances.append({"feature": f, "importance": round(float(imp) * 100, 2)})
        importances = sorted(importances, key=lambda x: x["importance"], reverse=True)
    elif hasattr(model, "coef_"):
        for f, c in zip(feat_cols, model.coef_):
            importances.append({"feature": f, "importance": round(abs(float(c)), 4)})
        importances = sorted(importances, key=lambda x: x["importance"], reverse=True)

    chart_series = []
    test_dates = test_df.index
    for i in range(len(test_df)):
        d_str = test_dates[i].strftime("%Y-%m-%d") if hasattr(test_dates[i], "strftime") else str(test_dates[i])
        chart_series.append({
            "date": d_str,
            "actual": round(float(y_test.iloc[i]), 2),
            "predicted": round(float(preds[i]), 2),
            "baseline": round(float(baseline_preds[i]), 2),
        })

    return {
        "ticker": ticker.upper(),
        "model": model_name,
        "target": target_type,
        "split": {
            "trainPct": int(split_ratio * 100),
            "testPct": int((1 - split_ratio) * 100),
            "trainCount": len(train_df),
            "testCount": len(test_df),
        },
        "metrics": {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "baselineMae": round(baseline_mae, 2),
            "directionalAccuracy": round(dir_acc, 1),
            "deltaVsBaselinePct": delta_vs_baseline,
        },
        "featureImportance": importances[:8],
        "chartSeries": chart_series,
        "activeFeaturesCount": len(feat_cols),
        "educationalDisclaimer": "Tessera Model Lab trains real scikit-learn models on live chronological price action. Not financial advice.",
    }
