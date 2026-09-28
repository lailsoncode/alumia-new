import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sampleRate = 44_100;
const durationSeconds = 4.5;
const sampleCount = Math.floor(sampleRate * durationSeconds);
const data = Buffer.alloc(sampleCount * 2);

for (let index = 0; index < sampleCount; index += 1) {
  const time = index / sampleRate;
  const cycleTime = time % 0.9;
  const audible = cycleTime < 0.62;
  const frequency = Math.floor(time / 0.9) % 2 === 0 ? 740 : 880;
  const attack = Math.min(1, cycleTime / 0.025);
  const release = Math.min(1, Math.max(0, (0.62 - cycleTime) / 0.05));
  const envelope = audible ? Math.min(attack, release) : 0;
  const fundamental = Math.sin(2 * Math.PI * frequency * time);
  const harmonic = Math.sin(2 * Math.PI * frequency * 2 * time) * 0.16;
  const sample = Math.max(-1, Math.min(1, (fundamental + harmonic) * envelope * 0.46));
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

const wav = Buffer.concat([header, data]);
const targets = [
  resolve(root, "android/app/src/main/res/raw/alumia_alarm.wav"),
  resolve(root, "ios/App/App/alumia_alarm.wav"),
];

for (const target of targets) {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, wav);
}

console.log(`Som de lembrete gerado (${wav.length} bytes).`);
