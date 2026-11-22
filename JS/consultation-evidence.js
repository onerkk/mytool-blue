/* Shared by the reading table and the single-message export. Always work from
 * the committed chart. A stop or missing input is also a useful thing to show. */
(function (root) {
  'use strict';
  const list = value => Array.isArray(value) ? value : [];
  const join = values => values.filter(value => typeof value === 'string' && value.trim()).join('；');
  const distinct = values => [...new Set(values.filter(Boolean))];
  const stations = {
    tarot: ['攤開你的牌陣', '翻看牌位', 'card'],
    ootk: ['循著代表牌開鑰', '查看操作', 'card'],
    lenormand: ['沿著牌列讀一句話', '查看牌路', 'card'],
    oracle: ['展讀你求得的籤', '展開籤句', 'slip'],
    bazi: ['讀你的四柱', '查看落點', 'pillar'],
    ziwei: ['循宮位看這件事', '入宮看星', 'sky'],
    astro: ['在星盤上定位問題', '查看星位', 'sky'],
    vedic: ['從本命看進分盤', '查看落點', 'sky'],
    liuyao: ['在六爻裡找用神', '查看爻位', 'gua'],
    yijing: ['展開這一卦的主辭', '展讀卦辭', 'gua'],
    meihua: ['循著體用看變化', '查看卦象', 'gua'],
    liuren: ['沿三傳看事情推進', '查看課傳', 'plate'],
    name: ['攤開名字逐字比', '查看姓名', 'ink'],
    compat: ['把兩個人的盤對著看', '查看作用', 'pair'],
    personality: ['看你的五軸怎麼算', '查看一軸', 'axis']
  };
  const make = (label, detail, reading, visual = {}) => ({ label, detail, reading, visual });
  const gap = (label, detail, reading) => make(label, detail, reading, { kind: 'limit' });
  const hex = (lines, position) => ({ lines: list(lines).map(Boolean), position });
  function fromItem(item, reading, visual) {
    if (!item?.summary) return null;
    return make(item.label, item.summary, reading, visual);
  }

  function cards(c, a) {
    const d = a.methodData, raw = c.tarotData || c, slots = list(raw.methodPlan?.slots);
    const all = list(d.records);
    const role = r => String(slots[r.index - 1]?.authority || slots[r.index - 1]?.role || '');
    const desired = [all.find(r => /state|core/.test(role(r))), all.find(r => /obstacle|interaction_force|cause/.test(role(r))),
      all.find(r => /outcome/.test(role(r))), all.find(r => /advice/.test(role(r)))];
    // A sequence or paired reading has no free-standing invented outcome slot.
    return distinct([...desired, ...all]).map(r => {
      const position = typeof r.position === 'string' ? r.position : '第' + r.index + '位';
      const direction = r.direction || '方向未記錄';
      const reading = /希望|恐懼|期待/.test(position) ? '這個位置讓你對照期待與擔心。判斷走向時，要另外看這副牌真正的結果位置。' :
        /結果|收束|最終/.test(position) ? '走到這個牌位，再看前面哪些條件會把事情帶到這裡。' :
        /建議|行動/.test(position) ? '想一件你自己能採取的行動，再回頭看它能處理哪個阻力。' :
        '先看這張在牌陣裡負責哪一件事，再跟相連的牌一起讀。';
      return make('第' + r.index + '位・' + position, r.name + '（' + direction + '）' + (r.meaning ? '。' + r.meaning : '。這次沒有登記可用的牌義。'), reading,
        { face: r.id, reversed: direction === '逆位', mark: r.name, edition: d.sourceProfile });
    });
  }

  function opening(c, a) {
    const d = a.methodData;
    return list(d.layerEvidence).map(layer => {
      const title = '第' + layer.index + '輪・' + layer.stage, op = list(d.operations).find(o => o.operation === layer.operation)?.data;
      if (!layer.valid || layer.readingStatus !== 'eligible' || !layer.counts.countingSteps || !layer.counts.activeCards || !d.significator)
        return gap(title, !layer.valid ? '操作停止或未成立。' : layer.readingStatus === 'context-mainline-pending' ? '本輪的主線仍待驗證。' : '代表牌或計數路徑缺少可核對的紀錄。', '這裡只能說明操作進度，不能據此替你的問題下結論。');
      const path = list(op.ringCountingPath).length ? op.ringCountingPath : list(op.countingPath);
      const names = path.slice(0, 3).map(p => list(op.activeCards).find(r => r.id === p.cardId)?.name).filter(Boolean);
      const territory = layer.domain?.label || layer.domain?.meaning || layer.domain?.value;
      const detail = join([typeof territory === 'string' ? territory : '', names.length ? '計數起段：' + names.join(' → ') : '', '記錄了' + path.length + '步']);
      return make(title, detail, '這一輪只承接自己的操作。回到實際計數與配對，看它為上一輪增加了什麼。', { mark: d.significator.name || '代表牌' });
    });
  }

  function lenormand(c, a) {
    const d = a.methodData, rows = list(d.records);
    const data = c.lenormandData || c, spread = data.spreadType || data.spread;
    const paths = list(d.paths);
    const route = spread === 'nine' ? [...paths.filter(p => p.includes(5) && (p[0] === 4 || p[0] === 2)), ...paths] : paths;
    return distinct(route).slice(0, 6).map(p => {
      const set = p.map(i => rows[i - 1]);
      const words = set.slice(0, 3).map(r => {
        const m = Array.isArray(r.meaning) ? r.meaning.join('、') : r.meaning;
        return typeof m === 'string' && m ? r.name + '：' + m : '';
      });
      return make('第' + p.join('、') + '位', set.map(r => r.name).join(' → '),
        join(words) || '沿這一條線把前後牌連成一句。保留這組牌的順序，另一分支要分開看。',
        { faces: set.slice(0, 3).map(r => r.id), mark: set[0].name });
    });
  }

  function oracle(c, a, q) {
    const d = a.methodData, rows = list(d.lines);
    const categories = [
      [/升遷|主管|考試|錄取|功名/, '功名'], [/生意|開店|攤位|營業/, '經商'], [/收入|款項|財運|錢/, '求財'],
      [/結婚|婚姻/, '婚姻'], [/搬家|移居/, '移居'], [/找人|尋人/, '尋人'], [/家人|家事/, '家事']
    ];
    const name = categories.find(([rx]) => rx.test(q))?.[1];
    const cat = list(d.categories).find(p => name && p.name === name && p.present);
    const tags = { supportive: '有利', caution: '留意阻力', conditional: '有成立條件', delay: '待時', late: '偏晚', early: '偏早', negative: '不利', neutral: '平', waiting: '需等待' };
    const qualified = cat && [...list(cat.textFeatureTags).map(t => tags[t]).filter(Boolean), ...list(cat.traditionalTimingTokens)].join('、');
    const clues = rows.map(r => make('第' + d.number + '籤・第' + r.index + '句', r.text,
      list(r.conditionWords).length ? '這句的轉折在「' + r.conditionWords.map(w => w.word).join('、') + '」。想想現實中對應的條件有沒有到。' : '把這一句放回前後句，看看它在描寫處境，還是在說下一步。', { mark: r.text }));
    if (d.reading?.summary) clues.splice(1, 0, make('本籤解意', d.reading.summary, d.reading.premises, { mark: d.ganzhi }));
    if (qualified) clues.splice(1, 0, make('本廟本・' + name + '附記', qualified, '這是本版本附記的要點。所問事項有自己的條件，可以跟整首籤的方向合看。', { mark: name }));
    return clues;
  }

  function gua(c, a, kind) {
    if (kind === 'yijing') return list(a.reading?.selections).map(r => make(r.role + '・' + r.hexagram + '卦' + r.label, r.text, a.reading.rule,
      hex((r.side === 'changed' ? c.changed : c.original)?.lines, r.position)));
    if (kind === 'meihua') return list(a.items).map((r, i) => fromItem(r, i === 0 ? '體卦先固定下來，你才看得出外在條件是在幫忙，還是要你多花力氣。' : i === 3 ? '回到原來的體卦，看變化之後，前面的作用有沒有改變。' : '互卦說的是中間過程，這一步要連回本卦和變卦。', hex(i === 3 ? a.changedLines : i === 0 ? a.originalLines : [...list(a.nuclear?.lower?.li), ...list(a.nuclear?.upper?.li)], i === 0 || i === 3 ? c.dong : null)));
    if (kind === 'liuren') return list(a.items).filter(i => /^transmission-/.test(i.id)).map((i, n) => {
      const t = i.evidence[0];
      return make(i.label, join([i.summary, t.empty ? '本傳旬空' : '', t.assessment?.monthlyBroken ? '月破' : '']),
        ['先看發端有沒有著力處，這會影響後面的承接。', '把這一步和初傳連起來看，事情要經過什麼轉折。', '這一步讀的是三傳收束。具體時日還要另有應期條件。'][n], { mark: t.branch, sector: t.branch && '子丑寅卯辰巳午未申酉戌亥'.indexOf(t.branch) });
    });
    const targets = list(a.targets), primary = targets.filter(t => t.priority === 'primary');
    const rows = (primary.length ? primary : targets).flatMap(t => {
      if (!list(t.candidates).length) return [gap(t.role, '本次沒有找到可確認的' + t.relative + '。', '缺少落點時，只能先核對取用條件。')];
      return t.candidates.map(r => {
        const state = r.assessment || {}, line = list(c.lines).find(l => l.position === r.position);
        const label = t.role + '・第' + r.position + '爻';
        const fact = (r.hidden ? '伏藏' : '明現') + t.relative + r.branch + (r.element || '');
        // A hidden spirit and its covering line have different kinship and strength.
        const detail = r.hidden ? join([fact, line ? '飛神為' + line.relative + line.branch : '', r.hiddenRelation || '']) :
          join([fact, state.monthInfluence, state.dayInfluence, state.voidStatus]);
        return make(label, detail, t.candidates.length > 1 ? '同一用神有多個位置，先分清它指的是哪個人或哪件事。' : r.hidden ? '先分清伏神和飛神，再看月日能否讓伏藏的作用顯出來。' : '月建、日辰和動變要一起看。遇到相反作用時，分清誰生誰、誰受制。',
          hex(c.original?.lines, r.position));
      });
    });
    return rows.concat(list(a.items).filter(i => /世|應/.test(i.label)).map(i => fromItem(i, '世應分別定位當事人和所問的一方，再核對它們與用神的關係。', hex(c.original?.lines, i.evidence[0].natal?.position))));
  }

  function natal(c, a, kind, primaryItems, question) {
    const items = list(a.items), find = id => items.find(p => p.id === id);
    if (a.coverage.provisional || c.input?.unknownTime || c.sensitivity?.unknownTime) {
      const limits = { bazi: '時柱、整體旺衰與精確起運要等時辰確認。', ziwei: '缺出生時辰，十二宮和星曜落宮不能確定。', vedic: '上升、宮位、分盤宮位與精確運期不能確定。', astro: '四角與宮位不能確定，月亮位置需看當天範圍。' };
      const available = kind === 'bazi' ? items.filter(i => /^pillar-(year|month|day)$/.test(i.id)).map(i => fromItem(i, '這是三柱中可核對的部分。', { mark: i.evidence[0]?.gan + i.evidence[0]?.zhi })) : [];
      if (kind === 'astro' || kind === 'vedic') {
        const signs = ['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚'];
        for (const [key, name] of [['Sun','太陽'],['Moon','月亮']]) {
          let indices;
          if (kind === 'astro') indices = c.sensitivity?.planets?.find(p => p.key === key)?.signs;
          else if (c.sensitivity?.sampled && c.planets?.[key]) {
            const change = c.sensitivity.changes?.find(p => p.key === key + '/D1');
            indices = change?.alternatives || [c.planets[key].sign];
          }
          const found = distinct(list(indices).map(i => signs[i]));
          if (found.length) available.push(make(name + '・當日取樣', found.length === 1 ?
            '當天所取時點，' + name + '都在' + found[0] + '座。' :
            '當天取樣跨過' + found.join('、') + '座，要有時辰才能辨別。',
            '你仍可以用這一天的範圍來對照，無法就此指定它在哪一宮。', { mark:name }));
        }
      }
      return [gap('出生時辰待確認', limits[kind], '如果你能取得出生紀錄，再回來檢查這部分；目前只用已能定位的資料。'), ...available];
    }
    if (kind === 'astro' && c.input?.chartPurpose && c.input.chartPurpose !== 'natal') {
      const mode = c.input.chartPurpose;
      if (mode === 'horary') {
        const h = c.horary || a.horary;
        if (!h) return [gap('問事盤', '本次沒有可用的問事宮主資料。', '要有問事當下的資料，才能連接問事者和事情。')];
        return [make('問事盤・取用', join([h.selectedHouse ? '所問第' + h.selectedHouse + '宮' : '', h.querent?.lord ? '本方宮主' + (root.JYWestern?.zh?.(h.querent?.lord) || h.querent?.lord) : '', h.quesited?.lord ? '對方宮主' + (root.JYWestern?.zh?.(h.quesited?.lord) || h.quesited?.lord) : '']) || '本次依問事時刻起盤。', '入相、接納與阻斷條件要一起讀。', { mark: '問事' })];
      }
      if (a.relocated || c.relocated) {
        const r = c.relocated || a.relocated;
        return [make('遷居參照地', join([r.location || '', r.houses?.angles?.ASC != null ? '遷居上升 ' + Math.round(r.houses.angles.ASC * 100) / 100 + '°' : '']) || '已另排參照地盤。', '比較兩地的四角與落宮，把實際的居住條件留給你核對。', { mark: '遷居' })];
      }
    }
    const base = { bazi: ['pillar-month','pillar-day'], ziwei: ['palace-命宮','palace-福德'], vedic: ['house-1'], astro: ['house-1'] }[kind];
    const rows = distinct([...primaryItems, ...base.map(find)]);
    const cues = rows.map(i => {
      const ev = i.evidence[0] || {}, house = Number(i.id.split('-')[1]);
      const reading = { bazi: '把明透與藏支分開讀，再看月令是否支持它。才能談它在你所問的事上容易發揮在哪裡。', ziwei: '先看本宮，再看對宮與三方。借星、會照和本宮坐守各有不同的分量。', astro: '看這個宮的宮主落到哪裡，再核對它與其他星的作用，才知道哪兩件生活上的事連在一起。', vedic: '從這個宮追到宮主落點，再用對題的分盤與運期核對，不能把本命傾向直接當作事件日期。' }[kind];
      return fromItem(i, reading, { mark: ev.gan && ev.zhi ? ev.gan + ev.zhi : i.label.split(' · ')[0], sector: house >= 1 && house <= 12 ? house - 1 : null });
    });
    if (kind === 'vedic') {
      const focus = a.depthContract?.requestCoverage?.caseBasis?.focus;
      const explicit = [...String(question || '').matchAll(/\bD(\d{1,3})\b/gi)].map(m => Number(m[1]));
      const relevant = distinct([...explicit, ...list(focus?.divisions).filter(n => n !== 1 && n !== 9)]);
      const lord = [...primaryItems].find(i => i.evidence[0]?.house?.lord)?.evidence[0]?.house?.lord;
      for (const n of relevant.slice(0, 2)) {
        const v = c.vargas?.[n], pl = lord && v?.planets?.[lord];
        if (!v?.lagna?.signName) continue;
        cues.splice(1, 0, make('D' + n + '・' + (v.purpose || '分盤'), join(['分盤上升' + v.lagna.signName, pl?.signName ? (root.JYVedic?.zh(lord) || lord) + '在' + pl.signName + (pl.house ? '第' + pl.house + '宮' : '') : '']), '同一顆星在專項分盤的落點，是拿來核對本命傾向在這件事上怎麼發揮。', { mark: 'D' + n, sector: v.lagna.sign }));
      }
    }
    return cues;
  }

  function pairs(c, a) {
    if (a.system === 'ziwei') {
      if (!c.personA || !c.personB) return [gap('雙方定盤條件', '甲方' + (c.personA ? '有盤' : '未定盤') + '，乙方' + (c.personB ? '有盤' : '未定盤') + '。', '只能解讀資料齊全的一方，跨盤作用需要雙方都能定盤。')];
      const rows = list(c.projectionGroups), focus = list(c.focusPalaces);
      const relevant = rows.filter(r => focus.includes(r.targetPalace));
      return distinct([...relevant, ...rows]).slice(0, 4).map(r => make(r.sourcePerson + ' → ' + r.targetPerson, r.star + r.hua + '入' + r.targetPalace + '（' + r.targetBranch + '）', '先辨清誰引動、誰承接。同一生年與宮干投射合併時只算一個作用。', { mark: r.targetPalace }));
    }
    const out = [];
    if (c.dayMasters?.aToB?.label && c.dayMasters?.bToA?.label) out.push(make('雙方日主', '甲方對乙方：' + c.dayMasters.aToB.label + '；乙方對甲方：' + c.dayMasters.bToA.label, '這是兩個方向的關係，可以對照誰先帶動、誰承接。對方的實際意願仍要由對方表達。', { mark: [c.personA?.dayMaster, c.personB?.dayMaster].filter(Boolean).join('／') }));
    const rs = list(c.branchRelations);
    const relevant = rs.filter(r => r.aPillar === 'day' || r.bPillar === 'day');
    return out.concat(distinct([...relevant, ...rs]).slice(0, 3).map(r => make(r.type, r.description, '要看它落在雙方哪一柱。若日支同時有其他作用，也要一併考慮。', { mark: r.aBranch + '／' + r.bBranch })));
  }

  function names(c) {
    const people = list(c.names).length ? c.names : [c];
    return people.map(p => {
      const grid = list(p.fiveGrids?.grids).find(g => g.role === '人格');
      const strokes = list(p.characters).map(x => x.char + (x.stroke ?? x.strokes ?? x.effectiveStrokes ?? '待核')).join('、');
      const sound = list(p.phonetic?.characters).map(x => x.char + ' ' + (x.reading || list(x.candidates).join('／') || '待核') + (x.confirmed ? '（本人確認）' : '（待本人確認）'));
      const details = [strokes && '各字筆畫：' + strokes, grid?.num != null ? '人格 ' + grid.num + '（' + grid.level + '，' + grid.theme + '）' : '五格未定', sound.length ? '讀音：' + sound.join('、') : ''];
      return make(p.name + (p.name === c.baseline?.name ? '・原名' : ''), join(details), '逐個名字用同一筆畫口徑比較。你平常怎麼唸、希望名字表達什麼，也會改變實際取捨。', { mark: p.name });
    });
  }

  function build(entry, question, primaryItems = []) {
    const { method, chart, analysis } = entry;
    const station = stations[method];
    if (!station) return null;
    let points;
    if (method === 'tarot') points = cards(chart, analysis);
    else if (method === 'ootk') points = opening(chart, analysis);
    else if (method === 'lenormand') points = lenormand(chart, analysis);
    else if (method === 'oracle') points = oracle(chart, analysis, question);
    else if (method === 'name') points = names(chart);
    else if (method === 'compat') points = pairs(chart, analysis);
    else if (method === 'personality') points = analysis.coverage.provisional ? [gap('時辰待確認', '本次未能計出完整五軸。', '先保留不確定的部分。')] : list(analysis.items).map(i => fromItem(i, '想一件你真的做過的事來對照這個傾向。生活經驗可以和這個模型不一樣。', { mark: i.evidence[0][i.evidence[0].rightSelected ? 'right' : 'left'] }));
    else if (['meihua','liuren','liuyao','yijing'].includes(method)) points = gua(chart, analysis, method);
    else points = natal(chart, analysis, method, primaryItems, question);
    points = points.filter(p => p?.label && p.detail);
    if (!points.length) points = [gap('可讀範圍', '本次尚無可定位的解讀落點。', '只保留已完成的程序，等缺少的資料補齊再看。')];
    return { method, source: entry.label || '', title: station[0], action: station[1], theme: station[2], points };
  }
  root.JYConsultationEvidence = Object.freeze({ build });
})(typeof window === 'undefined' ? globalThis : window);
