'use strict';
const assert=require('node:assert/strict');
// Assert a cache-busted asset and a minimum release, without pinning a historical build.
exports.assetVersion=function(source,path,minimum='20260922'){
 const escaped=path.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const m=source.match(new RegExp(escaped+'\\?v=([A-Za-z0-9_.-]+)'));
 assert(m,'Missing versioned asset '+path);
 assert(m[1].slice(0,8)>=minimum,'Stale '+path+': '+m[1]);return m[1];
};
