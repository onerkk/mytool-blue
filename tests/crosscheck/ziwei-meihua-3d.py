import asyncio,json,time
from playwright.async_api import async_playwright
async def run(kind):
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW',timezone_id='Asia/Taipei')
        await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1');localStorage.setItem('_jy_copy_coach_v1','1')}catch(e){}")
        pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:260]));pg.on('console',lambda m:errs.append('C:'+m.text[:160]) if m.type=='error' else None)
        for n in ['wheel-scene','ziwei-standalone','meihua-standalone','pillar-stage']:
            await pg.route('**/JS/%s.js*'%n,lambda route,request,n=n:route.fulfill(path='/home/claude/mytool-blue/JS/%s.js'%n,content_type='application/javascript'))
        await pg.goto('https://jingyue.uk/',wait_until='load',timeout=90000);await pg.wait_for_timeout(4000)
        await pg.add_script_tag(path='/home/claude/mytool-blue/JS/wheel-stage.js')
        if kind=='ziwei':
            await pg.evaluate("document.querySelectorAll('.at-tool')[5].click()");await pg.wait_for_timeout(4000);await pg.fill('#zw-q','明年適合換工作嗎')
            await pg.evaluate("(()=>{const b=[...document.querySelectorAll('#zw-input button')].find(e=>/繼續/.test(e.innerText)&&e.offsetParent);if(b)b.click();return !!b})()");await pg.wait_for_timeout(1500)
            await pg.click('#zwx-fld-date');await pg.wait_for_timeout(1000)
            await pg.evaluate("(()=>{const d=[...document.querySelectorAll('[class*=cal-d]')].find(e=>e.innerText.trim()==='15'&&e.offsetParent);d.click();return 1})()");await pg.wait_for_timeout(400)
            ok="(()=>{const b=[...document.querySelectorAll('dialog[open] button,[class*=sheet] button')].filter(e=>e.getBoundingClientRect().width>20&&/^確定$/.test(e.innerText.trim()));if(b.length){b[b.length-1].click();return 1}return 0})()"
            await pg.evaluate(ok);await pg.wait_for_timeout(800);await pg.click('#zwx-fld-hh');await pg.wait_for_timeout(1000)
            await pg.evaluate("(()=>{const o=[...document.querySelectorAll('button,[role=option],li')].filter(e=>/巳/.test(e.innerText)&&e.offsetParent&&e.innerText.length<24);o[0].click();return 1})()");await pg.wait_for_timeout(400);await pg.evaluate(ok);await pg.wait_for_timeout(700)
            await pg.click('#zw-g-m');await pg.wait_for_timeout(1500)
            print('mod',await pg.evaluate("[!!window.JYWheelSceneModule,!!window._jyWheelStageLoaded]"))
            await pg.evaluate("document.querySelector('.zw-in-go').click()")
        else:
            await pg.evaluate("document.querySelectorAll('.at-tool')[6].click()");await pg.wait_for_timeout(4000);await pg.fill('#mhx-q','這個案子推得動嗎')
            await pg.evaluate("(()=>{const b=[...document.querySelectorAll('#mhx-screen button')].find(e=>/繼續/.test(e.innerText)&&e.offsetParent);if(b)b.click();return !!b})()");await pg.wait_for_timeout(2500)
            print('mod',await pg.evaluate("[!!window.JYWheelSceneModule,!!window._jyWheelStageLoaded]"))
            await pg.evaluate("document.querySelector('.mhx-cast-btn').click()")
        await pg.wait_for_timeout(3500)
        st="[!!document.querySelector('.pil3d.on'),(document.querySelector('.pil3d-title')||{}).textContent,(document.querySelector('.pil3d-line')||{}).textContent,(document.querySelector('.pil3d-sub')||{}).textContent,(document.querySelector('.pil3d-btn')||{}).textContent,!!document.querySelector('.jr-dialog')]"
        print(kind,'stage',await pg.evaluate(st),errs[:3]);await pg.screenshot(path='/tmp/x/%s0.png'%kind)
        await pg.touchscreen.tap(195,400);await pg.wait_for_timeout(2200);print('tap',await pg.evaluate(st));await pg.screenshot(path='/tmp/x/%s1.png'%kind)
        await pg.evaluate("document.querySelector('.pil3d-btn').click()")
        for i in range(40):
            await pg.wait_for_timeout(600)
            t=await pg.evaluate("(document.querySelector('.pil3d-line')||{}).textContent||''")
            if '都亮了' in t or '卦成了' in t: break
        await pg.wait_for_timeout(1500);print('all',await pg.evaluate(st));await pg.screenshot(path='/tmp/x/%s2.png'%kind)
        await pg.evaluate("document.querySelector('.pil3d-btn').click()");await pg.wait_for_timeout(3500)
        print('after',await pg.evaluate("[!document.querySelector('.pil3d'),[...document.querySelectorAll('button')].filter(e=>/複製/.test(e.textContent)&&/提示詞/.test(e.textContent)).length]"),'errors',errs[:4]);await b.close()
import sys
asyncio.run(run(sys.argv[1]))
