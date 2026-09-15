#!/usr/bin/env python3
"""Generate or verify the repository-owned 1200x630 Open Graph image."""

import argparse
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFilter, ImageFont
except ModuleNotFoundError as error:
    if error.name != "PIL":
        raise
    raise SystemExit(
        "Pillow is required to generate the OGP image. "
        "Install it in a virtual environment with: "
        "python3 -m venv .venv-ogp && "
        ".venv-ogp/bin/python -m pip install --disable-pip-version-check "
        "--no-deps --require-hashes -r tools/requirements-ogp.txt"
    ) from error


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "ogp.png"
APPS = [
    ("PayCycle", ROOT / "public" / "apps" / "pay-cycle" / "icon.png", "round-lg"),
    ("SubLog", ROOT / "public" / "apps" / "sublog" / "icon.png", "round-rect"),
    ("CafLog", ROOT / "public" / "apps" / "caflog" / "icon.png", "circle"),
    ("Dev-Tools", ROOT / "public" / "apps" / "dev-tools" / "icon.png", "squircle"),
]
MAX_OGP_APPS = 6
CANVAS = (1200, 630)
PAPER = (255, 248, 241, 255)
INK2 = (63, 59, 54, 255)
ACCENT = (0, 102, 238, 255)
VINYL = (255, 255, 255, 255)
PAD = 11
SHADOW_OFFSET = (4, 7)


def font(size: int) -> ImageFont.FreeTypeFont:
    # Pillow に同梱されたフォントを使い、OS のフォント差分を生成物へ持ち込まない。
    return ImageFont.load_default(size=size)


def _radii(size: int, shape: str) -> tuple[int, int]:
    vinyl_size = size + PAD * 2
    if shape == "circle":
        return vinyl_size // 2, size // 2
    if shape == "squircle":
        return max(10, vinyl_size // 7), max(6, size // 8)
    if shape == "round-lg":
        return max(16, vinyl_size // 4), max(12, size // 5)
    return max(14, vinyl_size // 5), max(10, size // 6)


def rounded_icon(path: Path, size: int, radius: int) -> Image.Image:
    image = Image.open(path).convert("RGBA").resize((size, size), Image.Resampling.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    image.putalpha(mask)
    return image


def vinyl_sticker(path: Path, size: int, shape: str) -> Image.Image:
    pad_radius, icon_radius = _radii(size, shape)
    vinyl_size = size + PAD * 2
    vinyl = Image.new("RGBA", (vinyl_size, vinyl_size), (0, 0, 0, 0))
    ImageDraw.Draw(vinyl).rounded_rectangle(
        (0, 0, vinyl_size - 1, vinyl_size - 1),
        radius=pad_radius,
        fill=VINYL,
    )
    vinyl.alpha_composite(rounded_icon(path, size, icon_radius), (PAD, PAD))
    return vinyl


def icon_layout(count: int) -> list[tuple[int, int, int]]:
    """Scatter vinyl top-left origins inside the 1200×630 cream canvas."""
    if count < 1 or count > MAX_OGP_APPS:
        raise ValueError(f"OGP supports 1-{MAX_OGP_APPS} app icons; received {count}")
    # Slight offsets, not a glass-panel grid. Names stay off the vinyl.
    presets = [
        (928, 428, 132),
        (792, 64, 148),
        (1010, 214, 102),
        (686, 304, 118),
        (72, 430, 96),
        (540, 470, 88),
    ]
    positions = presets[:count]
    width, height = CANVAS
    for x, y, size in positions:
        vinyl_size = size + PAD * 2
        right = x + vinyl_size + SHADOW_OFFSET[0] + 8
        bottom = y + vinyl_size + SHADOW_OFFSET[1] + 8
        if x < 0 or y < 0 or right > width or bottom > height:
            raise ValueError("OGP icon layout escaped the canvas")
    return positions


def render() -> Image.Image:
    width, height = CANVAS
    image = Image.new("RGBA", (width, height), PAPER)
    draw = ImageDraw.Draw(image)
    draw.text((88, 96), "AppLibrary", font=font(72), fill=ACCENT)
    draw.text((92, 190), "Small apps, on the desk.", font=font(28), fill=INK2)

    for (_name, path, shape), (icon_x, icon_y, icon_size) in zip(APPS, icon_layout(len(APPS)), strict=True):
        sticker = vinyl_sticker(path, icon_size, shape)
        shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
        alpha = sticker.getchannel("A")
        sx, sy = icon_x + SHADOW_OFFSET[0], icon_y + SHADOW_OFFSET[1]
        shadow.paste((20, 19, 16, 70), (sx, sy, sx + sticker.width, sy + sticker.height), alpha)
        image = Image.alpha_composite(image, shadow.filter(ImageFilter.GaussianBlur(10)))
        image.alpha_composite(sticker, (icon_x, icon_y))

    return image.convert("RGB")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="fail when public/ogp.png is out of date")
    args = parser.parse_args()
    generated = render()

    if args.check:
        if not OUTPUT.is_file():
            print(f"Missing generated OGP image: {OUTPUT}")
            return 1
        with Image.open(OUTPUT) as existing:
            existing_rgb = existing.convert("RGB")
            if existing_rgb.size != generated.size or existing_rgb.tobytes() != generated.tobytes():
                print("public/ogp.png is stale; run npm run generate:ogp")
                return 1
        print("OGP image synchronized")
        return 0

    generated.save(OUTPUT, format="PNG", optimize=False)
    print(f"Generated {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
