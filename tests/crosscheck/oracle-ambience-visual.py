import asyncio,json,time
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox'])
        c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW',timezone_id='Asia/Taipei')
        await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1')}catch(e){}")
        pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
        await pg.route('**/JS/oracle-ambience.js*',lambda route,request:route.fulfill(path='/home/claude/mytool-blue/JS/oracle-ambience.js',content_type='application/javascript'))
        await pg.goto('https://jingyue.uk/',wait_until='load',timeout=90000);await pg.wait_for_timeout(4500)
        await pg.evaluate("document.querySelectorAll('.at-tool')[7].click()");await pg.wait_for_timeout(3000)
        click=lambda rx:"(()=>{const r=document.getElementById('oracle-screen');const b=[...r.querySelectorAll('button')].filter(e=>e.offsetParent&&!e.disabled&&/%s/.test(e.innerText.replace(/\\s/g,''))&&!/返回/.test(e.innerText));if(b.length){b[b.length-1].click();return b[b.length-1].innerText.replace(/\\s/g,'')}return ''})()"%rx
        await pg.evaluate(click('求籤'));await pg.wait_for_timeout(2200);await pg.evaluate(click('誠心求籤'));await pg.wait_for_timeout(2800)
        await pg.evaluate("(()=>{const s=document.querySelector('.jr-skip');if(s)s.click()})()");await pg.wait_for_timeout(2800)
        shots=[]
        async def burst(prefix,times):
            t0=time.time()
            for i,t in enumerate(times):
                d=t/1000-(time.time()-t0)
                if d>0: await pg.wait_for_timeout(int(d*1000))
                n='%s%d'%(prefix,i);await pg.screenshot(path='/tmp/x/%s.png'%n);shots.append(n)
        # toss until holy (max 6)
        for k in range(6):
            r=await pg.evaluate(click('擲杯請示|再擲杯'))
            if not r: break
            if k==0: await burst('t',[120,420,760,1060,1420,1700,2050,2600])
            else: await pg.wait_for_timeout(3200)
            lab=await pg.evaluate("(document.getElementById('orc-throw-label')||{}).textContent||''")
            print('toss',k,lab[:14])
            if '聖' in lab:
                if k>0: await pg.screenshot(path='/tmp/x/h0.png');shots.append('h0')
                break
        r=await pg.evaluate(click('搖籤'));print('shake',r)
        await burst('s',[200,520,1500,2900,4200])
        print('phase',await pg.evaluate("document.getElementById('oracle-screen').getAttribute('data-oracle-phase')"),'hint',await pg.evaluate("[...document.querySelectorAll('.orc-gesture-hint')].map(e=>e.textContent)"),'fx',await pg.evaluate("!!document.querySelector('#oracle-screen>.orc-fx canvas')"))
        print('errors',errs[:3]);json.dump(shots,open('/tmp/x/shots.json','w'));await b.close()
asyncio.run(main())
