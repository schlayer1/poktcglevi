#!/usr/bin/env python3
"""
Fetch Pokémon assets:
- TCGdex A1 card data (German) for 151 Kanto Pokémon
- PokeAPI official artworks (1..151)
- PokeAPI cries (1..151)
- TCGdex Pocket card scans (low/high webp)
- Pokémon Showdown trainer sprites
- 4 Beginner starter decks (Level 1: 20 Basis-Pokémon per deck)
"""

import os
import sys
import json
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "public", "data")
ART_DIR = os.path.join(BASE_DIR, "public", "images", "pokemon")
CARD_IMG_DIR = os.path.join(BASE_DIR, "public", "images", "cards")
TRAINER_DIR = os.path.join(BASE_DIR, "public", "images", "trainers")
CRIES_DIR = os.path.join(BASE_DIR, "public", "audio", "cries")

HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) PokTCGLevi/1.0"}

def download_file(url, target_path, skip_existing=True):
    if skip_existing and os.path.exists(target_path) and os.path.getsize(target_path) > 100:
        return True
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read()
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            with open(target_path, "wb") as f:
                f.write(content)
        return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return False

def fetch_json(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.load(resp)

def parse_damage(dmg_raw):
    if not dmg_raw:
        return 10
    if isinstance(dmg_raw, (int, float)):
        return int(dmg_raw)
    digits = "".join([c for c in str(dmg_raw) if c.isdigit()])
    return int(digits) if digits else 10

def main():
    print("=== 1. Fetching Card List from TCGdex (A1 + P-A) ===")
    a1_data = fetch_json("https://api.tcgdex.net/v2/de/sets/A1")
    pa_data = fetch_json("https://api.tcgdex.net/v2/de/sets/P-A")
    all_raw_cards = a1_data.get("cards", []) + pa_data.get("cards", [])
    print(f"Total cards found in sets: {len(all_raw_cards)}")

    # Fetch details for each card
    def get_details(card_meta):
        cid = card_meta["id"]
        try:
            return fetch_json(f"https://api.tcgdex.net/v2/de/cards/{cid}")
        except Exception as e:
            print(f"Error fetching card {cid}: {e}")
            return None

    print("Fetching card details in parallel...")
    with ThreadPoolExecutor(max_workers=16) as ex:
        card_details = list(ex.map(get_details, all_raw_cards))

    # Filter for Kanto (dexId 1..151)
    kanto_cards = []
    seen_ids = set()
    for c in card_details:
        if not c:
            continue
        dex = c.get("dexId")
        if not dex or len(dex) == 0:
            continue
        dex_num = dex[0]
        if 1 <= dex_num <= 151:
            cid = c["id"]
            if cid in seen_ids:
                continue
            seen_ids.add(cid)

            # Parse attacks
            clean_attacks = []
            for at in c.get("attacks", []):
                clean_attacks.append({
                    "name": at.get("name", "Tackle"),
                    "cost": at.get("cost", ["Farblos"]),
                    "damage": parse_damage(at.get("damage", 10)),
                    "effect": at.get("effect", "")
                })
            if not clean_attacks:
                clean_attacks.append({
                    "name": "Tackle",
                    "cost": ["Farblos"],
                    "damage": 10,
                    "effect": ""
                })

            is_ex = "-ex" in c.get("name", "").lower() or " ex" in c.get("name", "").lower()
            stage = c.get("stage", "Basis")
            if "Basis" in stage:
                stage_type = "Basis"
            elif "Rang 1" in stage or "Phase 1" in stage:
                stage_type = "Rang 1"
            elif "Rang 2" in stage or "Phase 2" in stage:
                stage_type = "Rang 2"
            else:
                stage_type = "Basis"

            types = c.get("types", ["Farblos"])
            hp = c.get("hp", 60)
            retreat = c.get("retreat", 1)
            weak = c.get("weaknesses", [])
            weakness = {"type": weak[0].get("type", ""), "value": weak[0].get("value", "+20")} if weak else None

            # Card image URL
            # Pocket uses format https://assets.tcgdex.net/de/tcgp/A1/001/high.webp
            local_id = c.get("localId", "001").zfill(3)
            set_id = c.get("set", {}).get("id", "A1")
            img_cdn = f"https://assets.tcgdex.net/de/tcgp/{set_id.lower()}/{local_id}/high.webp"
            if set_id == "A1":
                img_cdn = f"https://assets.tcgdex.net/de/tcgp/A1/{local_id}/high.webp"
            elif set_id == "P-A":
                img_cdn = f"https://assets.tcgdex.net/de/tcgp/P-A/{local_id}/high.webp"

            kanto_cards.append({
                "id": cid,
                "dexId": dex_num,
                "name": c.get("name", f"Pokémon #{dex_num}"),
                "types": types,
                "hp": hp,
                "stage": stage_type,
                "isEx": is_ex,
                "attacks": clean_attacks,
                "weakness": weakness,
                "retreat": retreat,
                "rarity": c.get("rarity", "Diamant"),
                "artworkUrl": f"/images/pokemon/{dex_num}.png",
                "cryUrl": f"/audio/cries/{dex_num}.ogg",
                "cardImageUrl": f"/images/cards/{cid}.webp",
                "cdnCardUrl": img_cdn
            })

    print(f"Indexed {len(kanto_cards)} Kanto cards from TCG Pocket.")

    # Save cards.json
    cards_path = os.path.join(DATA_DIR, "cards.json")
    with open(cards_path, "w", encoding="utf-8") as f:
        json.dump(kanto_cards, f, ensure_ascii=False, indent=2)
    print(f"Saved {cards_path}")

    # === 2. Download Official Artworks (1..151) ===
    print("=== 2. Downloading PokeAPI Official Artworks (1..151) ===")
    art_tasks = []
    for num in range(1, 152):
        url = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{num}.png"
        target = os.path.join(ART_DIR, f"{num}.png")
        art_tasks.append((url, target))

    with ThreadPoolExecutor(max_workers=16) as ex:
        results = list(ex.map(lambda t: download_file(t[0], t[1]), art_tasks))
    print(f"Downloaded {sum(1 for r in results if r)} artworks.")

    # === 3. Download Cries (1..151) ===
    print("=== 3. Downloading PokeAPI Pokémon Cries (1..151) ===")
    cry_tasks = []
    for num in range(1, 152):
        url = f"https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/{num}.ogg"
        target = os.path.join(CRIES_DIR, f"{num}.ogg")
        cry_tasks.append((url, target))

    with ThreadPoolExecutor(max_workers=16) as ex:
        results = list(ex.map(lambda t: download_file(t[0], t[1]), cry_tasks))
    print(f"Downloaded {sum(1 for r in results if r)} Pokémon cries.")

    # === 4. Download Pocket Card Scans ===
    print("=== 4. Downloading Pocket Card Scans ===")
    card_img_tasks = []
    for c in kanto_cards:
        url = c["cdnCardUrl"]
        target = os.path.join(CARD_IMG_DIR, f"{c['id']}.webp")
        card_img_tasks.append((url, target))

    with ThreadPoolExecutor(max_workers=16) as ex:
        results = list(ex.map(lambda t: download_file(t[0], t[1]), card_img_tasks))
    print(f"Downloaded {sum(1 for r in results if r)} card scans.")

    # === 5. Download Showdown Trainer Sprites ===
    print("=== 5. Downloading Trainer Sprites ===")
    trainers = {
        "levi": "red",
        "papa": "blue",
        "rocko": "brock",
        "misty": "misty",
        "majorbob": "ltsurge",
        "erika": "erika",
        "koga": "koga",
        "sabrina": "sabrina",
        "pyro": "blaine",
        "giovanni": "giovanni",
        "gary": "blue"
    }
    trainer_tasks = []
    for name, sprite in trainers.items():
        url = f"https://play.pokemonshowdown.com/sprites/trainers/{sprite}.png"
        target = os.path.join(TRAINER_DIR, f"{name}.png")
        trainer_tasks.append((url, target))

    with ThreadPoolExecutor(max_workers=8) as ex:
        results = list(ex.map(lambda t: download_file(t[0], t[1]), trainer_tasks))
    print(f"Downloaded {sum(1 for r in results if r)} trainer sprites.")

    # === 6. Generate 4 Starter Decks for Level 1 ===
    # Each deck has 20 Basis Pokémon
    print("=== 6. Generating Beginner Level 1 Starter Decks ===")
    basis_cards = [c for c in kanto_cards if c["stage"] == "Basis"]
    print(f"Total Basis cards available: {len(basis_cards)}")

    def build_deck(theme_type, ace_name, support_types):
        deck_cards = []
        # Find ace card
        ace = next((c for c in basis_cards if c["name"].startswith(ace_name) and not c["isEx"]), None)
        if ace:
            deck_cards.extend([ace["id"], ace["id"]]) # 2x Ace

        # Find themed Basis cards
        type_candidates = [c for c in basis_cards if any(t in c["types"] for t in [theme_type] + support_types) and c["id"] != (ace["id"] if ace else "")]
        for c in type_candidates:
            if len(deck_cards) < 20:
                deck_cards.append(c["id"])
            if len(deck_cards) < 20:
                deck_cards.append(c["id"])

        # Fill with Farblos if needed
        colorless = [c for c in basis_cards if "Farblos" in c["types"]]
        for c in colorless:
            while len(deck_cards) < 20:
                deck_cards.append(c["id"])

        return deck_cards[:20]

    decks = [
        {
            "id": "deck_feuer",
            "name": "Flammen-Deck",
            "trainer": "levi",
            "type": "Feuer",
            "aceName": "Glumanda",
            "coverCardId": next((c["id"] for c in basis_cards if c["name"] == "Glumanda"), basis_cards[0]["id"]),
            "cards": build_deck("Feuer", "Glumanda", ["Farblos"])
        },
        {
            "id": "deck_wasser",
            "name": "Wasser-Deck",
            "trainer": "misty",
            "type": "Wasser",
            "aceName": "Schiggy",
            "coverCardId": next((c["id"] for c in basis_cards if c["name"] == "Schiggy"), basis_cards[0]["id"]),
            "cards": build_deck("Wasser", "Schiggy", ["Farblos"])
        },
        {
            "id": "deck_pflanze",
            "name": "Pflanzen-Deck",
            "trainer": "erika",
            "type": "Pflanze",
            "aceName": "Bisasam",
            "coverCardId": next((c["id"] for c in basis_cards if c["name"] == "Bisasam"), basis_cards[0]["id"]),
            "cards": build_deck("Pflanze", "Bisasam", ["Farblos"])
        },
        {
            "id": "deck_elektro",
            "name": "Blitz-Deck",
            "trainer": "majorbob",
            "type": "Elektro",
            "aceName": "Pikachu",
            "coverCardId": next((c["id"] for c in basis_cards if c["name"] == "Pikachu"), basis_cards[0]["id"]),
            "cards": build_deck("Elektro", "Pikachu", ["Farblos"])
        }
    ]

    decks_path = os.path.join(DATA_DIR, "decks.json")
    with open(decks_path, "w", encoding="utf-8") as f:
        json.dump(decks, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(decks)} decks to {decks_path}")
    print("Done fetching all assets successfully!")

if __name__ == "__main__":
    main()
