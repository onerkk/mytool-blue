#!/usr/bin/env python3
"""Build JS/tarot-inventory.js from the inventory workbook without third-party packages.
Only positive-stock item names and wearable size fields are exported. URLs, price and claimed effects are intentionally excluded.
"""
from __future__ import annotations
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS_MAIN = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
NS_REL = {'r': 'http://schemas.openxmlformats.org/package/2006/relationships'}
NS_DOC_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'


def col_index(ref: str) -> int:
    letters = re.match(r'[A-Z]+', ref).group(0)
    n = 0
    for ch in letters:
        n = n * 26 + ord(ch) - 64
    return n - 1


def cell_value(cell, shared):
    typ = cell.get('t')
    if typ == 'inlineStr':
        return ''.join(t.text or '' for t in cell.findall('.//m:t', NS_MAIN))
    node = cell.find('m:v', NS_MAIN)
    if node is None:
        return None
    raw = node.text or ''
    if typ == 's':
        try:
            return shared[int(raw)]
        except Exception:
            return raw
    if typ == 'b':
        return raw == '1'
    try:
        number = float(raw)
        return int(number) if number.is_integer() else number
    except ValueError:
        return raw


def read_sheet(path: Path, sheet_name='進銷總表'):
    with zipfile.ZipFile(path) as zf:
        shared = []
        if 'xl/sharedStrings.xml' in zf.namelist():
            root = ET.fromstring(zf.read('xl/sharedStrings.xml'))
            shared = [''.join(t.text or '' for t in si.findall('.//m:t', NS_MAIN)) for si in root.findall('m:si', NS_MAIN)]
        workbook = ET.fromstring(zf.read('xl/workbook.xml'))
        rels = ET.fromstring(zf.read('xl/_rels/workbook.xml.rels'))
        relmap = {r.get('Id'): r.get('Target') for r in rels.findall('r:Relationship', NS_REL)}
        target = None
        for sheet in workbook.findall('.//m:sheets/m:sheet', NS_MAIN):
            if sheet.get('name') == sheet_name:
                target = relmap[sheet.get(f'{{{NS_DOC_REL}}}id')]
                break
        if not target:
            raise RuntimeError(f'sheet not found: {sheet_name}')
        xml_path = target.lstrip('/') if target.startswith('xl/') else 'xl/' + target.lstrip('/')
        root = ET.fromstring(zf.read(xml_path))
        rows = []
        for row in root.findall('.//m:sheetData/m:row', NS_MAIN):
            values = []
            for cell in row.findall('m:c', NS_MAIN):
                idx = col_index(cell.get('r'))
                while len(values) <= idx:
                    values.append(None)
                values[idx] = cell_value(cell, shared)
            rows.append(values)
        return rows


def size_text(value):
    if value in (None, ''):
        return None
    if isinstance(value, float) and value.is_integer():
        value = int(value)
    return str(value)


def build_catalog(rows):
    header_idx = next(i for i, row in enumerate(rows) if len(row) > 1 and row[1] == '品項名稱')
    merged = {}
    for row in rows[header_idx + 1:]:
        row = row + [None] * (18 - len(row))
        name, qty = row[1], row[8]
        if not isinstance(name, str) or not name.strip() or name.startswith('　▎'):
            continue
        try:
            qty = int(qty)
        except (TypeError, ValueError):
            continue
        if qty <= 0:
            continue
        item = {'name': name.strip(), 'element': row[2] or '', 'bead': row[3], 'wrist': row[4], 'ring': row[5], 'chain': row[6], 'qty': qty}
        parts = [item['name']]
        if size_text(item['bead']): parts.append(size_text(item['bead']) + 'mm')
        if size_text(item['wrist']): parts.append('手圍' + size_text(item['wrist']) + 'cm')
        if size_text(item['ring']): parts.append('戒圍' + size_text(item['ring']))
        if size_text(item['chain']): parts.append('鍊長' + size_text(item['chain']) + 'cm')
        item['displayName'] = '／'.join(parts)
        if item['displayName'] in merged:
            merged[item['displayName']]['qty'] += qty
        else:
            merged[item['displayName']] = item
    return list(merged.values())


def render(catalog, source_file):
    data = json.dumps(catalog, ensure_ascii=False, separators=(',', ':'))
    return Path(__file__).with_name('tarot-inventory.template.js').read_text(encoding='utf-8').replace('__CATALOG_JSON__', data).replace('__SOURCE_FILE__', source_file)


def main():
    if len(sys.argv) != 3:
        raise SystemExit('usage: build-tarot-inventory.py inventory.xlsx output.js')
    source, output = Path(sys.argv[1]), Path(sys.argv[2])
    catalog = build_catalog(read_sheet(source))
    output.write_text(render(catalog, source.name), encoding='utf-8')
    print(f'wrote {output} ({len(catalog)} in-stock variants)')

if __name__ == '__main__':
    main()
