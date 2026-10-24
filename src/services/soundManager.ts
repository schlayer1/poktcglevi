/**
 * Complete Audio Engine for Levis Pokémon Game:
 * 1. Web Audio API Chiptune/Melodic Background Music (BGM) - 100% offline, zero lag
 * 2. Web Audio API Sound Effects (Attack punches, elemental blasts, coin flip, card swoosh, KO boom)
 * 3. Pokémon cries from PokeAPI (/audio/cries/{dexId}.ogg)
 * 4. Pre-rendered Gemini voice clips (/audio/voice/{key}.wav)
 * 5. Web Speech API (speechSynthesis) fallback in German
 */

export type BgmTrack =
  | 'title'
  | 'menu'
  | 'pack_menu'
  | 'pack_open'
  | 'battle'
  | 'battle_elite'
  | 'battle_climax'
  | 'battle_papa'
  | 'battle_pinch'
  | 'victory'
  | null;

class SoundManager {
  private ctx: AudioContext | null = null;
  private voiceManifest: Record<string, { file: string | null; text: string }> = {};
  private muted: boolean = false;
  private bgmMuted: boolean = false;
  private sfxVolume: number = 0.9;
  private bgmVolume: number = 0.35;
  private currentVoiceAudio: HTMLAudioElement | null = null;
  private speechVoice: SpeechSynthesisVoice | null = null;

  // Authentic TCG Pocket Audio Elements
  private bgmAudio: HTMLAudioElement | null = null;
  private sfxAudioCache: Map<string, HTMLAudioElement> = new Map();

  // BGM scheduler state (synthesizer fallback)
  private currentTrack: BgmTrack = null;
  private bgmTimer: number | null = null;
  private bgmGainNode: GainNode | null = null;

  // Mapping to official CRIWARE ADX2 converted audio files
  private static readonly BGM_FILES: Record<string, string> = {
    title: '/audio/bgm/tcgp_title_default.m4a',
    menu: '/audio/bgm/tcgp_home_menu.m4a',
    pack_menu: '/audio/bgm/tcgp_pack_menu.m4a',
    pack_open: '/audio/bgm/tcgp_pack_opening_1.m4a',
    battle: '/audio/bgm/tcgp_battle.m4a',
    battle_elite: '/audio/bgm/tcgp_battle_elite.m4a',
    battle_climax: '/audio/bgm/tcgp_battle_climax.m4a',
    battle_papa: '/audio/bgm/tcgp_battle_papa.m4a',
    battle_pinch: '/audio/bgm/tcgp_battle_pinch.m4a',
    victory: '/audio/sfx/tcgp_victory.m4a'
  };

  private static readonly SFX_FILES: Record<string, string> = {
    pack_tear: '/audio/sfx/tcgp_pack_tear.m4a',
    card_slide: '/audio/sfx/tcgp_card_slide.m4a',
    card_flip: '/audio/sfx/tcgp_card_flip.m4a',
    rainbow_rare: '/audio/sfx/tcgp_rainbow_rare.m4a',
    victory: '/audio/sfx/tcgp_victory.m4a',
    defeat: '/audio/sfx/tcgp_defeat.m4a',
    achievement: '/audio/sfx/tcgp_gold_achievement.m4a',
    shuffle: '/audio/sfx/tcgp_shuffle.m4a',
    click: '/audio/sfx/tcgp_click.m4a',
    attack_hit: '/audio/sfx/tcgp_attack_hit.m4a',
    attack_whoosh: '/audio/sfx/tcgp_attack_whoosh.m4a',
    card_rotate: '/audio/sfx/tcgp_card_rotate.m4a',
    star_rare: '/audio/sfx/tcgp_star_rare.m4a',
    crown_rare: '/audio/sfx/tcgp_crown_rare.m4a',
    card_shine: '/audio/sfx/tcgp_card_shine.m4a',
    ok: '/audio/sfx/tcgp_ok.m4a',
    select: '/audio/sfx/tcgp_select.m4a',
    toast: '/audio/sfx/tcgp_toast.m4a',
    transition: '/audio/sfx/tcgp_transition.m4a'
  };

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
      // Offline fallback
    }
  }

  private initSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
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

  public getAudioContext(): AudioContext {
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
      this.stopBgm();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleBgmMute(): boolean {
    this.bgmMuted = !this.bgmMuted;
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmMuted || this.muted ? 0 : this.bgmVolume;
    }
    if (this.bgmGainNode && this.ctx) {
      this.bgmGainNode.gain.setValueAtTime(this.bgmMuted || this.muted ? 0 : this.bgmVolume, this.ctx.currentTime);
    }
    return this.bgmMuted;
  }

  public isBgmMuted(): boolean {
    return this.bgmMuted;
  }

  public setVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    this.bgmVolume = Math.max(0, Math.min(1, vol * 0.45));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmMuted || this.muted ? 0 : this.bgmVolume;
    }
    if (this.bgmGainNode && this.ctx && !this.bgmMuted && !this.muted) {
      this.bgmGainNode.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.sfxVolume;
  }

  // =========================================================================
  // BGM ENGINE (Authentic CRIWARE TCG Pocket Audio with Synth Fallback)
  // =========================================================================
  public playBgm(track: BgmTrack) {
    if (this.currentTrack === track) return;
    this.stopBgm();
    if (!track || this.muted) return;

    this.currentTrack = track;

    // Check if authentic audio file exists
    const audioSrc = SoundManager.BGM_FILES[track];
    if (audioSrc) {
      try {
        const audio = new Audio(audioSrc);
        audio.loop = true;
        audio.volume = this.bgmMuted ? 0 : this.bgmVolume;
        this.bgmAudio = audio;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay policy or error: fallback to synthesizer
            if (this.currentTrack === track && (!this.bgmAudio || this.bgmAudio.paused)) {
              this.playSynthesizedBgm(track);
            }
          });
        }
        return;
      } catch {
        // Fallback to synthesizer below
      }
    }

    this.playSynthesizedBgm(track);
  }

  public setBgmPinch(isPinch: boolean) {
    if (this.bgmAudio) {
      try {
        this.bgmAudio.playbackRate = isPinch ? 1.14 : 1.0;
      } catch {}
    }
  }

  public stopBgm() {
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
      } catch {}
      this.bgmAudio = null;
    }
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.bgmGainNode) {
      try {
        this.bgmGainNode.disconnect();
      } catch {}
      this.bgmGainNode = null;
    }
    this.currentTrack = null;
  }

  private playSynthesizedBgm(track: BgmTrack) {
    if (!track || this.muted || this.bgmAudio) return;
    const ctx = this.getAudioContext();

    this.bgmGainNode = ctx.createGain();
    this.bgmGainNode.gain.setValueAtTime(this.bgmMuted ? 0 : this.bgmVolume, ctx.currentTime);
    this.bgmGainNode.connect(ctx.destination);

    // Note frequencies in Hz
    const N = {
      C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0,
      REST: 0
    };

    let melody: { f: number; d: number }[] = [];
    let bass: { f: number; d: number }[] = [];
    let loopDuration = 0;

    if (track === 'title') {
      // Heroic triumphant theme in C
      melody = [
        { f: N.G4, d: 0.2 }, { f: N.C5, d: 0.3 }, { f: N.D5, d: 0.2 }, { f: N.E5, d: 0.4 },
        { f: N.C5, d: 0.2 }, { f: N.E5, d: 0.3 }, { f: N.G5, d: 0.6 },
        { f: N.F5, d: 0.2 }, { f: N.E5, d: 0.2 }, { f: N.D5, d: 0.4 }, { f: N.B4, d: 0.3 }, { f: N.C5, d: 0.6 }
      ];
      bass = [
        { f: N.C3, d: 0.4 }, { f: N.G3, d: 0.4 }, { f: N.C3, d: 0.4 }, { f: N.E3, d: 0.4 },
        { f: N.A3, d: 0.4 }, { f: N.E3, d: 0.4 }, { f: N.F3, d: 0.4 }, { f: N.G3, d: 0.4 }
      ];
    } else if (track === 'menu') {
      // Cheerful Pallet Town style walk
      melody = [
        { f: N.C5, d: 0.25 }, { f: N.E5, d: 0.25 }, { f: N.G5, d: 0.35 }, { f: N.E5, d: 0.25 },
        { f: N.A5, d: 0.3 }, { f: N.G5, d: 0.3 }, { f: N.E5, d: 0.4 },
        { f: N.F5, d: 0.25 }, { f: N.D5, d: 0.25 }, { f: N.B4, d: 0.3 }, { f: N.C5, d: 0.6 }
      ];
      bass = [
        { f: N.C3, d: 0.5 }, { f: N.G3, d: 0.5 }, { f: N.F3, d: 0.5 }, { f: N.G3, d: 0.5 }
      ];
    } else if (track === 'battle') {
      // Fast, driving Gym Leader battle theme
      melody = [
        { f: N.A4, d: 0.15 }, { f: N.A4, d: 0.15 }, { f: N.C5, d: 0.2 }, { f: N.D5, d: 0.2 },
        { f: N.E5, d: 0.3 }, { f: N.D5, d: 0.15 }, { f: N.C5, d: 0.15 }, { f: N.D5, d: 0.3 },
        { f: N.E5, d: 0.2 }, { f: N.G5, d: 0.3 }, { f: N.E5, d: 0.2 }, { f: N.A5, d: 0.5 },
        { f: N.G5, d: 0.2 }, { f: N.E5, d: 0.2 }, { f: N.D5, d: 0.2 }, { f: N.C5, d: 0.3 }
      ];
      bass = [
        { f: N.A3, d: 0.15 }, { f: N.A3, d: 0.15 }, { f: N.E3, d: 0.15 }, { f: N.A3, d: 0.15 },
        { f: N.F3, d: 0.15 }, { f: N.C3, d: 0.15 }, { f: N.G3, d: 0.15 }, { f: N.D3, d: 0.15 }
      ];
    } else if (track === 'victory') {
      melody = [
        { f: N.C5, d: 0.15 }, { f: N.E5, d: 0.15 }, { f: N.G5, d: 0.2 }, { f: N.C5, d: 0.3 },
        { f: N.G5, d: 0.2 }, { f: N.C5, d: 0.6 }
      ];
      bass = [
        { f: N.C3, d: 0.4 }, { f: N.G3, d: 0.4 }, { f: N.C3, d: 0.8 }
      ];
    }

    loopDuration = melody.reduce((acc, n) => acc + n.d, 0);

    const scheduleLoop = (startTime: number) => {
      if (!this.bgmGainNode || !this.ctx || this.currentTrack !== track) return;

      // Schedule melody
      let tMelody = startTime;
      melody.forEach((note) => {
        if (note.f > 0 && this.bgmGainNode && this.ctx) {
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          osc.type = track === 'battle' ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(note.f, tMelody);
          noteGain.gain.setValueAtTime(0.12, tMelody);
          noteGain.gain.exponentialRampToValueAtTime(0.001, tMelody + note.d * 0.9);
          osc.connect(noteGain);
          noteGain.connect(this.bgmGainNode);
          osc.start(tMelody);
          osc.stop(tMelody + note.d);
        }
        tMelody += note.d;
      });

      // Schedule bass line
      let tBass = startTime;
      while (tBass < startTime + loopDuration - 0.05) {
        for (const b of bass) {
          if (tBass >= startTime + loopDuration - 0.05) break;
          if (b.f > 0 && this.bgmGainNode && this.ctx) {
            const osc = this.ctx.createOscillator();
            const noteGain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(b.f, tBass);
            noteGain.gain.setValueAtTime(0.18, tBass);
            noteGain.gain.exponentialRampToValueAtTime(0.001, tBass + b.d * 0.9);
            osc.connect(noteGain);
            noteGain.connect(this.bgmGainNode);
            osc.start(tBass);
            osc.stop(tBass + b.d);
          }
          tBass += b.d;
        }
      }

      // Schedule next loop
      const nextLoopTime = startTime + loopDuration;
      const delayMs = Math.max(10, (nextLoopTime - this.ctx.currentTime - 0.1) * 1000);
      this.bgmTimer = window.setTimeout(() => {
        scheduleLoop(nextLoopTime);
      }, delayMs);
    };

    scheduleLoop(ctx.currentTime + 0.05);
  }

  // =========================================================================
  // SOUND EFFECTS (Authentic CRIWARE TCG Pocket SFX + Web Audio API)
  // =========================================================================
  public playSfx(
    type:
      | 'card_play'
      | 'card_hover'
      | 'energy_attach'
      | 'attack_hit'
      | 'attack_whoosh'
      | 'fire_attack'
      | 'water_attack'
      | 'electric_attack'
      | 'grass_attack'
      | 'coin_flip'
      | 'ko'
      | 'button'
      | 'victory'
      | 'pack_tear'
      | 'card_slide'
      | 'card_flip'
      | 'rainbow_rare'
      | 'defeat'
      | 'achievement'
      | 'shuffle'
      | 'click'
      | 'card_rotate'
      | 'star_rare'
      | 'crown_rare'
      | 'card_shine'
      | 'ok'
      | 'select'
      | 'toast'
      | 'transition'
  ) {
    if (this.muted) return;

    // 1. Play authentic CRIWARE audio file if mapped
    const sfxFile = SoundManager.SFX_FILES[type];
    if (sfxFile) {
      try {
        const audio = new Audio(sfxFile);
        audio.volume = this.sfxVolume;
        audio.play().catch(() => {});
      } catch {}

      // Non-combat UI / ceremony sounds are fully handled by the official audio
      if (['pack_tear', 'card_slide', 'card_flip', 'rainbow_rare', 'defeat', 'achievement', 'shuffle', 'click'].includes(type)) {
        return;
      }
    }

    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      if (type === 'button') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.07);
        gain.gain.setValueAtTime(this.sfxVolume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'card_hover') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);
        gain.gain.setValueAtTime(this.sfxVolume * 0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'coin_flip') {
        // High ping metallic coin spin
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1400 + i * 200, now + i * 0.08);
          gain.gain.setValueAtTime(this.sfxVolume * 0.18, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.12);
        }
      } else if (type === 'fire_attack') {
        // Roaring flame whoosh + impact
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);
        gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'water_attack') {
        // Splashing water fountain
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.linearRampToValueAtTime(250, now + 0.15);
        osc.frequency.linearRampToValueAtTime(600, now + 0.3);
        gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'electric_attack') {
        // Sharp electric zap
        for (let i = 0; i < 5; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(800 + Math.random() * 600, now + i * 0.05);
          gain.gain.setValueAtTime(this.sfxVolume * 0.2, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.04);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.04);
        }
      } else if (type === 'grass_attack') {
        // Whistling razor leaf
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.25);
        gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'energy_attach') {
        // Shimmering chime
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          gain.gain.setValueAtTime(this.sfxVolume * 0.15, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.25);
        });
      } else if (type === 'attack_hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);
        gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'ko') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
        gain.gain.setValueAtTime(this.sfxVolume * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'victory') {
        const notes = [
          { f: 523.25, d: 0.15 }, { f: 523.25, d: 0.15 }, { f: 523.25, d: 0.15 },
          { f: 659.25, d: 0.35 }, { f: 783.99, d: 0.5 }
        ];
        let offset = 0;
        notes.forEach((n) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.f, now + offset);
          gain.gain.setValueAtTime(this.sfxVolume * 0.25, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + n.d);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + n.d);
          offset += n.d * 0.85;
        });
      }
    } catch {}
  }

  // --- Pokémon Cry playback ---
  public playCry(dexId: number) {
    if (this.muted) return;
    try {
      const audio = new Audio(`/audio/cries/${dexId}.ogg`);
      audio.volume = this.sfxVolume * 0.65;
      audio.play().catch(() => {});
    } catch {}
  }

  // --- Speech Output ---
  public stopVoice() {
    if (this.currentVoiceAudio) {
      this.currentVoiceAudio.pause();
      this.currentVoiceAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Safe speakText: Browser speechSynthesis is intentionally muted to guarantee
   * 100% studio-quality audio across the app (no robotic voices for Levi).
   */
  public speakText(text: string) {
    if (this.muted) return;
    this.stopVoice();
    // Intentionally suppressed in favor of studio .m4a audio assets.
    console.debug('[SoundManager] speakText suppressed to preserve studio quality:', text);
  }

  /**
   * Plays authentic studio voice for a specific card (intro, stats & attacks).
   */
  public playCardVoice(card: { id: string; dexId?: number; name?: string }) {
    if (this.muted) return;
    const cleanId = card.id.toLowerCase().replace(/-/g, '_');
    const voiceKey = `card_${cleanId}`;

    // Star Pokémon lore priority (e.g. card_glurak, card_pikachu, etc.)
    const nameClean = card.name ? card.name.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    const starLoreKey = `card_${nameClean}`;

    if (this.voiceManifest[starLoreKey]?.file) {
      this.playVoice(starLoreKey);
      return;
    }

    if (this.voiceManifest[voiceKey]?.file) {
      this.playVoice(voiceKey);
      return;
    }

    // Direct path fallback for card voice
    const directPath = `/audio/voice/cards/${cleanId}.m4a`;
    this.stopVoice();
    const audio = new Audio(directPath);
    audio.volume = this.sfxVolume;
    this.currentVoiceAudio = audio;
    audio.play().catch(() => {
      this.playVoice('card_detail_intro');
    });
  }

  public playVoice(key: string, fallbackText?: string) {
    if (this.muted) return;
    this.stopVoice();

    const manifestEntry = this.voiceManifest[key];

    if (manifestEntry?.file) {
      const audio = new Audio(manifestEntry.file);
      audio.volume = this.sfxVolume;
      this.currentVoiceAudio = audio;

      audio.play().catch(() => {
        // Fallback suppressed to prevent robotic browser speech
      });
      return;
    }
  }
}

export const soundManager = new SoundManager();
