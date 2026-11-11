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
        await pg.click('#home-cta-btn');await pg.wait_for_timeout(1800);await pg.fill('#f-question','這份工作值得做下去嗎');await pg.wait_for_timeout(600)
        await pg.click('#tool-cta button');await pg.wait_for_timeout(1800);await pg.get_by_text('直接送出').first.click();await pg.wait_for_timeout(4000)
        await pg.evaluate("document.getElementById('tarot-dock-action').click()");await pg.wait_for_timeout(2500)
        shots=[]
        async def shot(n):
            await pg.screenshot(path='/tmp/x/%s.png'%n);shots.append(n)
        await shot('u0')
        await pg.evaluate("document.querySelector('.tar3d-btn').click()");await pg.wait_for_timeout(1700);await shot('u1')
        await pg.mouse.move(195,420);await pg.mouse.down()
        for i in range(30):
            await pg.mouse.move(195+110*math.cos(i/3.2),430+90*math.sin(i/3.2));await pg.wait_for_timeout(25)
        await pg.mouse.up();await pg.wait_for_timeout(300);await shot('u2')
        await pg.evaluate("document.querySelector('.tar3d-btn').click()");await pg.wait_for_timeout(1300);await shot('u3')
        await pg.wait_for_timeout(900);await shot('u4');await pg.wait_for_timeout(700);await shot('u5');await pg.wait_for_timeout(1500)
        # wait until ribbon text
        for i in range(20):
            tx=await pg.evaluate("(document.querySelector('.tar3d-line')||{}).textContent||''")
            if '推開' in tx: break
            await pg.wait_for_timeout(400)
        await pg.wait_for_timeout(700);await shot('u6');await pg.wait_for_timeout(1600);await shot('u7')
        print('ribbon',await pg.evaluate("[(document.querySelector('.tar3d-line')||{}).textContent,(document.querySelector('.tar3d-sub')||{}).textContent,document.querySelectorAll('.tar3d-dots i').length]"))
        await pg.touchscreen.tap(195,300);await pg.wait_for_timeout(500);await shot('u8');await pg.wait_for_timeout(1100)
        await pg.evaluate("document.querySelector('.tar3d-btn').click()")
        for i in range(30):
            await pg.wait_for_timeout(700)
            tx=await pg.evaluate("(document.querySelector('.tar3d-line')||{}).textContent||''")
            if '擺好' in tx: break
        await shot('u9');await pg.wait_for_timeout(3500);await shot('u10')
        for i in range(30):
            await pg.wait_for_timeout(700)
            if '翻開了' in (await pg.evaluate("(document.querySelector('.tar3d-line')||{}).textContent||''")): break
        await shot('u11')
        print('end',await pg.evaluate("[(document.querySelector('.tar3d-line')||{}).textContent,(document.querySelector('.tar3d-btn')||{}).textContent,typeof drawnCards!=='undefined'?drawnCards.length:-1]"),'errors',errs[:4])
        json.dump(shots,open('/tmp/x/shots5.json','w'));await b.close()
asyncio.run(main())
