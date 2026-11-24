import feedparser
import requests
import json
import time
import urllib.parse
from typing import List, Dict, Any, Optional
from app.core.cache import get_cached, set_cached, get_stale_fallback

FEEDS = [
    {
        "name": "Economic Times Markets",
        "url": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
        "type": "equity"
    },
    {
        "name": "Cointelegraph",
        "url": "https://cointelegraph.com/rss",
        "type": "crypto"
    },
    {
        "name": "Decrypt",
        "url": "https://decrypt.co/feed",
        "type": "crypto"
    },
    {
        "name": "Google News Business",
        "url": "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-IN&gl=IN&ceid=IN:en",
        "type": "macro"
    }
]

def classify_tags(title: str, summary: str) -> List[str]:
    text = (title + " " + summary).lower()
    tags = []
    if any(k in text for k in ["surge", "rally", "bull", "jump", "high", "gain", "profit", "record", "growth", "boost"]):
        tags.append("Bullish")
    if any(k in text for k in ["crash", "drop", "plunge", "bear", "down", "fall", "loss", "decline", "warn", "slump"]):
        tags.append("Bearish")
    if any(k in text for k in ["sec", "rbi", "sebi", "court", "law", "rule", "regulat", "ban", "policy", "tax", "govt"]):
        tags.append("Regulatory")
    if any(k in text for k in ["q1", "q2", "q3", "q4", "quarter", "revenue", "ebitda", "earnings", "dividend", "profit"]):
        tags.append("Earnings")
    if any(k in text for k in ["inflation", "gdp", "rate hike", "fed", "central bank", "tariffs", "war", "crude", "oil", "gold"]):
        tags.append("Macro")
    return tags if tags else ["General"]

def get_live_news(feed_type: Optional[str] = None, keyword: Optional[str] = None) -> Dict[str, Any]:
    cache_key = f"news_v3:{feed_type or 'all'}:{keyword or 'none'}"
    cached = get_cached(cache_key)
    if cached:
        return {"data": cached, "stale": False}

    articles = []

    # If keyword is provided, query Google News RSS specifically for that ticker/company!
    if keyword and len(keyword.strip()) > 1:
        kw = keyword.strip()
        encoded = urllib.parse.quote(f"{kw} stock financial")
        gnews_url = f"https://news.google.com/rss/search?q={encoded}&hl=en-IN&gl=IN&ceid=IN:en"
        try:
            parsed = feedparser.parse(gnews_url)
            for entry in parsed.entries[:10]:
                title = entry.get("title", "")
                link = entry.get("link", "#")
                pub_date = entry.get("published", "") or entry.get("updated", "")
                summary = entry.get("summary", "")
                source_title = entry.get("source", {}).get("title", "Google News")
                tags = classify_tags(title, summary)
                articles.append({
                    "title": title,
                    "link": link,
                    "pubDate": pub_date,
                    "source": source_title,
                    "category": "targeted",
                    "tags": tags,
                    "summary": summary
                })
        except Exception as e:
            print(f"[News Aggregator] Error fetching targeted Google News for {keyword}: {e}")

    # Also parse standard feeds
    selected_feeds = [f for f in FEEDS if feed_type is None or f["type"] == feed_type or feed_type == "all"]
    for feed_info in selected_feeds:
        try:
            parsed = feedparser.parse(feed_info["url"])
            for entry in parsed.entries[:10]:
                title = entry.get("title", "")
                link = entry.get("link", "#")
                pub_date = entry.get("published", "") or entry.get("updated", "")
                summary = entry.get("summary", "")

                if keyword:
                    kw_lower = keyword.lower()
                    if kw_lower not in title.lower() and kw_lower not in summary.lower():
                        continue

                tags = classify_tags(title, summary)
                articles.append({
                    "title": title,
                    "link": link,
                    "pubDate": pub_date,
                    "source": feed_info["name"],
                    "category": feed_info["type"],
                    "tags": tags,
                    "summary": summary
                })
        except Exception as e:
            print(f"[News Aggregator] Error fetching {feed_info['name']}: {e}")

    if not articles:
        # Fallback to general market news if keyword filter was too strict
        stale = get_stale_fallback(cache_key)
        if stale:
            return stale
        if keyword:
            return get_live_news(feed_type=feed_type, keyword=None)
        return {"data": [], "stale": False}

    # Deduplicate
    seen = set()
    deduped = []
    for a in articles:
        clean_title = a["title"].strip()
        if clean_title not in seen:
            seen.add(clean_title)
            deduped.append(a)

    set_cached(cache_key, deduped, ttl_seconds=180)
    return {"data": deduped, "stale": False}
