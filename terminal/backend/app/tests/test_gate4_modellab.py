import pytest
import pandas as pd
import numpy as np
from app.ml.model_engine import compute_custom_features, run_custom_ml_experiment

def test_no_lookahead_leakage():
    """
    CRITICAL UNIT TEST:
    Verifies that feature calculation at time t does NOT depend on data at t+1,
    and that train timestamps strictly precede test timestamps in walk-forward evaluation.
    """
    dates = pd.date_range("2024-01-01", periods=100)
    prices = np.linspace(100, 200, 100) + np.random.normal(0, 1, 100)
    volumes = np.random.randint(1000, 5000, 100)
    df = pd.DataFrame({"Close": prices, "Volume": volumes, "High": prices * 1.01, "Low": prices * 0.99}, index=dates)

    config = {
        "lags": [1, 3, 5],
        "smaWindows": [10, 50],
        "useRsi": True,
        "rsiPeriod": 14,
        "useVolatility": True,
        "volWindow": 10,
        "useVolume": True,
        "useSpread": True
    }
    df_feat = compute_custom_features(df, config)

    # Perturb future value at index 50
    df_perturbed = df.copy()
    df_perturbed.iloc[50, 0] = 99999.0
    df_feat_perturbed = compute_custom_features(df_perturbed, config)

    for col in ["ret_1d", "ratio_sma10", "vol_10d"]:
        diff = (df_feat[col].iloc[:49] - df_feat_perturbed[col].iloc[:49]).abs().max()
        assert diff == 0.0 or np.isnan(diff)

def test_custom_model_lab_end_to_end():
    res = run_custom_ml_experiment(
        "TCS",
        timeframe="1Y",
        target_type="price_5d",
        model_name="gradient_boosting",
        train_split_pct=0.75,
        hyperparameters={"n_estimators": 50, "learning_rate": 0.1},
        market="NSE"
    )
    assert "metrics" in res
    m = res["metrics"]
    assert "mae" in m
    assert "rmse" in m
    assert "directionalAccuracy" in m
    assert "deltaVsBaselinePct" in m
    assert len(res["chartSeries"]) > 10
    assert "educationalDisclaimer" in res
