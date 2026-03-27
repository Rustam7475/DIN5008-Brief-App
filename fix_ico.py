from PIL import Image
import io, struct, os

ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
img = Image.open(os.path.join(ASSETS, "icon.png")).convert("RGBA")

sizes = [16, 24, 32, 48, 64, 128, 256]
png_data_list = []
for s in sizes:
    resized = img.resize((s, s), Image.LANCZOS)
    buf = io.BytesIO()
    resized.save(buf, format="PNG")
    png_data_list.append((s, buf.getvalue()))

num = len(png_data_list)
header = struct.pack("<HHH", 0, 1, num)

dir_size = 6 + num * 16
offset = dir_size
entries = b""
data = b""
for s, pngbytes in png_data_list:
    w = s if s < 256 else 0
    h = w
    entry = struct.pack("<BBBBHHII", w, h, 0, 0, 1, 32, len(pngbytes), offset)
    entries += entry
    data += pngbytes
    offset += len(pngbytes)

ico_path = os.path.join(ASSETS, "icon.ico")
with open(ico_path, "wb") as f:
    f.write(header + entries + data)

print(f"icon.ico saved: {os.path.getsize(ico_path)} bytes ({num} sizes: {sizes})")
