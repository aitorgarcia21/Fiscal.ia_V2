import os
import requests
import json
from pathlib import Path
from typing import Optional

LEGIFRANCE_TOKEN = os.getenv("LEGIFRANCE_TOKEN")
API_URL = "https://api.aife.economie.gouv.fr/dila/legifrance/lf-engine-app/consult"


def fetch_code(cid: str, date: Optional[str] = None) -> dict:
    """Fetch one legal code from Legifrance API."""
    if not LEGIFRANCE_TOKEN:
        raise RuntimeError("LEGIFRANCE_TOKEN environment variable not set")
    headers = {"Authorization": f"Bearer {LEGIFRANCE_TOKEN}"}
    params = {"context": "code", "cid": cid}
    if date:
        params["date"] = date
    resp = requests.get(API_URL, headers=headers, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()


def save_articles(data: dict, output_dir: Path, code_prefix: str) -> None:
    """Extract articles from API response and store each as JSON."""
    output_dir.mkdir(parents=True, exist_ok=True)
    articles = data.get("articles", [])
    for art in articles:
        num = art.get("id") or art.get("num") or "unknown"
        path = output_dir / f"{code_prefix}_{num}.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(art, f, ensure_ascii=False, indent=2)


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Fetch a Legifrance code")
    parser.add_argument("cid", help="Legifrance code identifier")
    parser.add_argument("--output", default="data/legifrance", help="Directory to store articles")
    parser.add_argument("--prefix", default="CODE", help="Prefix for saved files")
    parser.add_argument("--date", help="Optional date for snapshot YYYY-MM-DD")
    args = parser.parse_args()

    data = fetch_code(args.cid, args.date)
    output_dir = Path(args.output) / args.prefix.lower()
    save_articles(data, output_dir, args.prefix)


if __name__ == "__main__":
    main()
