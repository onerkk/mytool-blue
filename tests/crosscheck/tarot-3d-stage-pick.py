import asyncio,json,time,math
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW')
        await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1');localStorage.setItem('_jy_copy_coach_v1','1')}catch(e){}")
        pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:260]))
        await pg.route('**/JS/tarot-scene.js*',lambda route,request:route.fulfill(path='/home/claude/mytool-blue/JS/tarot-scene.js',content_type='application/javascript'))
        await pg.goto('https://jingyue.uk/',wait_until='load',timeout=90000);await pg.wait_for_timeout(4000)
        await pg.add_script_tag(path='/home/claude/mytool-blue/JS/tarot-stage.js')
        await pg.click('#home-cta-btn');await pg.wait_for_timeout(1800);await pg.fill('#f-question','她未來會愛上我嗎');await pg.wait_for_timeout(600)
        await pg.click('#tool-cta button');await pg.wait_for_timeout(1800);await pg.get_by_text('直接送出').first.click();await pg.wait_for_timeout(4000)
        await pg.evaluate("document.getElementById('tarot-dock-action').click()");await pg.wait_for_timeout(1500)
        st="[(document.querySelector('.tar3d-line')||{}).textContent,(document.querySelector('.tar3d-btn')||{}).textContent,(document.querySelector('.tar3d-btn')||{style:{}}).style.display,(typeof drawnCards!=='undefined'?drawnCards.length:-1),window._deckIsShuffled]"
        await pg.evaluate("document.querySelector('.tar3d-btn').click()");await pg.wait_for_timeout(1800)
        print('wash',await pg.evaluate(st))
        await pg.evaluate("document.querySelector('.tar3d-btn').click()");await pg.wait_for_timeout(4200)
        for (x,y) in [(110,330),(200,320),(290,330),(150,325),(245,325),(195,335),(90,340),(310,340),(130,330)]:
            n=await pg.evaluate("typeof drawnCards!=='undefined'?drawnCards.length:-1")
            if n>=6: break
            await pg.touchscreen.tap(x,y);await pg.wait_for_timeout(1100)
            print('tap',(x,y),'->',await pg.evaluate(st))
        # drag to scroll then tap again
        await pg.wait_for_timeout(9000)
        print('final',await pg.evaluate(st))
        await pg.screenshot(path='/tmp/x/tfinal.png')
        await pg.evaluate("document.querySelector('.tar3d-btn').click()");await pg.wait_for_timeout(1200)
        print('closed',await pg.evaluate("[!document.querySelector('.tar3d'),typeof drawnCards!=='undefined'?drawnCards.length:-1,(document.getElementById('tarot-dock-action')||{}).innerText]"))
        print('errors',errs[:3]);await b.close()
asyncio.run(main())
