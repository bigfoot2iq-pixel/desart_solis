"""
Prepares the product cutouts used by the hero range strip.

Not part of the app build - run it by hand when the packaging changes.
Requires Python 3 with Pillow and numpy.

    python scripts/build-range.py

The hero no longer composites a single baked band of the four products.
Baking them into one raster meant a fixed aspect ratio, so any viewport that
did not match it cropped the range: wide screens cut the tops off the tall
bottles, narrow screens sliced the outer products away. The range is now
composed in the DOM from the individual cutouts, so each one is always whole.

That works only if every cutout is trimmed tight. The source renders carry
large transparent margins (the gommage tube is 1045px wide but only 633px of
product), which would otherwise push the products apart and break the shared
baseline.

Output (alpha preserved, written next to the sources):
    public/brand/range/face-wash.webp
    public/brand/range/gommage.webp
    public/brand/range/gel-douche.webp
    public/brand/range/serum.webp

To re-cut a single file, or to cut a new product:

    python scripts/build-range.py gommage.webp
    python scripts/build-range.py new-product.webp
"""

import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, "public", "brand")
OUT = os.path.join(BRAND, "range")

# The four products that make up the hero range, in display order.
DEFAULT_SOURCES = [
    "face-wash.webp",
    "gommage.webp",
    "gel-douche.png",
    "serum.webp",
]

# Anything fainter than this is antialiasing noise, not product.
ALPHA_CUTOFF = 12


def trim(im: Image.Image) -> Image.Image:
    """Crop to the product, dropping fully transparent margins."""
    alpha = im.getchannel("A")
    # point() maps every alpha below the cutoff to 0 so the bbox ignores it
    mask = alpha.point(lambda a: 255 if a > ALPHA_CUTOFF else 0)
    bbox = mask.getbbox()
    if bbox is None:
        raise ValueError("cutout has no visible pixels")
    return im.crop(bbox)


def main(argv: list[str]) -> None:
    os.makedirs(OUT, exist_ok=True)

    for src_name in argv or DEFAULT_SOURCES:
        im = Image.open(os.path.join(BRAND, src_name)).convert("RGBA")
        trimmed = trim(im)
        dest = os.path.join(OUT, os.path.splitext(src_name)[0] + ".webp")
        trimmed.save(dest, "WEBP", quality=92, method=6)
        w, h = trimmed.size
        print(f"{os.path.basename(dest):<18} {w:>5} x {h:<5} aspect {w / h:.4f}")


if __name__ == "__main__":
    main(sys.argv[1:])
