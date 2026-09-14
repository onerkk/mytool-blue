# 西洋觀星台視覺素材

生成方式：內建 imagegen，2026-09-14。素材用途是藝術場景，沒有把生成圖當精確命盤。

專案位置：`assets/ui/western-observatory-20260914.webp`。原圖 1024 × 1536，僅轉 WebP 格式供網站載入；精確星盤由 `western-chart.js` 畫出，再由 `western-scene-src.mjs` 貼到真正有厚度的星儀上。

完整生成提示：

```text
Use case: stylized-concept. Asset type: immersive astrology website environmental backdrop, portrait 1024x1536. Create an exquisitely crafted, photorealistic three-dimensional European Renaissance observatory interior at midnight. Tall bronze celestial dome with ribbed brass architecture and an open circular oculus onto deep blue stars; flanking dark carved wood cabinets and deep lapis-blue stone columns, fine antique gold filigree on corbels, warm practical lanterns, a circular polished black marble floor with bronze inlays. Symmetrical central perspective, eye-level camera looking into a grand hall, rich spatial depth. The central lower half must remain empty open floor for a real interactive brass zodiac wheel rendered later in WebGL, do not draw a zodiac wheel or charts or large objects in the middle. Sapphire blue, antique gold, warm ivory light, restrained burgundy details. Physically plausible materials, engraved bronze highlights, volumetric moonlight, cinematic dramatic lighting but legible architectural detail, luxury museum quality, avoid flat illustration. No people, no statues, no text or lettering, no logos, no UI, no lotus, no Indian architecture.
```

3D 成品：`JS/western-scene.js`。原始碼：`JS/western-scene-src.mjs`。鏡頭、星儀升起、葉片開合、星座銘牌與觸控視角均為程式動畫，不是循環播放的背景影片。
