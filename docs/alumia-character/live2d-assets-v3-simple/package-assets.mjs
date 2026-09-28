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

function pathMask(path, blur = 0) {
  const filter = blur
    ? `<defs><filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${blur}"/></filter></defs>`
    : '';
  const filterAttr = blur ? ' filter="url(#soft)"' : '';
  return Buffer.from(`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${filter}<path d="${path}" fill="white"${filterAttr}/></svg>`);
}

async function masked(input, mask) {
  return sharp(input).ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function shiftedMasked(input, mask, crop, left, top) {
  const patchMask = await sharp(mask).extract(crop).png().toBuffer();
  const patch = await sharp(input).extract(crop)
    .composite([{ input: patchMask, blend: 'dest-in' }])
    .png()
    .toBuffer();
  return sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: patch, left, top }])
    .png()
    .toBuffer();
}

async function darkFeatureMask(input, crop) {
  const { data, info } = await sharp(input).extract(crop).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const mask = Buffer.alloc(info.width * info.height * 4);
  for (let index = 0; index < info.width * info.height; index += 1) {
    const source = index * 4;
    const red = data[source];
    const green = data[source + 1];
    const blue = data[source + 2];
    const alpha = red < 112 && green < 88 && blue < 78 ? 255 : 0;
    mask[source] = 255;
    mask[source + 1] = 255;
    mask[source + 2] = 255;
    mask[source + 3] = data[source + 3] > 0 ? alpha : 0;
  }
  return sharp(mask, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function shiftedDarkFeature(input, mask, crop, left, top) {
  const colorMask = await darkFeatureMask(input, crop);
  const shapeMask = await sharp(mask).extract(crop).png().toBuffer();
  const localMask = await sharp(colorMask)
    .composite([{ input: shapeMask, blend: 'dest-in' }])
    .png()
    .toBuffer();
  const patch = await sharp(input).extract(crop)
    .composite([{ input: localMask, blend: 'dest-in' }])
    .png()
    .toBuffer();
  return sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: patch, left, top }])
    .png()
    .toBuffer();
}

async function coveredDarkFeature(input, mask, crop) {
  const colorMask = await darkFeatureMask(input, crop);
  const shapeMask = await sharp(mask).extract(crop).png().toBuffer();
  const localMask = await sharp(colorMask)
    .composite([{ input: shapeMask, blend: 'dest-in' }])
    .blur(3)
    .png()
    .toBuffer();
  const patch = await sharp(cleanFace).extract(crop)
    .composite([{ input: localMask, blend: 'dest-in' }])
    .png()
    .toBuffer();
  return sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: patch, left: crop.left, top: crop.top }])
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

// As sobrancelhas são os próprios pixels do repouso, deslocados 10 px para
// cima. O desenho não é refeito; a versão serve somente para uma escuta atenta.
const browLeftMask = pathMask('M 474 438 C 486 404 530 386 576 390 C 592 394 594 407 580 419 C 542 420 507 434 480 452 C 469 451 468 446 474 438 Z', 1);
const browRightMask = pathMask('M 742 361 C 761 333 807 321 851 329 C 867 334 869 347 855 357 C 819 355 781 363 749 379 C 738 377 736 370 742 361 Z', 1);
const browLeftCrop = { left: 460, top: 370, width: 150, height: 105 };
const browRightCrop = { left: 720, top: 305, width: 170, height: 95 };
const browCover = await coveredDarkFeature(canonical, browLeftMask, browLeftCrop);
const browCoverRight = await coveredDarkFeature(canonical, browRightMask, browRightCrop);
const browCoverBoth = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: browCover, blend: 'over' }, { input: browCoverRight, blend: 'over' }])
  .png()
  .toBuffer();
const browRaisedLeft = await shiftedDarkFeature(canonical, browLeftMask, browLeftCrop, 460, 360);
const browRaisedRight = await shiftedDarkFeature(canonical, browRightMask, browRightCrop, 720, 295);
const browsRaised = await sharp(browCoverBoth)
  .composite([{ input: browRaisedLeft, blend: 'over' }, { input: browRaisedRight, blend: 'over' }])
  .png()
  .toBuffer();

const assets = {
  canonical,
  cleanFace,
  blinkViewerLeft,
  blinkViewerRight,
  mouthOpen,
  mouthO,
  browsRaised,
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
const browsState = await composite(browsRaised);

await writeFile(new URL('alumia-live2d-v3-simple-idle.png', outDir), idle);

const identityCheck = await sharp({
  create: { width: W * 2, height: H, channels: 4, background: { r: 247, g: 245, b: 238, alpha: 1 } },
})
  .composite([
    { input: canonical, left: 0, top: 0 },
    { input: idle, left: W, top: 0 },
  ])
  .png()
  .toBuffer();
await writeFile(new URL('alumia-live2d-v3-simple-identity-check.png', outDir), identityCheck);

const stateLabels = ['Repouso canônico', 'Piscada', 'Fala · aberta', 'Fala · O', 'Escuta · sobrancelhas'];
const stateImages = [idle, blinkState, mouthOpenState, mouthOState, browsState];
const tileW = 656;
const tileH = 650;
const labelH = 52;
const columns = 3;
const rows = Math.ceil(stateImages.length / columns);
const stateSheet = sharp({
  create: { width: tileW * columns, height: tileH * rows, channels: 4, background: { r: 247, g: 245, b: 238, alpha: 1 } },
});
const stateComposites = [];
for (let index = 0; index < stateImages.length; index += 1) {
  const left = (index % columns) * tileW;
  const top = Math.floor(index / columns) * tileH;
  const image = await sharp(stateImages[index])
    .resize(tileW, tileH - labelH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const label = Buffer.from(`<svg width="${tileW}" height="${labelH}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f7f5ee"/><text x="${tileW / 2}" y="34" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="600" fill="#3d4648">${stateLabels[index]}</text></svg>`);
  stateComposites.push({ input: label, left, top });
  stateComposites.push({ input: image, left, top: top + labelH });
}
await writeFile(
  new URL('alumia-live2d-v3-simple-states.png', outDir),
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
    await layer('Base canônica · repouso exato · dorso fixo', canonical),
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
    {
      name: 'Sobrancelhas · sobreposição registrada',
      children: [await layer('Escuta · sobrancelhas elevadas', browsRaised, true)],
    },
    await layer('Preenchimento limpo · suporte oculto', cleanFace, true),
  ],
};

const psdBuffer = writePsdBuffer(psd, { generateThumbnail: false, trimImageData: false });
await writeFile(new URL('alumia-live2d-material-v3-simple.psd', outDir), psdBuffer);

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
