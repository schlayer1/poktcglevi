import json, os, subprocess
from concurrent.futures import ThreadPoolExecutor

CARDS_JSON = "public/data/cards.json"
MANIFEST_JSON = "public/audio/voice/manifest.json"
CARDS_DIR = "public/audio/voice/cards"
NAMES_DIR = "public/audio/voice/names"
VOICE_DIR = "public/audio/voice"

os.makedirs(CARDS_DIR, exist_ok=True)
os.makedirs(NAMES_DIR, exist_ok=True)

with open(CARDS_JSON, "r", encoding="utf-8") as f:
    cards = json.load(f)

with open(MANIFEST_JSON, "r", encoding="utf-8") as f:
    manifest = json.load(f)

print(f"Loaded {len(cards)} cards and {len(manifest)} manifest entries.")

# 1. Fix string entries in manifest
fixed_count = 0
for k, v in list(manifest.items()):
    if isinstance(v, str):
        manifest[k] = {
            "file": f"/audio/voice/{k}.m4a",
            "text": v,
            "voice": "de-DE-AmalaNeural"
        }
        fixed_count += 1

print(f"Fixed {fixed_count} string entries in manifest.")

def generate_tts_m4a(text, dest_m4a, voice="de-DE-AmalaNeural", rate="+0%"):
    if os.path.exists(dest_m4a) and os.path.getsize(dest_m4a) > 500:
        return True
    
    tmp_mp3 = dest_m4a + ".tmp.mp3"
    try:
        res = subprocess.run([
            "python3", "-m", "edge_tts",
            "--voice", voice,
            "--rate", rate,
            "--text", text,
            "--write-media", tmp_mp3
        ], capture_output=True, text=True)

        if res.returncode != 0:
            print(f"edge-tts error for '{text[:30]}': {res.stderr}")
            return False

        conv = subprocess.run([
            "afconvert", "-f", "m4af", "-d", "aac", tmp_mp3, dest_m4a
        ], capture_output=True)

        if os.path.exists(tmp_mp3):
            os.remove(tmp_mp3)

        return conv.returncode == 0
    except Exception as e:
        print(f"Exception generating '{text[:30]}': {e}")
        if os.path.exists(tmp_mp3):
            os.remove(tmp_mp3)
        return False

# 2. UI Lines to generate
ui_lines = {
    "pack_desc_glurak": "Glurak-Pack! Feuer und Drachen!",
    "pack_desc_pikachu": "Pikachu-Pack! Elektro und Blitz!",
    "pack_desc_mewtu": "Mewtu-Pack! Psycho und Mystik!",
    "pack_desc_mew": "Mew-Pack! Mysteriöse Insel!",
    "pack_desc_turtok": "Turtok-Pack! Wasser und Eis!",
    "pack_desc_bisaflor": "Bisaflor-Pack! Pflanze und Natur!",
    "pack_desc_lugia": "Lugia-Pack! Sturm und Ozean!",
    "pack_desc_ho_oh": "Ho-Oh-Pack! Regenbogen und Flammen!",
    "pack_select_prompt": "Wähle deinen Booster! Hier findest du seltene Karten für deine Sammlung!",
    "memo_rules": "Poké-Memo! Finde alle passenden Pokémon-Pärchen.",
    "memo_diff_medium": "Schwierigkeit Mittel: Finde sechs Pärchen!",
    "memo_diff_hard": "Schwierigkeit Schwer: Finde acht Pärchen!",
    "memo_diff_pro": "Schwierigkeit Profi: Finde zehn Pärchen!",
    "memo_win_medium": "Klasse Gedächtnis, Levi! Du hast alle sechs Pärchen auf Mittel gefunden! Hier ist deine Belohnung!",
    "memo_win_hard": "Klasse Gedächtnis, Levi! Du hast alle acht Pärchen auf Schwer gefunden! Hier ist deine Belohnung!",
    "memo_win_pro": "Klasse Gedächtnis, Levi! Du hast alle zehn Pärchen auf Profi gefunden! Hier ist deine Belohnung!",
    "camp_quiz_desc": "Ruf- und Typen-Quiz! Erkenne Pokémon an ihren Rufen und teste dein Typen-Wissen mit Professor Eich!",
    "camp_memo_desc": "Poké-Memo! Finde passende Pärchen deiner eigenen Pokémon-Karten und trainiere dein Gedächtnis!",
    "quest_prompt_task": "Erfülle die Forschungs-Aufgabe für Professor Eich, um kostenlose Belohnungs-Booster zu erhalten!",
    "quiz_q_cry_1": "Frage eins: Zu welchem Pokémon gehört dieser Ruf? Hör genau hin!",
    "quiz_q_cry_2": "Frage zwei: Zu welchem Pokémon gehört dieser Ruf?",
    "quiz_q_weakness_1": "Frage drei: Welcher Typ ist gegen diesen Typ besonders effektiv?",
    "quiz_q_weakness_2": "Frage vier: Welcher Typ hat einen Vorteil?",
    "quiz_q_evolution_1": "Frage fünf: Zu welchem Pokémon entwickelt sich dieses Pokémon?",
    "card_a4_171": "Pichu! Das süße Elektro-Maus-Baby und die Vorentwicklung von Pikachu!"
}

# 3. Queue up all TTS tasks
tasks = []

# UI lines
for k, text in ui_lines.items():
    dest = f"{VOICE_DIR}/{k}.m4a"
    manifest[k] = {
        "file": f"/audio/voice/{k}.m4a",
        "text": text,
        "voice": "de-DE-AmalaNeural"
    }
    tasks.append((text, dest))

# Card voices
type_adj = {
    'Pflanze': 'Pflanzen',
    'Feuer': 'Feuer',
    'Wasser': 'Wasser',
    'Elektro': 'Elektro',
    'Psycho': 'Psycho',
    'Kampf': 'Kampf',
    'Finsternis': 'Finsternis',
    'Metall': 'Metall',
    'Drache': 'Drachen',
    'Farblos': 'Normal'
}

for c in cards:
    cid = c['id']
    clean_id = cid.lower().replace('-', '_')
    dest = f"{CARDS_DIR}/{clean_id}.m4a"
    
    if c.get('stage') == 'Trainer' or not c.get('types') or len(c['types']) == 0:
        eff = c.get('trainerEffect') or 'Hilft deinen Pokémon im Kampf!'
        text = f"{c['name']}! Ausrüstungskarte: {eff}"
    else:
        t_adj = type_adj.get(c['types'][0], 'Pokémon')
        atk_name = c['attacks'][0]['name'] if c.get('attacks') and len(c['attacks']) > 0 else 'Tackle'
        atk_dmg = c['attacks'][0]['damage'] if c.get('attacks') and len(c['attacks']) > 0 else 20
        text = f"{c['name']}! {t_adj}-Pokémon mit {c['hp']} Kraftpunkten. Attacke: {atk_name} mit {atk_dmg} Schaden!"
    
    manifest_key = f"card_{clean_id}"
    manifest[manifest_key] = {
        "file": f"/audio/voice/cards/{clean_id}.m4a",
        "text": text,
        "voice": "de-DE-AmalaNeural"
    }
    if not os.path.exists(dest) or os.path.getsize(dest) < 500:
        tasks.append((text, dest))

# 4. Pokemon Names (1 to 251)
dex_to_name = {}
for c in cards:
    if c.get('dexId') and c['dexId'] not in dex_to_name:
        dex_to_name[c['dexId']] = c['name']

for dex_id in range(1, 252):
    name = dex_to_name.get(dex_id)
    if name:
        dest = f"{NAMES_DIR}/{dex_id}.m4a"
        if not os.path.exists(dest) or os.path.getsize(dest) < 500:
            tasks.append((name, dest))

print(f"Total TTS tasks to process: {len(tasks)}")

def run_task(item):
    text, dest = item
    return generate_tts_m4a(text, dest)

with ThreadPoolExecutor(max_workers=8) as executor:
    results = list(executor.map(run_task, tasks))

print(f"Successfully generated {sum(1 for r in results if r)} audio files!")

# Save manifest
with open(MANIFEST_JSON, "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print(f"Successfully saved {MANIFEST_JSON} with {len(manifest)} entries.")
