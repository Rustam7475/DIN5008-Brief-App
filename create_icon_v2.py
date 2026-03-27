from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, subprocess, struct, io

SIZE = 1024
ASSETS = os.path.dirname(os.path.abspath(__file__)) + "/assets"

# --- Helper: rounded rectangle ---
def rounded_rect(d, xy, radius, fill):
    x0, y0, x1, y1 = xy
    r = min(radius, (x1 - x0) // 2, (y1 - y0) // 2)
    d.rectangle([x0 + r, y0, x1 - r, y1], fill=fill)
    d.rectangle([x0, y0 + r, x1, y1 - r], fill=fill)
    d.pieslice([x0, y0, x0 + 2*r, y0 + 2*r], 180, 270, fill=fill)
    d.pieslice([x1 - 2*r, y0, x1, y0 + 2*r], 270, 360, fill=fill)
    d.pieslice([x0, y1 - 2*r, x0 + 2*r, y1], 90, 180, fill=fill)
    d.pieslice([x1 - 2*r, y1 - 2*r, x1, y1], 0, 90, fill=fill)

# --- Helper: gradient fill ---
def gradient_bg(size, color_top, color_bottom, radius=200):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    for y in range(size):
        t = y / size
        r = int(color_top[0] + (color_bottom[0] - color_top[0]) * t)
        g = int(color_top[1] + (color_bottom[1] - color_top[1]) * t)
        b = int(color_top[2] + (color_bottom[2] - color_top[2]) * t)
        ImageDraw.Draw(img).line([(0, y), (size - 1, y)], fill=(r, g, b, 255))
    # Apply rounded mask
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size, size], radius=radius, fill=255)
    img.putalpha(mask)
    return img

# --- Helper: create .ico with multiple sizes ---
def create_ico(source_img, ico_path):
    sizes = [16, 24, 32, 48, 64, 128, 256]
    imgs = []
    for s in sizes:
        resized = source_img.resize((s, s), Image.LANCZOS)
        imgs.append(resized)
    imgs[0].save(ico_path, format='ICO', sizes=[(s, s) for s in sizes], append_images=imgs[1:])

# ==========================================
# 1. Background — rich gradient (deep blue to indigo)
# ==========================================
img = gradient_bg(SIZE, (59, 130, 246), (49, 46, 129), radius=220)
draw = ImageDraw.Draw(img)

# Subtle decorative circle glow (top right)
glow = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse([500, -200, 1200, 500], fill=(255, 255, 255, 18))
img = Image.alpha_composite(img, glow)
draw = ImageDraw.Draw(img)

# ==========================================
# 2. Paper with shadow & slight tilt effect
# ==========================================
# Shadow layer
shadow = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
sd = ImageDraw.Draw(shadow)
rounded_rect(sd, (250, 120, 790, 810), 24, (0, 0, 0, 80))
shadow = shadow.filter(ImageFilter.GaussianBlur(radius=18))
img = Image.alpha_composite(img, shadow)
draw = ImageDraw.Draw(img)

# Paper
rounded_rect(draw, (240, 100, 780, 790), 20, (255, 255, 255, 250))

# Subtle paper inner shadow (top edge)
for i in range(6):
    alpha = int(12 - i * 2)
    draw.line([(260, 100 + i), (760, 100 + i)], fill=(0, 0, 0, max(alpha, 0)))

# ==========================================
# 3. Letter content elements
# ==========================================

# Letterhead accent bar (gradient feel)
draw.rectangle([500, 145, 740, 155], fill=(59, 130, 246, 200))
draw.rectangle([500, 155, 680, 158], fill=(59, 130, 246, 100))

# Return address (small line)
draw.rectangle([290, 212, 470, 216], fill=(148, 163, 184, 180))

# Recipient address block
for i, w in enumerate([190, 170, 150, 180]):
    y = 248 + i * 22
    draw.rectangle([290, y, 290 + w, y + 7], fill=(51, 65, 85, 220))

# Info block (right side)
for i, w in enumerate([150, 130, 140, 120, 135]):
    y = 248 + i * 22
    draw.rectangle([580, y, 580 + w, y + 5], fill=(148, 163, 184, 160))

# Fold mark
draw.line([(268, 395), (298, 395)], fill=(0, 0, 0, 80), width=2)

# Subject line (bold)
draw.rectangle([300, 425, 640, 435], fill=(30, 41, 59, 240))

# Body text lines
line_widths = [410, 390, 420, 360, 400, 380, 300, 350, 390, 280]
for i, w in enumerate(line_widths):
    y = 460 + i * 18
    alpha = 160 - i * 8
    draw.rectangle([300, y, 300 + w, y + 5], fill=(100, 116, 139, max(alpha, 80)))

# Closing
draw.rectangle([300, 655, 500, 661], fill=(51, 65, 85, 200))

# Signature squiggle
draw.arc([300, 680, 440, 720], 0, 180, fill=(51, 65, 85, 150), width=3)

# Footer line
draw.line([(290, 748), (740, 748)], fill=(203, 213, 225, 200), width=1)
for x, w in [(290, 95), (400, 95), (510, 95), (620, 75)]:
    draw.rectangle([x, 756, x + w, 760], fill=(148, 163, 184, 140))

# ==========================================
# 4. DIN 5008 badge (bottom area, prominent)
# ==========================================
# Badge background — white pill with slight shadow
badge_shadow = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
bsd = ImageDraw.Draw(badge_shadow)
rounded_rect(bsd, (282, 858, 742, 958), 50, (0, 0, 0, 60))
badge_shadow = badge_shadow.filter(ImageFilter.GaussianBlur(radius=10))
img = Image.alpha_composite(img, badge_shadow)
draw = ImageDraw.Draw(img)

# White pill
rounded_rect(draw, (280, 850, 740, 950), 50, (255, 255, 255, 240))

# Text "DIN 5008"
try:
    font_badge = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 64)
except:
    try:
        font_badge = ImageFont.truetype("/System/Library/Fonts/SFNSDisplay.ttf", 64)
    except:
        font_badge = ImageFont.load_default()

text = "DIN 5008"
bbox = draw.textbbox((0, 0), text, font=font_badge)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
tx = (SIZE - tw) // 2
ty = 850 + (100 - th) // 2 - 4
draw.text((tx, ty), text, fill=(49, 46, 129, 255), font=font_badge)

# ==========================================
# 5. Small pen/pencil accent (top-left corner)
# ==========================================
pen = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
pd = ImageDraw.Draw(pen)
# Pen body
pd.polygon([(120, 240), (160, 100), (180, 108), (140, 248)], fill=(255, 200, 60, 220))
# Pen tip
pd.polygon([(127, 252), (120, 280), (143, 258)], fill=(60, 60, 60, 200))
# Pen top
pd.polygon([(160, 100), (180, 108), (175, 85), (155, 78)], fill=(220, 80, 60, 220))
pen_rotated = pen.rotate(-15, center=(150, 180), resample=Image.BICUBIC)
img = Image.alpha_composite(img, pen_rotated)
draw = ImageDraw.Draw(img)

# ==========================================
# 6. Save all formats
# ==========================================

# PNG (1024x1024)
png_path = os.path.join(ASSETS, "icon.png")
img.save(png_path, "PNG")
print(f"icon.png saved: {os.path.getsize(png_path)} bytes")

# ICO (multi-size for Windows)
ico_path = os.path.join(ASSETS, "icon.ico")
create_ico(img, ico_path)
print(f"icon.ico saved: {os.path.getsize(ico_path)} bytes")

# ICNS (macOS) via iconutil
iconset = os.path.join(ASSETS, "icon.iconset")
os.makedirs(iconset, exist_ok=True)
sizes = [(16,1), (16,2), (32,1), (32,2), (128,1), (128,2), (256,1), (256,2), (512,1), (512,2)]
for sz, scale in sizes:
    actual = sz * scale
    resized = img.resize((actual, actual), Image.LANCZOS)
    name = f"icon_{sz}x{sz}.png" if scale == 1 else f"icon_{sz}x{sz}@2x.png"
    resized.save(os.path.join(iconset, name), "PNG")

result = subprocess.run(
    ["iconutil", "-c", "icns", iconset, "-o", os.path.join(ASSETS, "icon.icns")],
    capture_output=True, text=True
)
if result.returncode == 0:
    print(f"icon.icns saved: {os.path.getsize(os.path.join(ASSETS, 'icon.icns'))} bytes")
else:
    print(f"iconutil error: {result.stderr}")

print("\nDone! All icon formats generated.")
