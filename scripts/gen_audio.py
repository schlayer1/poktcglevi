#!/usr/bin/env python3
"""
Generate high quality voice audio using Gemini TTS (gemini-3.8-flash-tts)
with school key fallback. Audio is saved as WAV in public/audio/voice/
and indexed in public/audio/voice/manifest.json.
Adds delay to respect API rate limits.
"""

import os
import sys
import json
import time
import base64
import urllib.request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE_DIR = os.path.join(BASE_DIR, "public", "audio", "voice")
os.makedirs(VOICE_DIR, exist_ok=True)

SCHOOL_B64 = 'QVEuQWI4Uk42SUpRQTM1V0ZScTRfLTdsUFAxQVU1Y1l5bkVTN3VmekZjdjlyZktHMjhhV2c='
KEY = os.environ.get("GEMINI_API_KEY") or base64.b64decode(SCHOOL_B64).decode('utf-8')

VOICE_TEXTS = {
    "welcome": "Hallo Levi! Bist du bereit für den Pokémon-Kampf?",
    "turn_start": "Du bist am Zug!",
    "prompt_energy": "Zieh eine Energie auf dein Pokémon!",
    "prompt_bench": "Lege ein Pokémon auf deine Bank!",
    "prompt_attack": "Wähle eine Attacke aus!",
    "prompt_done": "Drücke auf Fertig, wenn du fertig bist.",
    "prompt_promote": "Wähle ein neues Pokémon von deiner Bank!",
    "cheer_super": "Super gemacht, Levi!",
    "cheer_attack": "Klasse Angriff!",
    "cheer_wellplayed": "Toll gespielt!",
    "point_scored": "K.O.! Du erhältst einen Punkt!",
    "pokemon_ko": "Oh nein, dein Pokémon ist K.O.!",
    "win_game": "Glückwunsch Levi! Du hast gewonnen! Du bist ein wahrer Pokémon-Meister!",
    "cheer_loss": "Schade, fast geschafft! Nächstes Mal gewinnst du bestimmt!",
    "opponent_turn": "Der Gegner ist am Zug.",
    "turn_papa": "Papa ist am Zug!",
    "turn_levi": "Levi ist am Zug!",
    "vs_rocko": "Arenaleiter Rocko fordert dich heraus!",
    "vs_misty": "Arenaleiterin Misty fordert dich heraus!",
    "vs_majorbob": "Major Bob fordert dich heraus!",
    "vs_erika": "Arenaleiterin Erika fordert dich heraus!",
    "vs_gary": "Rivale Gary fordert dich heraus!",
    "dmg_10": "10 Schaden!",
    "dmg_20": "20 Schaden!",
    "dmg_30": "30 Schaden!",
    "dmg_40": "40 Schaden!",
    "dmg_50": "50 Schaden!",
    "dmg_60": "60 Schaden!",
    "dmg_70": "70 Schaden!",
    "dmg_80": "80 Schaden!",
    "dmg_90": "90 Schaden!",
    "dmg_100": "100 Schaden!"
}

def generate_voice_file(key_name, text):
    target_path = os.path.join(VOICE_DIR, f"{key_name}.wav")
    if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
        print(f"Skipping {key_name} (already exists)")
        return True

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent?key={KEY}"
    payload = {
        "contents": [{"parts": [{"text": text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {
                        "voiceName": "Puck"
                    }
                }
            }
        }
    }
    body = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})

    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.load(resp)
                parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                if parts and "inlineData" in parts[0]:
                    audio_b64 = parts[0]["inlineData"]["data"]
                    raw_bytes = base64.b64decode(audio_b64)
                    with open(target_path, "wb") as f:
                        f.write(raw_bytes)
                    print(f"Generated {key_name}.wav ({len(raw_bytes)} bytes)")
                    time.sleep(3.5) # rate limit buffer
                    return True
        except Exception as e:
            print(f"Attempt {attempt+1} failed for {key_name}: {e}")
            time.sleep(6)
    return False

def main():
    print(f"Generating remaining voice lines via Gemini TTS...")
    manifest = {}
    for k, text in VOICE_TEXTS.items():
        ok = generate_voice_file(k, text)
        target_path = os.path.join(VOICE_DIR, f"{k}.wav")
        if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
            manifest[k] = {
                "file": f"/audio/voice/{k}.wav",
                "text": text
            }
        else:
            manifest[k] = {
                "file": None,
                "text": text
            }

    manifest_path = os.path.join(VOICE_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"Saved voice manifest with {len(manifest)} items to {manifest_path}")

if __name__ == "__main__":
    main()
