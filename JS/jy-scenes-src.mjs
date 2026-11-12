/* 靜月・立體場景合併檔（2026-11-12）
 * 原本牌桌、四柱殿、星盤卦盤、供桌各打包一份，每份都含一整套 three.js（各 560～680KB），使用者每進一個工具就要再下載一次。
 * 合成一個檔：three.js 只有一份，四個場景共用；任何一個工具先載到，其餘就不必再載。對外仍是原本四個全域名稱，舞台程式不用改呼叫方式。
 */
import {create as tarot} from './tarot-scene-src.mjs';
import {create as pillar} from './pillar-scene-src.mjs';
import {create as wheel} from './wheel-scene-src.mjs';
import {create as oracle, supported} from './oracle-scene-src.mjs';
const w=window;
w.JYTarotSceneModule={create:tarot};w.JYPillarSceneModule={create:pillar};w.JYWheelSceneModule={create:wheel};w.JYOracleSceneModule={create:oracle,supported};
