import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sampleRate = 44_100;

function createWav(durationSeconds, sampleAt) {
  const sampleCount = Math.floor(sampleRate * durationSeconds);
  const data = Buffer.alloc(sampleCount * 2);

  for (let index = 0; index < sampleCount; index += 1) {
    const sample = Math.max(-1, Math.min(1, sampleAt(index / sampleRate)));
    data.writeInt16LE(Math.round(sample * 32_767), index * 2);
  }

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

const sounds = {
  "alumia_alarm.wav": createWav(4.5, (time) => {
    const cycleTime = time % 0.9;
    const audible = cycleTime < 0.62;
    const frequency = Math.floor(time / 0.9) % 2 === 0 ? 740 : 880;
    const attack = Math.min(1, cycleTime / 0.025);
    const release = Math.min(1, Math.max(0, (0.62 - cycleTime) / 0.05));
    const envelope = audible ? Math.min(attack, release) : 0;
    return (Math.sin(2 * Math.PI * frequency * time) + Math.sin(4 * Math.PI * frequency * time) * 0.16) * envelope * 0.46;
  }),
  "alumia_gentle.wav": createWav(2.8, (time) => {
    const notes = [523.25, 659.25, 783.99];
    const noteIndex = Math.min(notes.length - 1, Math.floor(time / 0.55));
    const noteTime = time - noteIndex * 0.55;
    const envelope = noteTime < 0.03 ? noteTime / 0.03 : Math.exp(-3.2 * noteTime);
    const shimmer = 1 + Math.sin(2 * Math.PI * 4.5 * time) * 0.035;
    return (Math.sin(2 * Math.PI * notes[noteIndex] * shimmer * time) * 0.34
      + Math.sin(2 * Math.PI * notes[noteIndex] * 2 * time) * 0.05) * envelope;
  }),
};

for (const [filename, wav] of Object.entries(sounds)) {
  const targets = [
    resolve(root, "android/app/src/main/res/raw", filename),
    resolve(root, "ios/App/App", filename),
    resolve(root, "public/sounds", filename),
  ];
  for (const target of targets) {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, wav);
  }
  console.log(`${filename} gerado (${wav.length} bytes).`);
}
