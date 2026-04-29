#!/usr/bin/env node
/**
 * Generates PCM WAV files matching the web version's Web Audio API oscillator sounds.
 * Run: node scripts/generate-sounds.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const BIT_DEPTH = 16;
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

// ── WAV writer ────────────────────────────────────────────────────────────────

function writeWav(filename, samples) {
  const dataSize = samples.length * 2; // 16-bit = 2 bytes per sample
  const buf = Buffer.alloc(44 + dataSize);

  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);              // PCM
  buf.writeUInt16LE(1, 22);              // mono
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buf.writeUInt16LE(2, 32);              // block align
  buf.writeUInt16LE(BIT_DEPTH, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);

  const MAX = 32767;
  for (let i = 0; i < samples.length; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * MAX), 44 + i * 2);
  }

  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, buf);
  console.log(`  ${filename}  (${(samples.length / SAMPLE_RATE).toFixed(3)}s, ${(buf.length / 1024).toFixed(1)} KB)`);
}

// ── Oscillators ───────────────────────────────────────────────────────────────

function sineSample(phase) {
  return Math.sin(phase);
}

function triangleSample(phase) {
  // Equivalent to Web Audio 'triangle' type
  return (2 / Math.PI) * Math.asin(Math.sin(phase));
}

// ── Note renderer (mirrors Web Audio API note()) ─────────────────────────────
// Envelope: linear attack 0→vol, hold, linear release vol→0
// Renders into `samples` array at `startSample` offset.

function renderNote(samples, startSample, freq, durationSec, vol, type, attack = 0.015, release = 0.10) {
  const n = Math.ceil(durationSec * SAMPLE_RATE);
  const attackSamples = Math.max(1, Math.floor(attack * SAMPLE_RATE));
  const releaseSamples = Math.max(1, Math.floor(release * SAMPLE_RATE));
  const decayStart = Math.max(attackSamples + 1, n - releaseSamples);
  const osc = type === 'sine' ? sineSample : triangleSample;
  const phaseInc = (2 * Math.PI * freq) / SAMPLE_RATE;

  for (let i = 0; i < n; i++) {
    const idx = startSample + i;
    if (idx >= samples.length) break;

    let gain;
    if (i < attackSamples) {
      gain = vol * (i / attackSamples);
    } else if (i >= decayStart) {
      const relPos = (i - decayStart) / Math.max(1, n - decayStart);
      gain = vol * (1 - relPos);
    } else {
      gain = vol;
    }

    samples[idx] += osc(phaseInc * i) * gain;
  }
}

function renderNoteAt(samples, startSec, freq, durationSec, vol, type, attack = 0.015, release = 0.10) {
  renderNote(samples, Math.floor(startSec * SAMPLE_RATE), freq, durationSec, vol, type, attack, release);
}

// Exponential interpolation (matches Web Audio exponentialRampToValueAtTime)
function expInterp(v0, v1, alpha) {
  if (v0 <= 0 || v1 <= 0) return v0 + alpha * (v1 - v0);
  return v0 * Math.pow(v1 / v0, alpha);
}

// ── SFX generators ────────────────────────────────────────────────────────────

function genSelect() {
  // note(780, now, 0.07, 0.45, 'sine', sfx, 0.003, 0.06)
  const n = Math.ceil(0.10 * SAMPLE_RATE);
  const s = new Float32Array(n);
  renderNote(s, 0, 780, 0.07, 0.45, 'sine', 0.003, 0.06);
  writeWav('select.wav', s);
}

function genPlace() {
  // Frequency: 110 →(exp 0.16s)→ 540 →(exp 0.14s)→ 480
  // Gain: 0.75 →(exp 0.42s)→ 0.001
  const dur = 0.45;
  const n = Math.ceil(dur * SAMPLE_RATE);
  const s = new Float32Array(n);

  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;

    let freq;
    if (t <= 0.16) {
      freq = expInterp(110, 540, t / 0.16);
    } else if (t <= 0.30) {
      freq = expInterp(540, 480, (t - 0.16) / 0.14);
    } else {
      freq = 480;
    }

    const gain = t <= 0.42 ? expInterp(0.75, 0.001, t / 0.42) : 0;

    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    s[i] = Math.sin(phase) * gain;
  }

  writeWav('place.wav', s);
}

function genRoulette() {
  // note(850, now, 0.045, 0.28, 'triangle', sfx, 0.002, 0.035)
  const n = Math.ceil(0.08 * SAMPLE_RATE);
  const s = new Float32Array(n);
  renderNote(s, 0, 850, 0.045, 0.28, 'triangle', 0.002, 0.035);
  writeWav('roulette.wav', s);
}

function genFirst() {
  // [[C5, 0], [E5, 0.13], [G5, 0.26]] each 0.26s, vol=0.50, triangle, attack=0.005, release=0.16
  const C5 = 523.25, E5 = 659.25, G5 = 783.99;
  const n = Math.ceil(0.60 * SAMPLE_RATE);
  const s = new Float32Array(n);
  renderNoteAt(s, 0,    C5, 0.26, 0.50, 'triangle', 0.005, 0.16);
  renderNoteAt(s, 0.13, E5, 0.26, 0.50, 'triangle', 0.005, 0.16);
  renderNoteAt(s, 0.26, G5, 0.26, 0.50, 'triangle', 0.005, 0.16);
  writeWav('first.wav', s);
}

function genSkip() {
  // 460 →(exp 0.35s)→ 160 Hz, gain 0.40 →(linear 0.35s)→ 0
  const dur = 0.37;
  const n = Math.ceil(dur * SAMPLE_RATE);
  const s = new Float32Array(n);

  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const alpha = Math.min(t / 0.35, 1);
    const freq = expInterp(460, 160, alpha);
    const gain = 0.40 * Math.max(0, 1 - t / 0.35);
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    s[i] = Math.sin(phase) * gain;
  }

  writeWav('skip.wav', s);
}

function genWin() {
  // C4→E4→G4→C5 triangle arpeggio at offsets 0/0.12/0.24/0.38s, each 0.36s, vol=0.60, attack=0.01, release=0.16
  // Then C5+E5+G5 sine chord at 0.65s, 1.0s, vol=0.38, attack=0.02, release=0.50
  const C4 = 261.63, E4 = 329.63, G4 = 392.00, C5 = 523.25;
  const E5 = 659.25, G5 = 783.99;

  const n = Math.ceil(1.80 * SAMPLE_RATE);
  const s = new Float32Array(n);

  [[C4, 0], [E4, 0.12], [G4, 0.24], [C5, 0.38]].forEach(([f, d]) =>
    renderNoteAt(s, d, f, 0.36, 0.60, 'triangle', 0.01, 0.16)
  );
  [C5, E5, G5].forEach(f =>
    renderNoteAt(s, 0.65, f, 1.0, 0.38, 'sine', 0.02, 0.50)
  );

  writeWav('win.wav', s);
}

function genDraw() {
  // E5 triangle at 0s for 0.26s, vol=0.50, attack=0.01, release=0.16
  // G4 triangle at 0.3s for 0.48s, vol=0.50, attack=0.01, release=0.32
  const E5 = 659.25, G4 = 392.00;
  const n = Math.ceil(0.90 * SAMPLE_RATE);
  const s = new Float32Array(n);
  renderNoteAt(s, 0,   E5, 0.26, 0.50, 'triangle', 0.01, 0.16);
  renderNoteAt(s, 0.3, G4, 0.48, 0.50, 'triangle', 0.01, 0.32);
  writeWav('draw.wav', s);
}

function genBgm() {
  const BPM = 98;
  const Q = 60 / BPM;
  const H = Q * 2;
  const W = Q * 4;

  const C3 = 130.81, G3 = 196.00, A2 = 110.00, E3 = 164.81;
  const C4 = 261.63, D4 = 293.66, E4 = 329.63, G4 = 392.00, A4 = 440.00;
  const C5 = 523.25;

  const MELODY = [
    [C4, Q], [E4, Q], [G4, Q], [A4, Q],
    [C5, Q], [A4, Q], [G4, H],
    [G4, Q], [A4, Q], [C5, Q], [A4, Q],
    [G4, H], [E4, H],
    [D4, Q], [E4, Q], [G4, Q], [A4, Q],
    [G4, Q], [E4, Q], [D4, H],
    [E4, Q], [G4, Q], [A4, Q], [G4, Q],
    [C4, W],
  ];

  const BASS = [
    [C3, H], [G3, H],
    [A2, H], [E3, H],
    [C3, H], [G3, H],
    [C3, W],
    [C3, H], [G3, H],
    [A2, H], [E3, H],
    [C3, H], [G3, H],
    [C3, W],
  ];

  // Total = 32 quarter notes
  const totalDur = 32 * Q;
  // Add a small tail so last notes fade out cleanly before loop
  const bufDur = totalDur + 0.30;
  const n = Math.ceil(bufDur * SAMPLE_RATE);
  const s = new Float32Array(n);

  let t = 0;
  for (const [freq, dur] of MELODY) {
    renderNoteAt(s, t, freq, dur * 0.60, 0.60, 'triangle', 0.012, 0.10);
    t += dur;
  }

  t = 0;
  for (const [freq, dur] of BASS) {
    renderNoteAt(s, t, freq, dur * 0.40, 0.30, 'sine', 0.05, 0.25);
    t += dur;
  }

  // Normalize to 0.75 peak
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(s[i]));
  if (peak > 0) {
    const scale = 0.75 / peak;
    for (let i = 0; i < n; i++) s[i] *= scale;
  }

  writeWav('bgm_loop.wav', s);
}

// ── Run ───────────────────────────────────────────────────────────────────────

console.log('Generating sound files into assets/sounds/...\n');
genSelect();
genPlace();
genRoulette();
genFirst();
genSkip();
genWin();
genDraw();
genBgm();
console.log('\nDone.');
