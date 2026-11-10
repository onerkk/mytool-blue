import asyncio,json,sys
from playwright.async_api import async_playwright
DUMP='''()=>{const vis=e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>4&&r.height>4&&s.visibility!=='hidden'&&s.display!=='none'&&parseFloat(s.opacity)>0.05&&r.bottom>0&&r.top<innerHeight};
 const els=[...document.querySelectorAll('button,a,input,textarea,select,[role=button],[onclick],canvas')].filter(vis).map(e=>({g:e.tagName[0],t:(e.innerText||e.placeholder||e.getAttribute('aria-label')||'').trim().replace(/\\n/g,' ').slice(0,22),id:e.id,c:(e.className||'').toString().slice(0,24),y:Math.round(e.getBoundingClientRect().top)}));
 const heads=[...document.querySelectorAll('h1,h2,h3,h4')].filter(vis).map(e=>e.innerText.trim().replace(/\\n/g,' ').slice(0,26)).filter(Boolean).slice(0,6);
 const hints=[...document.querySelectorAll('p,small,.hint,[class*=hint],[class*=tip],[class*=guide],[class*=desc]')].filter(vis).map(e=>e.innerText.trim().replace(/\\n/g,' ')).filter(t=>t.length>8&&t.length<90).slice(0,6);
 return {heads,hints,els:els.filter(e=>!/nav-brand/.test(e.c)&&e.t!=='水晶選物 ↗').slice(0,22),coach:!!document.querySelector('.jy-coach-ring'),guide:!!document.querySelector('.jy-fg.on'),sy:Math.round(scrollY),H:document.documentElement.scrollHeight}}'''
async def main(acts,seen=True):
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox'])
        c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW',timezone_id='Asia/Taipei',permissions=['clipboard-read','clipboard-write'])
        if seen: await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1')}catch(e){}")
        pg=await c.new_page();errs=[]
        await pg.route('**/JS/bazi-standalone.js*',lambda route:route.fulfill(path='/home/claude/mytool-blue/JS/bazi-standalone.js',content_type='application/javascript'))
        await pg.route('**/JS/ziwei-standalone.js*',lambda route:route.fulfill(path='/home/claude/mytool-blue/JS/ziwei-standalone.js',content_type='application/javascript'))
        await pg.route('**/JS/first-guide.js*',lambda route:route.fulfill(path='/home/claude/mytool-blue/JS/first-guide.js',content_type='application/javascript'));pg.on('pageerror',lambda e:errs.append((getattr(e,'stack','') or str(e))[:420]))
        await pg.goto('https://jingyue.uk/',wait_until='load',timeout=90000);await pg.wait_for_timeout(5000)
        for a in acts:
            k,_,v=a.partition(':')
            try:
                if k=='click': await pg.locator(v).first.click(timeout=6000)
                elif k=='text': await pg.get_by_text(v,exact=False).first.click(timeout=6000)
                elif k=='fill': s,_,val=v.partition('=');await pg.fill(s,val)
                elif k=='wait': await pg.wait_for_timeout(int(v))
                elif k=='scroll': await pg.evaluate(f'window.scrollTo(0,{v})')
                elif k=='js': print('JS',json.dumps(await pg.evaluate(v),ensure_ascii=False)[:900])
                elif k=='shot': await pg.screenshot(path=f'/tmp/x/{v}.png')
                elif k=='dump': print('DUMP',json.dumps(await pg.evaluate(DUMP),ensure_ascii=False)[:1900])
            except Exception as e: print('FAIL',a,str(e)[:110])
        print('errors',errs[:4]);await b.close()
asyncio.run(main(json.loads(sys.argv[1]),seen=(len(sys.argv)<3)))
