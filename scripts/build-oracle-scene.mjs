import {build} from 'rolldown';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await build({input:path.join(root,'JS/oracle-scene-src.mjs'),platform:'browser',output:{file:path.join(root,'JS/oracle-scene.js'),format:'iife',name:'JYOracleSceneModule',minify:true,comments:{legal:true},sourcemap:false}});
console.log('Built the oracle 3D altar scene.');
