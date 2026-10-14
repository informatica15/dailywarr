// Original synthesized audio via Web Audio — no external assets to fail loading.
// Nothing plays until the user interacts (enabling music or completing an action).
type Sfx = "complete" | "uncomplete" | "levelup" | "achievement" | "correct" | "wrong" | "tick" | "go";

let ctx: AudioContext | null = null;
let sfxGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicTimer: ReturnType<typeof setInterval> | null = null;
let musicNodes: AudioNode[] = [];
let supported = true;

function ensure(): AudioContext | null {
  if (!supported || typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) { supported = false; return null; }
    try {
      ctx = new AC();
      sfxGain = ctx.createGain(); sfxGain.connect(ctx.destination);
      musicGain = ctx.createGain(); musicGain.gain.value = 0; musicGain.connect(ctx.destination);
    } catch { supported = false; return null; }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export const audioSupported = () => supported && typeof window !== "undefined" && !!(window.AudioContext ?? (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext);

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.25) {
  const c = ctx!; const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(vol, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g); g.connect(sfxGain!); o.start(start); o.stop(start + dur + 0.05);
}

const PATTERNS: Record<Sfx, Array<[number, number, number, OscillatorType?]>> = {
  complete: [[659, 0, 0.18], [988, 0.08, 0.3]],
  uncomplete: [[440, 0, 0.15, "triangle"]],
  levelup: [[523, 0, 0.3], [659, 0.12, 0.3], [784, 0.24, 0.3], [1047, 0.36, 0.6]],
  achievement: [[784, 0, 0.25], [1175, 0.1, 0.5], [1568, 0.2, 0.6]],
  correct: [[880, 0, 0.2]],
  wrong: [[196, 0, 0.3, "triangle"]],
  tick: [[1200, 0, 0.06, "square"]],
  go: [[1320, 0, 0.12]],
};

export function playSfx(name: Sfx, enabled: boolean, volume: number) {
  if (!enabled) return;
  const c = ensure(); if (!c || !sfxGain) return;
  sfxGain.gain.value = volume;
  const t = c.currentTime;
  for (const [f, at, d, type] of PATTERNS[name]) tone(f, t + at, d, type ?? "sine", name === "tick" ? 0.06 : 0.22);
}

// Slow ambient pad: overlapping chords with long crossfades so the loop never starts/stops abruptly.
const CHORDS = [[220, 277.2, 329.6], [196, 246.9, 293.7], [174.6, 220, 261.6], [196, 246.9, 329.6]];

function padChord(freqs: number[], start: number, dur: number) {
  const c = ctx!;
  for (const f of freqs) {
    for (const det of [-4, 4]) {
      const o = c.createOscillator(); const g = c.createGain(); const lp = c.createBiquadFilter();
      o.type = "sawtooth"; o.frequency.value = f; o.detune.value = det;
      lp.type = "lowpass"; lp.frequency.value = 700;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.025, start + dur * 0.4);
      g.gain.linearRampToValueAtTime(0, start + dur);
      o.connect(lp); lp.connect(g); g.connect(musicGain!);
      o.start(start); o.stop(start + dur + 0.1);
      musicNodes.push(o);
    }
  }
}

export function startMusic(volume: number): boolean {
  const c = ensure(); if (!c || !musicGain) return false;
  if (musicTimer) { setMusicVolume(volume); return true; }
  let i = 0;
  const step = 6;
  const schedule = () => {
    musicNodes = musicNodes.slice(-24);
    padChord(CHORDS[i++ % CHORDS.length], c.currentTime, step * 1.6);
  };
  schedule();
  musicTimer = setInterval(schedule, step * 1000);
  musicGain.gain.cancelScheduledValues(c.currentTime);
  musicGain.gain.setTargetAtTime(volume * 0.9, c.currentTime, 1.2);
  return true;
}

export function setMusicVolume(volume: number) {
  if (!ctx || !musicGain) return;
  musicGain.gain.setTargetAtTime(volume * 0.9, ctx.currentTime, 0.3);
}

export function stopMusic() {
  if (!ctx || !musicGain) return;
  musicGain.gain.setTargetAtTime(0, ctx.currentTime, 0.6);
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
  const nodes = musicNodes; musicNodes = [];
  setTimeout(() => nodes.forEach((n) => { try { (n as OscillatorNode).stop(); } catch { /* already stopped */ } }), 3000);
}
