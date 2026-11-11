import asyncio,json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox'])
        c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW',timezone_id='Asia/Taipei')
        await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1')}catch(e){}")
        pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:160]))
        await pg.goto('https://jingyue.uk/',wait_until='load',timeout=90000);await pg.wait_for_timeout(4500)
        await pg.add_script_tag(path='/home/claude/mytool-blue/JS/oracle-ambience.js')
        await pg.evaluate("document.querySelectorAll('.at-tool')[7].click()");await pg.wait_for_timeout(3500)
        await pg.screenshot(path='/tmp/x/am1.png')
        click=lambda rx:"(()=>{const sk=document.querySelector('.jr-skip');if(sk&&sk.offsetParent){sk.click();return 'skip'}const r=document.getElementById('oracle-screen');const b=[...r.querySelectorAll('button')].filter(e=>e.offsetParent&&!e.disabled&&/%s/.test(e.innerText.replace(/\\s/g,''))&&!/返回/.test(e.innerText));if(b.length){b[b.length-1].click();return b[b.length-1].innerText.replace(/\\s/g,'')}return ''})()"%rx
        seq=[('求籤',2500,None),('誠心求籤',3000,None),('__skip',3000,'am2'),('擲杯請示',900,'am3'),(None,2800,'am4'),('再擲杯|搖籤',1200,'am5'),(None,2600,'am6'),(None,3200,'am7'),('擲筊',1000,'am8'),(None,2600,'am9')]
        for rx,wait,shot in seq:
            if rx=='__skip': r=await pg.evaluate("(()=>{const s=document.querySelector('.jr-skip');if(s){s.click();return 'skip'}return 'noskip'})()")
            elif rx: r=await pg.evaluate(click(rx))
            else: r='-'
            await pg.wait_for_timeout(wait)
            ph=await pg.evaluate("(document.getElementById('oracle-screen')||{getAttribute(){return ''}}).getAttribute('data-oracle-phase')")
            amb=await pg.evaluate("!!document.querySelector('#oracle-screen>.orc-amb')")
            print(rx,'->',r,'| phase',ph,'| amb',amb)
            if shot: await pg.screenshot(path='/tmp/x/%s.png'%shot)
        print('errors',errs[:3]);await b.close()
asyncio.run(main())
