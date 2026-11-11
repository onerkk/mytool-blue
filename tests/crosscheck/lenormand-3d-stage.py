import asyncio,json,time,math
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW')
        await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1');localStorage.setItem('_jy_copy_coach_v1','1')}catch(e){}")
        pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:260]));pg.on('console',lambda m:errs.append('C:'+m.text[:160]) if m.type=='error' else None)
        for n in ['tarot-scene','tarot-stage']:
            await pg.route('**/JS/%s.js*'%n,lambda route,request,n=n:route.fulfill(path='/home/claude/mytool-blue/JS/%s.js'%n,content_type='application/javascript'))
        await pg.goto('https://jingyue.uk/',wait_until='load',timeout=90000);await pg.wait_for_timeout(4000)
        await pg.evaluate("document.querySelectorAll('.at-tool')[2].click()");await pg.wait_for_timeout(3500);await pg.fill('#ln-q','她未來會愛上我嗎');await pg.wait_for_timeout(500)
        nx="(()=>{const r=document.getElementById('ln-screen');const b=[...r.querySelectorAll('button')].filter(e=>e.offsetParent&&!e.disabled&&/繼續|抽牌/.test(e.innerText.replace(/\\s/g,'')));if(b.length){const x=b[b.length-1];x.scrollIntoView({block:'center'});x.click();return x.innerText.replace(/\\s/g,'')}return ''})()"
        for i in range(3):
            print('step',await pg.evaluate(nx));await pg.wait_for_timeout(2600)
        st="[!!document.querySelector('.tar3d.on'),(document.querySelector('.tar3d-title')||{}).textContent,(document.querySelector('.tar3d-line')||{}).textContent,(document.querySelector('.tar3d-sub')||{}).textContent,(document.querySelector('.tar3d-btn')||{}).textContent]"
        print('stage',await pg.evaluate(st),'mod',await pg.evaluate("[!!window.JYTarotSceneModule,!!window._jyTarotStageLoaded,!!(window.JYRitual&&window.JYRitual.isActive&&window.JYRitual.isActive()),!!document.querySelector('.jr-dialog')]"),errs[:3]);await pg.screenshot(path='/tmp/x/l0.png')
        await pg.evaluate("document.querySelector('.tar3d-btn').click()");await pg.wait_for_timeout(2600)
        await pg.evaluate("document.querySelector('.tar3d-btn').click()")
        for i in range(40):
            await pg.wait_for_timeout(400)
            if '推開' in (await pg.evaluate("(document.querySelector('.tar3d-line')||{}).textContent||''")): break
        await pg.wait_for_timeout(2500);print('ribbon',await pg.evaluate(st));await pg.screenshot(path='/tmp/x/l1.png')
        await pg.touchscreen.tap(195,300);await pg.wait_for_timeout(1200);print('tap',await pg.evaluate(st))
        await pg.evaluate("document.querySelector('.tar3d-btn').click()")
        for i in range(60):
            await pg.wait_for_timeout(600)
            if '翻開了' in (await pg.evaluate("(document.querySelector('.tar3d-line')||{}).textContent||''")): break
        print('end',await pg.evaluate(st));await pg.screenshot(path='/tmp/x/l2.png')
        await pg.evaluate("document.querySelector('.tar3d-btn').click()");await pg.wait_for_timeout(1500)
        print('after',await pg.evaluate("[!document.querySelector('.tar3d'),!!document.querySelector('#ln-screen .ln-spread-section'),[...document.querySelectorAll('#ln-screen button')].filter(e=>/複製/.test(e.innerText)).length]"),'errors',errs[:4]);await b.close()
asyncio.run(main())
