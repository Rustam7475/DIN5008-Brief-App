from PIL import Image, ImageDraw, ImageFont
import os, subprocess

SIZE = 1024
img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

def rounded_rect(d, xy, radius, fill):
    x0, y0, x1, y1 = xy
    d.rectangle([x0+radius, y0, x1-radius, y1], fill=fill)
    d.rectangle([x0, y0+radius, x1, y1-radius], fill=fill)
    d.pieslice([x0, y0, x0+2*radius, y0+2*radius], 180, 270, fill=fill)
    d.pieslice([x1-2*radius, y0, x1, y0+2*radius], 270, 360, fill=fill)
    d.pieslice([x0, y1-2*radius, x0+2*radius, y1], 90, 180, fill=fill)
    d.pieslice([x1-2*radius, y1-2*radius, x1, y1], 0, 90, fill=fill)

# Background
rounded_rect(draw, (0, 0, SIZE, SIZE), 200, (37, 99, 235, 255))

# Paper shadow
rounded_rect(draw, (275, 135, 775, 835), 16, (0, 0, 0, 38))

# Paper
rounded_rect(draw, (265, 125, 765, 825), 16, (255, 255, 255, 255))

# Letterhead bar
draw.rectangle([445, 172, 720, 180], fill=(37, 99, 235, 153))

# Return address
draw.rectangle([305, 242, 505, 246], fill=(148, 163, 184, 255))

# Address lines
for i, w in enumerate([180, 160, 140, 170]):
    y = 282 + i * 20
    draw.rectangle([305, y, 305+w, y+6], fill=(71, 85, 105, 255))

# Info block
for i, w in enumerate([160, 140, 150, 130]):
    y = 282 + i * 20
    draw.rectangle([565, y, 565+w, y+5], fill=(148, 163, 184, 255))

# Fold mark 1
draw.line([(293, 422), (323, 422)], fill=(0, 0, 0, 255), width=3)

# Subject
draw.rectangle([315, 450, 615, 458], fill=(30, 41, 59, 255))

# Body lines
for i, w in enumerate([400, 380, 410, 350, 390, 370]):
    y = 482 + i * 20
    draw.rectangle([315, y, 315+w, y+5], fill=(100, 116, 139, 255))

# Closing + signature
draw.rectangle([315, 612, 535, 618], fill=(71, 85, 105, 255))
draw.rectangle([315, 652, 475, 658], fill=(71, 85, 105, 255))

# Fold mark 2
draw.line([(293, 682), (323, 682)], fill=(0, 0, 0, 255), width=3)

# Footer
draw.line([(305, 762), (725, 762)], fill=(203, 213, 225, 255), width=2)
for x, w in [(305, 100), (425, 100), (545, 100), (665, 60)]:
    draw.rectangle([x, 772, x+w, 776], fill=(148, 163, 184, 255))

# DIN 5008 text
try:
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 52)
except:
    font = ImageFont.load_default()

rounded_rect(draw, (340, 870, 684, 950), 40, (255, 255, 255, 51))
bbox = draw.textbbox((0, 0), "DIN 5008", font=font)
tw = bbox[2] - bbox[0]
tx = (SIZE - tw) // 2
draw.text((tx, 880), "DIN 5008", fill=(255, 255, 255, 255), font=font)

base = "/Users/user/Desktop/Проекты AI/DIN5008-Brief-App/assets"
img.save(os.path.join(base, "icon.png"), "PNG")
print(f"icon.png saved: {os.path.getsize(os.path.join(base, 'icon.png'))} bytes")

# Create .icns for macOS
iconset = os.path.join(base, "icon.iconset")
os.makedirs(iconset, exist_ok=True)
sizes = [(16,1), (16,2), (32,1), (32,2), (128,1), (128,2), (256,1), (256,2), (512,1), (512,2)]
for sz, scale in sizes:
    actual = sz * scale
    resized = img.resize((actual, actual), Image.LANCZOS)
    if scale == 1:
        name = f"icon_{sz}x{sz}.png"
    else:
        name = f"icon_{sz}x{sz}@2x.png"
    resized.save(os.path.join(iconset, name), "PNG")

# Use iconutil to create .icns
result = subprocess.run(
    ["iconutil", "-c", "icns", iconset, "-o", os.path.join(base, "icon.icns")],
    capture_output=True, text=True
)
if result.returncode == 0:
    print(f"icon.icns created: {os.path.getsize(os.path.join(base, 'icon.icns'))} bytes")
else:
    print(f"iconutil error: {result.stderr}")

print("Done!")
