#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import asyncio
import aiohttp
import logging
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime
import json
import sys
from pathlib import Path

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class ScrapingResult:
    url: str
    title: str
    content: str
    timestamp: datetime
    metadata: Dict[str, str]

class AdvancedScraper:
    def __init__(self, max_concurrent_requests: int = 5):
        self.max_concurrent_requests = max_concurrent_requests
        self.session: Optional[aiohttp.ClientSession] = None
        self.results: List[ScrapingResult] = []

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def fetch_url(self, url: str) -> Optional[ScrapingResult]:
        try:
            async with self.session.get(url) as response:
                if response.status == 200:
                    content = await response.text()
                    return ScrapingResult(
                        url=url,
                        title=url.split('/')[-1],
                        content=content,
                        timestamp=datetime.now(),
                        metadata={'status': 'success', 'size': str(len(content))}
                    )
                else:
                    logger.warning(f"Échec de la requête pour {url}: {response.status}")
                    return None
        except Exception as e:
            logger.error(f"Erreur lors du scraping de {url}: {str(e)}")
            return None

    async def process_urls(self, urls: List[str]):
        semaphore = asyncio.Semaphore(self.max_concurrent_requests)
        
        async def bounded_fetch(url: str):
            async with semaphore:
                return await self.fetch_url(url)

        tasks = [bounded_fetch(url) for url in urls]
        results = await asyncio.gather(*tasks)
        self.results.extend([r for r in results if r is not None])

    def save_results(self, output_file: str):
        output_path = Path(output_file)
        data = [
            {
                'url': r.url,
                'title': r.title,
                'content': r.content,
                'timestamp': r.timestamp.isoformat(),
                'metadata': r.metadata
            }
            for r in self.results
        ]
        output_path.write_text(json.dumps(data, indent=2, ensure_ascii=False))

async def main():
    urls = [
        "https://example.com",
        "https://example.org",
        "https://example.net"
    ]

    async with AdvancedScraper() as scraper:
        await scraper.process_urls(urls)
        scraper.save_results('results.json')

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Programme interrompu par l'utilisateur")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Erreur inattendue: {str(e)}")
        sys.exit(1) 