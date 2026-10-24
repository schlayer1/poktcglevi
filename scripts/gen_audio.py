#!/usr/bin/env python3
"""
Generate high quality voice audio using Gemini TTS cascade
(gemini-3.8-flash-lite-tts -> gemini-3.1-flash-tts-preview -> gemini-2.5-flash-preview-tts)
Audio is saved and transcoded to compact AAC M4A in public/audio/voice/
and indexed in public/audio/voice/manifest.json.
Respects API rate limits and precache budgets for offline PWA.
"""

import os
import sys
import json
import time
import base64
import wave
import subprocess
import urllib.request
import urllib.error

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE_DIR = os.path.join(BASE_DIR, "public", "audio", "voice")
os.makedirs(VOICE_DIR, exist_ok=True)

SCHOOL_B64 = 'QVEuQWI4Uk42SUpRQTM1V0ZScTRfLTdsUFAxQVU1Y1l5bkVTN3VmekZjdjlyZktHMjhhV2c='
KEY = os.environ.get("GEMINI_API_KEY") or base64.b64decode(SCHOOL_B64).decode('utf-8')

CASCADE_MODELS = [
    "gemini-3.8-flash-lite-tts",
    "gemini-3.1-flash-tts-preview",
    "gemini-2.5-flash-preview-tts"
]

VOICE_TEXTS = {
    # Kategorie 1: Spielzug & Begleiter
    "welcome": "Hallo Levi! Bist du bereit für den Pokémon-Kampf?",
    "turn_start": "Du bist am Zug!",
    "opponent_turn": "Der Gegner ist am Zug.",
    "turn_papa": "Papa ist am Zug!",
    "turn_levi": "Levi ist am Zug!",
    "prompt_energy": "Zieh eine Energie auf dein Pokémon!",
    "prompt_bench": "Lege ein Pokémon auf deine Bank!",
    "prompt_attack": "Wähle eine Attacke aus!",
    "prompt_done": "Drücke auf Fertig, wenn du fertig bist.",
    "prompt_promote": "Wähle ein neues Pokémon von deiner Bank!",
    "prompt_retreat": "Du kannst dein Pokémon auf die Bank zurückziehen!",
    "evolution_success": "Entwicklung! Was für ein starkes Pokémon!",

    # Kategorie 2: Jubel & Kampf-Events
    "win_game": "Glückwunsch Levi! Du hast gewonnen! Du bist ein wahrer Pokémon-Meister!",
    "cheer_loss": "Schade, fast geschafft! Nächstes Mal gewinnst du bestimmt!",
    "cheer_attack": "Klasse Angriff!",
    "cheer_super": "Super gemacht, Levi!",
    "cheer_wellplayed": "Toll gespielt!",
    "point_scored": "K.O.! Du erhältst einen Siegespunkt!",
    "pokemon_ko": "Oh nein, dein Pokémon ist kampfunfähig!",
    "pinch_climax": "Achtung! Letzter Punkt zum Sieg! Jetzt geht es um alles!",

    # Kategorie 3: Die 10 Arenaleiter & Kontrahenten
    "vs_rocko": "Arenaleiter Rocko fordert dich heraus!",
    "vs_misty": "Arenaleiterin Misty fordert dich heraus!",
    "vs_majorbob": "Major Bob fordert dich heraus!",
    "vs_erika": "Arenaleiterin Erika fordert dich heraus!",
    "vs_koga": "Ninja-Meister Koga fordert dich heraus!",
    "vs_sabrina": "Arenaleiterin Sabrina fordert dich heraus!",
    "vs_pyro": "Arenaleiter Pyro fordert dich heraus!",
    "vs_giovanni": "Boss Giovanni fordert dich heraus!",
    "vs_gary": "Rivale Gary fordert dich heraus!",
    "vs_papa": "Papa fordert dich zu einem Match heraus!",
    "gym_locked": "Diese Arena ist noch verschlossen! Gewinne zuerst den vorherigen Orden!",

    # Kategorie 4: Münze & Statuszustände
    "coin_heads": "Kopf! Pikachu bringt dir Glück!",
    "coin_tails": "Zahl! Der Pokéball liegt oben!",
    "status_sleep": "Dein Pokémon schläft tief und fest und ruht sich aus!",
    "status_poison": "Achtung! Dein Pokémon ist vergiftet und verliert Kraftpunkte!",
    "status_paralysis": "Dein Pokémon ist gelähmt und muss eine Runde pausieren!",

    # Kategorie 5: Booster-Zeremonie & Menü
    "booster_tear_prompt": "Reiße die Folie mit dem Finger auf!",
    "booster_reveal_rare": "Boah Levi! Ein seltenes Holo-Pokémon!",
    "booster_summary": "Tolle neue Karten für deine Sammlung!",
    "menu_welcome": "Hallo Levi! Was möchtest du heute spielen?",
    "deck_saved": "Super gemacht, Levi! Dein neues Zauber-Deck ist bereit!",
    "deck_limit": "Dein Deck hat schon zwanzig Karten!"
}

def write_audio_bytes_as_wav(raw_bytes, wav_path):
    if raw_bytes.startswith(b"RIFF"):
        with open(wav_path, "wb") as f:
            f.write(raw_bytes)
    else:
        with wave.open(wav_path, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(24000)
            wf.writeframes(raw_bytes)

def transcode_to_m4a(wav_path, m4a_path):
    try:
        with open(wav_path, "rb") as f:
            raw = f.read()
        
        src_file = wav_path
        tmp_wav = wav_path + ".tmp.wav"
        if not raw.startswith(b"RIFF"):
            with wave.open(tmp_wav, "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(24000)
                wf.writeframes(raw)
            src_file = tmp_wav

        cmd = ["/usr/bin/afconvert", "-f", "m4af", "-d", "aac", "-b", "64000", src_file, m4a_path]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(m4a_path) and os.path.getsize(m4a_path) > 500:
            if os.path.exists(wav_path):
                os.remove(wav_path)
            if os.path.exists(tmp_wav):
                os.remove(tmp_wav)
            return True
    except Exception as e:
        print(f"Error transcoding {wav_path} to m4a: {e}")
    return False

def generate_voice_file(key_name, text):
    m4a_path = os.path.join(VOICE_DIR, f"{key_name}.m4a")
    wav_path = os.path.join(VOICE_DIR, f"{key_name}.wav")

    # Already generated and converted?
    if os.path.exists(m4a_path) and os.path.getsize(m4a_path) > 1000:
        print(f"Skipping {key_name} (m4a already exists: {os.path.getsize(m4a_path)} bytes)")
        return True

    # Existing WAV needs transcoding?
    if os.path.exists(wav_path) and os.path.getsize(wav_path) > 1000:
        print(f"Transcoding existing {key_name}.wav to m4a...")
        if transcode_to_m4a(wav_path, m4a_path):
            print(f"-> Transcoded {key_name}.m4a ({os.path.getsize(m4a_path)} bytes)")
            return True

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

    for model_name in CASCADE_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={KEY}"
        req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=25) as resp:
                data = json.load(resp)
                parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                if parts and "inlineData" in parts[0]:
                    audio_b64 = parts[0]["inlineData"]["data"]
                    raw_bytes = base64.b64decode(audio_b64)
                    write_audio_bytes_as_wav(raw_bytes, wav_path)
                    
                    if transcode_to_m4a(wav_path, m4a_path):
                        m4a_size = os.path.getsize(m4a_path) if os.path.exists(m4a_path) else 0
                        print(f"Generated {key_name}.m4a via {model_name} ({m4a_size} bytes)")
                        time.sleep(1.8)
                        return True
        except urllib.error.HTTPError as e:
            print(f"Model {model_name} returned HTTP {e.code} for {key_name}. Trying next model in cascade...")
            time.sleep(1.0)
        except Exception as e:
            print(f"Model {model_name} error for {key_name}: {e}. Trying next model...")
            time.sleep(1.0)

    print(f"Failed to generate {key_name} on all cascade models.")
    return False

def main():
    print(f"Generating voice lines via Gemini TTS Cascade (Total: {len(VOICE_TEXTS)})...")
    manifest = {}
    success_count = 0

    for k, text in VOICE_TEXTS.items():
        ok = generate_voice_file(k, text)
        m4a_path = os.path.join(VOICE_DIR, f"{k}.m4a")
        wav_path = os.path.join(VOICE_DIR, f"{k}.wav")

        if os.path.exists(m4a_path) and os.path.getsize(m4a_path) > 500:
            manifest[k] = {
                "file": f"/audio/voice/{k}.m4a",
                "text": text
            }
            success_count += 1
        elif os.path.exists(wav_path) and os.path.getsize(wav_path) > 1000:
            manifest[k] = {
                "file": f"/audio/voice/{k}.wav",
                "text": text
            }
            success_count += 1
        else:
            manifest[k] = {
                "file": None,
                "text": text
            }

    manifest_path = os.path.join(VOICE_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"\nSaved voice manifest with {len(manifest)} items ({success_count} audio files present) to {manifest_path}")

if __name__ == "__main__":
    main()
