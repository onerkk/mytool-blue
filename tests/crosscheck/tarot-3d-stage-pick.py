import asyncio,json,time,math
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW')
        await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1');localStorage.setItem('_jy_copy_coach_v1','1')}catch(e){}")
        pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:260]))
        for n in ['tarot-scene','tarot-stage']:
            await pg.route('**/JS/%s.js*'%n,lambda route,request,n=n:route.fulfill(path='/home/claude/mytool-blue/JS/%s.js'%n,content_type='application/javascript'))
        await pg.goto('https://jingyue.uk/',wait_until='load',timeout=90000);await pg.wait_for_timeout(4000)
        await pg.click('#home-cta-btn');await pg.wait_for_timeout(1800);await pg.fill('#f-question','她未來會愛上我嗎');await pg.wait_for_timeout(600)
        await pg.click('#tool-cta button');await pg.wait_for_timeout(1800);await pg.get_by_text('直接送出').first.click();await pg.wait_for_timeout(4000)
        await pg.evaluate("document.getElementById('tarot-dock-action').click()");await pg.wait_for_timeout(2000)
        st="[(document.querySelector('.tar3d-line')||{}).textContent,(document.querySelector('.tar3d-sub')||{}).textContent,(typeof drawnCards!=='undefined'?drawnCards.length:-1)]"
        await pg.evaluate("document.querySelector('.tar3d-btn').click()");await pg.wait_for_timeout(2600)
        await pg.evaluate("document.querySelector('.tar3d-btn').click()")
        for i in range(30):
            await pg.wait_for_timeout(400)
            if '推開' in (await pg.evaluate("(document.querySelector('.tar3d-line')||{}).textContent||''")): break
        await pg.wait_for_timeout(2600);print('ribbon',await pg.evaluate(st))
        # drag to scroll, then taps along the ribbon band (find its screen y by projecting: try several y)
        hits=0
        for (x,y) in [(195,300),(120,305),(270,305),(195,330),(90,315),(300,315),(160,290),(230,290),(195,310),(140,320),(250,320),(195,345)]:
            n0=await pg.evaluate("typeof drawnCards!=='undefined'?drawnCards.length:-1")
            if n0>=6: break
            await pg.touchscreen.tap(x,y);await pg.wait_for_timeout(1500)
            n1=await pg.evaluate("typeof drawnCards!=='undefined'?drawnCards.length:-1");hits+=n1>n0
            print('tap',(x,y),n0,'->',n1,await pg.evaluate("(document.querySelector('.tar3d-sub')||{}).textContent"))
        for i in range(40):
            await pg.wait_for_timeout(700)
            if '翻開了' in (await pg.evaluate("(document.querySelector('.tar3d-line')||{}).textContent||''")): break
        print('end',await pg.evaluate(st),'hits',hits);await pg.screenshot(path='/tmp/x/tfinal2.png')
        await pg.evaluate("document.querySelector('.tar3d-btn').click()");await pg.wait_for_timeout(1200)
        print('closed',await pg.evaluate("[!document.querySelector('.tar3d'),(document.getElementById('tarot-dock-action')||{}).innerText]"),'errors',errs[:3]);await b.close()
asyncio.run(main())
