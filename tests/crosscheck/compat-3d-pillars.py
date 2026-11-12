import asyncio,json,time
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW',timezone_id='Asia/Taipei')
        await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1');localStorage.setItem('_jy_copy_coach_v1','1')}catch(e){}")
        pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:260]));pg.on('console',lambda m:errs.append('C:'+m.text[:160]) if m.type=='error' else None)
        for n in ['pillar-scene','pillar-stage','bazi-suite','bazi-standalone']:
            await pg.route('**/JS/%s.js*'%n,lambda route,request,n=n:route.fulfill(path='/home/claude/mytool-blue/JS/%s.js'%n,content_type='application/javascript'))
        await pg.goto('https://jingyue.uk/',wait_until='load',timeout=90000);await pg.wait_for_timeout(4000)
        await pg.evaluate("document.querySelectorAll('.at-tool')[4].click()");await pg.wait_for_timeout(4500)
        print('set',await pg.evaluate("(()=>{const set=(id,v)=>{const e=document.getElementById(id);if(!e)return id+'?';e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));return ''};return [set('a-date','1988-03-14'),set('a-time','09:20'),set('a-gender','male'),set('b-date','1990-11-02'),set('b-time','21:05'),set('b-gender','female')].join('')||'ok'})()"))
        print('mod',await pg.evaluate("[!!window.JYPillarSceneModule,!!window._jyPillarStageLoaded]"))
        await pg.wait_for_timeout(1500)
        print('cast',await pg.evaluate("(()=>{const b=document.querySelector('#bzs-screen [data-act=cast-compat]');if(!b)return 'nocast';b.click();return b.innerText.trim()})()"));await pg.wait_for_timeout(4500)
        st="[!!document.querySelector('.pil3d.on'),(document.querySelector('.pil3d-title')||{}).textContent,(document.querySelector('.pil3d-line')||{}).textContent,(document.querySelector('.pil3d-sub')||{}).textContent,(document.querySelector('.pil3d-btn')||{}).textContent,!!document.querySelector('.jr-dialog')]"
        print('stage',await pg.evaluate(st),errs[:3]);await pg.screenshot(path='/tmp/x/c0.png')
        await pg.touchscreen.tap(150,470);await pg.wait_for_timeout(1900);print('tap',await pg.evaluate(st));await pg.screenshot(path='/tmp/x/c1.png')
        await pg.evaluate("document.querySelector('.pil3d-btn').click()")
        for i in range(40):
            await pg.wait_for_timeout(600)
            if '立起來了' in (await pg.evaluate("(document.querySelector('.pil3d-line')||{}).textContent||''")): break
        await pg.wait_for_timeout(1800);print('all',await pg.evaluate(st));await pg.screenshot(path='/tmp/x/c2.png')
        await pg.evaluate("document.querySelector('.pil3d-btn').click()");await pg.wait_for_timeout(4000)
        r=await pg.evaluate("""async()=>{const w=document.getElementById('bzs-screen');const t0=performance.now();const btn=[...w.querySelectorAll('button')].filter(e=>/複製完整提示詞/.test(e.textContent));const h0=w.scrollHeight;let frames=0,slow=0,last=performance.now();
          await new Promise(res=>{let y=0;function step(){const n=performance.now();if(n-last>50)slow++;last=n;frames++;y+=220;w.scrollTop=y;if(y<w.scrollHeight-w.clientHeight&&frames<120)requestAnimationFrame(step);else res();}requestAnimationFrame(step);});
          return {closed:!document.querySelector('.pil3d'),h0,h1:w.scrollHeight,copyButtons:btn.length,frames,slow,bf:[...w.querySelectorAll('*')].filter(e=>getComputedStyle(e).backdropFilter&&getComputedStyle(e).backdropFilter!=='none').length}}""")
        print('after',r,'errors',errs[:4]);await b.close()
asyncio.run(main())
