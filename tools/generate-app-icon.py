"""Generate Android launcher icons from the PMS logo mark."""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "assets" / "logo.png"
RES = ROOT / "android" / "app" / "src" / "main" / "res"
NAVY = (15, 42, 77, 255)
ACCENT = (99, 168, 255, 255)


def logo_mark() -> Image.Image:
    source = Image.open(SOURCE).convert("RGBA")
    mark = source.crop((55, 55, 295, 325))
    pixels = []
    for y in range(mark.height):
        for x in range(mark.width):
            red, green, blue, alpha = mark.getpixel((x, y))
            if alpha < 20:
                pixels.append((0, 0, 0, 0))
            elif blue > 150 and blue > red * 1.25 and blue > green * 1.08:
                pixels.append((*ACCENT[:3], alpha))
            else:
                pixels.append((255, 255, 255, alpha))
    mark.putdata(pixels)
    return mark


def contain(image: Image.Image, size: int) -> Image.Image:
    result = image.copy()
    result.thumbnail((size, size), Image.Resampling.LANCZOS)
    return result


def centered(canvas: Image.Image, image: Image.Image) -> None:
    x = (canvas.width - image.width) // 2
    y = (canvas.height - image.height) // 2
    canvas.alpha_composite(image, (x, y))


def legacy_icon(size: int, round_icon: bool) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    if round_icon:
        draw.ellipse((0, 0, size - 1, size - 1), fill=NAVY)
    else:
        radius = round(size * 0.22)
        draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=NAVY)
    centered(canvas, contain(MARK, round(size * 0.62)))
    return canvas


def adaptive_foreground(size: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    centered(canvas, contain(MARK, round(size * 0.56)))
    return canvas


MARK = logo_mark()
DENSITIES = {
    "mdpi": (48, 108),
    "hdpi": (72, 162),
    "xhdpi": (96, 216),
    "xxhdpi": (144, 324),
    "xxxhdpi": (192, 432),
}

for density, (legacy_size, adaptive_size) in DENSITIES.items():
    folder = RES / f"mipmap-{density}"
    folder.mkdir(parents=True, exist_ok=True)
    legacy_icon(legacy_size, False).save(folder / "ic_launcher.png", optimize=True)
    legacy_icon(legacy_size, True).save(folder / "ic_launcher_round.png", optimize=True)
    adaptive_foreground(adaptive_size).save(
        folder / "ic_launcher_foreground.png", optimize=True
    )

print("Generated PMS Android launcher icons.")
