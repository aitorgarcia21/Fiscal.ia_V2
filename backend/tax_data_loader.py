import json, os

TAX_DATA_PATH = os.path.join(os.path.dirname(__file__), 'tax_data_2025.json')

_cache = None

def get_tax_data():
    global _cache
    if _cache is None:
        with open(TAX_DATA_PATH, 'r', encoding='utf-8') as f:
            _cache = json.load(f)
    return _cache 