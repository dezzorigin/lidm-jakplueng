#!/usr/bin/env python3
"""Generate public/og-image.png 1200x630 for JAK PLUENG! (PIL, local only).

Design follows the product's own neo-brutalist language (tailwind.config.js):
paper #FFFEF7, black #1A1A2E, yellow #FFE135, coral #FF6B6B, mint #4ECDC4,
sky #74C0FC, lavender #C77DFF. Hard 4px borders, hard offset shadows,
Nunito-style heavy sans (DejaVu Sans Bold as local stand-in).
No gradients, no emoji, no stock imagery — a plain brutalist card.
This is a link-preview card, NOT a screenshot of the app.
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
PAPER = (255, 254, 247)   # #FFFEF7
BLACK = (26, 26, 46)      # #1A1A2E
YELLOW = (255, 225, 53)   # #FFE135
CORAL = (255, 107, 107)   # #FF6B6B
MINT = (78, 205, 196)     # #4ECDC4
SKY = (116, 192, 252)     # #74C0FC
LAVENDER = (199, 125, 255)  # #C77DFF
MUTED = (26, 26, 46)

SANS_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
MONO_B = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"

img = Image.new("RGB", (W, H), PAPER)
d = ImageDraw.Draw(img)

# diagonal hazard stripes along the top (product's own repeating-linear motif)
for x in range(-H, W + H, 48):
    d.polygon([(x, 0), (x + 24, 0), (x + 24 + 56, 56), (x + 56, 56)], fill=YELLOW)
d.rectangle([0, 56, W, 62], fill=BLACK)

# hard frame
d.rectangle([28, 28, W - 28, H - 28], outline=BLACK, width=6)

# kicker chip
f_kick = ImageFont.truetype(MONO_B, 28)
kick = "LIDM 2025  ·  MICROTEACHING PORTAL"
tw = d.textlength(kick, font=f_kick)
d.rectangle([72, 96, 72 + tw + 36, 96 + 52], fill=BLACK)
d.text((72 + 18, 96 + 11), kick, font=f_kick, fill=YELLOW)

# title
f_title = ImageFont.truetype(SANS_B, 132)
d.text((68, 168), "JAK PLUENG!", font=f_title, fill=BLACK)
# coral underline bar
d.rectangle([72, 330, 72 + 420, 344], fill=CORAL, outline=BLACK, width=3)

# subtitle
f_sub = ImageFont.truetype(SANS_B, 34)
d.text((72, 356), "Portal Microteaching Bahasa Inggris", font=f_sub, fill=BLACK)
f_sub2 = ImageFont.truetype(SANS, 30)
d.text((72, 402), "Giving & Following Instructions · Konteks Bencana Alam",
       font=f_sub2, fill=(90, 90, 110))

# disaster chips row
f_chip = ImageFont.truetype(SANS_B, 26)
chips = [("GEMPA", CORAL), ("BANJIR", SKY), ("TSUNAMI", MINT), ("SIMULATOR 3D", YELLOW)]
x, y = 72, 468
for label, bg in chips:
    tw = d.textlength(label, font=f_chip)
    d.rectangle([x, y, x + tw + 40, y + 54], fill=bg, outline=BLACK, width=4)
    d.text((x + 20, y + 12), label, font=f_chip, fill=BLACK)
    x += tw + 40 + 18

# footer
f_meta = ImageFont.truetype(MONO_B, 26)
d.text((72, 556), "LIDM-JAKPLUENG.PAGES.DEV", font=f_meta, fill=MUTED)

# corner stamp: compass square, bottom-right
sx, sy, ss = 1020, 452, 108
d.rectangle([sx + 8, sy + 8, sx + ss + 8, sy + ss + 8], fill=BLACK)
d.rectangle([sx, sy, sx + ss, sy + ss], fill=YELLOW, outline=BLACK, width=5)
d.polygon([(sx + 54, sy + 14), (sx + 66, sy + 54), (sx + 54, sy + 94), (sx + 42, sy + 54)],
          fill=CORAL, outline=BLACK)
d.ellipse([sx + 46, sy + 46, sx + 62, sy + 62], fill=BLACK)

img.save("public/og-image.png")
print("saved public/og-image.png")
