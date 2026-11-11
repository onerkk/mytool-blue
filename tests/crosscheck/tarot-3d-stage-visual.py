import asyncio,json,time
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW')
        await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1');localStorage.setItem('_jy_copy_coach_v1','1')}catch(e){}")
        pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:260]));pg.on('console',lambda m:errs.append('C:'+m.text[:160]) if m.type=='error' else None)
        await pg.route('**/JS/tarot-scene.js*',lambda route,request:route.fulfill(path='/home/claude/mytool-blue/JS/tarot-scene.js',content_type='application/javascript'))
        await pg.goto('https://jingyue.uk/',wait_until='load',timeout=90000);await pg.wait_for_timeout(4000)
        await pg.add_script_tag(path='/home/claude/mytool-blue/JS/tarot-stage.js')
        await pg.click('#home-cta-btn');await pg.wait_for_timeout(1800);await pg.fill('#f-question','她未來會愛上我嗎');await pg.wait_for_timeout(600)
        await pg.click('#tool-cta button');await pg.wait_for_timeout(1800);await pg.get_by_text('直接送出').first.click();await pg.wait_for_timeout(4000)
        print('module',await pg.evaluate("[!!window.JYTarotSceneModule,!!window._jyTarotStageLoaded]"))
        await pg.evaluate("document.getElementById('tarot-dock-action').click()");await pg.wait_for_timeout(1800)
        shots=[]
        async def shot(n):
            await pg.screenshot(path='/tmp/x/%s.png'%n);shots.append(n)
        print('stage',await pg.evaluate("[!!document.querySelector('.tar3d.on'),(document.querySelector('.tar3d-line')||{}).textContent,(document.querySelector('.tar3d-btn')||{}).textContent]"));await shot('q0')
        await pg.click('.tar3d-btn');await pg.wait_for_timeout(1200);await shot('q1')
        # stir
        await pg.mouse.move(195,400);await pg.mouse.down()
        for i in range(24):
            import math
            await pg.mouse.move(195+90*math.cos(i/3),400+90*math.sin(i/3));await pg.wait_for_timeout(30)
        await pg.mouse.up();await pg.wait_for_timeout(700);await shot('q2')
        await pg.click('.tar3d-btn');await pg.wait_for_timeout(1500);await shot('q3');await pg.wait_for_timeout(1300);await shot('q4');await pg.wait_for_timeout(2200);await shot('q5')
        print('ribbon',await pg.evaluate("[(document.querySelector('.tar3d-line')||{}).textContent,(document.querySelector('.tar3d-sub')||{}).textContent,window._deckIsShuffled,document.querySelectorAll('#t-deck .tarot-deck-card').length]"))
        # tap picks
        for k,(x,y) in enumerate([(120,430),(200,420),(280,430),(160,425),(240,425),(195,430),(100,440),(300,440)]):
            n=await pg.evaluate("(typeof drawnCards!=='undefined'?drawnCards.length:-1)")
            cnt=await pg.evaluate("document.querySelectorAll('.tar3d-dots i').length")
            if n>=cnt>0: break
            await pg.mouse.click(x,y);await pg.wait_for_timeout(1300)
            if k==0: await shot('q6')
        print('picked',await pg.evaluate("[typeof drawnCards!=='undefined'?drawnCards.length:-1,document.querySelectorAll('.tar3d-dots i').length,(document.querySelector('.tar3d-sub')||{}).textContent]"));await shot('q7')
        await pg.wait_for_timeout(2600);await shot('q8');await pg.wait_for_timeout(5000);await shot('q9');await pg.wait_for_timeout(5000);await shot('q10')
        print('end',await pg.evaluate("[(document.querySelector('.tar3d-line')||{}).textContent,(document.querySelector('.tar3d-btn')||{}).textContent,(document.querySelector('.tar3d-btn')||{style:{}}).style.display]"))
        print('errors',errs[:4]);json.dump(shots,open('/tmp/x/shots4.json','w'));await b.close()
asyncio.run(main())
