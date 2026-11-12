import asyncio,json,sys
from playwright.async_api import async_playwright
async def tool(b,idx,name,steps):
    c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW',timezone_id='Asia/Taipei')
    await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1');localStorage.setItem('_jy_copy_coach_v1','1')}catch(e){}")
    pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:140]))
    await pg.goto('https://jingyue.uk/?cb=four',wait_until='load',timeout=90000);await pg.wait_for_timeout(3500)
    await pg.evaluate("(i)=>document.querySelectorAll('.at-tool')[i].click()",idx);await pg.wait_for_timeout(4500)
    n=0
    for js,wait,shot in steps:
        try: r=await pg.evaluate(js)
        except Exception as e: r='ERR '+str(e)[:120]
        print(name,'|',str(r)[:300]);await pg.wait_for_timeout(wait)
        if shot:
            try:
                await pg.screenshot(path='/tmp/x/four_%s_%d.png'%(name,n),timeout=70000);n+=1
            except Exception as e: print(name,'| screenshot failed',str(e)[:60])
    print(name,'canvases',await pg.evaluate("[...document.querySelectorAll('canvas')].filter(e=>e.getClientRects().length&&e.offsetWidth>200).map(e=>(e.className||e.id||'canvas').toString().slice(0,26)+':'+e.offsetWidth+'x'+e.offsetHeight)"),'copy',await pg.evaluate("[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length&&/複製/.test(e.innerText)&&/提示詞/.test(e.innerText)).length"),'errors',errs[:2])
    await c.close()
FORM="(sel)=>{const f=document.querySelector(sel);if(!f)return 'noform';const out=[];f.querySelectorAll('input,select,textarea').forEach(e=>{out.push((e.id||e.name||e.type)+':'+e.type+(e.offsetParent?'':'(h)'))});return out.join(' ').slice(0,280)}"
SET="""(sel)=>{const f=document.querySelector(sel);const ev=e=>{e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};let n=0;
 f.querySelectorAll('input').forEach(e=>{const k=(e.id+' '+e.name+' '+e.type).toLowerCase();if(e.type==='date'||/date/.test(k)&&e.type!=='checkbox'){e.value='1990-01-15';ev(e);n++}else if(e.type==='time'||/time/.test(k)&&e.type!=='checkbox'){e.value='09:20';ev(e);n++}});
 f.querySelectorAll('textarea').forEach(e=>{if(!e.value){e.value='明年適合換工作嗎';ev(e);n++}});return 'set '+n}"""
async def main(which):
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        if which=='a':
            await tool(b,12,'name',[("(()=>{const m=[...document.querySelectorAll('#nm-room button')].find(e=>e.offsetParent&&/分析一個姓名/.test(e.innerText));if(m)m.click();return !!m})()",1500,False),
              ("(()=>{const ev=e=>{e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};const s=document.getElementById('nm-surname'),g=document.getElementById('nm-given');if(!s||!g)return 'noinput';s.value='陳';ev(s);g.value='大明';ev(g);const q=document.getElementById('nm-question');if(q){q.value='這個名字對事業好嗎';ev(q)}return 'filled'})()",800,False),
              ("(()=>{const b=[...document.querySelectorAll('#nm-room button')].find(e=>e.offsetParent&&/下一步/.test(e.innerText));if(b){b.click();return b.innerText.trim().slice(0,14)}return 'nonext'})()",2500,False),
              ("(()=>{const b=document.getElementById('nm-analyze')||[...document.querySelectorAll('#nm-room button')].filter(e=>e.offsetParent&&!e.disabled&&/開始|分析|解讀|確認|下一步/.test(e.innerText)&&!/分析一個姓名|比較候選/.test(e.innerText)).pop();if(b){b.click();return b.innerText.trim().slice(0,14)}return 'nobtn'})()",4500,True),
              ("(()=>{const b=[...document.querySelectorAll('#nm-room button')].filter(e=>e.offsetParent&&!e.disabled).map(e=>e.innerText.trim().slice(0,10));return b.slice(0,10).join('|')})()",3500,True)])
            await tool(b,13,'liuren',[("(()=>{const ev=e=>{e.dispatchEvent(new Event('input',{bubbles:true}))};const t=[...document.querySelectorAll('#lr-room textarea')].find(e=>e.offsetParent);if(t){t.value='這份工作值得做下去嗎';ev(t)}const b=[...document.querySelectorAll('#lr-room button')].find(e=>e.offsetParent&&/起課/.test(e.innerText));if(b){b.click();return 'cast'}return 'nobtn'})()",2500,True),
              ("(()=>{const c=document.querySelector('.lr-instrument-canvas,canvas[class*=instrument]');if(c){c.scrollIntoView({block:'center'});return 'canvas '+c.offsetWidth}return 'nocanvas'})()",3500,True)])
        else:
            await tool(b,9,'western',[(FORM.replace('(sel)=>','(()=>{const sel="#wx-form";return (')+ ')(sel)})()' if False else "("+FORM+")('#wx-form')",300,False),("("+SET+")('#wx-form')",800,False),
              ("(()=>{const b=document.getElementById('wx-submit');if(b){b.scrollIntoView({block:'center'});b.click();return b.innerText.trim().slice(0,14)+(b.disabled?'(disabled)':'')}return 'nosubmit'})()",3500,True),
              ("(()=>{const e=document.getElementById('wx-error');const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length&&/展開我的|略過演出|進入/.test(x.innerText)).map(x=>x.innerText.trim().slice(0,12));return (e?e.innerText.slice(0,80):'')+' | '+b.join(',')})()",4000,True),
              ("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getClientRects().length&&/展開我的西洋命盤/.test(x.innerText));if(b){b.click();return 'enter'}return 'no-enter'})()",5000,True)])
            await tool(b,8,'vedic',[("("+FORM+")('#vd-form')",300,False),("("+SET+")('#vd-form')",800,False),
              ("(()=>{const f=document.getElementById('vd-form');const b=f&&(f.querySelector('button[type=submit]')||[...f.querySelectorAll('button')].filter(e=>e.offsetParent&&/排盤|展開|開始|計算/.test(e.innerText)).pop());if(b){b.scrollIntoView({block:'center'});b.click();return b.innerText.trim().slice(0,14)}return 'nosubmit'})()",3500,True),
              ("(()=>{const s=document.getElementById('vd-form-status');const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length&&/展開|略過|進入|開始/.test(x.innerText)).map(x=>x.innerText.trim().slice(0,12));return (s?s.innerText.slice(0,80):'')+' | '+b.join(',')})()",4500,True),
              ("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getClientRects().length&&/展開我的|進入星殿|開始演出/.test(x.innerText));if(b){b.click();return 'enter:'+b.innerText.trim().slice(0,10)}return 'no-enter'})()",5000,True)])
        await b.close()
asyncio.run(main(sys.argv[1]))
