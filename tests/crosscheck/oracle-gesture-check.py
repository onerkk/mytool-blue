import asyncio,json
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
        click=lambda rx:"(()=>{const r=document.getElementById('oracle-screen');const b=[...r.querySelectorAll('button')].filter(e=>e.offsetParent&&!e.disabled&&/%s/.test(e.innerText.replace(/\\s/g,''))&&!/返回/.test(e.innerText));if(b.length){b[b.length-1].click();return 1}return 0})()"%rx
        await pg.evaluate(click('求籤'));await pg.wait_for_timeout(2200);await pg.evaluate(click('誠心求籤'));await pg.wait_for_timeout(2800)
        await pg.evaluate("(()=>{const s=document.querySelector('.jr-skip');if(s)s.click()})()");await pg.wait_for_timeout(3000)
        ph=lambda: pg.evaluate("document.getElementById('oracle-screen').getAttribute('data-oracle-phase')")
        print('phase',await ph(),'hint',await pg.evaluate("[...document.querySelectorAll('.orc-gesture-hint')].map(e=>e.textContent)"))
        await pg.screenshot(path='/tmp/x/g_hint.png')
        # synthetic swipe up
        r=await pg.evaluate("""()=>{const t=document.querySelector('#oracle-screen .orc-body');const mk=(y)=>new Touch({identifier:1,target:t,clientX:195,clientY:y});
          t.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[mk(620)],changedTouches:[mk(620)]}));
          t.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[mk(380)]}));return 1}""")
        await pg.wait_for_timeout(700);print('after swipe phase',await ph())
        await pg.wait_for_timeout(3200)
        # keep tossing until holy then test devicemotion shake
        for k in range(6):
            lab=await pg.evaluate("(document.getElementById('orc-throw-label')||{}).textContent||''")
            if '聖' in lab: break
            await pg.evaluate(click('再擲杯'));await pg.wait_for_timeout(3300)
        print('hint2',await pg.evaluate("[...document.querySelectorAll('.orc-gesture-hint')].map(e=>e.textContent)"))
        await pg.evaluate("""()=>{const fire=(v)=>window.dispatchEvent(Object.assign(new Event('devicemotion'),{accelerationIncludingGravity:{x:v,y:v,z:v}}));for(let i=0;i<6;i++)fire(3);fire(22)}""")
        await pg.wait_for_timeout(600);print('after shake phase',await ph(),'errors',errs[:3]);await b.close()
asyncio.run(main())
