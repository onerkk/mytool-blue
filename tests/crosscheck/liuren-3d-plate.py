import asyncio,json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW',timezone_id='Asia/Taipei')
        await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1');localStorage.setItem('_jy_copy_coach_v1','1')}catch(e){}")
        pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:260]));pg.on('console',lambda m:errs.append('C:'+m.text[:160]) if m.type=='error' else None)
        for n in ['jy-scenes','wheel-stage','pillar-stage','liuren-room']:
            await pg.route('**/JS/%s.js*'%n,lambda route,request,n=n:route.fulfill(path='/home/claude/mytool-blue/JS/%s.js'%n,content_type='application/javascript'))
        await pg.goto('https://jingyue.uk/',wait_until='load',timeout=90000);await pg.wait_for_timeout(4000)
        await pg.evaluate("document.querySelectorAll('.at-tool')[13].click()");await pg.wait_for_timeout(6000)
        print('mod',await pg.evaluate("[!!window.JYWheelSceneModule,!!window.JYLiurenStage]"))
        await pg.evaluate("(()=>{const ev=e=>{e.dispatchEvent(new Event('input',{bubbles:true}))};const t=[...document.querySelectorAll('#lr-room textarea')].find(e=>e.offsetParent);if(t){t.value='這份工作值得做下去嗎';ev(t)}const b=[...document.querySelectorAll('#lr-room button')].find(e=>e.offsetParent&&/起課/.test(e.innerText));if(b)b.click();return !!b})()");await pg.wait_for_timeout(4500)
        st="[!!document.querySelector('.pil3d.on'),(document.querySelector('.pil3d-title')||{}).textContent,(document.querySelector('.pil3d-line')||{}).textContent,(document.querySelector('.pil3d-sub')||{}).textContent,(document.querySelector('.pil3d-btn')||{}).textContent]"
        print('stage',await pg.evaluate(st),errs[:3]);await pg.screenshot(path='/tmp/x/lr0.png',timeout=70000)
        # drag a bit, then auto
        await pg.mouse.move(120,380);await pg.mouse.down();await pg.mouse.move(200,380,steps=6);await pg.mouse.up();await pg.wait_for_timeout(600)
        await pg.evaluate("document.querySelector('.pil3d-btn').click()");await pg.wait_for_timeout(3200)
        print('locked',await pg.evaluate(st));await pg.screenshot(path='/tmp/x/lr1.png',timeout=70000)
        await pg.evaluate("document.querySelector('.pil3d-btn').click()")
        for i in range(30):
            await pg.wait_for_timeout(600)
            if '課成了' in (await pg.evaluate("(document.querySelector('.pil3d-line')||{}).textContent||''")): break
        await pg.wait_for_timeout(1500);print('done',await pg.evaluate(st));await pg.screenshot(path='/tmp/x/lr2.png',timeout=70000)
        await pg.evaluate("document.querySelector('.pil3d-btn').click()");await pg.wait_for_timeout(3500)
        print('after',await pg.evaluate("[!document.querySelector('.pil3d'),!!document.querySelector('.lr-instrument-canvas'),[...document.querySelectorAll('#lr-room button')].filter(e=>/複製完整提示詞/.test(e.textContent)).length]"),'errors',errs[:4]);await b.close()
asyncio.run(main())
