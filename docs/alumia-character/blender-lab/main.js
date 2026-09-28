import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import modelUrl from './build/alumia-volume-study.glb?url';
import referenceUrl from '../reference-pack-v2/alumia-bust-master-v2.png?url';
import './style.css';

document.querySelector('#reference').src = referenceUrl;
const stage = document.querySelector('#stage');
const status = document.querySelector('#status');
const motionButton = document.querySelector('#motion');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let moving = !reduced.matches;
let loaded = false;
let mixer, model, head, greetingStart = null;
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = .9;
stage.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, .01, 50);
const target = new THREE.Vector3(0, 1.35, 0);
const views = { front: [0, 1.65, 5.7], three: [2.7, 1.75, 5], side: [5.7, 1.65, .05] };
camera.position.set(...views.front);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(target);
controls.enablePan = false;
controls.enableDamping = true;
controls.minDistance = 2.8;
controls.maxDistance = 8;
controls.minPolarAngle = Math.PI * .25;
controls.maxPolarAngle = Math.PI * .7;
const env = new RoomEnvironment();
const pmrem = new THREE.PMREMGenerator(renderer);
const environment = pmrem.fromScene(env, .04);
scene.environment = environment.texture;
scene.environmentIntensity = .5;
env.dispose();
pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xfff3db, 0x736454, .6));
const key = new THREE.DirectionalLight(0xffedd7, 1.5);
key.position.set(-3, 4, 5);
scene.add(key);
const fill = new THREE.DirectionalLight(0xe0f5fa, .5);
fill.position.set(3, 2, -2);
scene.add(fill);

function motionLabel() {
  motionButton.textContent = moving ? 'Pausar movimento' : 'Ativar movimento';
  motionButton.setAttribute('aria-pressed', String(moving));
}
motionLabel();
motionButton.addEventListener('click', () => { moving = !moving; greetingStart = null; motionLabel(); });
reduced.addEventListener('change', () => { moving = !reduced.matches; greetingStart = null; motionLabel(); });
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
  camera.position.set(...views[button.dataset.view]); controls.target.copy(target); controls.update();
}));
document.querySelector('#hello').addEventListener('click', () => {
  if (loaded && !reduced.matches) { greetingStart = performance.now(); moving = true; motionLabel(); }
  else if (reduced.matches) status.textContent = 'Movimento reduzido ativo: gesto não executado.';
});
document.querySelector('#wire').addEventListener('click', event => {
  const active = event.currentTarget.getAttribute('aria-pressed') !== 'true';
  event.currentTarget.setAttribute('aria-pressed', String(active));
  model?.traverse(object => { if (object.isMesh) for (const m of [object.material].flat()) m.wireframe = active; });
});

new GLTFLoader().load(modelUrl, gltf => {
  model = gltf.scene;
  model.name = 'AlumiaVolumeStudy';
  scene.add(model);
  head = model.getObjectByName('Head');
  mixer = new THREE.AnimationMixer(model);
  gltf.animations.forEach(clip => mixer.clipAction(clip).play());
  let triangles = 0;
  model.traverse(o => { if (o.isMesh) triangles += (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3; });
  loaded = true;
  status.textContent = `${Math.round(triangles).toLocaleString('pt-BR')} triângulos · ${gltf.animations.length} animação(ões) · arraste para girar`;
  stage.dataset.loaded = 'true';
}, undefined, error => {
  console.error(error);
  status.textContent = 'Não foi possível abrir o modelo. Confira a exportação do laboratório.';
  stage.dataset.loaded = 'error';
});
renderer.domElement.addEventListener('webglcontextlost', event => {
  event.preventDefault(); moving = false; motionLabel();
  status.textContent = 'O renderizador 3D foi interrompido. Recarregue para tentar novamente.';
});
const observer = new ResizeObserver(() => {
  const { width, height } = stage.getBoundingClientRect();
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
observer.observe(stage);
let previous = performance.now();
renderer.setAnimationLoop(now => {
  const delta = Math.min((now - previous) / 1000, .05);
  previous = now;
  if (document.hidden) return;
  if (moving && mixer) mixer.update(delta);
  if (moving && head && greetingStart !== null) {
    const t = (now - greetingStart) / 1000;
    if (t < 2) {
      head.rotation.y += Math.sin(t * Math.PI) * .22;
      head.rotation.x += Math.sin(t * Math.PI * 2) * .08;
    } else greetingStart = null;
  }
  controls.update();
  renderer.render(scene, camera);
});
window.addEventListener('pagehide', () => {
  renderer.setAnimationLoop(null); observer.disconnect(); controls.dispose();
  mixer?.stopAllAction(); model?.traverse(o => { if (o.isMesh) { o.geometry.dispose(); for (const m of [o.material].flat()) m.dispose(); } });
  environment.dispose(); renderer.dispose();
}, { once: true });
