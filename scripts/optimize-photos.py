# Convert large Wikimedia originals into predictable small JPEG images on our website.
from PIL import Image, ImageOps, ImageFile
from pathlib import Path
import json, hashlib
Image.MAX_IMAGE_PIXELS = 40_000_000
ImageFile.LOAD_TRUNCATED_IMAGES = True

# Build responsive derivatives of published public photos only. Keep the originals
# in KV and the source archive unchanged. Internal assets are served by the Worker.
import sys
if "--responsive-public" in sys.argv:
    import io, re, urllib.request
    from concurrent.futures import ThreadPoolExecutor
    base="https://nusapenidaexperiences.com"
    widths=(240,480,800,1200)
    output=Path("public/__npe_templates/responsive")
    output.mkdir(parents=True,exist_ok=True)
    def fetch(path, limit):
        with urllib.request.urlopen(urllib.request.Request(base+path,headers={"User-Agent":"NPE-public-image-build/1"}),timeout=30) as r:
            data=r.read(limit+1)
            if len(data)>limit: raise ValueError("Public asset exceeds build limit")
            return data
    paths=set()
    for endpoint,field in [("/api/public/website/slots","url"),("/api/public/website/activities","photo_url")]:
        for item in json.loads(fetch(endpoint,2_000_000))["items"]:
            value=item.get(field) or ""
            if re.fullmatch(r"/photos/website/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",value):
                paths.add(value)
    try:
        for item in json.loads(fetch("/api/public/website/articles",2_000_000))["items"]:
            value=item.get("photo_url") or ""
            if re.fullmatch(r"/photos/website/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",value):
                paths.add(value)
    except urllib.error.HTTPError as e:
        if e.code!=404: raise
    if len(paths)>500: raise ValueError("Too many published images for bounded build")
    def generate(pair):
        key,raw=pair
        with Image.open(io.BytesIO(raw)) as opened:
            im=ImageOps.exif_transpose(opened).convert("RGB")
            if not im.width or not im.height or im.width*im.height>40_000_000: raise ValueError("Invalid image dimensions")
            for width in widths:
                # Exact width descriptors: preserve aspect ratio; modest upscaling only
                # where the source is narrower than the largest display variant.
                h=max(1,round(im.height*width/im.width))
                resized=im.resize((width,h),Image.Resampling.LANCZOS)
                target=output/(key+"-"+str(width)+".webp")
                resized.save(target,"WEBP",quality=80 if width<=480 else 83,method=4)
                with Image.open(target) as checked:
                    if checked.width!=width or checked.format!="WEBP": raise ValueError("Invalid derivative")
                    checked.verify()
                if target.stat().st_size>900000: raise ValueError("Oversize derivative")
        return (len(raw),sum((output/(key+"-"+str(w)+".webp")).stat().st_size for w in widths))
    static=[(p.stem,p.read_bytes()) for p in Path("public/photos").glob("*.jpg") if re.fullmatch(r"[a-z-]+",p.stem)]
    with ThreadPoolExecutor(max_workers=4) as pool:
        owners=list(pool.map(lambda path:(path.split("/")[-1],fetch(path,900000)),sorted(paths)))
        totals=list(pool.map(generate,static+owners))
    print("Responsive WebP generated for",len(totals),"photos;",len(totals)*len(widths),"variants")
    sys.exit(0)

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
