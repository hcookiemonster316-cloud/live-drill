"""Patrol City's own typeface, built from scratch: every glyph is a hand-placed skeleton of lines and arcs that is
stroked with round ends and joins. Two families come out of the same drawings:
  Meridian          condensed display face for headings, HUD labels and buttons (weights 600, 700, 800)
  Meridian Text     normal-width face for body copy (weights 400, 600, 700)
Run:  python3 tools/makefont.py   (writes academy/fonts/*.woff)
"""
import math, os
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

C, X, ASC, DESC = 700, 510, 720, -200  # cap height, x-height, ascender, descender (UPM 1000)

# ---------------------------------------------------------------- skeleton primitives
def L(*pts): return ('L', list(pts))
def A(cx, cy, rx, ry, a0, a1): return ('A', (cx, cy, rx, ry, a0, a1))
def O(cx, cy, rx, ry): return ('O', (cx, cy, rx, ry))
def D(x, y, k=1.0): return ('D', (x, y, k))  # a round dot, k times the stroke weight

def arcpts(cx, cy, rx, ry, a0, a1, n=None):
    span = abs(a1 - a0); n = n or max(8, int(span / 6))
    return [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]

# ---------------------------------------------------------------- the drawings
def S_shape(cx, top, h, w):  # an S inside the box (cx - w/2 .. cx + w/2, 0 .. h), top at 'top'
    r = h / 4
    return [A(cx, h - r, w / 2 * .94, r, 20, 270), A(cx, r, w / 2, r, 90, -160)]

G = {}
G['A'] = [L((0, 0), (270, C), (540, 0)), L((95, 230), (445, 230))]
G['B'] = [L((0, 0), (0, C), (270, C)), A(270, 540, 170, 160, 90, -90), L((270, 380), (0, 380)), L((270, 380), (300, 380)), A(300, 190, 200, 190, 90, -90), L((300, 0), (0, 0))]
G['C'] = [A(310, 350, 310, 350, 42, 318)]
G['D'] = [L((0, 0), (0, C), (230, C)), A(230, 350, 310, 350, 90, -90), L((230, 0), (0, 0))]
G['E'] = [L((430, C), (0, C), (0, 0), (430, 0)), L((0, 365), (370, 365))]
G['F'] = [L((430, C), (0, C), (0, 0)), L((0, 365), (370, 365))]
G['G'] = [A(310, 350, 310, 350, 40, 335), L((340, 300), (612, 300), (612, 140))]
G['H'] = [L((0, 0), (0, C)), L((500, 0), (500, C)), L((0, 365), (500, 365))]
G['I'] = [L((0, 0), (0, C))]
G['J'] = [L((360, C), (360, 210)), A(185, 210, 175, 210, 0, -180)]
G['K'] = [L((0, 0), (0, C)), L((470, C), (0, 250)), L((160, 400), (490, 0))]
G['L'] = [L((0, C), (0, 0), (410, 0))]
G['M'] = [L((0, 0), (0, C), (310, 200), (620, C), (620, 0))]
G['N'] = [L((0, 0), (0, C), (510, 0), (510, C))]
G['O'] = [O(330, 350, 330, 350)]
G['P'] = [L((0, 0), (0, C), (270, C)), A(270, 510, 190, 190, 90, -90), L((270, 320), (0, 320))]
G['Q'] = [O(330, 350, 330, 350), L((400, 170), (640, -70))]
G['R'] = [L((0, 0), (0, C), (270, C)), A(270, 510, 190, 190, 90, -90), L((270, 320), (0, 320)), L((250, 320), (490, 0))]
G['S'] = S_shape(260, C, C, 500)
G['T'] = [L((0, C), (560, C)), L((280, C), (280, 0))]
G['U'] = [L((0, C), (0, 250)), A(255, 250, 255, 250, 180, 360), L((510, 250), (510, C))]
G['V'] = [L((0, C), (275, 0), (550, C))]
G['W'] = [L((0, C), (190, 0), (370, 560), (550, 0), (740, C))]
G['X'] = [L((0, C), (510, 0)), L((510, C), (0, 0))]
G['Y'] = [L((0, C), (275, 345), (550, C)), L((275, 345), (275, 0))]
G['Z'] = [L((0, C), (500, C), (0, 0), (510, 0))]
# digits
G['0'] = [O(255, 350, 255, 350)]
G['1'] = [L((40, 555), (250, C), (250, 0))]
G['2'] = [A(245, 480, 235, 220, 162, -38), L((430, 345), (0, 0), (500, 0))]
G['3'] = [A(240, 530, 215, 170, 155, -90), L((240, 360), (250, 360)), A(250, 185, 250, 185, 90, -155)]
G['4'] = [L((380, 0), (380, C), (0, 200), (530, 200))]
G['5'] = [L((450, C), (70, C), (40, 395)), A(255, 225, 255, 225, 138, -155)]
G['6'] = [O(255, 225, 245, 225), L((415, C), (55, 290))]
G['7'] = [L((0, C), (500, C), (160, 0))]
G['8'] = [O(250, 535, 210, 165), O(250, 190, 250, 190)]
G['9'] = [O(245, 475, 245, 225), L((440, 410), (85, 0))]
# lowercase
G['a'] = [O(235, 255, 235, 255), L((470, X), (470, 0))]
G['b'] = [L((0, ASC), (0, 0)), O(235, 255, 235, 255)]
G['c'] = [A(245, 255, 245, 255, 45, 315)]
G['d'] = [O(235, 255, 235, 255), L((470, ASC), (470, 0))]
G['e'] = [A(245, 255, 245, 255, 0, 325), L((0, 255), (490, 255))]
G['f'] = [L((150, 0), (150, 560)), A(300, 560, 150, 160, 180, 35), L((10, X), (330, X))]
G['g'] = [O(235, 255, 235, 255), L((470, X), (470, -40)), A(235, -40, 235, 160, 0, -165)]
G['h'] = [L((0, ASC), (0, 0)), A(235, 290, 235, 220, 180, 0), L((470, 290), (470, 0))]
G['i'] = [L((0, 0), (0, X)), D(0, 685, .62)]
G['j'] = [L((110, X), (110, -60)), A(0, -60, 110, 140, 0, -150), D(110, 685, .62)]
G['k'] = [L((0, ASC), (0, 0)), L((410, X), (0, 175)), L((140, 290), (430, 0))]
G['l'] = [L((0, ASC), (0, 0))]
G['m'] = [L((0, 0), (0, X)), A(185, 330, 185, 180, 180, 0), L((370, 330), (370, 0)), A(555, 330, 185, 180, 180, 0), L((740, 330), (740, 0))]
G['n'] = [L((0, 0), (0, X)), A(235, 290, 235, 220, 180, 0), L((470, 290), (470, 0))]
G['o'] = [O(255, 255, 255, 255)]
G['p'] = [L((0, X), (0, DESC)), O(235, 255, 235, 255)]
G['q'] = [O(235, 255, 235, 255), L((470, X), (470, DESC))]
G['r'] = [L((0, 0), (0, X)), A(260, 290, 260, 220, 180, 72)]
G['s'] = S_shape(205, X, X, 410)
G['t'] = [L((150, 680), (150, 140)), A(300, 140, 150, 140, 180, 270), L((10, X), (330, X))]
G['u'] = [L((0, X), (0, 230)), A(235, 230, 235, 230, 180, 360), L((470, X), (470, 0))]
G['v'] = [L((0, X), (225, 0), (450, X))]
G['w'] = [L((0, X), (165, 0), (330, 400), (495, 0), (660, X))]
G['x'] = [L((0, X), (430, 0)), L((430, X), (0, 0))]
G['y'] = [L((0, X), (225, 0)), L((450, X), (150, DESC))]
G['z'] = [L((0, X), (410, X), (0, 0), (420, 0))]
# punctuation and symbols
G['.'] = [D(0, 0, .78)]
G[','] = [D(40, 0, .78), L((40, 10), (-10, -120))]
G[':'] = [D(0, 0, .78), D(0, 400, .78)]
G[';'] = [D(40, 400, .78), D(40, 0, .78), L((40, 10), (-10, -120))]
G['!'] = [L((0, C), (0, 230)), D(0, 0, .78)]
G['?'] = [A(210, 520, 205, 180, 160, -60), L((313, 364), (215, 300), (215, 220)), D(215, 0, .78)]
G["'"] = [L((0, C), (0, 500))]
G['"'] = [L((0, C), (0, 500)), L((150, C), (150, 500))]
G['’'] = [D(40, 640, .7), L((40, 650), (0, 520))]
G['‘'] = [D(0, 580, .7), L((0, 570), (40, 700))]
G['”'] = [D(40, 640, .7), L((40, 650), (0, 520)), D(180, 640, .7), L((180, 650), (140, 520))]
G['“'] = [D(0, 580, .7), L((0, 570), (40, 700)), D(140, 580, .7), L((140, 570), (180, 700))]
G['-'] = [L((0, 290), (260, 290))]
G['–'] = [L((0, 290), (470, 290))]
G['—'] = [L((0, 290), (880, 290))]
G['('] = [A(270, 300, 270, 440, 115, 245)]
G[')'] = [A(0, 300, 270, 440, 65, -65)]
G['['] = [L((160, 790), (0, 790), (0, -190), (160, -190))]
G[']'] = [L((0, 790), (160, 790), (160, -190), (0, -190))]
G['/'] = [L((0, -90), (380, 780))]
G['\\'] = [L((380, -90), (0, 780))]
G['&'] = [O(215, 555, 130, 140), L((140, 445), (540, 0)), A(225, 190, 225, 190, 50, 260), L((480, 330), (430, 230))]
G['+'] = [L((0, 300), (460, 300)), L((230, 70), (230, 530))]
G['='] = [L((0, 200), (440, 200)), L((0, 400), (440, 400))]
G['%'] = [O(115, 560, 115, 140), O(475, 140, 115, 140), L((20, 0), (570, C))]
G['#'] = [L((160, 0), (230, C)), L((350, 0), (420, C)), L((40, 230), (530, 230)), L((70, 470), (560, 470))]
G['@'] = [A(360, 290, 360, 400, -25, 330), O(350, 290, 130, 150), L((480, 440), (480, 200), (560, 130))]
G['$'] = S_shape(260, C, C, 500) + [L((260, 790), (260, -90))]
G['*'] = [L((150, 700), (150, 430)), L((20, 640), (280, 490)), L((280, 640), (20, 490))]
G['•'] = [D(0, 300, 1.4)]
G['·'] = [D(0, 300, .78)]
G['…'] = [D(0, 0, .78), D(220, 0, .78), D(440, 0, .78)]
G['_'] = [L((0, -130), (500, -130))]
G['<'] = [L((440, 540), (0, 300), (440, 60))]
G['>'] = [L((0, 540), (440, 300), (0, 60))]
G['|'] = [L((0, 790), (0, -190))]
G['^'] = [L((0, 450), (210, C), (420, 450))]
G['~'] = [A(110, 300, 110, 90, 180, 0), A(330, 300, 110, 90, 180, 360)]
G['×'] = [L((0, 90), (380, 470)), L((380, 90), (0, 470))]
G['✓'] = [L((0, 300), (180, 80), (520, 640))]
G['°'] = [O(110, 600, 100, 100)]
# accented letters for the city's Spanish and French names
def accent(base, kind, cap=False):
    g = list(G[base]); xs = [p[0] for s in g for p in pts_of(s)]; cx = (min(xs) + max(xs)) / 2; y = 860 if cap else 640
    if kind == 'acute': g.append(L((cx - 50, y), (cx + 80, y + 150)))
    if kind == 'grave': g.append(L((cx + 50, y), (cx - 80, y + 150)))
    if kind == 'tilde': g.append(L((cx - 150, y + 20), (cx - 60, y + 110), (cx + 60, y + 30), (cx + 150, y + 120)))
    if kind == 'diaer': g += [D(cx - 110, y + 70, .62), D(cx + 110, y + 70, .62)]
    if kind == 'circ': g.append(L((cx - 130, y), (cx, y + 140), (cx + 130, y)))
    return g
def pts_of(s):
    k, v = s
    if k == 'L': return v
    if k == 'A': return arcpts(*v, n=12)
    if k == 'O': cx, cy, rx, ry = v; return [(cx - rx, cy), (cx + rx, cy)]
    return [(v[0], v[1])]
G['ı'] = [L((0, 0), (0, X))]  # dotless i, base for í
for ch, base, kind, cap in [('á', 'a', 'acute', 0), ('é', 'e', 'acute', 0), ('í', 'ı', 'acute', 0), ('ó', 'o', 'acute', 0), ('ú', 'u', 'acute', 0), ('ñ', 'n', 'tilde', 0), ('ü', 'u', 'diaer', 0),
                            ('è', 'e', 'grave', 0), ('ç', 'c', None, 0), ('Á', 'A', 'acute', 1), ('É', 'E', 'acute', 1), ('Í', 'I', 'acute', 1), ('Ó', 'O', 'acute', 1), ('Ú', 'U', 'acute', 1), ('Ñ', 'N', 'tilde', 1), ('ê', 'e', 'circ', 0)]:
    G[ch] = accent(base, kind, cap) if kind else G[base] + [L((245, 0), (215, -150))]

# ---------------------------------------------------------------- stroking
def circle(cx, cy, r, n=20): return [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)]
def area(p): return sum(p[i][0] * p[(i + 1) % len(p)][1] - p[(i + 1) % len(p)][0] * p[i][1] for i in range(len(p))) / 2
def cw(p): return p if area(p) < 0 else p[::-1]   # TrueType fills clockwise outlines
def ccw(p): return p if area(p) > 0 else p[::-1]
def seg_quad(a, b, h):
    dx, dy = b[0] - a[0], b[1] - a[1]; l = math.hypot(dx, dy) or 1; nx, ny = -dy / l * h, dx / l * h
    return [(a[0] + nx, a[1] + ny), (b[0] + nx, b[1] + ny), (b[0] - nx, b[1] - ny), (a[0] - nx, a[1] - ny)]
def offset_curve(pts, h):  # a smooth band along a polyline (used for arcs): one contour, no seams
    left, right = [], []
    for i, p in enumerate(pts):
        a = pts[max(0, i - 1)]; b = pts[min(len(pts) - 1, i + 1)]; dx, dy = b[0] - a[0], b[1] - a[1]; l = math.hypot(dx, dy) or 1
        left.append((p[0] - dy / l * h, p[1] + dx / l * h)); right.append((p[0] + dy / l * h, p[1] - dx / l * h))
    return left + right[::-1]
def stroke(glyph, w, sx):
    h = w / 2; out = []; holes = []
    for k, v in glyph:
        if k == 'L':
            p = [(x * sx, y) for x, y in v]
            for i in range(len(p) - 1): out.append(cw(seg_quad(p[i], p[i + 1], h)))
            for q in p: out.append(cw(circle(q[0], q[1], h)))
        elif k == 'A':
            cx, cy, rx, ry, a0, a1 = v; p = [(x * sx, y) for x, y in arcpts(cx, cy, rx, ry, a0, a1)]
            out.append(cw(offset_curve(p, h))); out += [cw(circle(p[0][0], p[0][1], h)), cw(circle(p[-1][0], p[-1][1], h))]
        elif k == 'O':
            cx, cy, rx, ry = v; n = 72
            outer = [(cx * sx + (rx * sx + h) * math.cos(2 * math.pi * i / n), cy + (ry + h) * math.sin(2 * math.pi * i / n)) for i in range(n)]
            inner = [(cx * sx + max(8, rx * sx - h) * math.cos(2 * math.pi * i / n), cy + max(8, ry - h) * math.sin(2 * math.pi * i / n)) for i in range(n)]
            out.append(cw(outer)); holes.append(ccw(inner))
        elif k == 'D':
            x, y, kk = v; r = h * kk * 1.25 + 4; out.append(cw(circle(x * sx, y + r if y == 0 else y, r, 24)))
    return out, holes

def build(family, style, weight, w, sx, fname, track):
    names = ['.notdef', 'space'] + ['g%04x' % ord(c) for c in G]
    fb = FontBuilder(1000, isTTF=True); fb.setupGlyphOrder(names)
    fb.setupCharacterMap({32: 'space', 160: 'space', **{ord(c): 'g%04x' % ord(c) for c in G}})
    glyphs, metrics = {}, {}
    pen = TTGlyphPen(None); glyphs['.notdef'] = pen.glyph(); metrics['.notdef'] = (500, 0)
    pen = TTGlyphPen(None); glyphs['space'] = pen.glyph(); metrics['space'] = (int(230 * (sx * .9 + .1) + track * 2), 0)
    for c, sk in G.items():
        outs, holes = stroke(sk, w, sx); xs = [p[0] for c2 in outs for p in c2]; minx = min(xs); maxx = max(xs)
        sb = int(16 + w * .14 + track / 2); dx = sb - minx; pen = TTGlyphPen(None)
        for cont in outs + holes:
            pen.moveTo((round(cont[0][0] + dx), round(cont[0][1])))
            for p in cont[1:]: pen.lineTo((round(p[0] + dx), round(p[1])))
            pen.closePath()
        gname = 'g%04x' % ord(c); glyphs[gname] = pen.glyph(); metrics[gname] = (int(maxx - minx + 2 * sb), sb)
    fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=930, descent=-270)
    fb.setupNameTable({'familyName': family, 'styleName': style, 'uniqueFontIdentifier': family + ' ' + style + ' (Patrol City)', 'fullName': family + ' ' + style, 'psName': (family + '-' + style).replace(' ', ''), 'version': 'Version 1.000',
                       'copyright': 'Drawn from scratch for Patrol City.', 'licenseDescription': 'Part of Patrol City.'})
    fb.setupOS2(sTypoAscender=930, sTypoDescender=-270, usWinAscent=1000, usWinDescent=300, sxHeight=X, sCapHeight=C, usWeightClass=weight, fsSelection=0x40)
    fb.setupPost(); fb.setupDummyDSIG() if hasattr(fb, 'setupDummyDSIG') else None
    for g in fb.font['glyf'].glyphs.values():
        if hasattr(g, 'flags') and g.numberOfContours > 0: g.flags[0] |= 0x40  # OVERLAP_SIMPLE: contours overlap on purpose
    fb.font.flavor = 'woff'; fb.save(fname); return fname

OUT = os.path.join(os.path.dirname(__file__), '..', 'academy', 'fonts')
os.makedirs(OUT, exist_ok=True)
for weight, w in [(600, 104), (700, 126), (800, 150)]:
    print(build('Meridian', {600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold'}[weight], weight, w, .8, os.path.join(OUT, 'meridian-%d.woff' % weight), 14))
for weight, w in [(400, 70), (600, 90), (700, 108)]:
    print(build('Meridian Text', {400: 'Regular', 600: 'SemiBold', 700: 'Bold'}[weight], weight, w, .94, os.path.join(OUT, 'meridian-text-%d.woff' % weight), 44))
