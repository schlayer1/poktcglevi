/**
 * Audio and Speech Manager for Levis Pokémon Game:
 * 1. Web Audio API for responsive, zero-latency sound effects (energy, attack, card, fanfare)
 * 2. Pokémon cries from PokeAPI (/audio/cries/{dexId}.ogg)
 * 3. Pre-rendered Gemini voice clips (/audio/voice/{key}.wav)
 * 4. Automatic Web Speech API (speechSynthesis) fallback in German for unrecorded text or missing clips
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private voiceManifest: Record<string, { file: string | null; text: string }> = {};
  private muted: boolean = false;
  private volume: number = 0.9;
  private currentVoiceAudio: HTMLAudioElement | null = null;
  private speechVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.loadManifest();
    this.initSpeech();
  }

  private async loadManifest() {
    try {
      const res = await fetch('/audio/voice/manifest.json');
      if (res.ok) {
        this.voiceManifest = await res.json();
      }
    } catch {
      // Manifest not found or offline fallback
    }
  }

  private initSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Prefer German voice (e.g. Google Deutsch or friendly system voice)
        this.speechVoice =
          voices.find((v) => v.lang.startsWith('de') && (v.name.includes('Google') || v.name.includes('Natural'))) ||
          voices.find((v) => v.lang.startsWith('de')) ||
          null;
      };
      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stopVoice();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  // --- Sound Effects via Web Audio API ---
  public playSfx(type: 'card_play' | 'energy_attach' | 'attack_hit' | 'ko' | 'button' | 'victory') {
    if (this.muted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      if (type === 'button') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(this.volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'card_play') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
        gain.gain.setValueAtTime(this.volume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'energy_attach') {
        // Magical shimmering chime
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          gain.gain.setValueAtTime(this.volume * 0.15, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.25);
        });
      } else if (type === 'attack_hit') {
        // Impact punch sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);
        gain.gain.setValueAtTime(this.volume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'ko') {
        // Dramatic low boom
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
        gain.gain.setValueAtTime(this.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'victory') {
        // Celebratory triumphant fanfare
        const notes = [
          { f: 523.25, d: 0.15 },
          { f: 523.25, d: 0.15 },
          { f: 523.25, d: 0.15 },
          { f: 659.25, d: 0.35 },
          { f: 783.99, d: 0.5 }
        ];
        let offset = 0;
        notes.forEach((n) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.f, now + offset);
          gain.gain.setValueAtTime(this.volume * 0.25, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + n.d);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + n.d);
          offset += n.d * 0.85;
        });
      }
    } catch {
      // AudioContext unavailable
    }
  }

  // --- Pokémon Cry playback ---
  public playCry(dexId: number) {
    if (this.muted) return;
    try {
      const audio = new Audio(`/audio/cries/${dexId}.ogg`);
      audio.volume = this.volume * 0.6;
      audio.play().catch(() => {});
    } catch {
      // Audio play failed
    }
  }

  // --- Voice / Speech Output ---
  public stopVoice() {
    if (this.currentVoiceAudio) {
      this.currentVoiceAudio.pause();
      this.currentVoiceAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public speakText(text: string) {
    if (this.muted) return;
    this.stopVoice();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'de-DE';
      if (this.speechVoice) {
        utter.voice = this.speechVoice;
      }
      utter.rate = 0.95; // Friendly, clear pacing for child
      utter.pitch = 1.15; // Slightly cheerful, warm pitch
      utter.volume = this.volume;
      window.speechSynthesis.speak(utter);
    }
  }

  public playVoice(key: string, fallbackText?: string) {
    if (this.muted) return;
    this.stopVoice();

    const manifestEntry = this.voiceManifest[key];
    const textToSpeak = fallbackText || manifestEntry?.text || '';

    // Check if pre-rendered wav file exists
    if (manifestEntry?.file) {
      const audio = new Audio(manifestEntry.file);
      audio.volume = this.volume;
      this.currentVoiceAudio = audio;

      audio.play().catch(() => {
        // Fallback to speech synthesis if audio play fails
        if (textToSpeak) {
          this.speakText(textToSpeak);
        }
      });
      return;
    }

    // Direct speech synthesis fallback
    if (textToSpeak) {
      this.speakText(textToSpeak);
    }
  }
}

export const soundManager = new SoundManager();
