/**
 * ============================================================================
 * Acoustic Drum Kit - Web Audio Modeling & Physics Trigger Engine
 * ============================================================================
 */

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let masterGain = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);

    const initialVol = parseFloat(document.getElementById('volume-slider').value);
    masterGain.gain.setValueAtTime(initialVol, audioCtx.currentTime);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Volume Slider
const volumeSlider = document.getElementById('volume-slider');
const volReadout = document.getElementById('vol-readout');

volumeSlider.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  volReadout.innerText = `${Math.round(val * 100)}%`;
  if (masterGain) {
    masterGain.gain.setValueAtTime(val, audioCtx.currentTime);
  }
});

// Helper: Generates audio white noise buffers
function createNoiseBuffer(duration) {
  const sampleRate = audioCtx.sampleRate;
  const bufferSize = Math.floor(sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// ================= ACOUSTIC DRUM SOUND SYNTHESIS =================
const acousticDrums = {
  // 1. Bass / Kick Drum (Deep acoustic punch with beater attack)
  kick() {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.38);

    gain.gain.setValueAtTime(1.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.45);

    // Beater click transient
    const click = audioCtx.createOscillator();
    const clickGain = audioCtx.createGain();
    click.frequency.setValueAtTime(1200, now);
    clickGain.gain.setValueAtTime(0.3, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    click.connect(clickGain);
    clickGain.connect(masterGain);
    click.start(now);
    click.stop(now + 0.02);
  },

  // 2. Snare Drum (Wooden shell tone + metallic snare wire rattle)
  snare() {
    const now = audioCtx.currentTime;

    // Body Tone
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(85, now + 0.12);
    oscGain.gain.setValueAtTime(0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.12);

    // Snare Wires (Filtered Noise)
    const noise = audioCtx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.24);
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1500;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.75, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start(now);
  },

  // 3. Closed Hi-Hat
  'hihat-closed'() {
    const now = audioCtx.currentTime;
    const noise = audioCtx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.05);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 8500;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start(now);
  },

  // 4. Open Hi-Hat
  'hihat-open'() {
    const now = audioCtx.currentTime;
    const noise = audioCtx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.45);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6500;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start(now);
  },

  // 5. High Tom
  'tom-high'() {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.frequency.setValueAtTime(175, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  },

  // 6. Mid Tom
  'tom-mid'() {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.frequency.setValueAtTime(135, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.35);

    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.35);
  },

  // 7. Floor Tom (Deep resonant thud)
  'tom-floor'() {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.45);

    gain.gain.setValueAtTime(1.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.45);
  },

  // 8. Crash Cymbal (Bright explosive metallic shimmer)
  crash() {
    const now = audioCtx.currentTime;
    const noise = audioCtx.createBufferSource();
    noise.buffer = createNoiseBuffer(1.4);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start(now);
  },

  // 9. Ride Cymbal (Defined wooden stick ping + dark bronze wash)
  ride() {
    const now = audioCtx.currentTime;

    // Ping transient
    const ping = audioCtx.createOscillator();
    const pingGain = audioCtx.createGain();
    ping.type = 'triangle';
    ping.frequency.setValueAtTime(2800, now);
    pingGain.gain.setValueAtTime(0.3, now);
    pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    ping.connect(pingGain);
    pingGain.connect(masterGain);
    ping.start(now);
    ping.stop(now + 0.08);

    // Wash resonance
    const noise = audioCtx.createBufferSource();
    noise.buffer = createNoiseBuffer(1.1);
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 6000;
    const washGain = audioCtx.createGain();
    washGain.gain.setValueAtTime(0.35, now);
    washGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    noise.connect(filter);
    filter.connect(washGain);
    washGain.connect(masterGain);
    noise.start(now);
  }
};

// ================= DRUM HIT TRIGGER & ANIMATION =================
function triggerDrum(element, specificSound = null) {
  initAudio();
  const soundName = specificSound || element.getAttribute('data-sound');

  if (acousticDrums[soundName]) {
    acousticDrums[soundName]();
  }

  // Visual recoil/shake class
  element.classList.remove('hit');
  void element.offsetWidth; // Force CSS repaint
  element.classList.add('hit');

  setTimeout(() => {
    element.classList.remove('hit');
  }, 220);
}

// Click and Touch on Drum Pieces
document.querySelectorAll('.drum-piece').forEach((piece) => {
  piece.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    triggerDrum(piece);
  });
});

// Click specifically on the "Open Hat" pill inside Hi-Hat
const openHatPill = document.getElementById('open-hat-pill');
if (openHatPill) {
  openHatPill.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const hihatPiece = document.querySelector('.pos-hihat');
    triggerDrum(hihatPiece, 'hihat-open');
  });
}

// Keyboard Listeners
window.addEventListener('keydown', (e) => {
  if (e.repeat) return; // Prevent stutter from held keys
  const pressed = e.key.toLowerCase();

  // Space or 'b' for Kick
  if (pressed === ' ' || pressed === 'b') {
    e.preventDefault();
    const kick = document.querySelector('.pos-kick');
    if (kick) triggerDrum(kick, 'kick');
    return;
  }

  // 'j' for Open Hi-Hat
  if (pressed === 'j') {
    const hihat = document.querySelector('.pos-hihat');
    if (hihat) triggerDrum(hihat, 'hihat-open');
    return;
  }

  // Match other keys (s, h, t, g, f, c, r)
  const piece = document.querySelector(`.drum-piece[data-key="${pressed}"]`);
  if (piece) {
    triggerDrum(piece);
  }
});

// ================= DEMO DRUM SOLO GROOVE =================
const btnDemo = document.getElementById('btn-demo');
const demoText = document.getElementById('demo-text');
let isSoloPlaying = false;
let soloInterval = null;

// Realistic Rock/Groove drum pattern
const soloPattern = [
  ['kick', 'hihat-closed'], // Beat 1
  ['hihat-closed'],
  ['snare', 'hihat-closed'], // Beat 2
  ['hihat-closed'],
  ['kick', 'hihat-closed'], // Beat 3
  ['kick'],
  ['snare', 'hihat-open'],   // Beat 4
  ['hihat-closed'],
  ['kick', 'crash'],        // Beat 5 (Crash accent)
  ['hihat-closed'],
  ['snare', 'hihat-closed'], // Beat 6
  ['tom-high'],
  ['tom-mid'],              // Beat 7 (Tom fill)
  ['tom-floor'],
  ['snare', 'kick'],        // Beat 8 (Ending punch)
  ['ride']
];

btnDemo.addEventListener('click', () => {
  initAudio();
  if (isSoloPlaying) {
    stopSolo();
  } else {
    startSolo();
  }
});

function startSolo() {
  isSoloPlaying = true;
  btnDemo.classList.add('active-solo');
  demoText.innerText = 'Stop Solo';

  let step = 0;
  soloInterval = setInterval(() => {
    const sounds = soloPattern[step];
    sounds.forEach((snd) => {
      let selector = `.drum-piece[data-sound="${snd}"]`;
      if (snd === 'hihat-open') selector = '.pos-hihat';
      const el = document.querySelector(selector);
      if (el) triggerDrum(el, snd);
    });

    step = (step + 1) % soloPattern.length;
  }, 145);
}

function stopSolo() {
  isSoloPlaying = false;
  clearInterval(soloInterval);
  btnDemo.classList.remove('active-solo');
  demoText.innerText = 'Play Drum Solo';
}