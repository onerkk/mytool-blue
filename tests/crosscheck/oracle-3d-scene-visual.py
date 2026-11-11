import asyncio,json,time
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW',timezone_id='Asia/Taipei')
        await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1')}catch(e){}")
        pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:260]));pg.on('console',lambda m:errs.append('C:'+m.text[:200]) if m.type=='error' else None)
        for n in ['oracle-ambience','oracle-scene']:
            await pg.route('**/JS/%s.js*'%n,lambda route,request,n=n:route.fulfill(path='/home/claude/mytool-blue/JS/%s.js'%n,content_type='application/javascript'))
        await pg.goto('https://jingyue.uk/',wait_until='load',timeout=90000);await pg.wait_for_timeout(4500)
        await pg.evaluate("document.querySelectorAll('.at-tool')[7].click()");await pg.wait_for_timeout(3000)
        click=lambda rx:"(()=>{const r=document.getElementById('oracle-screen');const b=[...r.querySelectorAll('button')].filter(e=>e.offsetParent&&!e.disabled&&/%s/.test(e.innerText.replace(/\\s/g,''))&&!/返回/.test(e.innerText));if(b.length){b[b.length-1].click();return 1}return 0})()"%rx
        await pg.evaluate(click('求籤'));await pg.wait_for_timeout(2200);await pg.evaluate(click('誠心求籤'));await pg.wait_for_timeout(2800)
        await pg.evaluate("(()=>{const s=document.querySelector('.jr-skip');if(s)s.click()})()");await pg.wait_for_timeout(4500)
        print('3d active',await pg.evaluate("[document.getElementById('oracle-screen').classList.contains('orc-3d'),!!document.querySelector('.orc3d-host.on canvas'),!!window.JYOracleSceneModule]"),errs[:3])
        shots=[]
        async def burst(prefix,times):
            t0=time.time()
            for i,t in enumerate(times):
                d=t/1000-(time.time()-t0)
                if d>0: await pg.wait_for_timeout(int(d*1000))
                n='%s%d'%(prefix,i);await pg.screenshot(path='/tmp/x/%s.png'%n);shots.append(n)
        await pg.screenshot(path='/tmp/x/a0.png');shots.append('a0')
        for k in range(6):
            r=await pg.evaluate(click('擲杯請示|再擲杯'))
            if not r: break
            if k==0: await burst('t',[300,800,1500,2000,3000])
            else: await pg.wait_for_timeout(3600)
            lab=await pg.evaluate("(document.getElementById('orc-throw-label')||{}).textContent||''");print('toss',k,lab[:10])
            if '聖' in lab: break
        await pg.evaluate(click('搖籤'));await burst('s',[500,1600,3200,4800,6000])
        print('phase',await pg.evaluate("document.getElementById('oracle-screen').getAttribute('data-oracle-phase')"),'errors',errs[:4])
        json.dump(shots,open('/tmp/x/shots3.json','w'));await b.close()
asyncio.run(main())
