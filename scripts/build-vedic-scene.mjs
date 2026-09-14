import {build} from 'rolldown';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await build({input:path.join(root,'JS/vedic-scene-src.mjs'),platform:'browser',output:{file:path.join(root,'JS/vedic-scene.js'),format:'iife',name:'JYVedicSceneModule',minify:true,comments:{legal:true},sourcemap:false}});
console.log('Built the independent Navagraha / Kundali 3D ceremony.');
