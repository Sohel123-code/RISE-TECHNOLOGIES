"""Port the supplied Framer markup/styles to a local, declarative React tree.

The generated files preserve source classes, style declarations, text and asset
dimensions. Interaction logic lives separately in src/main.jsx.
"""
from pathlib import Path
from bs4 import BeautifulSoup, Comment, NavigableString
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse
import hashlib
import html
import json
import re
import subprocess
import tinycss2

ROOT = Path(__file__).resolve().parents[1]
source = ROOT.parent / 'reference-latest.html'
soup = BeautifulSoup(source.read_text(encoding='utf-8'), 'html.parser')
css = '\n'.join(x.get_text() for x in soup.head.find_all('style'))
asset_dir = ROOT / 'public/template-assets'
asset_dir.mkdir(parents=True, exist_ok=True)

# Download exactly the source URLs (including responsive image derivatives).
asset_urls = set()
for image in soup.select('#main img'):
    asset_urls.add(image['src'])
    for candidate in image.get('srcset', '').split(','):
        if candidate.strip(): asset_urls.add(candidate.strip().split()[0])
asset_urls.update(re.findall(r'https://[^\s\)\"\']+\.(?:woff2?|png|jpe?g|svg|webp)(?:\?[^\s\)\"\']*)?', css))
assets = {}
for url in sorted(asset_urls):
    suffix = Path(urlparse(url).path).suffix
    assets[url] = '/template-assets/' + hashlib.sha256(url.encode()).hexdigest()[:16] + suffix

def fetch(item):
    url, local = item
    destination = ROOT / 'public' / local.lstrip('/')
    if not destination.exists():
        subprocess.run(['curl.exe', '-f', '-sS', '-L', '--retry', '2', url, '-o', str(destination)], check=True)
    if destination.stat().st_size == 0: raise ValueError('Empty asset: ' + url)

with ThreadPoolExecutor(max_workers=6) as pool:
    list(pool.map(fetch, assets.items()))

def localize(value):
    for url in sorted(assets, key=len, reverse=True): value = value.replace(url, assets[url])
    return value

css = localize(css)
(ROOT / 'src/template.css').write_text(css, encoding='utf-8')

attribute_names = {'class':'className','tabindex':'tabIndex','srcset':'srcSet','viewbox':'viewBox','fetchpriority':'fetchPriority','fill-opacity':'fillOpacity','stroke-width':'strokeWidth','stroke-linecap':'strokeLinecap','stroke-linejoin':'strokeLinejoin','stroke-dasharray':'strokeDasharray','crossorigin':'crossOrigin'}
def style_object(text):
    result = {}
    for declaration in tinycss2.parse_declaration_list(text):
        if declaration.type != 'declaration': continue
        name = declaration.name
        if not name.startswith('--'):
            name = re.sub(r'-([a-z])', lambda m:m[1].upper(),name)
            if name.startswith('Ms'): name = 'm' + name[1:]
        result[name] = localize(tinycss2.serialize(declaration.value).strip())
    return result

index = 0
def convert(node):
    global index
    if isinstance(node, Comment): return None
    if isinstance(node, NavigableString):
        text = str(node)
        return text if text.strip() else None
    if node.name in ['script','style','link']: return None
    if node.get('id') in ['template-overlay','__framer-badge-container','__framer-badge']: return None
    if node.get('aria-label') == 'Made in Framer' or node.get('data-framer-name') == 'Made in Framer': return None
    index += 1
    key = index
    props = {}
    for name, value in node.attrs.items():
        if name in ['data-framer-hydrate-v2','data-framer-page-optimized-at','data-framer-ssr-released-at']: continue
        if isinstance(value,list): value = ' '.join(value)
        if name == 'style': value = style_object(value)
        elif isinstance(value,str): value = localize(value)
        if name == 'href' and value.startswith('./'):
            value = value[2:] if value.startswith('./#') else ('#' if value == './' else 'https://tidy-airport-868077.framer.app/' + value[2:])
        props[attribute_names.get(name,name)] = value
    classes = node.get('class',[])
    meta = {}
    if 'framer-zeIDz' in classes: meta['kind'] = 'services'
    if 'framer-kkTry' in classes:
        meta['kind'] = 'service'
        group = node.find_parent(class_='framer-zeIDz')
        meta['index'] = group.select('.framer-kkTry').index(node)
        meta['phone'] = 'Phone' in group.get('data-framer-name','')
    if 'framer-5gFt0' in classes: meta['kind'] = 'faq'
    if 'framer-A5Hxr' in classes: meta['kind'] = 'nav'
    if node.name == 'span' and node.parent and node.parent.parent and node.parent.parent.name == 'h1':
        meta['letter'] = list(node.parent.find_all('span',recursive=False)).index(node)
        props['style'].update({'opacity':'1','filter':'none','transform':'none'})
    style = props.get('style',{})
    if 'data-framer-appear-id' in props or (style.get('opacity') == '0' and 'willChange' in style):
        meta['reveal'] = True
        style['opacity'] = '1'
        style['transform'] = 'none'
    children = [v for child in node.children if (v := convert(child)) is not None]
    return {'tag':node.name,'props':props,'children':children,'key':key,**meta}

tree = [convert(soup.select_one('#main')), convert(soup.select_one('#svg-templates'))]
(ROOT / 'src/template.json').write_text(json.dumps(tree,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
(ROOT / 'src/template-assets.json').write_text(json.dumps(assets,indent=2),encoding='utf-8')
print(f'Imported {index} nodes, {len(assets)} local assets, and {len(css)} bytes of original CSS.')
