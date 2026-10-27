import numpy as np
from PIL import Image, ImageDraw
from pathlib import Path

def generate_sample_satellite_images():
    output_dirs = [
        Path(__file__).resolve().parent / "samples",
        Path(__file__).resolve().parent.parent / "frontend" / "public" / "samples",
    ]
    for d in output_dirs:
        d.mkdir(parents=True, exist_ok=True)

    size = (256, 256)

    # 1. Lake Sample
    base1 = np.zeros((size[1], size[0], 3), dtype=np.uint8)
    base1[:, :, 0] = np.random.randint(40, 90, size)    # Red earth/vegetation
    base1[:, :, 1] = np.random.randint(90, 150, size)   # Green canopy
    base1[:, :, 2] = np.random.randint(30, 70, size)    # Soil
    pil1 = Image.fromarray(base1, mode="RGB")
    draw1 = ImageDraw.Draw(pil1)
    
    # Draw lake polygon
    lake_poly = [(40, 50), (120, 30), (210, 80), (230, 160), (180, 220), (90, 200), (30, 130)]
    draw1.polygon(lake_poly, fill=(24, 110, 195))

    # 2. River Sample
    base2 = np.zeros((size[1], size[0], 3), dtype=np.uint8)
    base2[:, :, 0] = np.random.randint(80, 130, size)  # Arid soil
    base2[:, :, 1] = np.random.randint(110, 160, size) # Shrubs
    base2[:, :, 2] = np.random.randint(50, 90, size)
    pil2 = Image.fromarray(base2, mode="RGB")
    draw2 = ImageDraw.Draw(pil2)

    # Draw meandering river
    river_poly = [
        (0, 30), (50, 60), (100, 140), (160, 120), (210, 200), (255, 230),
        (255, 255), (200, 230), (150, 150), (90, 170), (40, 90), (0, 60)
    ]
    draw2.polygon(river_poly, fill=(18, 95, 185))

    samples = [
        ("sample_lake.png", pil1),
        ("sample_river.png", pil2),
    ]

    for name, img in samples:
        for out_dir in output_dirs:
            img.save(out_dir / name, format="PNG")
            print(f"Saved: {out_dir / name}")

if __name__ == "__main__":
    generate_sample_satellite_images()
