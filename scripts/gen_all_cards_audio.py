import os
import json
import re
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor

CARDS_JSON = "public/data/cards.json"
MANIFEST_JSON = "public/audio/voice/manifest.json"
OUT_DIR = "public/audio/voice/cards"
os.makedirs(OUT_DIR, exist_ok=True)

TYPE_MAP = {
    'Pflanze': 'Pflanzen',
    'Feuer': 'Feuer',
    'Wasser': 'Wasser',
    'Elektro': 'Elektro',
    'Psycho': 'Psycho',
    'Kampf': 'Kampf',
    'Farblos': 'Normal',
    'Unlicht': 'Unlicht',
    'Drache': 'Drachen'
}

def clean_damage(dmg):
    if not dmg:
        return ""
    dmg_str = str(dmg).replace("+", " Plus").replace("x", " Mal ")
    return f" mit {dmg_str} Schaden"

def format_card_voice_text(c):
    if c.get('stage') == 'Trainer':
        effect = c.get('trainerEffect', '')
        return f"Trainerkarte: {c['name']}! {effect}"
    
    name = c['name']
    types = c.get('types', ['Farblos'])
    raw_type = types[0] if types else 'Farblos'
    type_adj = TYPE_MAP.get(raw_type, raw_type)
    hp = c.get('hp', 50)
    is_ex = c.get('isEx', False)
    stage = c.get('stage', 'Basis')
    
    if is_ex:
        intro = f"{name}! Legendäres {type_adj}-Pokémon mit {hp} Kraftpunkten."
    elif stage == 'Rang 2':
        intro = f"{name}! Starkes Phase-Zwei {type_adj}-Pokémon mit {hp} Kraftpunkten."
    elif stage == 'Rang 1':
        intro = f"{name}! Phase-Eins {type_adj}-Pokémon mit {hp} Kraftpunkten."
    else:
        intro = f"{name}! {type_adj}-Pokémon mit {hp} Kraftpunkten."
    
    attacks = c.get('attacks', [])
    if not attacks:
        return intro
    elif len(attacks) == 1:
        atk = attacks[0]
        dmg_str = clean_damage(atk.get('damage', 0))
        return f"{intro} Attacke: {atk['name']}{dmg_str}!"
    else:
        atk_strs = []
        for a in attacks:
            dmg_str = clean_damage(a.get('damage', 0))
            atk_strs.append(f"{a['name']}{dmg_str}")
        return f"{intro} Attacken: {' und '.join(atk_strs)}!"

def generate_line(item):
    card_id, text = item
    clean_id = card_id.lower().replace("-", "_")
    final_m4a = os.path.join(OUT_DIR, f"{clean_id}.m4a")
    temp_aiff = f"/tmp/card_{clean_id}.aiff"
    
    # If already generated and valid size, skip
    if os.path.exists(final_m4a) and os.path.getsize(final_m4a) > 5000:
        return card_id, final_m4a, text
    
    try:
        # Generate with Apple Neural Voice Anna (Premium)
        subprocess.run(['say', '-v', 'Anna (Premium)', '-r', '175', '-o', temp_aiff, text], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        # Transcode to 64kbps AAC m4a
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '64000', temp_aiff, final_m4a], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(temp_aiff):
            os.remove(temp_aiff)
        return card_id, final_m4a, text
    except Exception as e:
        print(f"Error generating {card_id}: {e}")
        return card_id, None, text

def main():
    with open(CARDS_JSON) as f:
        cards = json.load(f)
    
    print(f"Loaded {len(cards)} cards from {CARDS_JSON}")
    
    items_to_gen = []
    for c in cards:
        c_id = c['id']
        text = format_card_voice_text(c)
        items_to_gen.append((c_id, text))
    
    print(f"Starting parallel generation of {len(items_to_gen)} card audio files with 8 threads...")
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=8) as ex:
        results = list(ex.map(generate_line, items_to_gen))
    
    elapsed = time.time() - start_time
    print(f"Finished generation in {elapsed:.2f} seconds!")
    
    # Load existing manifest
    manifest = {}
    if os.path.exists(MANIFEST_JSON):
        with open(MANIFEST_JSON) as f:
            manifest = json.load(f)
    
    success_count = 0
    for card_id, file_path, text in results:
        clean_id = card_id.lower().replace("-", "_")
        key = f"card_{clean_id}"
        if file_path and os.path.exists(file_path):
            success_count += 1
            rel_path = f"/audio/voice/cards/{clean_id}.m4a"
            manifest[key] = {
                "file": rel_path,
                "text": text
            }
    
    with open(MANIFEST_JSON, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    print(f"Updated {MANIFEST_JSON} with {success_count} card voices. Total manifest items: {len(manifest)}")

if __name__ == "__main__":
    main()
