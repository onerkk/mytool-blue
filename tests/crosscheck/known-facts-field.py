import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox']);ctx=await b.new_context(viewport={'width':390,'height':844},service_workers='block');pg=await ctx.new_page()
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:150]))
        await pg.route('https://jingyue.uk/',lambda r,q:r.fulfill(path='/home/claude/mytool-blue/index.html',content_type='text/html'));await pg.route('**/JS/known-facts.js*',lambda r,q:r.fulfill(path='/home/claude/mytool-blue/JS/known-facts.js',content_type='application/javascript'));await pg.goto('https://jingyue.uk/',wait_until='load',timeout=90000);await pg.wait_for_timeout(4000)
        print(await pg.title(),pg.url,await pg.evaluate("[document.body.innerHTML.length,document.querySelectorAll('textarea.jy-facts').length,!!window.JYKnownFacts,!!document.getElementById('f-question')]"),errs[:3])
        n=await pg.evaluate("document.querySelectorAll('textarea.jy-facts').length")
        if n:
            await pg.evaluate("(()=>{const t=document.querySelector('textarea.jy-facts');t.value='測試內容';t.dispatchEvent(new Event('input'));})()")
            print(await pg.evaluate("[JYKnownFacts.get(),[...document.querySelectorAll('textarea.jy-facts')].map(t=>t.value+'@'+(t.parentElement.previousElementSibling||{}).id)]"))
            await pg.evaluate("document.querySelector('textarea.jy-facts').scrollIntoView({block:'center'})");await pg.screenshot(path='/tmp/claude-0/kf.png')
        await b.close()
asyncio.run(main())
