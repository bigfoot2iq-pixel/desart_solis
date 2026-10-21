"""
Builds the hero product-family shot from the real product cutouts.

Not part of the app build - run it by hand when the range or the art direction
changes. Requires Python 3 with Pillow and numpy.

    python scripts/build-hero.py

Products are composited on a warm studio backdrop with contact shadows, scaled
by their real pack size (400 ml bottle tallest, 30 ml dropper most compact).
Output: public/brand/hero-range.png (source) and .webp (served).
"""

import os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, "public", "brand")

W, H = 1600, 1000
BASELINE = 838


def backdrop(w, h):
    """Warm studio sweep: soft key light from the upper left, floor falloff, gentle vignette."""
    yy, xx = np.mgrid[0:h, 0:w]
    y = yy / h

    top = np.array([252, 246, 236], dtype=np.float32)
    bottom = np.array([225, 212, 192], dtype=np.float32)
    grad = top[None, None, :] * (1 - y[:, :, None]) + bottom[None, None, :] * y[:, :, None]

    # key light, upper left
    key = np.exp(-(((xx - w * 0.36) / (w * 0.55)) ** 2 + ((yy - h * 0.24) / (h * 0.50)) ** 2))
    grad += key[:, :, None] * np.array([14, 12, 8], dtype=np.float32)

    # vignette
    vig = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    grad -= np.clip(vig - 0.58, 0, None)[:, :, None] * np.array([32, 28, 22], dtype=np.float32)

    return Image.fromarray(np.clip(grad, 0, 255).astype(np.uint8), "RGB")


def shadow(canvas, cx, base_y, half_w, strength=0.42):
    """Two-part contact shadow: a tight dark core plus a wide soft falloff."""
    w, h = canvas.size
    for spread, scale, alpha in ((3.0, 0.20, strength), (1.25, 0.085, strength * 0.85)):
        rx, ry = half_w * spread, half_w * scale
        pad = int(rx * 1.2)
        x0, x1 = max(0, int(cx - rx)), min(w, int(cx + rx))
        y0, y1 = max(0, int(base_y - ry * 2.2)), min(h, int(base_y + ry * 2.6))
        if x1 <= x0 or y1 <= y0:
            continue
        yy, xx = np.mgrid[y0:y1, x0:x1]
        r = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - base_y) / ry) ** 2)
        a = np.clip(1.0 - r, 0, 1) ** 1.7 * alpha
        layer = Image.new("L", (x1 - x0, y1 - y0), 0)
        layer.putalpha(Image.fromarray((a * 255).astype(np.uint8), "L"))
        canvas.paste(Image.new("RGB", layer.size, (70, 54, 38)), (x0, y0), layer)


def load(name, height):
    im = Image.open(os.path.join(BRAND, name)).convert("RGBA")
    scale = height / im.height
    return im.resize((max(1, round(im.width * scale)), height), Image.LANCZOS)


def main():
    canvas = backdrop(W, H).convert("RGBA")

    # Relative heights follow the real pack sizes: 400 ml tall, 200 ml pump tall,
    # 250 g tube broad and low, 30 ml dropper the most compact.
    items = [
        {"file": "face-wash.webp", "h": 655, "x": 330},
        {"file": "gommage.webp", "h": 525, "x": 645},
        {"file": "gel-douche.png", "h": 700, "x": 945},
        {"file": "serum.webp", "h": 585, "x": 1215},
    ]

    for item in items:
        prod = load(item["file"], item["h"])
        cx = item["x"]
        shadow(canvas, cx, BASELINE, prod.width * 0.54)
        canvas.alpha_composite(prod, (int(round(cx - prod.width / 2)), int(BASELINE - prod.height)))

    out = canvas.convert("RGB")
    out.save(os.path.join(BRAND, "hero-range.png"))
    out.save(os.path.join(BRAND, "hero-range.webp"), "WEBP", quality=90, method=6)
    print("hero-range", out.size)


main()
