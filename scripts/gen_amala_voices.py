import asyncio
import json
import os
import subprocess
import time
import edge_tts

VOICE = "de-DE-AmalaNeural"
MANIFEST_PATH = "public/audio/voice/manifest.json"
CARDS_JSON = "public/data/cards.json"
VOICE_DIR = "public/audio/voice"
CARDS_DIR = "public/audio/voice/cards"

os.makedirs(VOICE_DIR, exist_ok=True)
os.makedirs(CARDS_DIR, exist_ok=True)

# 25 recently added general cues
RECENT_25_KEYS = {
    "rule_welcome": "Willkommen bei den Pokémon-Karten, Levi! Hier lernst du ganz leicht, wie du kämpfst und gewinnst!",
    "rule_goal": "Ziel des Spiels: Besiege drei gegnerische Pokémon, um drei Siegespunkte zu sammeln und den Kampf zu gewinnen!",
    "rule_energy": "1. Energie anlegen: Jede Runde bekommst du eine neue Energie. Ziehe sie einfach auf dein aktives Pokémon oder auf die Bank!",
    "rule_bench": "2. Deine Bank: Bis zu drei Basis-Pokémon können sich auf deiner Bank ausruhen, während dein aktives Pokémon kämpft.",
    "rule_evolve": "3. Entwicklung: Lege ein passendes Entwicklungs-Pokémon auf dein Basis-Pokémon, um es viel stärker zu machen!",
    "rule_attack": "4. Angreifen: Hat dein Pokémon genug Energie? Dann tippe auf die Attacke, um dem Gegner Schaden zuzufügen!",
    "rule_ko": "5. K.O. und Punkte: Wenn die Kraftpunkte des Gegners auf Null sinken, ist das Pokémon besiegt und du bekommst einen Punkt!",
    "rule_status": "6. Status-Effekte: Schlaf lässt dein Pokémon ausruhen, Gift zieht jede Runde Kraftpunkte ab, und Paralyse lässt es pausieren.",
    "card_detail_intro": "Hier siehst du alle Werte und Attacken deines Pokémon! Wische mit dem Finger für dreidimensionalen Glanz!",
    "album_locked": "Dieses Pokémon hast du noch nicht entdeckt! Öffne Booster-Packs, um es zu finden!",
    "album_card_owned": "Tolle Karte für deine Sammlung!",
    "booster_card_reveal": "Ein tolles neues Pokémon für dich!",
    "deck_max_copies": "Du darfst höchstens zwei gleiche Karten in deinem Deck haben!",
    "deck_no_more_copies": "Du hast keine weiteren Kopien dieser Karte!",
    "prompt_attack_confirm": "Tippe noch einmal auf die Attacke zum Angreifen!",
    "deck_info": "Das ist dein Kartenstapel! In jeder Runde ziehst du hier eine neue Karte!",
    "prompt_evolve": "Entwicklung bereit! Ziehe die Karte auf dein Pokémon!",
    "card_glurak": "Glurak! Das legendäre Feuer-Pokémon mit gewaltigen Flammenflügeln!",
    "card_pikachu": "Pikachu! Voller Elektro-Power und blitzschnellen Donner-Attacken!",
    "card_turtok": "Turtok! Das gigantische Wasser-Pokémon mit zwei mächtigen Wasserkanonen!",
    "card_bisaflor": "Bisaflor! Das uralte Pflanzen-Pokémon mit einer riesigen Blüte auf dem Rücken!",
    "card_mewtu": "Mewtu! Das geheimnisvolle Psycho-Pokémon mit unendlicher geistiger Kraft!",
    "card_onix": "Onix! Die gigantische Felsenschlange von Arenaleiter Rocko!",
    "card_gengar": "Gengar! Das schaurige Schatten-Geist-Pokémon mit verblüffenden Tricks!",
    "card_eevee": "Evoli! Das fröhliche und wandlungsfähige Pokémon mit vielen Entwicklungen!"
}

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

async def generate_speech_file(text: str, out_m4a: str, key_name: str, sem: asyncio.Semaphore):
    async with sem:
        temp_mp3 = out_m4a + f".temp_{os.getpid()}_{abs(hash(key_name))}.mp3"
        for attempt in range(3):
            try:
                comm = edge_tts.Communicate(text, VOICE, rate="+3%")
                await comm.save(temp_mp3)
                
                # Transcode mp3 to 64k AAC m4a
                subprocess.run(
                    ['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '64000', temp_mp3, out_m4a],
                    check=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
                if os.path.exists(temp_mp3):
                    os.remove(temp_mp3)
                return True
            except Exception as e:
                if attempt == 2:
                    print(f"Failed to generate {key_name}: {e}")
                    if os.path.exists(temp_mp3):
                        os.remove(temp_mp3)
                    return False
                await asyncio.sleep(1)

async def main():
    print(f"Starting voice generation with Microsoft Edge-TTS voice: {VOICE}")
    start_time = time.time()
    
    sem = asyncio.Semaphore(8)

    # 1. Prepare General Lines
    tasks = []
    task_info = [] # (key, rel_path, text)
    
    for key, text in RECENT_25_KEYS.items():
        out_file = os.path.join(VOICE_DIR, f"{key}.m4a")
        rel_path = f"/audio/voice/{key}.m4a"
        tasks.append(generate_speech_file(text, out_file, key, sem))
        task_info.append((key, rel_path, text))
    
    # 2. Prepare Cards Lines
    with open(CARDS_JSON) as f:
        cards = json.load(f)
        
    for c in cards:
        clean_id = c['id'].lower().replace("-", "_")
        key = f"card_{clean_id}"
        out_file = os.path.join(CARDS_DIR, f"{clean_id}.m4a")
        rel_path = f"/audio/voice/cards/{clean_id}.m4a"
        text = format_card_voice_text(c)
        tasks.append(generate_speech_file(text, out_file, key, sem))
        task_info.append((key, rel_path, text))
        
    total_count = len(tasks)
    print(f"Queued {total_count} items (25 general cues + {len(cards)} cards). Processing concurrently...")
    
    results = await asyncio.gather(*tasks)
    success_count = sum(1 for r in results if r)
    
    print(f"Finished generating {success_count}/{total_count} items in {time.time() - start_time:.2f} seconds!")
    
    # 3. Update manifest
    manifest = {}
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH) as f:
            manifest = json.load(f)
            
    for (key, rel_path, text), success in zip(task_info, results):
        if success:
            manifest[key] = {
                "file": rel_path,
                "text": text,
                "voice": VOICE
            }
            
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        
    print(f"Updated {MANIFEST_PATH}. Total entries in manifest: {len(manifest)}")

if __name__ == "__main__":
    asyncio.run(main())
