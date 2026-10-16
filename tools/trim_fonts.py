#!/usr/bin/env python3
"""Trim the site's variable fonts to the weights and sizes the site actually uses.

    pip install fonttools brotli
    python3 tools/trim_fonts.py

The full Newsreader and Public Sans fonts cover every weight from hairline to
black. The site only uses a few weights, so this cuts each file down to the
ranges below and rewrites assets/fonts/*.woff2 in place. Inside those ranges
the letters are unchanged.

Running it again on already-trimmed files does nothing harmful. To use a weight
outside these ranges later (say, bold 700 headings in Newsreader), download the
full font from Google Fonts into assets/fonts/, widen the range here, run this
again, and update the matching font-weight in the @font-face rules at the top
of assets/css/styles.css.

Ranges:
    wght  font weight (400 regular, 500 medium, 600 semibold, 700 bold)
    opsz  optical size in px: Newsreader adjusts letter shapes for the text size,
          so this covers the smallest to largest size the serif is set at
"""

from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

FONTS = Path(__file__).resolve().parent.parent / "assets" / "fonts"

RANGES = {
    # Headings (500), large numbers (600); 16px quotes up to the 72px drop capital.
    "newsreader.woff2": {"wght": (400, 600), "opsz": (16, 72)},
    # Quotes (400) and the italic words in the home page headline (500).
    "newsreader-italic.woff2": {"wght": (400, 500), "opsz": (16, 60)},
    # Body text (400) up to the bold step numbers (700).
    "public-sans.woff2": {"wght": (400, 700)},
}


def main():
    for name, limits in RANGES.items():
        path = FONTS / name
        before = path.stat().st_size
        font = instancer.instantiateVariableFont(TTFont(path), limits, updateFontNames=False)
        font.flavor = "woff2"
        font.save(path)
        after = path.stat().st_size
        print(f"{name}: {before / 1024:.0f} KB -> {after / 1024:.0f} KB")


if __name__ == "__main__":
    main()
