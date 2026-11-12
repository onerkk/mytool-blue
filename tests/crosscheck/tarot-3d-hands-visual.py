import asyncio,json,time,math,os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW')
        await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1');localStorage.setItem('_jy_copy_coach_v1','1')}catch(e){}")
        pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:260]));pg.on('console',lambda m:errs.append('C:'+m.text[:200]) if m.type=='error' else None)
        for n in ['tarot-scene','tarot-stage']:
            await pg.route('**/JS/%s.js*'%n,lambda route,request,n=n:route.fulfill(path='/home/claude/mytool-blue/JS/%s.js'%n,content_type='application/javascript'))
        async def asset(route,request):
            rel=request.url.split('/assets/3d/')[1].split('?')[0];pth='/home/claude/mytool-blue/assets/3d/'+rel
            if os.path.exists(pth): await route.fulfill(path=pth)
            else: await route.abort()
        await pg.route('**/assets/3d/**',asset)
        await pg.goto('https://jingyue.uk/',wait_until='load',timeout=90000);await pg.wait_for_timeout(4000)
        await pg.click('#home-cta-btn');await pg.wait_for_timeout(1800);await pg.fill('#f-question','這份工作值得做下去嗎');await pg.wait_for_timeout(600)
        await pg.click('#tool-cta button');await pg.wait_for_timeout(1800);await pg.get_by_text('直接送出').first.click();await pg.wait_for_timeout(4000)
        await pg.evaluate("document.getElementById('tarot-dock-action').click()");await pg.wait_for_timeout(4500)
        shots=[]
        async def shot(n):
            await pg.screenshot(path='/tmp/x/%s.png'%n);shots.append(n)
        await shot('h0')
        await pg.evaluate("document.querySelector('.tar3d-btn').click()");await pg.wait_for_timeout(3200);await shot('h1')
        await pg.mouse.move(150,420);await pg.mouse.down()
        for i in range(18):
            await pg.mouse.move(150+60*math.cos(i/3),430+50*math.sin(i/3));await pg.wait_for_timeout(25)
        await shot('h2');await pg.mouse.up()
        await pg.evaluate("document.querySelector('.tar3d-btn').click()");await pg.wait_for_timeout(900);await shot('h3')
        print('errors',errs[:5]);json.dump(shots,open('/tmp/x/shots6.json','w'));await b.close()
asyncio.run(main())
