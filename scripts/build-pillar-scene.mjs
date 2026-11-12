import {build} from 'rolldown';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await build({input:path.join(root,'JS/pillar-scene-src.mjs'),platform:'browser',output:{file:path.join(root,'JS/pillar-scene.js'),format:'iife',name:'JYPillarSceneModule',minify:true,comments:{legal:true},sourcemap:false}});
console.log('Built the bazi 3D four-pillars scene.');
