export type MindfulnessAmbientSound = "none" | "rain" | "ocean" | "breeze";

export interface MindfulnessAmbientHandle {
  pause: () => void;
  resume: () => void;
  setVolume: (volume: number) => void;
  stop: () => void;
}

function clampVolume(volume: number) {
  return Math.min(1, Math.max(0, volume));
}

function fillNoise(data: Float32Array, sound: Exclude<MindfulnessAmbientSound, "none">) {
  let brown = 0;
  for (let index = 0; index < data.length; index += 1) {
    const white = Math.random() * 2 - 1;
    brown = (brown + 0.02 * white) / 1.02;
    data[index] = sound === "rain" ? white * 0.72 + brown * 0.28 : brown * 3.2;
  }
}

export function startMindfulnessAmbientSound(
  sound: Exclude<MindfulnessAmbientSound, "none">,
  initialVolume: number,
): MindfulnessAmbientHandle | null {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;

  const context = new AudioContext();
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const textureGain = context.createGain();
  const masterGain = context.createGain();
  const seconds = 5;
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
  fillNoise(buffer.getChannelData(0), sound);

  source.buffer = buffer;
  source.loop = true;
  if (sound === "rain") {
    filter.type = "bandpass";
    filter.frequency.value = 2800;
    filter.Q.value = 0.35;
    textureGain.gain.value = 0.42;
  } else if (sound === "ocean") {
    filter.type = "lowpass";
    filter.frequency.value = 650;
    filter.Q.value = 0.7;
    textureGain.gain.value = 0.55;
  } else {
    filter.type = "lowpass";
    filter.frequency.value = 1250;
    filter.Q.value = 0.45;
    textureGain.gain.value = 0.38;
  }

  source.connect(filter);
  filter.connect(textureGain);
  textureGain.connect(masterGain);
  masterGain.connect(context.destination);

  let modulation: OscillatorNode | null = null;
  let modulationDepth: GainNode | null = null;
  if (sound === "ocean" || sound === "breeze") {
    modulation = context.createOscillator();
    modulationDepth = context.createGain();
    modulation.type = "sine";
    modulation.frequency.value = sound === "ocean" ? 0.09 : 0.18;
    modulationDepth.gain.value = sound === "ocean" ? 0.28 : 0.16;
    modulation.connect(modulationDepth);
    modulationDepth.connect(textureGain.gain);
    modulation.start();
  }

  const baseVolume = sound === "rain" ? 0.18 : sound === "ocean" ? 0.26 : 0.2;
  masterGain.gain.value = baseVolume * clampVolume(initialVolume);
  source.start();
  void context.resume();

  let stopped = false;
  return {
    pause: () => { if (!stopped) void context.suspend(); },
    resume: () => { if (!stopped) void context.resume(); },
    setVolume: (volume) => {
      if (!stopped) masterGain.gain.setTargetAtTime(baseVolume * clampVolume(volume), context.currentTime, 0.15);
    },
    stop: () => {
      if (stopped) return;
      stopped = true;
      source.stop();
      modulation?.stop();
      source.disconnect();
      modulation?.disconnect();
      modulationDepth?.disconnect();
      filter.disconnect();
      textureGain.disconnect();
      masterGain.disconnect();
      void context.close();
    },
  };
}
