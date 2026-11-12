import asyncio,json,time
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW',timezone_id='Asia/Taipei')
        await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1');localStorage.setItem('_jy_copy_coach_v1','1')}catch(e){}")
        pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:260]));pg.on('console',lambda m:errs.append('C:'+m.text[:160]) if m.type=='error' else None)
        for n in ['pillar-scene','bazi-standalone']:
            await pg.route('**/JS/%s.js*'%n,lambda route,request,n=n:route.fulfill(path='/home/claude/mytool-blue/JS/%s.js'%n,content_type='application/javascript'))
        await pg.goto('https://jingyue.uk/',wait_until='load',timeout=90000);await pg.wait_for_timeout(4000)
        await pg.add_script_tag(path='/home/claude/mytool-blue/JS/pillar-stage.js')
        await pg.evaluate("document.querySelectorAll('.at-tool')[3].click()");await pg.wait_for_timeout(4000)
        ok="(()=>{const b=[...document.querySelectorAll('.bzx-sheet-btn.go')].filter(e=>e.getBoundingClientRect().width>20);if(b.length){b[b.length-1].click();return 1}return 0})()"
        await pg.click('#bzx-fld-date');await pg.wait_for_timeout(1000)
        await pg.evaluate("([...document.querySelectorAll('.bzx-cal-d')].find(e=>e.innerText.trim()==='15').click(),1)");await pg.wait_for_timeout(400);await pg.evaluate(ok);await pg.wait_for_timeout(800)
        await pg.click('#bzx-fld-time');await pg.wait_for_timeout(1000)
        await pg.evaluate("(()=>{const s=[...document.querySelectorAll('select')].filter(e=>e.getBoundingClientRect().width>20&&e.getBoundingClientRect().top>100&&e.getBoundingClientRect().top<400);s[0].value=s[0].options[9].value;s[0].dispatchEvent(new Event('change',{bubbles:true}));s[1].value=s[1].options[20].value;s[1].dispatchEvent(new Event('change',{bubbles:true}));return 1})()");await pg.wait_for_timeout(300);await pg.evaluate(ok);await pg.wait_for_timeout(800)
        await pg.evaluate("(document.getElementById('bzx-fld-city').scrollIntoView({block:'center'}),1)");await pg.wait_for_timeout(400);await pg.click('#bzx-fld-city');await pg.wait_for_timeout(1000)
        await pg.evaluate("([...document.querySelectorAll('.bzx-loc-chip')].find(e=>e.innerText.trim()==='高雄').click(),1)");await pg.wait_for_timeout(500);await pg.evaluate(ok);await pg.wait_for_timeout(700)
        await pg.get_by_text('心裡的問題').first.click();await pg.wait_for_timeout(900);await pg.fill('#bzx-q','明年適合換工作嗎')
        print('module',await pg.evaluate("[!!window.JYPillarSceneModule,!!window._jyPillarStageLoaded]"))
        await pg.click('.bzx-cast-btn');await pg.wait_for_timeout(3000)
        st="[!!document.querySelector('.pil3d.on'),(document.querySelector('.pil3d-line')||{}).textContent,(document.querySelector('.pil3d-sub')||{}).textContent,(document.querySelector('.pil3d-btn')||{}).textContent,!!document.querySelector('.jr-dialog')]"
        print('stage',await pg.evaluate(st),errs[:3]);await pg.screenshot(path='/tmp/x/z0.png')
        await pg.touchscreen.tap(110,330);await pg.wait_for_timeout(1900);print('tap1',await pg.evaluate(st));await pg.screenshot(path='/tmp/x/z1.png')
        await pg.evaluate("document.querySelector('.pil3d-btn').click()")
        for i in range(30):
            await pg.wait_for_timeout(600)
            if '立齊' in (await pg.evaluate("(document.querySelector('.pil3d-line')||{}).textContent||''")): break
        await pg.wait_for_timeout(1500);print('all',await pg.evaluate(st));await pg.screenshot(path='/tmp/x/z2.png')
        await pg.evaluate("document.querySelector('.pil3d-btn').click()");await pg.wait_for_timeout(3500)
        print('after',await pg.evaluate("[!document.querySelector('.pil3d'),[...document.querySelectorAll('#bzx-screen .bzx-pillar,#bzx-screen [class*=pillar]')].length,[...document.querySelectorAll('button')].filter(e=>/一鍵複製八字提示詞/.test(e.innerText)).length,(document.querySelector('#bzx-screen')||{innerText:''}).innerText.replace(/\\s+/g,' ').match(/[己庚][巳午]|丁丑|庚辰|辛巳/g)]"),'errors',errs[:4]);await b.close()
asyncio.run(main())
