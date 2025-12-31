"""Temporary script to find the Siemens CERT API endpoint."""
import requests
import re

r = requests.get('https://www.siemens.com/global/en/products/services/cert.html', timeout=15)
html = r.text

# Look for SSA IDs in the page
ssa_ids = re.findall(r'SSA-\d{6}', html)
print(f'Found {len(ssa_ids)} SSA references in page')
if ssa_ids:
    print('First 10:', ssa_ids[:10])

# Look for JSON/API URLs in the page
api_patterns = re.findall(r'["\'](https?://[^"\']*(?:api|json|data|feed|cert|advisory)[^"\']*)[\"\']', html, re.IGNORECASE)
print(f'\nFound {len(api_patterns)} potential API URLs')
for p in list(set(api_patterns))[:15]:
    print(f'  {p}')

# Look for data attributes
data_attrs = re.findall(r'data-[a-z-]+=["\']([^"\']+)["\']', html)
print(f'\nFound {len(data_attrs)} data attributes')
for d in list(set(data_attrs))[:10]:
    if 'http' in d or 'api' in d.lower() or 'json' in d.lower():
        print(f'  {d}')

# Look for script content with URLs
script_urls = re.findall(r'fetch\(["\']([^"\']+)["\']\)', html)
print(f'\nFound {len(script_urls)} fetch URLs')
for s in script_urls[:10]:
    print(f'  {s}')

