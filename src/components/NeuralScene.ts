/**
 * 3D neural constellation with Three.js: instanced nodes, dynamic edges, camera drift.
 * Beautiful, deep space aesthetic. Pauses when tab hidden; full disposal on cleanup.
 */

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  InstancedMesh,
  BufferGeometry,
  Float32BufferAttribute,
  SphereGeometry,
  MeshBasicMaterial,
  LineSegments,
  LineBasicMaterial,
  Color,
  Fog,
  Vector3,
  Matrix4,
  Quaternion,
  Points,
  PointsMaterial,
} from 'three';

const REDUCE_MOTION =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const NODE_COUNT = 160;
const CONNECT_THRESHOLD = 2.5;
const SPREAD = 10;
const DRIFT = 0.0004;
const ROTATION_SPEED = 0.00018;
const FOG_NEAR = 8;
const FOG_FAR = 36;
const STAR_COUNT = 500;
const STAR_SPREAD = 28;

interface NodePosition {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let instancedMesh: InstancedMesh;
let lines: LineSegments;
let stars: Points | null = null;
let nodePositions: NodePosition[] = [];
let rafId = 0;
let resizeObserver: ResizeObserver;
let matrix: Matrix4;
let quat: Quaternion;

function initNodes(): NodePosition[] {
  const list: NodePosition[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    list.push({
      x: (Math.random() - 0.5) * SPREAD * 2,
      y: (Math.random() - 0.5) * SPREAD * 2,
      z: (Math.random() - 0.5) * SPREAD * 2,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      vz: (Math.random() - 0.5) * 0.02,
    });
  }
  return list;
}

function buildStarGeometry(): BufferGeometry {
  const pos: number[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    pos.push(
      (Math.random() - 0.5) * STAR_SPREAD * 2,
      (Math.random() - 0.5) * STAR_SPREAD * 2,
      (Math.random() - 0.5) * STAR_SPREAD * 2
    );
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  return geo;
}

function buildEdgeGeometry(positions: NodePosition[]): BufferGeometry {
  const pairs: number[] = [];
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const a = positions[i];
      const b = positions[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dz = b.z - a.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < CONNECT_THRESHOLD) {
        pairs.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(pairs, 3));
  return geo;
}

function updateInstancedMatrices(): void {
  if (!instancedMesh || !matrix || !quat) return;
  matrix.identity();
  quat.identity();
  for (let i = 0; i < nodePositions.length; i++) {
    const p = nodePositions[i];
    matrix.compose(
      new Vector3(p.x, p.y, p.z),
      quat,
      new Vector3(1, 1, 1)
    );
    instancedMesh.setMatrixAt(i, matrix);
  }
  instancedMesh.instanceMatrix.needsUpdate = true;
}

function updateLines(): void {
  if (!lines) return;
  lines.geometry.dispose();
  lines.geometry = buildEdgeGeometry(nodePositions);
}

function updatePositions(): void {
  if (REDUCE_MOTION) return;
  for (const p of nodePositions) {
    p.x += p.vx;
    p.y += p.vy;
    p.z += p.vz;
    const half = SPREAD;
    if (p.x < -half || p.x > half) p.vx *= -1;
    if (p.y < -half || p.y > half) p.vy *= -1;
    if (p.z < -half || p.z > half) p.vz *= -1;
    p.x = Math.max(-half, Math.min(half, p.x));
    p.y = Math.max(-half, Math.min(half, p.y));
    p.z = Math.max(-half, Math.min(half, p.z));
  }
}

function tick(): void {
  if (!renderer || !scene || !camera) return;
  updatePositions();
  updateInstancedMatrices();
  updateLines();
  const t = Date.now() * ROTATION_SPEED;
  const r = 3.5;
  camera.position.x = Math.sin(t) * r;
  camera.position.z = Math.cos(t) * r;
  camera.position.y = (Date.now() * DRIFT) % 5 - 2.5;
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  renderer.render(scene, camera);
  rafId = requestAnimationFrame(tick);
}

function onResize(container: HTMLElement): void {
  const w = container.clientWidth;
  const h = container.clientHeight;
  if (!camera || !renderer) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
}

function dispose(): void {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  if (instancedMesh) {
    instancedMesh.geometry.dispose();
    (instancedMesh.material as MeshBasicMaterial).dispose();
  }
  if (lines) {
    lines.geometry.dispose();
    (lines.material as LineBasicMaterial).dispose();
  }
  if (stars) {
    stars.geometry.dispose();
    (stars.material as PointsMaterial).dispose();
  }
  renderer?.dispose();
  scene?.clear();
  nodePositions = [];
}

export function initNeuralScene(container: HTMLElement): Promise<() => void> {
  return new Promise((resolve, reject) => {
    if (REDUCE_MOTION) {
      resolve(() => {});
      return;
    }
    try {
      const width = container.clientWidth;
      const height = container.clientHeight;

      scene = new Scene();
      scene.background = new Color(0x0a0a0c);
      scene.fog = new Fog(0x0a0a0c, FOG_NEAR, FOG_FAR);

      camera = new PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 0, 14);
      camera.lookAt(0, 0, 0);

      renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      container.appendChild(renderer.domElement);
      renderer.domElement.setAttribute('aria-hidden', 'true');
      renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';

      nodePositions = initNodes();
      matrix = new Matrix4();
      quat = new Quaternion();

      const sphereGeo = new SphereGeometry(0.08, 16, 12);
      const nodeMaterial = new MeshBasicMaterial({
        color: 0xe8e8ec,
        transparent: true,
        opacity: 0.9,
      });
      instancedMesh = new InstancedMesh(sphereGeo, nodeMaterial, NODE_COUNT);
      scene.add(instancedMesh);
      updateInstancedMatrices();

      const lineGeo = buildEdgeGeometry(nodePositions);
      const lineMaterial = new LineBasicMaterial({
        color: 0xc9a227,
        transparent: true,
        opacity: 0.45,
      });
      lines = new LineSegments(lineGeo, lineMaterial);
      scene.add(lines);

      const starGeo = buildStarGeometry();
      const starMat = new PointsMaterial({
        color: 0xe8e8ec,
        size: 0.08,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true,
      });
      stars = new Points(starGeo, starMat);
      scene.add(stars);

      resizeObserver = new ResizeObserver(() => onResize(container));
      resizeObserver.observe(container);

      const onVisibility = (): void => {
        if (document.hidden) {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = 0;
        } else {
          rafId = requestAnimationFrame(tick);
        }
      };
      document.addEventListener('visibilitychange', onVisibility);
      rafId = requestAnimationFrame(tick);

      resolve(dispose);
    } catch (e) {
      reject(e);
    }
  });
}
