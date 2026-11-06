"""
Stitch Project Exporter for 'Outfit Court: Retro AI Stylist' (StylU)
Extracts all downloaded screens, assets, design systems, and metadata.
"""

import json
import base64
import os

STEPS_DIR = r"C:\Users\KiTE\.gemini\antigravity-ide\brain\64fa3c63-63cb-4636-a5bd-45d6be32ff77\.system_generated\steps"
TARGET_DIR = r"c:\Users\KiTE\Desktop\Stylu"
SCREENS_DIR = os.path.join(TARGET_DIR, "screens")
ASSETS_DIR = os.path.join(TARGET_DIR, "assets")

os.makedirs(SCREENS_DIR, exist_ok=True)
os.makedirs(ASSETS_DIR, exist_ok=True)

# 1. Project metadata
step_15 = os.path.join(STEPS_DIR, "15", "output.txt")
if os.path.exists(step_15):
    with open(step_15, "r", encoding="utf-8") as f:
        proj_data = json.load(f)
    for p in proj_data.get("projects", []):
        if "3741489828161269655" in p.get("name", ""):
            with open(os.path.join(TARGET_DIR, "stitch_project.json"), "w", encoding="utf-8") as out:
                json.dump(p, out, indent=2)
            print("Exported stitch_project.json")
            break

# 2. Screens
screen_map = {
    "23": ("01_lucky_wheel_studio_pro.html", True),  # Also index.html
    "29": ("02_lucky_wheel_studio.html", False),
    "31": ("03_retro_tv_studio.html", False),
    "33": ("04_sky_blue_studio.html", False),
    "35": ("05_retro_beige_studio.html", False),
    "37": ("06_retro_tv_broadcast.html", False),
}

for step_id, (filename, is_index) in screen_map.items():
    step_file = os.path.join(STEPS_DIR, step_id, "output.txt")
    if os.path.exists(step_file):
        with open(step_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        html_code = data.get("html", "")
        if html_code:
            screen_path = os.path.join(SCREENS_DIR, filename)
            with open(screen_path, "w", encoding="utf-8") as out:
                out.write(html_code)
            print(f"Exported screen: screens/{filename}")
            if is_index:
                index_path = os.path.join(TARGET_DIR, "index.html")
                with open(index_path, "w", encoding="utf-8") as out:
                    out.write(html_code)
                print("Exported index.html")

# 3. Assets
asset_map = {
    "27": "pixel_art_defendant_avatar.png",
    "39": "reference_screenshot_2026-10-23.png",
    "41": "reference_image.png"
}

for step_id, filename in asset_map.items():
    step_file = os.path.join(STEPS_DIR, step_id, "output.txt")
    if os.path.exists(step_file):
        with open(step_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        img_b64 = data.get("image", "")
        if img_b64:
            img_bytes = base64.b64decode(img_b64)
            asset_path = os.path.join(ASSETS_DIR, filename)
            with open(asset_path, "wb") as out:
                out.write(img_bytes)
            print(f"Exported asset: assets/{filename}")

print("\nAll Stitch project components successfully exported!")
