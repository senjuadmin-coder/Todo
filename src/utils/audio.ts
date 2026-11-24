import { SoundscapeMode } from '../types';

class StudioAudioEngine {
  private ctx: AudioContext | null = null;
  private activeNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private intervalId: number | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public stopAmbient(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.activeNode) {
      try {
        if ('stop' in this.activeNode && typeof (this.activeNode as AudioBufferSourceNode).stop === 'function') {
          (this.activeNode as AudioBufferSourceNode).stop();
        }
        this.activeNode.disconnect();
      } catch {
        // Ignore already stopped audio nodes
      }
      this.activeNode = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {
        // Ignore
      }
      this.gainNode = null;
    }
  }

  public startAmbient(mode: SoundscapeMode, volume = 0.25): void {
    this.stopAmbient();
    if (mode === 'silence') return;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.value = Math.max(0.02, Math.min(0.6, volume));
    masterGain.connect(ctx.destination);
    this.gainNode = masterGain;

    if (mode === 'brown-noise' || mode === 'rain') {
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      if (mode === 'brown-noise') {
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 2.8;
        }
      } else {
        // Gentle filtered pink-like texture for quiet studio rain
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99765 * b0 + white * 0.099046;
          b1 = 0.96300 * b1 + white * 0.2965164;
          b2 = 0.57000 * b2 + white * 1.0526913;
          output[i] = (b0 + b1 + b2 + white * 0.1848) * 0.08;
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = mode === 'brown-noise' ? 380 : 1250;

      source.connect(filter);
      filter.connect(masterGain);
      source.start();
      this.activeNode = source;
    } else if (mode === 'metronome') {
      const triggerTick = () => {
        if (!this.ctx || !this.gainNode) return;
        const osc = this.ctx.createOscillator();
        const env = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(640, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.035);

        env.gain.setValueAtTime(0.18, this.ctx.currentTime);
        env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.045);

        osc.connect(env);
        env.connect(this.gainNode);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      };
      triggerTick();
      this.intervalId = window.setInterval(triggerTick, 1000);
    }
  }

  public playCompletionChime(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [440, 554.37, 659.25];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.16);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.16);
      gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.16 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.16 + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.16);
      osc.stop(now + idx * 0.16 + 1.45);
    });
  }
}

export const studioAudio = new StudioAudioEngine();
