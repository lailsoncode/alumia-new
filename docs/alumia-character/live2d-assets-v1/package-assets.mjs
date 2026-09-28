import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { writePsdBuffer, readPsd } from 'ag-psd';
import { fileURLToPath } from 'node:url';

const W = 1312, H = 1199;
const layersDir = new URL('./layers/', import.meta.url);
const outDir = new URL('./package/', import.meta.url);
await mkdir(outDir, { recursive: true });

async function alphaBounds(input, crop) {
  let pipeline = sharp(input).ensureAlpha();
  if (crop) pipeline = pipeline.extract(crop);
  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 8) {
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
  }
  if (right < 0) throw new Error(`Layer has no visible pixels: ${input}`);
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

async function registered(file, target, sourceCrop) {
  const input = fileURLToPath(new URL(`./layers/${file}`, import.meta.url));
  const bounds = await alphaBounds(input, sourceCrop);
  const extract = sourceCrop
    ? { left: sourceCrop.left + bounds.left, top: sourceCrop.top + bounds.top, width: bounds.width, height: bounds.height }
    : bounds;
  const fragment = await sharp(input).ensureAlpha().extract(extract)
    .resize(target.width, target.height, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .png().toBuffer();
  return sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: fragment, left: target.left, top: target.top }]).png().toBuffer();
}

async function canonical(file) {
  const input = fileURLToPath(new URL(`./layers/${file}`, import.meta.url));
  return sharp(input).ensureAlpha().resize(W, H, { fit: 'fill' }).png().toBuffer();
}

const source = {
  body: await canonical('01-body-neck.png'),
  hairBack: await canonical('02-hair-back.png'),
  face: await registered('03-face-base.png', { left: 365, top: 150, width: 650, height: 610 }),
  hairFront: await registered('04-hair-front.png', { left: 190, top: 70, width: 930, height: 560 }),
  glasses: await registered('05-glasses.png', { left: 402, top: 370, width: 560, height: 300 }),
  eyeGuideL: await registered('06-eye-viewer-left.png', { left: 480, top: 470, width: 155, height: 145 }),
  eyeGuideR: await registered('07-eye-viewer-right.png', { left: 750, top: 410, width: 150, height: 145 }),
  browL: await registered('08-eyebrows.png', { left: 475, top: 385, width: 120, height: 70 }, { left: 0, top: 0, width: 656, height: 1199 }),
  browR: await registered('08-eyebrows.png', { left: 735, top: 317, width: 135, height: 68 }, { left: 656, top: 0, width: 656, height: 1199 }),
  closedL: await registered('09-eyes-closed.png', { left: 480, top: 500, width: 155, height: 80 }, { left: 0, top: 0, width: 656, height: 1199 }),
  closedR: await registered('09-eyes-closed.png', { left: 752, top: 438, width: 150, height: 80 }, { left: 656, top: 0, width: 656, height: 1199 }),
  mouthSmile: await registered('10-mouth-smile.png', { left: 635, top: 596, width: 150, height: 75 }),
  mouthOpen: await registered('11-mouth-open.png', { left: 630, top: 590, width: 165, height: 95 }),
  mouthO: await registered('12-mouth-o.png', { left: 680, top: 602, width: 80, height: 72 }),
  whiteL: await registered('13-eye-white-viewer-left.png', { left: 486, top: 476, width: 148, height: 135 }),
  whiteR: await registered('14-eye-white-viewer-right.png', { left: 756, top: 414, width: 146, height: 140 }),
  pupilL: await registered('15-pupils.png', { left: 520, top: 492, width: 90, height: 114 }, { left: 0, top: 0, width: 656, height: 1199 }),
  pupilR: await registered('15-pupils.png', { left: 776, top: 430, width: 88, height: 112 }, { left: 656, top: 0, width: 656, height: 1199 }),
  lashL: await registered('16-upper-lashes.png', { left: 480, top: 468, width: 155, height: 65 }, { left: 0, top: 0, width: 710, height: 1108 }),
  lashR: await registered('16-upper-lashes.png', { left: 752, top: 405, width: 150, height: 65 }, { left: 710, top: 0, width: 710, height: 1108 }),
  reference: await sharp(fileURLToPath(new URL('../reference-pack-v2/alumia-bust-master-v2.png', import.meta.url))).ensureAlpha().png().toBuffer(),
};

for (const [name, data] of Object.entries(source)) await writeFile(new URL(`./package/${name}.png`, import.meta.url), data);

const visibleOrder = ['hairBack', 'body', 'face', 'whiteL', 'whiteR', 'pupilL', 'pupilR', 'lashL', 'lashR', 'browL', 'browR', 'mouthSmile', 'glasses', 'hairFront'];
let preview = sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });
preview = preview.composite(visibleOrder.map(name => ({ input: source[name], blend: 'over' })));
const previewPng = await preview.png().toBuffer();
await writeFile(new URL('./package/alumia-live2d-recomposed-preview.png', import.meta.url), previewPng);
const comparison = await sharp({ create: { width: W * 2, height: H, channels: 4, background: { r: 247, g: 245, b: 238, alpha: 1 } } })
  .composite([{ input: source.reference, left: 0, top: 0 }, { input: previewPng, left: W, top: 0 }]).png().toBuffer();
await writeFile(new URL('./package/alumia-live2d-comparison.png', import.meta.url), comparison);

async function imageData(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, data: new Uint8ClampedArray(data) };
}
async function layer(name, key, hidden = false) { return { name, hidden, imageData: await imageData(source[key]) }; }

const psd = {
  width: W, height: H,
  imageData: await imageData(previewPng),
  children: [
    await layer('Cabelo · traseiro', 'hairBack'),
    await layer('Corpo · pescoço e camiseta', 'body'),
    await layer('Rosto-base · sem feições', 'face'),
    { name: 'Boca · alternativas', children: [
      await layer('Boca · sorriso repouso', 'mouthSmile'), await layer('Boca · aberta', 'mouthOpen', true), await layer('Boca · O', 'mouthO', true)
    ] },
    { name: 'Olho · direito da personagem', children: [
      await layer('Branco do olho', 'whiteL'), await layer('Pupila', 'pupilL'), await layer('Cílios superiores', 'lashL'),
      await layer('Pálpebra fechada', 'closedL', true), await layer('GUIA · olho aberto completo', 'eyeGuideL', true)
    ] },
    { name: 'Olho · esquerdo da personagem', children: [
      await layer('Branco do olho', 'whiteR'), await layer('Pupila', 'pupilR'), await layer('Cílios superiores', 'lashR'),
      await layer('Pálpebra fechada', 'closedR', true), await layer('GUIA · olho aberto completo', 'eyeGuideR', true)
    ] },
    { name: 'Sobrancelhas', children: [await layer('Sobrancelha · esquerda da personagem', 'browR'), await layer('Sobrancelha · direita da personagem', 'browL')] },
    await layer('Óculos · armação', 'glasses'),
    await layer('Cabelo · frente', 'hairFront'),
    await layer('GUIA · referência canônica · oculto', 'reference', true),
  ]
};
const psdBuffer = writePsdBuffer(psd, { generateThumbnail: false, trimImageData: false });
await writeFile(new URL('./package/alumia-live2d-material-v1.psd', import.meta.url), psdBuffer);
const structure = readPsd(psdBuffer, { skipLayerImageData: true, skipCompositeImageData: true, skipThumbnail: true });
function tree(items, depth = 0) { return items.flatMap(item => [`${'  '.repeat(depth)}${item.hidden ? '[oculto] ' : ''}${item.name}`, ...(item.children ? tree(item.children, depth + 1) : [])]); }
console.log(JSON.stringify({ width: structure.width, height: structure.height, layers: tree(structure.children), psdBytes: psdBuffer.length }, null, 2));
