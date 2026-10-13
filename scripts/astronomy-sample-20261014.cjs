'use strict';
// Emits the actual browser engines' angular values without computing unrelated dashas.
const {environment}=require('../tests/native-fixtures-20261003.cjs');
const c=environment().ctx,dates=['1900-01-01T00:00:00Z','1912-02-04T10:00:00Z','1930-06-21T12:00:00Z','1949-10-01T00:00:00Z','1960-02-29T23:30:00Z','1983-08-25T06:55:00Z','1999-12-31T23:59:59Z','2000-01-01T12:00:00Z','2024-02-29T16:00:00Z','2026-10-14T00:00:00Z','2031-08-25T06:55:00Z','2050-06-21T12:00:00Z','2075-12-21T12:00:00Z','2099-01-01T00:00:00Z','2100-01-01T00:00:00Z'];
const cases=dates.map(utc=>({utc,tropical:Object.fromEntries(c.JYWestern.KEYS.map(k=>[k,c.JYWestern.position(k,utc).longitude])),sidereal:Object.fromEntries(['lahiri','raman'].map(mode=>[mode,Object.fromEntries(Object.entries(c.JYVedic.astronomy(new Date(utc),23.31,120.31,mode).planets).map(([k,p])=>[k,p.sidereal]))]))}));
const houses=[];for(const utc of [dates[5],dates[7],dates[9]])for(const [latitude,longitude]of [[23.31,120.31],[51.5,-.12],[-33.87,151.21],[64.14,-21.94]])for(const system of ['P','W','E','O','R']){const h=c.JYWestern.houses(utc,latitude,longitude,system);houses.push({utc,latitude,longitude,system,cusps:h.cusps});}
process.stdout.write(JSON.stringify({source:'actual bundled Astronomy Engine 2.1.19 and local Western/Vedic adapters',cases,houses}));
