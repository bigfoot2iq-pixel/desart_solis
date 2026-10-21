"""
Builds the hero product-family strip from the real product cutouts.

Not part of the app build - run it by hand when the range or the art direction
changes. Requires Python 3 with Pillow and numpy.

    python scripts/build-hero.py

The strip is a wide band that sits at the bottom of the hero, full bleed. Two
variants are produced because a single 4.3:1 crop cannot serve both a wide
desktop band and a narrow phone band:

- hero-range.webp        2000x460  desktop, products spread across the frame
- hero-range-mobile.webp 1200x560  phone, products in a tighter cluster

The backdrop starts on the exact page cream (#f3f0ec) so the seam with the page
disappears, and each product is scaled by its real pack size (400 ml bottle
tallest, 30 ml dropper most compact) and stood on a single floor line.
"""

import os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, "public", "brand")

PAGE_CREAM = (243, 240, 236)
FLOOR = (228, 216, 196)

# file, height as a share of the canvas, in display order
ITEMS = [
    ("face-wash.webp", 0.74),
    ("gommage.webp", 0.59),
    ("gel-douche.png", 0.78),
    ("serum.webp", 0.63),
]


def backdrop(w, h):
    """Page cream at the top fading to a warm sand floor, lit from the upper left."""
    yy, xx = np.mgrid[0:h, 0:w]
    y = yy / h

    top = np.array(PAGE_CREAM, dtype=np.float32)
    bottom = np.array(FLOOR, dtype=np.float32)
    grad = top[None, None, :] * (1 - y[:, :, None]) + bottom[None, None, :] * y[:, :, None]

    key = np.exp(-(((xx - w * 0.34) / (w * 0.55)) ** 2 + ((yy - h * 0.18) / (h * 0.6)) ** 2))
    grad += key[:, :, None] * np.array([7, 6, 4], dtype=np.float32)

    return Image.fromarray(np.clip(grad, 0, 255).astype(np.uint8), "RGB")


def shadow(canvas, cx, base_y, half_w, strength=0.36):
    """Two-part contact shadow: a tight dark core plus a wide soft falloff."""
    w, h = canvas.size
    for spread, scale, alpha in ((3.0, 0.22, strength), (1.2, 0.09, strength * 0.8)):
        rx, ry = half_w * spread, half_w * scale
        pad = int(rx * 1.2)
        x0, x1 = max(0, int(cx - rx)), min(w, int(cx + rx))
        y0, y1 = max(0, int(base_y - ry * 2.4)), min(h, int(base_y + ry * 2.8))
        if x1 <= x0 or y1 <= y0:
            continue
        yy, xx = np.mgrid[y0:y1, x0:x1]
        r = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - base_y) / ry) ** 2)
        a = np.clip(1.0 - r, 0, 1) ** 1.7 * alpha
        layer = Image.new("L", (x1 - x0, y1 - y0), 0)
        layer.putalpha(Image.fromarray((a * 255).astype(np.uint8), "L"))
        canvas.paste(Image.new("RGB", layer.size, (72, 56, 40)), (x0, y0), layer)


def load(name, height):
    im = Image.open(os.path.join(BRAND, name)).convert("RGBA")
    scale = height / im.height
    return im.resize((max(1, round(im.width * scale)), height), Image.LANCZOS)


def build(w, h, gap_ratio, baseline_ratio, filename):
    baseline = int(h * baseline_ratio)
    canvas = backdrop(w, h).convert("RGBA")

    products = [load(name, int(h * share)) for name, share in ITEMS]
    gap = int(w * gap_ratio)
    group = sum(p.width for p in products) + gap * (len(products) - 1)
    x = (w - group) / 2

    for prod in products:
        cx = x + prod.width / 2
        shadow(canvas, cx, baseline, prod.width * 0.55)
        canvas.alpha_composite(prod, (int(round(x)), int(baseline - prod.height)))
        x += prod.width + gap

    out = canvas.convert("RGB")
    out.save(os.path.join(BRAND, filename + ".png"))
    out.save(os.path.join(BRAND, filename + ".webp"), "WEBP", quality=90, method=6)
    print(filename, out.size)


# desktop: products spread across a 4.35:1 band
build(2000, 460, gap_ratio=0.10, baseline_ratio=0.895, filename="hero-range")
# phone: tighter cluster in a 2.14:1 band so all four stay visible
build(1200, 560, gap_ratio=0.008, baseline_ratio=0.895, filename="hero-range-mobile")
