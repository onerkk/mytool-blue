import math,random,sys
W,H=1024,1536;CX,CY=W/2,H/2
def P(x,y):return f"{x:.2f},{y:.2f}"
def rot(x,y,a):c,s=math.cos(a),math.sin(a);return (CX+(x-CX)*c-(y-CY)*s, CY+(x-CX)*s+(y-CY)*c)
def build(kind='tarot'):
    if kind=='tarot':
        bg0,bg1,bg2='#16305a','#0b1832','#050a16';enamel='#0d1f3d';accent='#7fa8e0'
    else:
        bg0,bg1,bg2='#14453f','#0a2724','#04110f';enamel='#0b2a27';accent='#79c9b4'
    o=[]
    o.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
    o.append(f'''<defs>
<radialGradient id="bg" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="{bg0}"/><stop offset=".55" stop-color="{bg1}"/><stop offset="1" stop-color="{bg2}"/></radialGradient>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8893c"/><stop offset=".22" stop-color="#f1d58a"/><stop offset=".38" stop-color="#9c7431"/><stop offset=".5" stop-color="#fff3c8"/><stop offset=".62" stop-color="#9c7431"/><stop offset=".78" stop-color="#f1d58a"/><stop offset="1" stop-color="#b8893c"/></linearGradient>
<linearGradient id="goldV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0bf"/><stop offset=".5" stop-color="#c99a45"/><stop offset="1" stop-color="#fff0bf"/></linearGradient>
<linearGradient id="goldDark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a5823"/><stop offset=".5" stop-color="#a77d33"/><stop offset="1" stop-color="#7a5823"/></linearGradient>
<radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe7a8" stop-opacity=".55"/><stop offset=".35" stop-color="#e9c271" stop-opacity=".18"/><stop offset="1" stop-color="#e9c271" stop-opacity="0"/></radialGradient>
<radialGradient id="moon" cx="50%" cy="50%" r="55%"><stop offset="0" stop-color="#fffaf0"/><stop offset=".55" stop-color="#f3e6c4"/><stop offset="1" stop-color="#cdb27a"/></radialGradient>
<radialGradient id="enamel" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="{accent}" stop-opacity=".55"/><stop offset=".6" stop-color="{enamel}"/><stop offset="1" stop-color="{bg2}"/></radialGradient>
<radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
</defs>''')
    o.append(f'<rect width="{W}" height="{H}" rx="44" fill="url(#bg)"/>')
    # starfield (point-symmetric: every star mirrored through the centre)
    rnd=random.Random(7 if kind=='tarot' else 11)
    for i in range(170):
        x,y=rnd.uniform(70,W-70),rnd.uniform(70,H/2);r=rnd.choice([.8,1,1.2,1.6,2.2]);op=rnd.uniform(.25,.85);col=rnd.choice(['#fff4d6','#e8cf8f','#cfe0ff'])
        for (sx,sy) in [(x,y),(W-x,H-y)]:o.append(f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="{r}" fill="{col}" opacity="{op:.2f}"/>')
    # guilloché rosettes (hypotrochoid bands) around the centre
    def hypo(R,r,d,turns,scale,sx,sy,steps=2400):
        pts=[]
        for k in range(steps+1):
            t=2*math.pi*turns*k/steps;x=(R-r)*math.cos(t)+d*math.cos((R-r)/r*t);y=(R-r)*math.sin(t)-d*math.sin((R-r)/r*t)
            pts.append(P(CX+x*scale*sx,CY+y*scale*sy))
        return 'M'+' L'.join(pts)
    # nebula clouds (point-symmetric pairs) for depth
    neb=['#5b4aa8','#2f6fb3','#7a3f8f'] if kind=='tarot' else ['#2d8f7a','#3a6f9a','#4a7f5a']
    for i,(x,y,r) in enumerate([(300,420,260),(760,300,200),(220,640,180)]):
        o.append(f'<defs><radialGradient id="n{i}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="{neb[i]}" stop-opacity=".28"/><stop offset="1" stop-color="{neb[i]}" stop-opacity="0"/></radialGradient></defs>')
        for (sx,sy) in [(x,y),(W-x,H-y)]:o.append(f'<ellipse cx="{sx}" cy="{sy}" rx="{r}" ry="{r*.7:.0f}" fill="url(#n{i})"/>')
    # guilloché: layered spirograph rosettes, banknote engraving look
    for (R,r,d,turns,sc,sw,op) in [(96,36,54,3,2.6,.55,.30),(120,30,46,1,2.75,.5,.24),(84,21,40,1,3.05,.45,.18),(105,35,60,1,2.2,.5,.22)]:
        o.append(f'<path d="{hypo(R,r,d,turns,sc,1,1.3)}" fill="none" stroke="url(#gold)" stroke-width="{sw}" opacity="{op}"/>')
    for k in range(36):
        a=k*math.pi/36
        o.append(f'<ellipse cx="{CX}" cy="{CY}" rx="300" ry="120" transform="rotate({math.degrees(a):.1f} {CX} {CY})" fill="none" stroke="url(#gold)" stroke-width=".35" opacity=".16"/>')
    # outer frame
    o.append('<rect x="22" y="22" width="980" height="1492" rx="34" fill="none" stroke="url(#gold)" stroke-width="5"/>')
    o.append('<rect x="38" y="38" width="948" height="1460" rx="24" fill="none" stroke="url(#gold)" stroke-width="1.6" opacity=".9"/>')
    for t in range(0,920,14):o.append(f'<circle cx="{52+t+7}" cy="52" r="1.6" fill="url(#gold)" opacity=".75"/><circle cx="{W-52-t-7}" cy="{H-52}" r="1.6" fill="url(#gold)" opacity=".75"/>')
    for t in range(0,1432,14):o.append(f'<circle cx="52" cy="{H-52-t-7}" r="1.6" fill="url(#gold)" opacity=".75"/><circle cx="{W-52}" cy="{52+t+7}" r="1.6" fill="url(#gold)" opacity=".75"/>')
    o.append('<rect x="24.5" y="24.5" width="975" height="1487" rx="32" fill="none" stroke="#fff3cf" stroke-width=".8" opacity=".6"/>')
    # art-deco corner fans
    def fan(cx,cy,a0):
        g=[];A=lambda r,a:(cx+math.cos(a)*r,cy+math.sin(a)*r)
        # stepped quarter annuli
        for (r0,r1,fill,op) in [(0,40,'url(#gold)',.95),(48,58,'url(#goldDark)',.9),(64,70,'url(#gold)',.9)]:
            p0,p1,p2,p3=A(r0,a0),A(r1,a0),A(r1,a0+math.pi/2),A(r0,a0+math.pi/2)
            d=f'M{P(*p1)} A{r1},{r1} 0 0 1 {P(*p2)} '+(f'L{P(*p3)} A{r0},{r0} 0 0 0 {P(*p0)} Z' if r0>0 else f'L{P(cx,cy)} Z')
            g.append(f'<path d="{d}" fill="{fill}" opacity="{op}"/>')
        # rays fanning out to a scalloped rim
        n=10
        for i in range(n+1):
            a=a0+i*(math.pi/2)/n;x1,y1=A(74,a);x2,y2=A(132 if i%2==0 else 112,a)
            g.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="url(#gold)" stroke-width="{1.6 if i%2==0 else .8}"/>')
            if i%2==0:
                x3,y3=A(140,a);g.append(f'<circle cx="{x3:.1f}" cy="{y3:.1f}" r="3.2" fill="url(#gold)"/>')
        for i in range(n):
            a=a0+(i+.5)*(math.pi/2)/n;x,y=A(124,a);g.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="1.6" fill="#fff0c4" opacity=".8"/>')
        # central jewel
        x,y=A(22,a0+math.pi/4);g.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="7" fill="{bg1}" stroke="#fff0c4" stroke-width="1.2"/>')
        return ''.join(g)
    for cx,cy,a0 in [(52,52,0),(972,52,math.pi/2),(972,1484,math.pi),(52,1484,-math.pi/2)]:o.append(fan(cx,cy,a0))
    # inner arched panel (point-symmetric ogee frame)
    def panel(m,sw,op):
        x0,y0,x1,y1=150+m,190+m,W-150-m,H-190-m
        d=f'M{CX},{y0-70} C{CX+90},{y0-40} {x1-40},{y0} {x1},{y0+110} L{x1},{y1-110} C{x1-40},{y1} {CX+90},{y1+40} {CX},{y1+70} C{CX-90},{y1+40} {x0+40},{y1} {x0},{y1-110} L{x0},{y0+110} C{x0+40},{y0} {CX-90},{y0-40} {CX},{y0-70} Z'
        return f'<path d="{d}" fill="none" stroke="url(#gold)" stroke-width="{sw}" opacity="{op}"/>'
    o.append(panel(0,3,1));o.append(panel(14,1,.7));o.append(panel(-10,.6,.35))
    # edge jewels
    for (x,y) in [(CX,58),(CX,H-58),(58,CY),(W-58,CY)]:
        o.append(f'<path d="M{x},{y-16} L{x+10},{y} L{x},{y+16} L{x-10},{y} Z" fill="url(#gold)"/><circle cx="{x}" cy="{y}" r="3" fill="{bg2}"/>')
    # vertical axis: dotted line + small star medallions (point-symmetric pair)
    o.append(f'<line x1="{CX}" y1="150" x2="{CX}" y2="{H-150}" stroke="url(#goldV)" stroke-width="1" stroke-dasharray="1 9" opacity=".7"/>')
    def star(cx,cy,R,r,n,fill='url(#gold)',rot0=-math.pi/2,facet=True):
        pts=[];g=[]
        for i in range(2*n):
            a=rot0+i*math.pi/n;rr=R if i%2==0 else r;pts.append((cx+math.cos(a)*rr,cy+math.sin(a)*rr))
        g.append('<path d="M'+' L'.join(P(*p) for p in pts)+' Z" fill="'+fill+'"/>')
        if facet:
            for i in range(0,2*n,2):
                a=rot0+i*math.pi/n;p1=(cx+math.cos(a)*R,cy+math.sin(a)*R);p2=pts[(i+1)%(2*n)]
                g.append(f'<path d="M{P(cx,cy)} L{P(*p1)} L{P(*p2)} Z" fill="url(#goldDark)" opacity=".85"/>')
        return ''.join(g)
    for sy in (330,H-330):
        o.append(f'<circle cx="{CX}" cy="{sy}" r="62" fill="url(#halo)"/>')
        o.append(f'<circle cx="{CX}" cy="{sy}" r="44" fill="none" stroke="url(#gold)" stroke-width="1.5"/><circle cx="{CX}" cy="{sy}" r="36" fill="none" stroke="url(#gold)" stroke-width=".7" stroke-dasharray="1 4"/>')
        o.append(star(CX,sy,30,6,4))
    # small four-point stars on the horizontal axis
    for sx in (232,W-232):o.append(star(sx,CY,18,4,4))
    # central medallion
    o.append(f'<circle cx="{CX}" cy="{CY}" r="300" fill="url(#halo)"/>')
    o.append(f'<circle cx="{CX}" cy="{CY}" r="252" fill="none" stroke="url(#gold)" stroke-width="3"/>')
    o.append(f'<circle cx="{CX}" cy="{CY}" r="240" fill="none" stroke="url(#gold)" stroke-width="1"/>')
    ticks=72 if kind=='tarot' else 36
    for i in range(ticks):
        a=2*math.pi*i/ticks;big=i%(ticks//12)==0;r0=240;r1=r0-(18 if big else 9)
        o.append(f'<line x1="{CX+math.cos(a)*r0:.1f}" y1="{CY+math.sin(a)*r0:.1f}" x2="{CX+math.cos(a)*r1:.1f}" y2="{CY+math.sin(a)*r1:.1f}" stroke="url(#gold)" stroke-width="{2 if big else 1}"/>')
    for i in range(12):
        a=2*math.pi*i/12+math.pi/12;o.append(star(CX+math.cos(a)*208,CY+math.sin(a)*208,7,2.5,4,facet=False))
    def phase(cx,cy,a,kind_):
        # crescent/half/full oriented radially (lit side faces outward)
        r=15;g=[f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r}" fill="{bg2}" stroke="url(#gold)" stroke-width="1.2"/>']
        if kind_=='full':g.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r-3}" fill="url(#moon)"/>')
        else:
            off={'half':0,'crescent':7,'gibbous':-6}[kind_];ux,uy=math.cos(a),math.sin(a)
            g.append(f'<clipPath id="cp{int(cx)}{int(cy)}"><circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r-3}"/></clipPath>')
            if kind_=='half':
                px,py=-uy,ux;pts=[(cx+px*(r-3),cy+py*(r-3)),(cx+px*(r-3)+ux*(r-3),cy+py*(r-3)+uy*(r-3)),(cx-px*(r-3)+ux*(r-3),cy-py*(r-3)+uy*(r-3)),(cx-px*(r-3),cy-py*(r-3))]
                g.append('<path clip-path="url(#cp%d%d)" d="M%s Z" fill="url(#moon)"/>'%(int(cx),int(cy),' L'.join(P(*p) for p in pts)))
            else:
                g.append(f'<g clip-path="url(#cp{int(cx)}{int(cy)})"><circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r-3}" fill="url(#moon)"/><circle cx="{cx-ux*off*1.6:.1f}" cy="{cy-uy*off*1.6:.1f}" r="{r-3}" fill="{bg2}"/></g>' if kind_=='crescent' else f'<g clip-path="url(#cp{int(cx)}{int(cy)})"><circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r-3}" fill="url(#moon)"/><circle cx="{cx-ux*14:.1f}" cy="{cy-uy*14:.1f}" r="{r-6}" fill="{bg2}" opacity=".9"/></g>')
        return ''.join(g)
    if kind=='tarot':
        seq=['full','gibbous','half','crescent']
        for i in range(8):
            a=-math.pi/2+i*math.pi/4;o.append(phase(CX+math.cos(a)*282,CY+math.sin(a)*282,a,seq[i%4]))
    o.append(f'<circle cx="{CX}" cy="{CY}" r="190" fill="url(#enamel)" stroke="url(#gold)" stroke-width="2.5"/>')
    # sunburst rays inside enamel
    for i in range(48):
        a=2*math.pi*i/48;r0=102;r1=186 if i%2==0 else 160
        o.append(f'<line x1="{CX+math.cos(a)*r0:.1f}" y1="{CY+math.sin(a)*r0:.1f}" x2="{CX+math.cos(a)*r1:.1f}" y2="{CY+math.sin(a)*r1:.1f}" stroke="url(#gold)" stroke-width="{1.3 if i%2==0 else .6}" opacity=".75"/>')
    # 8-point compass star (big) with facets
    o.append(star(CX,CY,182,40,4,rot0=-math.pi/2))
    o.append(star(CX,CY,128,30,4,rot0=-math.pi/4))
    if kind=='tarot':
        o.append(f'<circle cx="{CX}" cy="{CY}" r="96" fill="url(#halo)"/>')
        o.append(f'<circle cx="{CX}" cy="{CY}" r="68" fill="{bg1}" stroke="url(#gold)" stroke-width="3"/>')
        for i in range(36):
            a=2*math.pi*i/36;o.append(f'<circle cx="{CX+math.cos(a)*62:.1f}" cy="{CY+math.sin(a)*62:.1f}" r="1.5" fill="#fff0c4"/>')
        o.append(f'<circle cx="{CX}" cy="{CY}" r="54" fill="url(#moon)"/>')
        for (dx,dy,r) in [(-14,-10,9),(16,12,7),(6,-22,5),(-10,20,6)]:
            for sgn in (1,-1):o.append(f'<circle cx="{CX+sgn*dx}" cy="{CY+sgn*dy}" r="{r}" fill="#d9c493" opacity=".35"/>')
    else:
        # quatrefoil clover emblem (point-symmetric)
        o.append(f'<circle cx="{CX}" cy="{CY}" r="86" fill="url(#halo)"/>')
        o.append(f'<circle cx="{CX}" cy="{CY}" r="66" fill="{bg1}" stroke="url(#gold)" stroke-width="3"/>')
        for i in range(36):
            a=2*math.pi*i/36;o.append(f'<circle cx="{CX+math.cos(a)*60:.1f}" cy="{CY+math.sin(a)*60:.1f}" r="1.4" fill="#fff0c4"/>')
        for i in range(4):
            a=i*math.pi/2+math.pi/4;ux,uy=math.cos(a),math.sin(a);px,py=-uy,ux
            tip=(CX+ux*6,CY+uy*6);lobeA=(CX+ux*34+px*13,CY+uy*34+py*13);lobeB=(CX+ux*34-px*13,CY+uy*34-py*13)
            o.append(f'<path d="M{P(*tip)} Q{P(CX+ux*20+px*30,CY+uy*20+py*30)} {P(*lobeA)} A14,14 0 0 1 {P(CX+ux*44,CY+uy*44)} A14,14 0 0 1 {P(*lobeB)} Q{P(CX+ux*20-px*30,CY+uy*20-py*30)} {P(*tip)} Z" fill="url(#gold)" stroke="#fff0c4" stroke-width=".8"/>')
            o.append(f'<path d="M{P(*tip)} Q{P(CX+ux*20-px*30,CY+uy*20-py*30)} {P(*lobeB)} A14,14 0 0 0 {P(CX+ux*44,CY+uy*44)} L{P(*tip)} Z" fill="url(#goldDark)" opacity=".75"/>')
            o.append(f'<line x1="{tip[0]:.1f}" y1="{tip[1]:.1f}" x2="{CX+ux*40:.1f}" y2="{CY+uy*40:.1f}" stroke="{bg2}" stroke-width="1.2" opacity=".7"/>')
        o.append(f'<circle cx="{CX}" cy="{CY}" r="7" fill="{bg1}" stroke="#fff0c4" stroke-width="1.5"/>')
        for i in range(8):
            a=-math.pi/2+i*math.pi/4;x,y=CX+math.cos(a)*282,CY+math.sin(a)*282
            o.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="15" fill="{bg2}" stroke="url(#gold)" stroke-width="1.2"/>')
            o.append(star(x,y,10,3,4,rot0=a,facet=False) if i%2==0 else f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5" fill="url(#gold)"/>')
    # brand wordmark at top & bottom (bottom rotated 180° for symmetry)
    for (y,r) in [(150,0),(H-150,180)]:
        o.append(f'<text x="{CX}" y="{y}" transform="rotate({r} {CX} {y})" text-anchor="middle" font-family="Noto Serif CJK TC, Noto Serif TC, serif" font-size="26" letter-spacing="14" fill="url(#gold)" opacity=".9">JINGYUE</text>')
    o.append(f'<rect width="{W}" height="{H}" rx="44" fill="url(#vig)"/>')
    o.append('</svg>')
    return ''.join(o)
if __name__=='__main__':
    import cairosvg
    from PIL import Image
    import io
    for kind in ('tarot','lenormand'):
        svg=build(kind);open(f'/home/claude/cardback/{kind}.svg','w').write(svg)
        png=cairosvg.svg2png(bytestring=svg.encode(),output_width=W,output_height=H)
        im=Image.open(io.BytesIO(png)).convert('RGB');im.save(f'/home/claude/cardback/{kind}.png')
        print(kind,len(svg))

# post-processing (gold glow + grain + WebP), see scripts/build-card-backs-post.py
