import asyncio,json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox'])
        c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW')
        pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
        await pg.goto('https://jingyue.uk/',wait_until='load',timeout=90000);await pg.wait_for_timeout(3000)
        await pg.add_script_tag(path='/home/claude/mytool-blue/JS/first-guide.js')
        await pg.wait_for_timeout(4500)
        st=await pg.evaluate("()=>({open:!!document.querySelector('.jy-fg.on'),intro:!!document.getElementById('jy-cinematic-intro'),h:(document.querySelector('.jy-fg-h')||{}).textContent})");print('first',st)
        await pg.screenshot(path='/tmp/x/g1.png')
        for i in range(3):
            await pg.click('.jy-fg-btn');await pg.wait_for_timeout(1300)
            if i==2: await pg.screenshot(path='/tmp/x/g4.png')
        print('step4',await pg.evaluate("()=>document.querySelector('.jy-fg-h').textContent+' | '+document.querySelector('.jy-fg-btn').textContent"))
        await pg.click('.jy-fg-btn');await pg.wait_for_timeout(800)
        print('closed',await pg.evaluate("()=>[!document.querySelector('.jy-fg'),localStorage.getItem('_jy_first_guide_v1')]"))
        await pg.evaluate("()=>{const b=document.createElement('button');b.textContent='複製提示詞';b.id='fake-copy';b.style.cssText='position:fixed;left:40px;top:420px;width:300px;height:52px;z-index:50;background:#c79f45;border:0;border-radius:12px;font-size:16px';document.body.appendChild(b);}")
        await pg.wait_for_timeout(1500);await pg.screenshot(path='/tmp/x/g5.png')
        print('coach',await pg.evaluate("()=>[!!document.querySelector('.jy-coach-ring'),!!document.querySelector('.jy-coach-tip.on')]"))
        await pg.click('#fake-copy');await pg.wait_for_timeout(1400);await pg.screenshot(path='/tmp/x/g6.png')
        print('after',await pg.evaluate("()=>[!!document.querySelector('.jy-after.on'),!document.querySelector('.jy-coach-ring'),localStorage.getItem('_jy_copy_coach_v1')]"))
        print('errors',errs[:4]);await b.close()
asyncio.run(main())
