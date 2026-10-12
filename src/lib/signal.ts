let context: AudioContext | null = null;
let gain: GainNode | null = null;
let oscillator: OscillatorNode | null = null;

function ensureAudio() {
  if (context) return context;
  const AudioCtx = window.AudioContext;
  context = new AudioCtx();
  oscillator = context.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = 74;
  gain = context.createGain();
  gain.gain.value = 0;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  return context;
}

export function setSound(enabled: boolean) {
  document.documentElement.classList.toggle("sound-on", enabled);
  if (!enabled) {
    if (context && gain) gain.gain.setTargetAtTime(0, context.currentTime, 0.08);
    return;
  }
  const audio = ensureAudio();
  void audio.resume();
  gain?.gain.setTargetAtTime(0.012, audio.currentTime, 0.15);
}

export function setLite(enabled: boolean) {
  document.documentElement.classList.toggle("perf-lite", enabled);
}

export function stopSignal() {
  if (context && gain) gain.gain.setTargetAtTime(0, context.currentTime, 0.05);
  oscillator?.stop();
  void context?.close();
  context = null;
  gain = null;
  oscillator = null;
  document.documentElement.classList.remove("sound-on");
}
