#!/usr/bin/env python3
"""Rebuild only rule tables in the existing offline dictionary.

Use build-name-data.py with the versioned Unihan archives for a full rebuild.
This path retains every dictionary field and its existing source metadata.
"""
import argparse, hashlib, json, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser()
p.add_argument('--check', action='store_true')
args = p.parse_args()
dest = ROOT / 'JS/name-data.js'
text = dest.read_text()
marker = 'root.JYNameData='
start = text.index(marker) + len(marker)
data, consumed = json.JSONDecoder().raw_decode(text[start:])
before = hashlib.sha256(json.dumps(data['characters'], ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
data['numerology'] = json.loads((ROOT / 'data/name/numerology-81.json').read_text())
data['numerology']['original'] = json.loads((ROOT / 'data/name/numerology-original-1935.json').read_text())
after = hashlib.sha256(json.dumps(data['characters'], ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
assert before == after
body = text[:start] + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + text[start+consumed:]
if args.check:
    if text != body: raise SystemExit('Stale bundled name rule tables')
else:
    dest.write_text(body)
print(json.dumps({'characters': len(data['characters']), 'dictionaryDigest': before, 'originalRows': len(data['numerology']['original']['rows']), 'check': args.check}))
