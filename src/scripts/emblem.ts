/**
 * Entrée : le symbole du logo (les deux sommets) en métal brossé.
 * Il sort du noir, une lumière le balaie, puis il se fige.
 * Contours relevés sur le logo d'origine (pixels du fichier JPG, y vers le bas).
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const PEAKS: [number, number][][] = [
  [
    [759.4, 264.6],
    [820.4, 348],
    [807.5, 348],
    [755.5, 275.5],
    [703.5, 348],
    [699.5, 348],
  ],
  [
    [846.4, 264.6],
    [907.4, 348],
    [894.5, 348],
    [842.5, 275.5],
    [811.3, 319],
    [807.3, 319],
  ],
];
const CX = 803.5;
const TOP = 264.6;
const H = 348 - TOP;

function emblemGeometry() {
  const shapes = PEAKS.map((pts) => {
    const s = new THREE.Shape();
    pts.forEach(([x, y], i) => {
      const px = (x - CX) / H;
      const py = (TOP + H / 2 - y) / H;
      if (i) s.lineTo(px, py);
      else s.moveTo(px, py);
    });
    s.closePath();
    return s;
  });
  const g = new THREE.ExtrudeGeometry(shapes, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.006,
    bevelSegments: 3,
    curveSegments: 1,
  });
  g.center();
  return g;
}

export function playEmblem(canvas: HTMLCanvasElement, day: boolean): Promise<void> {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = day ? 0.55 : 0.8;

  const camera = new THREE.PerspectiveCamera(28, canvas.clientWidth / canvas.clientHeight, 0.1, 50);
  camera.position.set(0, 0, 6);
  const fit = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    // Symbole de 4 unités de large : un tiers de l'écran, plus sur téléphone
    const share = camera.aspect < 1 ? 0.62 : 0.32;
    camera.position.z = 4 / (share * 2 * Math.tan(THREE.MathUtils.degToRad(14)) * camera.aspect);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  fit();
  window.addEventListener('resize', fit);

  const material = new THREE.MeshPhysicalMaterial({
    color: day ? 0x1b2c52 : 0xd9e0e6,
    metalness: 1,
    roughness: 0.28,
    anisotropy: 0.85,
    anisotropyRotation: Math.PI / 2,
    clearcoat: 0.4,
    clearcoatRoughness: 0.2,
  });
  const mesh = new THREE.Mesh(emblemGeometry(), material);
  mesh.scale.setScalar(1.6);
  scene.add(mesh);

  // La lumière qui balaie le métal
  const sweep = new THREE.PointLight(day ? 0xffffff : 0xfff3e2, 0, 6, 1.4);
  scene.add(sweep);
  const key = new THREE.DirectionalLight(0xffffff, 0.8);
  key.position.set(-2, 3, 4);
  scene.add(key);

  const DURATION = 3.4;
  const t0 = performance.now();
  return new Promise((resolve) => {
    let done = false;
    const frame = () => {
      const t = (performance.now() - t0) / 1000;
      const k = Math.min(1, t / DURATION);
      const ease = 1 - Math.pow(1 - k, 3);
      renderer.toneMappingExposure = Math.min(1, t / 1.4) * (day ? 1.1 : 1.25);
      mesh.rotation.y = -0.55 * (1 - ease);
      mesh.rotation.x = 0.12 * (1 - ease);
      mesh.position.z = -0.6 * (1 - ease);
      const s = THREE.MathUtils.smoothstep(t, 0.4, 2.8);
      sweep.position.set(-3 + 6 * s, 0.6 - 0.5 * s, 1.2);
      sweep.intensity = 14 * Math.sin(Math.PI * s);
      scene.environmentRotation.y = 1.2 * ease;
      renderer.render(scene, camera);
      if (k >= 1 && !done) {
        done = true;
        resolve();
      }
      if (!canvas.closest('.is-done')) requestAnimationFrame(frame);
      else {
        window.removeEventListener('resize', fit);
        renderer.dispose();
        pmrem.dispose();
        material.dispose();
        mesh.geometry.dispose();
      }
    };
    requestAnimationFrame(frame);
  });
}
