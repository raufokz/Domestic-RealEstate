#!/usr/bin/env python3
"""
Generate the Open Graph share image (public/og-image.png).

    python scripts/build-og-image.py

Why this exists: the previous og-image.png contained exactly two colours —
a navy block and a gold block, no logo and no text. That is what WhatsApp,
LinkedIn and X rendered whenever anyone shared a link, so the preview looked
like a broken image rather than a brand.

The logo artwork is dark ink with gold accents, drawn for light backgrounds,
so it is composited on a light card. Putting it straight onto the brand navy
made it almost unreadable at preview size.
"""

from PIL import Image, ImageDraw, ImageFont
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "nextjs-frontend", "public")
LOGO = os.path.join(PUBLIC, "Domestic-logo.png")
OUT = os.path.join(PUBLIC, "og-image.png")

# Facebook / WhatsApp / LinkedIn / X all accept 1200x630 (1.91:1).
W, H = 1200, 630

NAVY = (10, 38, 71)
GOLD = (201, 162, 39)
WHITE = (255, 255, 255)
SLATE = (71, 85, 105)

TAGLINE = "Buy, sell and invest in property across the US & Canada"
DOMAIN = "domesticrealestate.us"


def load_font(size, bold=False):
    """Fall back through common system fonts so this runs on any machine."""
    candidates = (
        ["arialbd.ttf", "Arial Bold.ttf", "DejaVuSans-Bold.ttf", "seguisb.ttf"]
        if bold
        else ["arial.ttf", "Arial.ttf", "DejaVuSans.ttf", "segoeui.ttf"]
    )
    for name in candidates:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main():
    if not os.path.exists(LOGO):
        sys.exit("Logo not found: " + LOGO)

    canvas = Image.new("RGB", (W, H), WHITE)
    draw = ImageDraw.Draw(canvas)

    # Navy band across the top, gold hairline under it: enough brand colour to
    # be recognisable in a feed without sitting behind the logo itself.
    draw.rectangle([0, 0, W, 96], fill=NAVY)
    draw.rectangle([0, 96, W, 102], fill=GOLD)

    # Matching gold bar along the bottom edge.
    draw.rectangle([0, H - 14, W, H], fill=GOLD)

    logo = Image.open(LOGO).convert("RGBA")
    target_w = 720
    ratio = target_w / logo.width
    logo = logo.resize((target_w, max(1, int(logo.height * ratio))), Image.LANCZOS)

    logo_x = (W - logo.width) // 2
    logo_y = 150
    canvas.paste(logo, (logo_x, logo_y), logo)

    tagline_font = load_font(34)
    domain_font = load_font(28, bold=True)

    y = logo_y + logo.height + 46
    tw = draw.textlength(TAGLINE, font=tagline_font)
    draw.text(((W - tw) / 2, y), TAGLINE, font=tagline_font, fill=SLATE)

    y += 56
    dw = draw.textlength(DOMAIN, font=domain_font)
    draw.text(((W - dw) / 2, y), DOMAIN, font=domain_font, fill=NAVY)

    canvas.save(OUT, "PNG", optimize=True)

    size_kb = os.path.getsize(OUT) / 1024
    colours = canvas.getcolors(maxcolors=200000)
    print("wrote %s" % OUT)
    print("  %dx%d, %.1f KB, %s distinct colours"
          % (W, H, size_kb, len(colours) if colours else ">200k"))


if __name__ == "__main__":
    main()
