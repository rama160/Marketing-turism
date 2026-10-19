# Convert large Wikimedia originals into predictable small JPEG images on our website.
from PIL import Image, ImageOps, ImageFile
from pathlib import Path
import json, hashlib
Image.MAX_IMAGE_PIXELS = 40_000_000
ImageFile.LOAD_TRUNCATED_IMAGES = True
manifest_path=Path("public/photos/manifest.json")
manifest=json.loads(manifest_path.read_text())
for item in manifest["photos"]:
    path=Path("public/photos")/(item["slug"]+".jpg")
    with Image.open(path) as opened:
        # Wikimedia JPEG files may be detected as MPO depending on embedded camera data.
        # Accept only photos PIL can actually decode and transcode to clean RGB JPEG.
        print(f"DECODE {item['slug']} source format: {opened.format}")
        im=ImageOps.exif_transpose(opened).convert("RGB")
        im.thumbnail((960, 720), Image.Resampling.LANCZOS)
        im.save(path,"JPEG",quality=82,optimize=True,progressive=True,subsampling=0)
    with Image.open(path) as verified:
        verified.verify()
    raw=path.read_bytes()
    if not raw.startswith(bytes([0xff,0xd8])) or len(raw)<12000 or len(raw)>800000:
        raise ValueError(f"Output JPG is invalid or oversized: {path} {len(raw)}")
    item["sha256"]=hashlib.sha256(raw).hexdigest()
    item["bytes"]=len(raw)
    print(f"OPTIMIZED {item['slug']}: {len(raw)} bytes")
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
