"""
Generates the app icons (favicon / icon / apple-icon) from the brand monogram.

Not part of the app build - run it by hand when the logo changes.
Requires Python 3 with Pillow.

    python scripts/generate-brand-icons.py

Source (the brand icon, transparent background):
    public/brand/monogram-transparent.png

Output (Next.js file conventions, see app/layout.tsx):
    app/favicon.ico     multi-size ICO (16/32/48), served as /favicon.ico
    app/icon.png        512x512 PNG, transparent background
    app/apple-icon.png  180x180 PNG on cream, opaque (iOS renders transparency black)

The whole monogram is kept: cropping to the "DS" letters alone leaves a stub of
the gold arc and clips the tail of the S, which looks worse than the full mark.
The arc and the olive branch also keep the two brand colours (forest green and
gold) legible at tab size.
"""

import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, "public", "brand")
APP = os.path.join(ROOT, "app")

SOURCE = os.path.join(BRAND, "monogram-transparent.png")

CREAM = (243, 240, 236, 255)  # --color-cream

ICO_SIZES = (16, 32, 48)
ICON_SIZE = 512
APPLE_SIZE = 180
APPLE_MARGIN = 0.08  # keep the mark off the edges, iOS masks the icon


def load_mark():
    """The brand monogram on a transparent square canvas."""
    src = Image.open(SOURCE).convert("RGBA")
    canvas = Image.new("RGBA", (src.width, src.height), (0, 0, 0, 0))
    canvas.alpha_composite(src)
    return canvas


def fit(img, size):
    """Resizes to `size` x `size` preserving aspect ratio, on a transparent canvas."""
    scale = size / max(img.width, img.height)
    resized = img.resize(
        (max(1, round(img.width * scale)), max(1, round(img.height * scale))),
        Image.LANCZOS,
    )
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(
        resized,
        ((size - resized.width) // 2, (size - resized.height) // 2),
        resized,
    )
    return canvas


def write_ico(mark, path):
    """Writes a multi-size ICO with LANCZOS downsampling for every frame.

    `bitmap_format="bmp"` keeps the frames as 32bpp DIBs rather than PNG, which
    every icon reader understands. The alpha channel survives either way.
    """
    frames = [fit(mark, size).convert("RGBA") for size in ICO_SIZES]
    frames[-1].save(
        path,
        format="ICO",
        sizes=[(size, size) for size in ICO_SIZES],
        append_images=frames[:-1],
        bitmap_format="bmp",
    )


def main():
    mark = load_mark()
    print(f"source: {mark.width}x{mark.height} -> {os.path.relpath(SOURCE, ROOT)}")

    ico_path = os.path.join(APP, "favicon.ico")
    write_ico(mark, ico_path)
    print(f"wrote {os.path.relpath(ico_path, ROOT)} ({', '.join(f'{s}x{s}' for s in ICO_SIZES)})")

    icon_path = os.path.join(APP, "icon.png")
    fit(mark, ICON_SIZE).save(icon_path, format="PNG", optimize=True)
    print(f"wrote {os.path.relpath(icon_path, ROOT)} ({ICON_SIZE}x{ICON_SIZE})")

    apple_path = os.path.join(APP, "apple-icon.png")
    apple = Image.new("RGBA", (APPLE_SIZE, APPLE_SIZE), CREAM)
    margin = int(APPLE_SIZE * APPLE_MARGIN)
    mark = fit(load_mark(), APPLE_SIZE - margin * 2)
    apple.paste(mark, (margin, margin), mark)
    apple.convert("RGB").save(apple_path, format="PNG", optimize=True)
    print(f"wrote {os.path.relpath(apple_path, ROOT)} ({APPLE_SIZE}x{APPLE_SIZE}, cream)")


if __name__ == "__main__":
    main()
