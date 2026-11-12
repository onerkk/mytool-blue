import asyncio,json,sys
from playwright.async_api import async_playwright
async def main(idxs):
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
        for idx,name in idxs:
            c=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='zh-TW',timezone_id='Asia/Taipei')
            await c.add_init_script("try{localStorage.setItem('_jy_first_guide_v1','1');localStorage.setItem('_jy_copy_coach_v1','1')}catch(e){}")
            pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:140]))
            await pg.goto('https://jingyue.uk/?cb=s2',wait_until='load',timeout=90000);await pg.wait_for_timeout(3500)
            await pg.evaluate("(i)=>document.querySelectorAll('.at-tool')[i].click()",idx);await pg.wait_for_timeout(4000)
            log=[];shot=0
            for k in range(9):
                r=await pg.evaluate("""()=>{const vis=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
                  const top=[...document.querySelectorAll('body *')].filter(e=>vis(e)&&getComputedStyle(e).position==='fixed'&&e.offsetWidth>300&&e.offsetHeight>500).sort((a,b)=>(+getComputedStyle(b).zIndex||0)-(+getComputedStyle(a).zIndex||0))[0]||document.body;
                  [...top.querySelectorAll('textarea,input[type=text],input:not([type])')].filter(e=>vis(e)&&!e.value&&!e.readOnly).forEach(e=>{e.value=/name|名/i.test(e.id+e.placeholder)?'陳大明':'這份工作值得做下去嗎';e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));});
                  const cv=[...document.querySelectorAll('canvas')].filter(e=>vis(e)&&e.offsetWidth>250).map(e=>(e.className||e.id||'canvas').toString().slice(0,24)+':'+e.offsetWidth+'x'+e.offsetHeight);
                  const bs=[...top.querySelectorAll('button')].filter(e=>vis(e)&&!e.disabled&&e.offsetWidth>60);
                  const pri=[/擲|搖卦|起卦|起課|排盤|開始|分析|解讀|展開|進入|起名|測算/,/繼續|下一步|確認|完成/];let pick=null;
                  for(const rx of pri){const m=bs.filter(e=>rx.test(e.innerText)&&!/返回|取消|略過|跳過|上一步|音效|複製|分享|蝦皮|首頁/.test(e.innerText));if(m.length){pick=m[m.length-1];break;}}
                  const info={top:(top.id||top.className.toString().slice(0,30)),cv,jr:!!document.querySelector('.jr-dialog'),btn:pick?pick.innerText.replace(/\\s+/g,' ').trim().slice(0,16):'',copy:[...document.querySelectorAll('button')].filter(e=>vis(e)&&/複製/.test(e.innerText)&&/提示詞/.test(e.innerText)).length};
                  if(pick)pick.click();return info}""")
                log.append(r)
                await pg.wait_for_timeout(2600)
                if r['cv'] and shot<2:
                    await pg.screenshot(path='/tmp/x/six_%s_%d.png'%(name,shot));shot+=1
                if r['copy'] or not r['btn']: break
            print(name,json.dumps(log,ensure_ascii=False)[:900],'| errors',errs[:2])
            if shot==0: await pg.screenshot(path='/tmp/x/six_%s_0.png'%name)
            await c.close()
        await b.close()
sel={'a':[(10,'liuyao'),(11,'yijing'),(12,'name')],'b':[(13,'liuren'),(9,'western'),(8,'vedic')]}[sys.argv[1]]
asyncio.run(main(sel))
