'use strict';
// Real picker/controller lifecycle; actual browser touch evidence is in the audit report.
const assert=require('node:assert/strict');
const {tarotFixture,load}=require('./ritual-lifecycle-20260911.cjs');
function setup(){
 const e=tarotFixture();load(e,'ritual-story');e.ctx.goStep=()=>{};e.ctx.console={log(){},warn(){},error(){}};
 e.doc.body.style.overflow='auto';e.ctx.startOOTK();
 e.doc.querySelector('.ootk-manual-sig').click();e.doc.querySelector('#ootk-confirm').click();
 for(const [name,value] of Object.entries({direction:'left',pile:'water','house-primary':'7','house-cognate':'',sign:'6',seph:'6'}))e.doc.querySelector('#ootk-bind-'+name).value=value;
 return e;
}
{
 const e=setup();assert.equal(e.doc.body.style.overflow,'hidden');e.doc.querySelector('#ootk-confirm').click();
 assert.equal(e.doc.getElementById('ootk-sig-overlay'),null);
 assert(e.ctx.JYRitual.isActive('ootk'));
 assert.equal(e.doc.body.style.overflow,'hidden','The new ritual owns its active lock');
 e.doc.querySelector('.jr-cancel').click();
 assert.equal(e.doc.body.style.overflow,'auto','The ritual restores the original page state, not a closed picker lock');
 assert.equal(e.doc.getElementById('ootk-sequence-overlay'),null);
 assert.equal(e.doc.querySelectorAll('dialog[open]').length,0);
 console.log('PASS Picker -> Key ritual -> cancel restores original scrolling and removes overlays');
}
{
 const e=setup();e.ctx.ootkRunFull=()=>{throw new Error('Controlled calculation failure');};
 for(let i=0;i<2;i++){
  e.doc.querySelector('#ootk-confirm').click();
  assert(e.doc.getElementById('ootk-sig-overlay'));
  assert.equal(e.doc.querySelector('#ootk-bind-pile').value,'water');
  assert.equal(e.doc.querySelectorAll('.jy-picker-close').length,1);
  assert.equal(e.doc.querySelector('#ootk-confirm').disabled,false);
  assert(e.doc.querySelector('#ootk-setup-error').textContent.includes('Controlled calculation failure'));
 }
 e.doc.querySelector('#ootk-cancel').click();assert.equal(e.doc.body.style.overflow,'auto');
 assert.equal(e.doc.querySelectorAll('dialog[open]').length,0);
 console.log('PASS Repeated launch failure retains selections and one close control, then unlocks on cancel');
}
