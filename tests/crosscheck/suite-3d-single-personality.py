import asyncio,json
from playwright.async_api import async_playwright
async def run(kind):
    pre={'single':'s','personality':'p'}[kind]
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW',timezone_id='Asia/Taipei')
        await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1');localStorage.setItem('_jy_copy_coach_v1','1')}catch(e){}")
        pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
        await pg.goto('https://jingyue.uk/?cb=suite',wait_until='load',timeout=90000);await pg.wait_for_timeout(4000)
        await pg.evaluate("document.querySelectorAll('.at-tool')[4].click()");await pg.wait_for_timeout(4500)
        print(kind,'tab',await pg.evaluate("(k)=>{const w=document.getElementById('bzs-screen');const t=[...w.querySelectorAll('[data-tab],[role=tab],button')].find(e=>e.offsetParent&&(e.dataset.tab===k||new RegExp(k==='single'?'^單人':'^人格').test(e.innerText.trim())));if(t){t.click();return t.innerText.trim().slice(0,8)}return ''}",kind));await pg.wait_for_timeout(1500)
        print('set',await pg.evaluate("(pre)=>{const set=(id,v)=>{const e=document.getElementById(id);if(!e)return id+'?';e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));return ''};return [set(pre+'-date','1988-03-14'),set(pre+'-time','09:20'),set(pre+'-gender','male')].join('')||'ok'}",pre));await pg.wait_for_timeout(1500)
        print('cast',await pg.evaluate("(k)=>{const b=document.querySelector('#bzs-screen [data-act=cast-'+k+']');if(!b)return [...document.querySelectorAll('#bzs-screen [data-act]')].filter(e=>e.offsetParent).map(e=>e.dataset.act).slice(0,10).join(',');b.click();return 'clicked'}",kind));await pg.wait_for_timeout(4500)
        st="[!!document.querySelector('.pil3d.on'),(document.querySelector('.pil3d-line')||{}).textContent,(document.querySelector('.pil3d-btn')||{}).textContent,!!document.querySelector('.jr-dialog')]"
        print('stage',await pg.evaluate(st))
        if await pg.evaluate("!!document.querySelector('.pil3d')"):
            await pg.evaluate("document.querySelector('.pil3d-btn').click()")
            for i in range(40):
                await pg.wait_for_timeout(600)
                if '立齊' in (await pg.evaluate("(document.querySelector('.pil3d-line')||{}).textContent||''")): break
            await pg.wait_for_timeout(1800);await pg.evaluate("document.querySelector('.pil3d-btn').click()");await pg.wait_for_timeout(4000)
        print('after',await pg.evaluate("[!document.querySelector('.pil3d'),[...document.querySelectorAll('#bzs-screen button')].filter(e=>/複製/.test(e.textContent)&&/提示詞/.test(e.textContent)).length,(document.getElementById('bzs-screen')||{scrollHeight:0}).scrollHeight]"),'errors',errs[:3]);await b.close()
import sys
asyncio.run(run(sys.argv[1]))
