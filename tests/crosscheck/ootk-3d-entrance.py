import asyncio,json
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
        print('enter',await pg.evaluate("(()=>{const c=[...document.querySelectorAll('.at-tool,[data-tool],button,a')].filter(e=>/開鑰之法/.test(e.innerText||'')&&e.offsetParent);c.sort((a,b)=>a.innerText.length-b.innerText.length);if(c.length){c[0].click();return c[0].tagName+'|'+c[0].className+'|'+c[0].innerText.replace(/\\s+/g,' ').slice(0,30)}return ''})()"));await pg.wait_for_timeout(3000);print('q',await pg.evaluate("[!!document.getElementById('f-question'),document.getElementById('f-question')&&document.getElementById('f-question').offsetParent!==null,[...document.querySelectorAll('button')].filter(e=>e.offsetParent&&/開鑰|五輪|代表牌|抽牌|開始/.test(e.innerText)).map(e=>(e.id||'')+':'+e.innerText.trim().slice(0,14)).slice(0,6)]"));await pg.fill('#f-question','這份工作值得做下去嗎');await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{const b=document.getElementById('btn-tool-go')||[...document.querySelectorAll('#tool-cta button')].pop();if(b)b.click();return !!b})()");await pg.wait_for_timeout(1800)
        try: await pg.get_by_text('直接送出').first.click(timeout=4000)
        except Exception as e: print('no modal')
        await pg.wait_for_timeout(3500)
        print('sig',await pg.evaluate("(()=>{const o=document.getElementById('ootk-sig-overlay');return [!!o,o&&getComputedStyle(o).display,!!window.JYTarotSceneModule]})()"))
        await pg.evaluate("(()=>{const c=[...document.querySelectorAll('#ootk-sig-overlay button')].filter(e=>e.offsetParent&&/聖杯皇后/.test(e.innerText));if(c.length)c[0].click();return c.length})()");await pg.wait_for_timeout(1200)
        await pg.evaluate("(()=>{const b=[...document.querySelectorAll('#ootk-sig-overlay button')].find(e=>e.offsetParent&&/下一步/.test(e.innerText));if(b)b.click();return !!b})()");await pg.wait_for_timeout(1500)
        print('selects',await pg.evaluate("(()=>{const ss=[...document.querySelectorAll('#ootk-sig-overlay select')].filter(e=>e.offsetParent);return ss.map(x=>{if(!x.value||/請選擇/.test(x.options[x.selectedIndex].text)){x.selectedIndex=1;x.dispatchEvent(new Event('change',{bubbles:true}));}return x.options[x.selectedIndex].text.slice(0,12)})})()"));await pg.wait_for_timeout(800)
        print('go',await pg.evaluate("(()=>{const b=[...document.querySelectorAll('#ootk-sig-overlay button')].find(e=>e.offsetParent&&/確認並開始/.test(e.innerText)&&!e.disabled);if(b)b.click();return !!b})()"))
        await pg.wait_for_timeout(2500)
        st="[!!document.querySelector('.tar3d.on'),(document.querySelector('.tar3d-title')||{}).textContent,(document.querySelector('.tar3d-line')||{}).textContent,(document.querySelector('.tar3d-btn')||{}).textContent,!!document.querySelector('.jr-dialog'),!!window.JYTarotSceneModule]"
        print('stage',await pg.evaluate(st))
        if await pg.evaluate("!!document.querySelector('.tar3d.on')"):
            await pg.evaluate("document.querySelector('.tar3d-btn').click()");await pg.wait_for_timeout(2600);await pg.evaluate("document.querySelector('.tar3d-btn').click()")
            for i in range(80):
                await pg.wait_for_timeout(500)
                if (await pg.evaluate("(document.querySelector('.tar3d-btn')||{}).textContent||''"))=='開始五輪' and await pg.evaluate("(document.querySelector('.tar3d-btn')||{style:{display:'none'}}).style.display!=='none'"): break
            print('shuffled',await pg.evaluate(st));await pg.evaluate("document.querySelector('.tar3d-btn').click()");await pg.wait_for_timeout(3500)
        print('after',await pg.evaluate("(()=>{const f=document.getElementById('ootk-flip-overlay'),mf=document.getElementById('ootk-main-flow'),iv=document.getElementById('ootk-invocation');return [!document.querySelector('.tar3d'),f?getComputedStyle(f).display:'none',mf?getComputedStyle(mf).display:'-',iv?getComputedStyle(iv).display:'-',[...document.querySelectorAll('button')].filter(e=>e.offsetParent&&/開始第一輪|第一輪|開始/.test(e.innerText)).map(e=>e.innerText.trim().slice(0,12)).slice(0,3)]})()"),'errors',errs[:3]);await b.close()
asyncio.run(main())
