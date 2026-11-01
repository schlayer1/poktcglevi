import os, sys, urllib.request, subprocess
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

POKE_DIR = 'public/images/pokemon'
CRIES_DIR = 'public/audio/cries'
os.makedirs(POKE_DIR, exist_ok=True)
os.makedirs(CRIES_DIR, exist_ok=True)

def process_pokemon(dex_id):
    # 1. Artwork
    webp_path = f"{POKE_DIR}/{dex_id}.webp"
    if not os.path.exists(webp_path):
        tmp_png = f"/tmp/poke_{dex_id}.png"
        art_url = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{dex_id}.png"
        try:
            urllib.request.urlretrieve(art_url, tmp_png)
            im = Image.open(tmp_png).convert('RGBA')
            im.thumbnail((475, 475), Image.Resampling.LANCZOS)
            im.save(webp_path, 'WEBP', quality=90)
            if os.path.exists(tmp_png):
                os.remove(tmp_png)
        except Exception as e:
            print(f"Error fetching artwork for {dex_id}: {e}")

    # 2. Cry
    m4a_path = f"{CRIES_DIR}/{dex_id}.m4a"
    if not os.path.exists(m4a_path):
        tmp_ogg = f"/tmp/cry_{dex_id}.ogg"
        cry_url = f"https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/{dex_id}.ogg"
        try:
            urllib.request.urlretrieve(cry_url, tmp_ogg)
            res = subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', tmp_ogg, m4a_path], capture_output=True)
            if res.returncode != 0:
                print(f"afconvert error for {dex_id}: {res.stderr.decode()}")
            if os.path.exists(tmp_ogg):
                os.remove(tmp_ogg)
        except Exception as e:
            print(f"Error fetching cry for {dex_id}: {e}")

    return dex_id

ids_to_process = [i for i in range(152, 252) if not (os.path.exists(f"{POKE_DIR}/{i}.webp") and os.path.exists(f"{CRIES_DIR}/{i}.m4a"))]
print(f"Processing {len(ids_to_process)} Gen 2 Pokemon assets...")

with ThreadPoolExecutor(max_workers=8) as executor:
    results = list(executor.map(process_pokemon, ids_to_process))

print(f"Successfully processed {len(results)} Pokemon assets.")
