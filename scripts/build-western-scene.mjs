import {build} from 'rolldown';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await build({input:path.join(root,'JS/western-scene-src.mjs'),platform:'browser',output:{file:path.join(root,'JS/western-scene.js'),format:'iife',name:'JYWesternSceneModule',minify:true,comments:{legal:true},sourcemap:false}});
console.log('Built the Western celestial atlas scene.');
