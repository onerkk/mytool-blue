import asyncio,json,sys,time
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox'])
        c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW',timezone_id='Asia/Taipei',permissions=['clipboard-read','clipboard-write'])
        await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1')}catch(e){}")
        pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:160]))
        for n in ['oracle','first-guide']:
            await pg.route('**/JS/%s.js*'%n,lambda route,request,n=n:route.fulfill(path='/home/claude/mytool-blue/JS/%s.js'%n,content_type='application/javascript'))
        await pg.goto('https://jingyue.uk/',wait_until='load',timeout=90000);await pg.wait_for_timeout(5000)
        await pg.evaluate("document.querySelectorAll('.at-tool')[7].click()");await pg.wait_for_timeout(4000)
        await pg.fill('#orc-q-input','這次轉職會順利嗎')
        log=[];t0=time.time();done=False
        STEP='''()=>{const sk=document.querySelector('.jr-skip');if(sk&&sk.offsetParent){sk.click();return 'skip'}const r=document.getElementById('oracle-screen');if(!r)return 'noroot';
          if([...r.querySelectorAll('button')].some(e=>/複製/.test(e.innerText)&&e.offsetParent))return 'DONE';
          const b=[...r.querySelectorAll('button')].filter(e=>e.offsetParent&&!e.disabled&&/求籤|擲杯|擲筊|搖籤|查看籤詩|結束|看籤|解籤/.test(e.innerText.replace(/\\s/g,''))&&!/返回/.test(e.innerText));
          if(!b.length)return '';const x=b[b.length-1];const t=x.innerText.replace(/\\s/g,'');x.scrollIntoView({block:'center'});x.click();return t}'''
        while time.time()-t0<215:
            r=await pg.evaluate(STEP)
            if r: log.append(r)
            if r=='DONE': done=True;break
            await pg.wait_for_timeout(900 if not r else 1500)
        counts={}
        for x in log: counts[x]=counts.get(x,0)+1
        print('done',done,'secs',round(time.time()-t0),'counts',json.dumps(counts,ensure_ascii=False))
        print('seq',' '.join(log)[:900])
        await pg.screenshot(path='/tmp/x/OR_end.png')
        info=await pg.evaluate('''()=>{const r=document.getElementById('oracle-screen');const b=[...r.querySelectorAll('button,a')].filter(e=>e.offsetParent&&e.getBoundingClientRect().width>40).map(e=>e.innerText.trim().replace(/\\n/g,' ').slice(0,16)+'@'+Math.round(e.getBoundingClientRect().top+r.scrollTop));return {sh:r.scrollHeight,b:b.slice(0,14),pill:!!document.querySelector('.jy-coach-pill.on'),ring:!!document.querySelector('.jy-coach-ring'),locked:Object.keys(localStorage).filter(k=>/oracle_today_lock/.test(k)).length,txt:(r.innerText||'').replace(/\\s+/g,' ').slice(0,160)}}''')
        print('info',json.dumps(info,ensure_ascii=False)[:900]);print('errors',errs[:3]);await b.close()
asyncio.run(main())
