import urllib.request, json, os, subprocess
from concurrent.futures import ThreadPoolExecutor

CARDS_JSON = "public/data/cards.json"
MANIFEST_JSON = "public/audio/voice/manifest.json"

with open(CARDS_JSON, "r", encoding="utf-8") as f:
    existing_cards = json.load(f)

existing_dex_ids = set(c["dexId"] for c in existing_cards)
print(f"Loaded {len(existing_cards)} existing cards. Existing Dex IDs count: {len(existing_dex_ids)}")

# Type mapping from PokeAPI to TCG Pocket types
TYPE_MAP = {
    'normal': 'Farblos',
    'flying': 'Farblos',
    'grass': 'Pflanze',
    'bug': 'Pflanze',
    'fire': 'Feuer',
    'water': 'Wasser',
    'ice': 'Wasser',
    'electric': 'Elektro',
    'psychic': 'Psycho',
    'ghost': 'Psycho',
    'fairy': 'Psycho',
    'fighting': 'Kampf',
    'rock': 'Kampf',
    'ground': 'Kampf',
    'poison': 'Finsternis',
    'dark': 'Finsternis',
    'steel': 'Metall',
    'dragon': 'Drache'
}

WEAKNESS_MAP = {
    'Pflanze': {'type': 'Feuer', 'value': '+20'},
    'Feuer': {'type': 'Wasser', 'value': '+20'},
    'Wasser': {'type': 'Elektro', 'value': '+20'},
    'Elektro': {'type': 'Kampf', 'value': '+20'},
    'Psycho': {'type': 'Finsternis', 'value': '+20'},
    'Kampf': {'type': 'Psycho', 'value': '+20'},
    'Finsternis': {'type': 'Pflanze', 'value': '+20'},
    'Metall': {'type': 'Feuer', 'value': '+20'},
    'Drache': {'type': 'Farblos', 'value': '+20'},
    'Farblos': {'type': 'Kampf', 'value': '+20'}
}

# Attacks pool per type for authentic TCG feel
ATTACKS_POOL = {
    'Pflanze': [
        ('Rankenhieb', 20, 1),
        ('Rasierblatt', 40, 2),
        ('Megasauger', 50, 2),
        ('Solarstrahl', 80, 3),
        ('Blättertanz', 90, 3)
    ],
    'Feuer': [
        ('Glut', 20, 1),
        ('Flammenrad', 40, 2),
        ('Feuerwirbel', 50, 2),
        ('Flammenwurf', 70, 3),
        ('Feuersturm', 100, 3)
    ],
    'Wasser': [
        ('Blubber', 20, 1),
        ('Aquaknarre', 30, 2),
        ('Kaskade', 50, 2),
        ('Surfer', 70, 3),
        ('Hydropumpe', 90, 3)
    ],
    'Elektro': [
        ('Funksprung', 20, 1),
        ('Donnerschock', 30, 2),
        ('Ladungsstoß', 50, 2),
        ('Donnerblitz', 70, 3),
        ('Donner', 100, 3)
    ],
    'Psycho': [
        ('Konfusion', 20, 1),
        ('Psystrahl', 40, 2),
        ('Spukball', 50, 2),
        ('Psychokinese', 70, 3),
        ('Traumfresser', 90, 3)
    ],
    'Kampf': [
        ('Karateschlag', 20, 1),
        ('Felswurf', 30, 2),
        ('Kreuzhieb', 50, 2),
        ('Nahkampf', 80, 3),
        ('Wuchtschlag', 90, 3)
    ],
    'Finsternis': [
        ('Biss', 20, 1),
        ('Finte', 30, 2),
        ('Knirscher', 50, 2),
        ('Finsteraura', 70, 3),
        ('Nachthieb', 80, 3)
    ],
    'Metall': [
        ('Kratzer', 20, 1),
        ('Metallklaue', 30, 2),
        ('Eisenschädel', 50, 2),
        ('Lichtkanone', 70, 3),
        ('Sternenhieb', 90, 3)
    ],
    'Drache': [
        ('Windstoß', 20, 1),
        ('Drachenwut', 40, 2),
        ('Drachenklaue', 60, 2),
        ('Drachenpuls', 80, 3),
        ('Drachenstoß', 100, 3)
    ],
    'Farblos': [
        ('Tackle', 20, 1),
        ('Ruckzuckhieb', 30, 1),
        ('Bodycheck', 40, 2),
        ('Fuchtler', 60, 2),
        ('Turbotempo', 80, 3)
    ]
}

def fetch_data(dex_id):
    try:
        url_sp = f"https://pokeapi.co/api/v2/pokemon-species/{dex_id}/"
        req_sp = urllib.request.Request(url_sp, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req_sp) as resp:
            sp = json.loads(resp.read().decode())

        url_pk = f"https://pokeapi.co/api/v2/pokemon/{dex_id}/"
        req_pk = urllib.request.Request(url_pk, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req_pk) as resp:
            pk = json.loads(resp.read().decode())

        return dex_id, sp, pk
    except Exception as e:
        print(f"Error fetching {dex_id}: {e}")
        return dex_id, None, None

print("Fetching PokeAPI metadata for Gen 2 Pokemon (#152-#251)...")
with ThreadPoolExecutor(max_workers=10) as executor:
    results = list(executor.map(fetch_data, range(152, 252)))

raw_data = {res[0]: (res[1], res[2]) for res in results if res[1] is not None}
print(f"Successfully retrieved metadata for {len(raw_data)} Pokemon.")

# Create map of en_name -> (dexId, de_name)
species_map = {}
for dex_id, (sp, pk) in raw_data.items():
    de_name = next(n['name'] for n in sp['names'] if n['language']['name'] == 'de')
    en_name = sp['name']
    species_map[en_name] = (dex_id, de_name)

# Add Gen 1 species for evolutions that evolve from Gen 1
# e.g., Crobat evolves from Golbat (42), Bellossom from Gloom (44), Politoed from Poliwhirl (61), etc.
GEN1_EVOS = {
    'golbat': (42, 'Golbat'),
    'gloom': (44, 'Duflor'),
    'poliwhirl': (61, 'Quaputzi'),
    'slowpoke': (79, 'Flegmon'),
    'onix': (95, 'Onix'),
    'chansey': (113, 'Chaneira'),
    'seadra': (117, 'Seemon'),
    'scyther': (123, 'Sichlor'),
    'eevee': (133, 'Evoli'),
    'porygon': (137, 'Porygon')
}
species_map.update(GEN1_EVOS)

new_cards = []

for dex_id in range(152, 252):
    # Check if already present in existing_cards
    existing_match = next((c for c in existing_cards if c.get('dexId') == dex_id), None)
    if existing_match:
        print(f"Dex {dex_id} ({existing_match['name']}) already in cards.json.")
        continue

    sp, pk = raw_data.get(dex_id, (None, None))
    if not sp or not pk:
        print(f"Warning: missing data for {dex_id}")
        continue

    de_name = next(n['name'] for n in sp['names'] if n['language']['name'] == 'de')
    primary_api_type = pk['types'][0]['type']['name']
    tcg_type = TYPE_MAP.get(primary_api_type, 'Farblos')

    # Evolution and stage
    evolves_from_sp = sp.get('evolves_from_species')
    stage = 'Basis'
    pre_dex_id = None
    evolves_from_de = None

    if evolves_from_sp:
        en_from = evolves_from_sp['name']
        if en_from in species_map:
            pre_dex_id, evolves_from_de = species_map[en_from]
            # Check if pre is Basis or Rang 1
            # If pre_dex_id has its own evolves_from -> this is Rang 2, else Rang 1
            if pre_dex_id in raw_data and raw_data[pre_dex_id][0].get('evolves_from_species'):
                stage = 'Rang 2'
            elif pre_dex_id in [42, 44, 61, 117]: # Golbat, Gloom, Poliwhirl, Seadra are already Stage 1 in Gen 1
                stage = 'Rang 2'
            else:
                stage = 'Rang 1'

    # Determine HP
    if stage == 'Basis':
        if dex_id in [243, 244, 245, 251]: # Legendary beasts & Celebi
            hp = 110
        elif dex_id in [214, 227]: # Skaraborn, Panzaeron (single stage powerhouses)
            hp = 90
        elif sp.get('is_baby'):
            hp = 50
        else:
            hp = 60
    elif stage == 'Rang 1':
        hp = 90
    else: # Rang 2
        hp = 130
        if dex_id == 248: # Despotar (Tyranitar)
            hp = 150

    # Attacks
    pool = ATTACKS_POOL.get(tcg_type, ATTACKS_POOL['Farblos'])
    if stage == 'Basis':
        atk1 = {
            'name': pool[0][0],
            'cost': [tcg_type],
            'damage': pool[0][1],
            'effect': ''
        }
        atk2 = {
            'name': pool[1][0],
            'cost': [tcg_type, 'Farblos'],
            'damage': pool[1][1],
            'effect': ''
        }
    elif stage == 'Rang 1':
        atk1 = {
            'name': pool[1][0],
            'cost': [tcg_type],
            'damage': pool[1][1],
            'effect': ''
        }
        atk2 = {
            'name': pool[2][0],
            'cost': [tcg_type, tcg_type, 'Farblos'],
            'damage': pool[2][1],
            'effect': ''
        }
    else: # Rang 2
        atk1 = {
            'name': pool[2][0],
            'cost': [tcg_type, 'Farblos'],
            'damage': pool[2][1],
            'effect': ''
        }
        atk2 = {
            'name': pool[4][0],
            'cost': [tcg_type, tcg_type, tcg_type],
            'damage': pool[4][1],
            'effect': ''
        }

    attacks = [atk1, atk2]

    # Retreat cost
    retreat = 1 if stage == 'Basis' else 2 if stage == 'Rang 1' else 3

    # Rarity
    rarity = 'Une Diamant' if stage == 'Basis' else 'Deux Diamants' if stage == 'Rang 1' else 'Trois Diamants'
    if dex_id in [243, 244, 245, 248, 251]:
        rarity = 'Une Etoile'

    card = {
        'id': f'J1-{dex_id}',
        'dexId': dex_id,
        'name': de_name,
        'types': [tcg_type],
        'hp': hp,
        'stage': stage,
        'isEx': False,
        'attacks': attacks,
        'weakness': WEAKNESS_MAP.get(tcg_type, {'type': 'Farblos', 'value': '+20'}),
        'retreat': retreat,
        'rarity': rarity,
        'artworkUrl': f'/images/pokemon/{dex_id}.webp',
        'cryUrl': f'/audio/cries/{dex_id}.ogg',
        'cardImageUrl': f'/images/cards/J1-{dex_id}.webp'
    }

    if pre_dex_id:
        card['preDexId'] = pre_dex_id
    if evolves_from_de:
        card['evolvesFrom'] = evolves_from_de

    new_cards.append(card)

print(f"Generated {len(new_cards)} new Gen 2 cards!")

# Merge into existing cards
all_cards_updated = existing_cards + new_cards
with open(CARDS_JSON, "w", encoding="utf-8") as f:
    json.dump(all_cards_updated, f, ensure_ascii=False, indent=2)

print(f"Successfully saved updated {CARDS_JSON} (total cards: {len(all_cards_updated)}).")
