import os
import re
import json
from glob import glob

DATA_DIR = os.path.join('backend', 'data', 'cgi_chunks')

# Scan a subset of files for recency
pattern = re.compile(r"20\d{2}")
latest_year = 0
files_checked = 0
for path in glob(os.path.join(DATA_DIR, '*.json'))[:100]:
    with open(path, 'r') as f:
        content = f.read()
    years = [int(y) for y in pattern.findall(content)]
    if years:
        latest_year = max(latest_year, max(years))
    files_checked += 1

print(f"Checked {files_checked} files, latest year found: {latest_year}")
if latest_year >= 2025:
    print("Dataset is up to date for 2025")
else:
    print("Dataset may be outdated")
