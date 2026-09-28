import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const file = readFileSync(new URL('./build/alumia-volume-study.glb', import.meta.url));
assert.equal(file.toString('utf8', 0, 4), 'glTF');
assert.equal(file.readUInt32LE(4), 2);
assert.equal(file.readUInt32LE(8), file.length);
assert.equal(file.readUInt32LE(16), 0x4e4f534a);
const json = JSON.parse(file.toString('utf8', 20, 20 + file.readUInt32LE(12)));
assert.ok(json.meshes.length > 10, 'Real meshes must be exported');
assert.equal(json.images?.length ?? 0, 0, 'No PNG planes/textures masquerading as the model');
assert.ok(json.nodes.some(n => n.name === 'Head'));
assert.ok(json.animations.length >= 1, 'Animation must survive export');
assert.ok(!json.nodes.some(n => n.name?.includes('canônico')), 'Reference planes must stay editor-only');
for (const anim of json.animations) {
  assert.ok(anim.channels.length > 0);
  for (const channel of anim.channels) assert.ok(json.nodes[channel.target.node]);
}
console.log(JSON.stringify({ bytes: file.length, meshes: json.meshes.length, images: json.images?.length ?? 0,
  animations: json.animations.map(a => ({name:a.name, channels:a.channels.length})) }, null, 2));
