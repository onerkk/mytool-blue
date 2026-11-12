import asyncio,json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW',timezone_id='Asia/Taipei')
        await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1')}catch(e){}")
        pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:260]));pg.on('console',lambda m:errs.append('C:'+m.text[:160]) if m.type=='error' else None)
        for n in ['oracle-ambience','oracle-scene']:
            await pg.route('**/JS/%s.js*'%n,lambda route,request,n=n:route.fulfill(path='/home/claude/mytool-blue/JS/%s.js'%n,content_type='application/javascript'))
        await pg.goto('https://jingyue.uk/',wait_until='load',timeout=90000);await pg.wait_for_timeout(4500)
        await pg.evaluate("document.querySelectorAll('.at-tool')[7].click()");await pg.wait_for_timeout(3000)
        click=lambda rx:"(()=>{const r=document.getElementById('oracle-screen');const b=[...r.querySelectorAll('button')].filter(e=>e.offsetParent&&!e.disabled&&/%s/.test(e.innerText.replace(/\\s/g,''))&&!/返回/.test(e.innerText));if(b.length){b[b.length-1].click();return 1}return 0})()"%rx
        await pg.evaluate(click('求籤'));await pg.wait_for_timeout(2200);await pg.evaluate(click('誠心求籤'));await pg.wait_for_timeout(5200)
        st="[document.getElementById('oracle-screen').getAttribute('data-oracle-phase'),!!document.querySelector('.orc3d-cap'),(document.querySelector('.orc3d-cap p')||{}).textContent,(document.querySelector('.orc3d-cap button')||{}).disabled,!!document.querySelector('.jr-dialog'),!!document.querySelector('.orc3d-host.on canvas')]"
        print('pray',await pg.evaluate(st),errs[:3]);await pg.screenshot(path='/tmp/x/pray0.png')
        await pg.evaluate("document.querySelector('.orc3d-cap button').click()");await pg.wait_for_timeout(3500)
        print('next',await pg.evaluate(st));await pg.screenshot(path='/tmp/x/pray1.png')
        print('errors',errs[:4]);await b.close()
asyncio.run(main())
