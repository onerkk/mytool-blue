from PIL import Image,ImageFilter,ImageChops,ImageEnhance
import numpy as np,sys
def finish(src,dst,size=None,q=90):
    im=Image.open(src).convert('RGB');a=np.asarray(im).astype(np.float32)
    lum=a.mean(axis=2);mask=np.clip((lum-150)/80,0,1)[...,None]
    bright=Image.fromarray(np.uint8(a*mask))
    glow=np.asarray(bright.filter(ImageFilter.GaussianBlur(7))).astype(np.float32)
    glow2=np.asarray(bright.filter(ImageFilter.GaussianBlur(22))).astype(np.float32)
    out=255-(255-a)*(255-glow*.55)/255;out=255-(255-out)*(255-glow2*.35)/255
    rng=np.random.default_rng(3);noise=rng.normal(0,3.2,a.shape[:2])[...,None]
    out=np.clip(out+noise,0,255)
    img=Image.fromarray(np.uint8(out));img=ImageEnhance.Contrast(img).enhance(1.04)
    if size:img=img.resize(size,Image.LANCZOS)
    img.save(dst,'WEBP',quality=q,method=6);return img
for k in ('tarot','lenormand'):
    finish(f'{k}.png',f'{k}-final.webp');finish(f'{k}.png',f'{k}-preview.webp',(384,576),84)
    import os;print(k,os.path.getsize(f'{k}-final.webp'),os.path.getsize(f'{k}-preview.webp'))
