import {build} from 'rolldown';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await build({input:path.join(root,'JS/gua-scene-src.mjs'),platform:'browser',output:{file:path.join(root,'JS/gua-scene.js'),format:'iife',name:'JYGuaSceneModule',minify:true,comments:{legal:true},sourcemap:false}});
console.log('Built copper and yarrow 3D chambers.');
