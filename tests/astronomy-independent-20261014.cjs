'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const expected=require('./fixtures/astronomy-swiss-20261014.json');
const actual=JSON.parse(execFileSync(process.execPath,[path.resolve(__dirname,'../scripts/astronomy-sample-20261014.cjs')],{maxBuffer:8*1024*1024}));
const diff=(a,b)=>Math.abs(((a-b+180)%360+360)%360-180);let count=0,max=0;
function check(a,b,label){const d=diff(a,b);assert(d<expected.toleranceDegrees,label+' difference='+d+' degrees');count++;max=Math.max(max,d);}
assert.equal(actual.cases.length,expected.cases.length);assert.equal(actual.houses.length,expected.houses.length);
for(let i=0;i<actual.cases.length;i++){
 const a=actual.cases[i],b=expected.cases[i];assert.equal(a.utc,b.utc);
 for(const [k,v]of Object.entries(b.tropical))check(a.tropical[k],v,a.utc+'/'+k+'/tropical');
 for(const [mode,values]of Object.entries(b.sidereal))for(const [k,v]of Object.entries(values))check(a.sidereal[mode][k],v,a.utc+'/'+k+'/'+mode);
}
for(let i=0;i<actual.houses.length;i++){
 const a=actual.houses[i],b=expected.houses[i];for(const k of ['utc','latitude','longitude','system'])assert.equal(a[k],b[k]);
 assert.equal(a.cusps.length,12);for(let h=0;h<12;h++)check(a.cusps[h],b.cusps[h],a.utc+'/'+a.system+'/'+a.latitude+'/house'+(h+1));
}
console.log(JSON.stringify({status:'passed',assertions:count,maximumDifferenceDegrees:max,swissVersion:expected.swissVersion,scope:expected.caseScope}));
