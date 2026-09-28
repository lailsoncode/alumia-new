import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { writePsdBuffer, readPsd } from 'ag-psd';

const W = 1312;
const H = 1199;
const sourceDir = new URL('./source/', import.meta.url);
const outDir = new URL('./package/', import.meta.url);
await mkdir(outDir, { recursive: true });

async function png(name) {
  const input = await readFile(new URL(name, sourceDir));
  const metadata = await sharp(input).metadata();
  if (metadata.width !== W || metadata.height !== H) {
    throw new Error(`${name} deve medir ${W} × ${H}, recebeu ${metadata.width} × ${metadata.height}`);
  }
  return sharp(input).ensureAlpha().png().toBuffer();
}

function ellipseMask(cx, cy, rx, ry, blur = 0) {
  const filter = blur
    ? `<defs><filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${blur}"/></filter></defs>`
    : '';
  const filterAttr = blur ? ' filter="url(#soft)"' : '';
  return Buffer.from(`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${filter}<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="white"${filterAttr}/></svg>`);
}

function roundedRectMask(x, y, width, height, radius, blur = 0) {
  const filter = blur
    ? `<defs><filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${blur}"/></filter></defs>`
    : '';
  const filterAttr = blur ? ' filter="url(#soft)"' : '';
  return Buffer.from(`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${filter}<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="white"${filterAttr}/></svg>`);
}

async function masked(input, mask) {
  return sharp(input).ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

const canonical = await png('00-canonical-idle.png');
const cleanFace = await png('01-clean-face-underlay.png');
const blink = await png('02-blink-registered.png');
const mouthOpenRegistered = await png('03-mouth-open-registered.png');
const mouthORegistered = await png('04-mouth-o-registered.png');

// As máscaras ficam dentro das lentes e ao redor da boca. Assim, a geração não
// tem autoridade para redesenhar cabelo, contorno do rosto, óculos ou camiseta.
const blinkViewerLeft = await masked(blink, ellipseMask(550, 527, 88, 67, 3));
const blinkViewerRight = await masked(blink, ellipseMask(817, 468, 86, 67, 3));
// Primeiro apagamos por completo o sorriso canônico usando o rosto limpo. Em
// seguida recolocamos somente o miolo da nova boca. Essa composição impede que
// pequenos resíduos da edição gerada apareçam nas extremidades do sorriso.
const cleanFaceSmoothed = await sharp(cleanFace).blur(12).png().toBuffer();
const mouthRegionMask = roundedRectMask(615, 605, 200, 105, 35, 4);
const cleanMouthCover = await masked(cleanFaceSmoothed, mouthRegionMask);
const mouthOpenShape = await masked(mouthOpenRegistered, ellipseMask(710, 653, 60, 39, 1));
const mouthOpen = await sharp(cleanMouthCover)
  .composite([{ input: mouthOpenShape, blend: 'over' }])
  .png()
  .toBuffer();
const mouthO = await masked(mouthORegistered, mouthRegionMask);

const assets = {
  canonical,
  cleanFace,
  blinkViewerLeft,
  blinkViewerRight,
  mouthOpen,
  mouthO,
};

for (const [name, data] of Object.entries(assets)) {
  await writeFile(new URL(`${name}.png`, outDir), data);
}

async function composite(...overlays) {
  return sharp(canonical)
    .composite(overlays.map(input => ({ input, blend: 'over' })))
    .png()
    .toBuffer();
}

const idle = canonical;
const blinkState = await composite(blinkViewerLeft, blinkViewerRight);
const mouthOpenState = await composite(mouthOpen);
const mouthOState = await composite(mouthO);

await writeFile(new URL('alumia-live2d-v2-idle.png', outDir), idle);

const identityCheck = await sharp({
  create: { width: W * 2, height: H, channels: 4, background: { r: 247, g: 245, b: 238, alpha: 1 } },
})
  .composite([
    { input: canonical, left: 0, top: 0 },
    { input: idle, left: W, top: 0 },
  ])
  .png()
  .toBuffer();
await writeFile(new URL('alumia-live2d-v2-identity-check.png', outDir), identityCheck);

const stateLabels = ['Repouso canônico', 'Piscada', 'Fala · aberta', 'Fala · O'];
const stateImages = [idle, blinkState, mouthOpenState, mouthOState];
const tileW = 656;
const tileH = 650;
const labelH = 52;
const stateSheet = sharp({
  create: { width: tileW * 2, height: tileH * 2, channels: 4, background: { r: 247, g: 245, b: 238, alpha: 1 } },
});
const stateComposites = [];
for (let index = 0; index < stateImages.length; index += 1) {
  const left = (index % 2) * tileW;
  const top = Math.floor(index / 2) * tileH;
  const image = await sharp(stateImages[index])
    .resize(tileW, tileH - labelH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const label = Buffer.from(`<svg width="${tileW}" height="${labelH}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f7f5ee"/><text x="${tileW / 2}" y="34" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="600" fill="#3d4648">${stateLabels[index]}</text></svg>`);
  stateComposites.push({ input: label, left, top });
  stateComposites.push({ input: image, left, top: top + labelH });
}
await writeFile(
  new URL('alumia-live2d-v2-states.png', outDir),
  await stateSheet.composite(stateComposites).png().toBuffer(),
);

const canonicalRaw = await sharp(canonical).ensureAlpha().raw().toBuffer();
const idleRaw = await sharp(idle).ensureAlpha().raw().toBuffer();
let differentChannels = 0;
let maximumChannelDelta = 0;
for (let index = 0; index < canonicalRaw.length; index += 1) {
  const delta = Math.abs(canonicalRaw[index] - idleRaw[index]);
  if (delta > 0) differentChannels += 1;
  if (delta > maximumChannelDelta) maximumChannelDelta = delta;
}
const report = {
  canvas: { width: W, height: H },
  exactIdleMatch: differentChannels === 0,
  differentChannels,
  maximumChannelDelta,
  identityRule: 'O repouso é o PNG canônico, sem recomposição nem redesenho.',
};
await writeFile(new URL('identity-report.json', outDir), `${JSON.stringify(report, null, 2)}\n`);

async function imageData(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, data: new Uint8ClampedArray(data) };
}

async function layer(name, buffer, hidden = false) {
  return { name, hidden, imageData: await imageData(buffer) };
}

const psd = {
  width: W,
  height: H,
  imageData: await imageData(idle),
  children: [
    await layer('Base canônica · repouso exato', canonical),
    {
      name: 'Olhos · sobreposições registradas',
      children: [
        await layer('Piscada · olho esquerdo do observador', blinkViewerLeft, true),
        await layer('Piscada · olho direito do observador', blinkViewerRight, true),
      ],
    },
    {
      name: 'Boca · sobreposições registradas',
      children: [
        await layer('Fala · boca aberta', mouthOpen, true),
        await layer('Fala · boca O', mouthO, true),
      ],
    },
    await layer('Preenchimento limpo · suporte oculto', cleanFace, true),
  ],
};

const psdBuffer = writePsdBuffer(psd, { generateThumbnail: false, trimImageData: false });
await writeFile(new URL('alumia-live2d-material-v2.psd', outDir), psdBuffer);

const structure = readPsd(psdBuffer, {
  skipLayerImageData: true,
  skipCompositeImageData: true,
  skipThumbnail: true,
});
function tree(items, depth = 0) {
  return items.flatMap(item => [
    `${'  '.repeat(depth)}${item.hidden ? '[oculto] ' : ''}${item.name}`,
    ...(item.children ? tree(item.children, depth + 1) : []),
  ]);
}

console.log(JSON.stringify({
  ...report,
  psdBytes: psdBuffer.length,
  layers: tree(structure.children),
}, null, 2));
