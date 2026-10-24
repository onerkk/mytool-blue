#!/usr/bin/env python3
"""分享卡設計稿 → 模板底圖。

設計稿（assets/share/source/<type>.webp|jpg）保留全部美術與靜態文字；只把「會隨資料改變」的區域擦除
（低解析修補＋邊緣羽化＋紋理雜訊），再由 JS/share-card.js 以向量重畫。座標以各稿原始像素標記，
輸出到 spec.json 時一律換成 0–1 比例，換更高解析的原稿只要重跑本腳本。
用法：python3 scripts/build-share-templates.py   （之後執行 node scripts/stamp-asset-versions.cjs）"""
import os, json, hashlib
import cv2, numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets/share/source'); OUT = os.path.join(ROOT, 'assets/share/tpl')
OW, OH = 2160, 2700          # 預覽與分享用底圖（4:5）

def rect_cols(cxs, y0, y1, half): return [[cx-half, y0, cx+half, y1] for cx in cxs]

SPEC = {}
SPEC['invite'] = dict(r={}, clean=[])
SPEC['name'] = dict(r=dict(q=[90,390,1036,470], chars=[236,490,886,704], sancai=[650,986,1056,1034],
    g0=[47,719,243,952], g1=[256,719,451,952], g2=[465,719,659,952], g3=[671,719,867,952], g4=[879,719,1076,952]),
    clean=['q','chars','sancai'],
    atlas=dict(name='name-tiles', tiles=['g0','g1','g2','g3','g4'], inner=[[22,18,174,56],[20,56,176,146],[12,186,184,228]], scale=2))
L = dict(q=[90,390,1036,470], pil=[288,488,842,524], t0=[380,810,1046,854], t1=[380,886,1046,930], t2=[380,962,1046,1008], cls=[368,1040,772,1078])
for i, r in enumerate(rect_cols([182,433,689,940], 584, 754, 62)): L['c%d' % i] = r
SPEC['liuren'] = dict(r=L, clean=list(L))
def gua_common(q):
    return dict(q=q, name0=[160,518,440,572], name1=[690,518,970,572], bars0=[150,592,388,786], bars1=[678,592,920,786],
                tri0=[424,588,496,800], tri1=[952,588,1024,800], P0=[66,476,534,826], P1=[594,476,1056,826])
Y = gua_common([90,374,1036,456]); Y.update(b0=[78,850,292,894], b1=[328,850,542,894], b2=[578,850,792,894], b3=[828,850,1044,894], tab=[66,918,1056,1140], note=[230,1150,910,1188])
SPEC['yijing'] = dict(r=Y, clean=['q','name0','name1','bars0','bars1','tri0','tri1','b0','b1','b2','b3','tab','note'])
LY = gua_common([90,380,1036,456])
for i, bx in enumerate([66,316,566,816]): LY['v%d' % i] = [bx+92, 850, bx+232, 894]
LY.update(tabL=[66,948,540,1136], tabR=[662,948,1056,1136])
SPEC['liuyao'] = dict(r=LY, clean=['q','name0','name1','bars0','bars1','tri0','tri1','v0','v1','v2','v3','tabL','tabR'])
SPEC['meihua'] = dict(r=dict(q=[92,372,1034,452], b0=[148,594,334,772], b1=[472,594,656,772], b2=[794,594,978,772],
    n0=[152,906,330,950], n1=[478,906,654,950], n2=[802,906,976,950], conc=[98,994,1044,1042]),
    clean=['q','b0','b1','b2','n0','n1','n2','conc'])
SPEC['oracle'] = dict(r=dict(q=[102,376,1034,454], scroll=[282,560,866,994]), clean=['q','scroll'])
SPEC['western'] = dict(r=dict(head=[70,252,740,365], q=[70,446,284,520], wheel=[275,388,850,978],
    v0=[86,1068,392,1118], v1=[426,1068,706,1118], v2=[742,1068,1046,1118], note=[330,1136,800,1166]),
    clean=['head','q','wheel','v0','v1','v2','note'])
SPEC['vedic'] = dict(r=dict(head=[70,250,740,362], q=[66,430,266,516], chart=[256,388,866,974],
    v0=[96,1070,386,1118], v1=[428,1070,702,1118], v2=[748,1070,1034,1118], note=[320,1144,800,1172]),
    clean=['head','q','chart','v0','v1','v2','note'])
Z = dict(q=[96,360,1034,438], z1=[120,456,1006,622], z2=[120,622,376,1114], z3=[752,622,1006,1114], z4=[376,942,752,1114], ct=[398,846,742,934], note=[270,1122,880,1156])
cols = [[138,340],[356,552],[570,768],[786,985]]; rws = [[472,616],[632,776],[792,936],[950,1096]]
pos = [[0,0],[1,0],[2,0],[3,0],[0,1],[3,1],[0,2],[3,2],[0,3],[1,3],[2,3],[3,3]]   # 巳午未申 辰酉 卯戌 寅丑子亥
for i, (cx, ry) in enumerate(pos): Z['s%d' % i] = [cols[cx][0], rws[ry][0], cols[cx][1], rws[ry][1]]
Z['tile'] = [356,950,552,1096]
SPEC['ziwei'] = dict(r=Z, clean=['q','z1','z2','z3','z4','ct','note'],
    atlas=dict(name='ziwei-tile', tiles=['tile'], inner=[[14,12,182,134]], scale=3, from_original=True))
C = dict(q=[92,396,1034,478], scen=[66,505,520,552], nA=[100,618,520,690], pA=[100,694,520,734], nB=[638,618,1056,690], pB=[638,694,1056,734], note=[300,1094,860,1126])
for i, (a, b) in enumerate([(775,838),(850,912),(928,990),(1005,1068)]): C['r%d' % i] = [135, a+9, 1042, b-9]
SPEC['baziCompatibility'] = dict(r=C, clean=list(C))
SPEC['tarot'] = dict(r=dict(q=[100,358,1034,436], line=[66,462,1050,508], cards=[96,512,1040,1000], low=[66,1028,1056,1174], stray=[296,1180,826,1214]), clean=['q','line','cards','low','stray'])
SPEC['lenormand'] = dict(r=dict(q=[90,406,1040,500], line=[66,530,860,578], cards=[40,584,1081,1090], note=[330,1098,800,1140]), clean=['q','line','cards','note'])
B = dict(q=[92,358,1040,438], rz0=[330,896,1050,942], rz1=[330,970,1050,1014], rz2=[330,1040,1050,1084])
for i, cx in enumerate([180,435,688,941]): B['gz%d' % i] = [cx-80,596,cx+80,714]; B['pz%d' % i] = [cx-52,813,cx+52,853]
SPEC['bazi'] = dict(r=B, clean=list(B))
O = dict(q=[140,546,1630,672])
for i, y0 in enumerate([725,915,1105,1295,1490]): O['l%d' % i] = [300, y0+76, 1590, y0+160]
SPEC['ootk'] = dict(r=O, clean=list(O))

def load(t):
    for ext in ('webp','png','jpg'):
        p = os.path.join(SRC, t+'.'+ext)
        if os.path.exists(p): return cv2.cvtColor(np.array(Image.open(p).convert('RGB')), cv2.COLOR_RGB2BGR)
    raise FileNotFoundError(t)

def clean(img, r, ctx=16):
    """擦除矩形：低解析 Telea 修補（只延伸邊界色調），放大後羽化併回，並補上與周邊相當的細雜訊。"""
    h, w = img.shape[:2]; x0, y0, x1, y1 = [int(round(v)) for v in r]
    X0, Y0, X1, Y1 = max(0,x0-ctx), max(0,y0-ctx), min(w,x1+ctx), min(h,y1+ctx)
    roi = img[Y0:Y1, X0:X1].astype(np.float32)
    mask = np.zeros(roi.shape[:2], np.uint8); mask[y0-Y0:y1-Y0, x0-X0:x1-X0] = 255
    k = max(1, int(min(x1-x0, y1-y0) / 20))
    sw, sh = max(4, roi.shape[1]//k), max(4, roi.shape[0]//k)
    small = cv2.resize(roi.astype(np.uint8), (sw, sh), interpolation=cv2.INTER_AREA)
    ms = cv2.resize(mask, (sw, sh), interpolation=cv2.INTER_NEAREST)
    fill = cv2.inpaint(small, ms, 5, cv2.INPAINT_TELEA)
    big = cv2.resize(fill, (roi.shape[1], roi.shape[0]), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    big = cv2.GaussianBlur(big, (0,0), max(1.0, k*0.6))
    ring = cv2.dilate(mask, np.ones((9,9), np.uint8)) - mask
    sd = np.array([roi[..., ch][ring > 0].std() if (ring > 0).any() else 4 for ch in range(3)], np.float32)
    rng = np.random.default_rng(7); big += rng.normal(0, 1, roi.shape).astype(np.float32) * np.clip(sd*0.35, 1, 10)
    fm = cv2.GaussianBlur(mask.astype(np.float32)/255, (0,0), 2.2)[..., None]
    img[Y0:Y1, X0:X1] = np.clip(roi*(1-fm) + big*fm, 0, 255).astype(np.uint8)

def find_qr(img):
    """二維碼白底：右下角、近正方形、尺寸合理的最大白色連通區（不做形態閉合，避免併入旁邊的白色水晶）。"""
    h, w = img.shape[:2]; x0, y0 = int(w*0.7), int(h*0.8)
    sub = img[y0:, x0:]; m = (sub.min(axis=2) > 236).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    best = None
    for i in range(1, n):
        x, y, ww, hh, area = st[i]
        if area < 0.002*w*h or not (0.85 < ww/max(hh,1) < 1.18) or ww > 0.19*w: continue
        if best is None or area > best[4]: best = st[i]
    if best is None: return None
    x, y, ww, hh = best[:4]
    return [x0+x, y0+y, x0+x+ww, y0+y+hh]

def upscale(img, W, H):
    out = cv2.resize(img, (W, H), interpolation=cv2.INTER_LANCZOS4)
    blur = cv2.GaussianBlur(out, (0,0), 1.2)
    return cv2.addWeighted(out, 1.45, blur, -0.45, 0)

def save_webp(bgr, path, q=90):
    Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)).save(path, quality=q, method=6)
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()[:10]

spec = {'v': 1, 'design': [1080, 1350], 't': {}}
for t, s in SPEC.items():
    orig = load(t); img = orig.copy(); h, w = img.shape[:2]
    for name in s['clean']: clean(img, s['r'][name])
    r = dict(s['r']); qr = find_qr(orig)
    if qr: r['qr'] = qr
    else: r['qr'] = [round(0.784*w), round(0.852*h), round(0.94*w), round(0.978*h)]; print('  qr fallback', t)
    entry = {'r': {k: [round(v[0]/w,5), round(v[1]/h,5), round(v[2]/w,5), round(v[3]/h,5)] for k, v in r.items()}, 'src': [w, h]}
    entry['h'] = save_webp(upscale(img, OW, OH), os.path.join(OUT, t+'-2k.webp')); entry['f'] = t+'-2k.webp'
    a = s.get('atlas')
    if a:
        tiles = []
        for tn in a['tiles']:
            x0, y0, x1, y1 = s['r'][tn]; tile = orig[y0:y1, x0:x1].copy()
            for ir in a['inner']: clean(tile, ir, ctx=6)
            tiles.append(upscale(tile, (x1-x0)*a['scale'], (y1-y0)*a['scale']))
        th = max(x.shape[0] for x in tiles); atlas = np.zeros((th, sum(x.shape[1] for x in tiles), 3), np.uint8); x = 0; boxes = []
        for tl in tiles: atlas[:tl.shape[0], x:x+tl.shape[1]] = tl; boxes.append([x, 0, tl.shape[1], tl.shape[0]]); x += tl.shape[1]
        entry['a'] = {'f': a['name']+'.webp', 'h': save_webp(atlas, os.path.join(OUT, a['name']+'.webp'), 92), 'boxes': boxes}
    spec['t'][t] = entry
    print(f"{t:18s} src {w}x{h}  cleaned {len(s['clean'])} zones  qr {'ok' if qr else 'missing'}" + (f"  atlas {len(entry['a']['boxes'])}" if a else ''))
json.dump(spec, open(os.path.join(OUT, 'spec.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('spec.json written')
