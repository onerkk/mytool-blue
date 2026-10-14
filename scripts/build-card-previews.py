"""Build display previews from the original local artwork, without redrawing it.

Ritual thumbnails use these 384 x 576 previews. The full artwork remains the
canonical image for reading data, single-card inspection and sharing.
Requires Pillow; run from any directory with python scripts/build-card-previews.py.
"""
from pathlib import Path
from io import BytesIO
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/cards/bright-20261011"
TARGET = ROOT / "assets/cards/preview-20261014"

def build():
    paths = sorted(SOURCE.glob("*/*.webp"))
    for source in paths:
        target = TARGET / source.relative_to(SOURCE)
        target.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(source) as image:
            image = image.convert("RGB")
            image.thumbnail((384, 576), Image.Resampling.LANCZOS)
            data = BytesIO()
            image.save(data, "WEBP", quality=88, method=6)
            temporary = target.with_suffix(".webp.tmp")
            temporary.write_bytes(data.getvalue())
            temporary.replace(target)
        with Image.open(target) as preview:
            preview.load()
            assert preview.size == (384, 576), str(target)
    print(f"Built {len(paths)} card previews; full-size originals unchanged.")

if __name__ == "__main__":
    build()
