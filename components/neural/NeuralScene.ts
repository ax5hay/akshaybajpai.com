/**
 * Neural constellation — clean, performant.
 * Instanced nodes + single LineSegments mesh (in-place buffer updates, no per-frame alloc).
 */

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  InstancedMesh,
  SphereGeometry,
  MeshBasicMaterial,
  LineSegments,
  LineBasicMaterial,
  Color,
  Fog,
  Vector3,
  Vector2,
  Matrix4,
  Quaternion,
  Mesh,
  Raycaster,
  BufferGeometry,
  Float32BufferAttribute,
  type Intersection,
} from 'three';

export type OverlayPhase = 'closed' | 'flying' | 'open';

export interface NeuralCallbacks {
  onReady?: () => void;
  onHover?: (cluster: number | null, label: string, x: number, y: number) => void;
  onPhaseChange?: (phase: OverlayPhase) => void;
  onClusterSelect?: (cluster: number, url: string) => void;
}

export interface NeuralSceneHandle {
  dispose: () => void;
  setRawMode: (raw: boolean) => void;
  setOverlayPhase: (phase: OverlayPhase) => void;
  getOverlayPhase: () => OverlayPhase;
}

const REDUCE_MOTION =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const CLUSTER_COUNT = 5;
const NODES_PER_CLUSTER = 16;
const NODE_COUNT = CLUSTER_COUNT * NODES_PER_CLUSTER;
const CONNECT_THRESHOLD = 2.4;
const CONNECT_CROSS_MAX = 1.15;
const NUCLEUS_RADIUS = 0.2;
const THOUGHT_RADIUS = 0.06;
const ORBIT_SPEED = 0.022;
const DRIFT = 0.0035;
const BOUNDS = { x: 2.6, y: 2.2, z: 2.2 };
const CLUSTER_RADIUS = 1.65;
const MAX_EDGES = 900;
const CURVE_SAMPLES = 6;

const CLUSTER_CENTERS: [number, number, number][] = [
  [CLUSTER_RADIUS * 0.95, 0, 0.6],
  [CLUSTER_RADIUS * 0.59, CLUSTER_RADIUS * 0.81, -0.3],
  [-CLUSTER_RADIUS * 0.59, CLUSTER_RADIUS * 0.81, 0.2],
  [-CLUSTER_RADIUS * 0.95, 0, -0.4],
  [0, -CLUSTER_RADIUS * 0.95, 0.5],
];

const CLUSTER_TITLES = ['Essays', 'About', 'Work', 'Blog', 'Contact'];
const CLUSTER_URLS = ['/essays/', '/about/', '/work/', '/blog/', '/contact/'];
const CLUSTER_RAW = [
  'model = load(embedding); index.add(vectors);',
  'constraints → invariants → feedback loops',
  'latency_p99 < 50ms; throughput 10k/s',
  'auth, billing, webhooks, docs',
  'scroll-linked camera; instanced mesh',
];

const CLUSTER_LINE_COLORS = [0xc9a227, 0xa89b6a, 0xb8a85a, 0x9a9a7a, 0xa89bb8];
const NEUTRAL_LINE = 0x5c5c6a;

interface NodePosition {
  x: number;
  y: number;
  z: number;
  cluster: number;
  angle: number;
  orbitRadius: number;
  phase: number;
  vx: number;
  vy: number;
  vz: number;
}

let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let thoughtNodes: InstancedMesh;
let nuclei: Mesh[] = [];
let lines: LineSegments;
let lineMaterial: LineBasicMaterial;
let linePositions: Float32BufferAttribute;
let lineColors: Float32BufferAttribute;
let nodePositions: NodePosition[] = [];
let rafId = 0;
let frameCount = 0;
let resizeObserver: ResizeObserver | null = null;
let matrix: Matrix4;
let quat: Quaternion;
let scrollY = 0;
let time = 0;

let raycaster: Raycaster;
let mouse: Vector2;
let hoveredInstanceId: number | null = null;
let hoveredNucleusCluster: number | null = null;
let rawMode = false;
let overlayPhase: OverlayPhase = 'closed';
let callbacks: NeuralCallbacks = {};

let flyTarget: Vector3 | null = null;
let flyStart: Vector3 | null = null;
let flyStartTime = 0;
const FLY_DURATION = 1.2;

let containerEl: HTMLElement | null = null;

const HOVER_SCALE = 1.45;
const LINE_OPACITY_IDLE = 0.32;
const LINE_OPACITY_HOVER = 0.62;
const _projVec = new Vector3();
const _color = new Color();
const _mid = new Vector3();
const _prev = new Vector3();
const _curr = new Vector3();

function initNodes(): NodePosition[] {
  const list: NodePosition[] = [];
  for (let c = 0; c < CLUSTER_COUNT; c++) {
    const [cx, cy, cz] = CLUSTER_CENTERS[c];
    for (let i = 0; i < NODES_PER_CLUSTER; i++) {
      const angle = (i / NODES_PER_CLUSTER) * Math.PI * 2 + Math.random() * 0.5;
      const orbitRadius = 0.52 + Math.random() * 0.5;
      list.push({
        x: cx + Math.cos(angle) * orbitRadius,
        y: cy + Math.sin(angle) * orbitRadius * 0.68,
        z: cz + (Math.random() - 0.5) * 0.45,
        cluster: c,
        angle,
        orbitRadius,
        phase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * DRIFT,
        vy: (Math.random() - 0.5) * DRIFT,
        vz: (Math.random() - 0.5) * DRIFT,
      });
    }
  }
  return list;
}

function hexToRgb(hex: number): [number, number, number] {
  _color.setHex(hex);
  return [_color.r, _color.g, _color.b];
}

function getEdgePairs(): Array<{ a: number; b: number; sameCluster: boolean; cluster: number }> {
  const pairs: Array<{ a: number; b: number; sameCluster: boolean; cluster: number }> = [];
  for (let i = 0; i < nodePositions.length; i++) {
    for (let j = i + 1; j < nodePositions.length; j++) {
      const a = nodePositions[i];
      const b = nodePositions[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dz = b.z - a.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const sameCluster = a.cluster === b.cluster;
      const threshold = sameCluster ? CONNECT_THRESHOLD * 1.3 : CONNECT_CROSS_MAX;
      if (d < threshold) pairs.push({ a: i, b: j, sameCluster, cluster: a.cluster });
      if (pairs.length >= MAX_EDGES) return pairs;
    }
  }
  return pairs;
}

/** Gentle curve — reuse vectors, no per-frame alloc */
function curvePoint(a: NodePosition, b: NodePosition, t: number, out: Vector3): Vector3 {
  const ax = a.x, ay = a.y, az = a.z;
  const bx = b.x, by = b.y, bz = b.z;
  out.set(ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t);
  const wobble = Math.sin(time * 0.5 + a.phase + t * 4) * 0.06;
  out.x += wobble * (a.cluster === b.cluster ? 1 : 0.4);
  out.y += wobble * 0.5;
  return out;
}

function updateLines(): void {
  const pairs = getEdgePairs();
  const segCount = pairs.length * CURVE_SAMPLES;
  const vertCount = segCount * 2;
  const posArr = linePositions.array as Float32Array;
  const colArr = lineColors.array as Float32Array;
  const lit = hoveredInstanceId !== null || hoveredNucleusCluster !== null;

  let vi = 0;
  for (const pair of pairs) {
    const a = nodePositions[pair.a];
    const b = nodePositions[pair.b];
    const [r, g, bl] = hexToRgb(pair.sameCluster ? CLUSTER_LINE_COLORS[pair.cluster] : NEUTRAL_LINE);
    curvePoint(a, b, 0, _prev);

    for (let s = 1; s <= CURVE_SAMPLES; s++) {
      const t = s / CURVE_SAMPLES;
      curvePoint(a, b, t, _curr);
      posArr[vi++] = _prev.x;
      posArr[vi++] = _prev.y;
      posArr[vi++] = _prev.z;
      posArr[vi++] = _curr.x;
      posArr[vi++] = _curr.y;
      posArr[vi++] = _curr.z;
      colArr[vi - 6] = r;
      colArr[vi - 5] = g;
      colArr[vi - 4] = bl;
      colArr[vi - 3] = r;
      colArr[vi - 2] = g;
      colArr[vi - 1] = bl;
      _prev.copy(_curr);
    }
  }

  linePositions.needsUpdate = true;
  lineColors.needsUpdate = true;
  lines.geometry.setDrawRange(0, vertCount);
  lineMaterial.opacity = lit ? LINE_OPACITY_HOVER : LINE_OPACITY_IDLE;
}

function updateInstancedMatrices(): void {
  quat.identity();
  for (let i = 0; i < nodePositions.length; i++) {
    const p = nodePositions[i];
    const scale = hoveredInstanceId === i ? HOVER_SCALE : 1;
    matrix.compose(new Vector3(p.x, p.y, p.z), quat, new Vector3(scale, scale, scale));
    thoughtNodes.setMatrixAt(i, matrix);
  }
  thoughtNodes.instanceMatrix.needsUpdate = true;
}

function setHover(instanceId: number | null, nucleusCluster: number | null): void {
  if (overlayPhase === 'flying' || overlayPhase === 'open') return;
  hoveredInstanceId = instanceId;
  hoveredNucleusCluster = nucleusCluster;

  if (instanceId === null && nucleusCluster === null) {
    callbacks.onHover?.(null, '', 0, 0);
    return;
  }

  const cluster = nucleusCluster ?? nodePositions[instanceId!].cluster;
  const label = rawMode ? CLUSTER_RAW[cluster] : CLUSTER_TITLES[cluster];
  let x = 0;
  let y = 0;
  if (containerEl && camera) {
    if (instanceId !== null) {
      const p = nodePositions[instanceId];
      _projVec.set(p.x, p.y, p.z).project(camera);
    } else {
      const [cx, cy, cz] = CLUSTER_CENTERS[cluster];
      _projVec.set(cx, cy, cz).project(camera);
    }
    x = (_projVec.x * 0.5 + 0.5) * containerEl.clientWidth;
    y = (-_projVec.y * 0.5 + 0.5) * containerEl.clientHeight;
  }
  callbacks.onHover?.(cluster, label, x, y);
}

function updatePositions(): void {
  if (REDUCE_MOTION) return;
  for (const p of nodePositions) {
    const [cx, cy, cz] = CLUSTER_CENTERS[p.cluster];
    p.angle += ORBIT_SPEED * 0.016;
    const baseX = cx + Math.cos(p.angle) * p.orbitRadius;
    const baseY = cy + Math.sin(p.angle) * p.orbitRadius * 0.5;
    const baseZ = cz;
    p.x = baseX + (p.x - baseX) * 0.98 + p.vx;
    p.y = baseY + (p.y - baseY) * 0.98 + p.vy;
    p.z = baseZ + (p.z - baseZ) * 0.98 + p.vz;
    p.x = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, p.x));
    p.y = Math.max(-BOUNDS.y, Math.min(BOUNDS.y, p.y));
    p.z = Math.max(-BOUNDS.z, Math.min(BOUNDS.z, p.z));
  }
}

function tick(): void {
  if (!renderer || !scene || !camera) return;
  time += 0.016;
  frameCount++;

  if (flyTarget && flyStart && overlayPhase === 'flying') {
    const elapsed = performance.now() / 1000 - flyStartTime;
    const t = Math.min(1, elapsed / FLY_DURATION);
    const smooth = 1 - (1 - t) * (1 - t);
    camera.position.lerpVectors(flyStart, flyTarget, smooth);
    camera.lookAt(flyTarget);
    if (t >= 1) {
      overlayPhase = 'open';
      callbacks.onPhaseChange?.('open');
      flyTarget = null;
      flyStart = null;
    }
  } else if (overlayPhase !== 'open') {
    const t = time * 0.1;
    const baseZ = Math.max(5.5, 13 - scrollY * 0.024);
    camera.position.x = Math.sin(t) * 1.15;
    camera.position.z = baseZ + Math.cos(t) * 1.15;
    camera.position.y = Math.sin(time * 0.18) * 0.65;
    camera.lookAt(0, 0, 0);
  }

  camera.updateMatrixWorld(true);
  updatePositions();
  updateInstancedMatrices();
  if (frameCount % 2 === 0) updateLines();

  renderer.render(scene, camera);
  rafId = requestAnimationFrame(tick);
}

function selectCluster(cluster: number): void {
  if (overlayPhase !== 'closed') return;
  overlayPhase = 'flying';
  callbacks.onPhaseChange?.('flying');
  const [cx, cy, cz] = CLUSTER_CENTERS[cluster];
  flyStart = camera.position.clone();
  flyTarget = new Vector3(cx + 0.5, cy, cz + 1.2);
  flyStartTime = performance.now() / 1000;
  callbacks.onClusterSelect?.(cluster, CLUSTER_URLS[cluster]);
  setHover(null, null);
}

let boundMouseMove: ((e: MouseEvent) => void) | null = null;
let boundClick: (() => void) | null = null;
let boundWheel: ((e: WheelEvent) => void) | null = null;
let onVisibility: (() => void) | null = null;

function dispose(): void {
  if (rafId) cancelAnimationFrame(rafId);
  window.removeEventListener('scroll', onScroll);
  if (renderer?.domElement) {
    if (boundMouseMove) renderer.domElement.removeEventListener('mousemove', boundMouseMove);
    if (boundClick) renderer.domElement.removeEventListener('click', boundClick);
    if (boundWheel) renderer.domElement.removeEventListener('wheel', boundWheel);
  }
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility);
  resizeObserver?.disconnect();

  thoughtNodes?.geometry.dispose();
  (thoughtNodes?.material as MeshBasicMaterial)?.dispose();
  nuclei.forEach((n) => {
    n.geometry.dispose();
    (n.material as MeshBasicMaterial).dispose();
  });
  lines?.geometry.dispose();
  lineMaterial?.dispose();
  renderer?.dispose();
}

function onScroll(): void {
  scrollY = window.scrollY ?? 0;
}

function onResize(container: HTMLElement): void {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
}

export function initNeuralScene(container: HTMLElement, cb: NeuralCallbacks = {}): NeuralSceneHandle {
  callbacks = cb;

  if (REDUCE_MOTION) {
    cb.onReady?.();
    return { dispose: () => {}, setRawMode: () => {}, setOverlayPhase: () => {}, getOverlayPhase: () => 'closed' };
  }

  scrollY = window.scrollY ?? 0;
  window.addEventListener('scroll', onScroll, { passive: true });
  containerEl = container;

  const width = container.clientWidth;
  const height = container.clientHeight;

  scene = new Scene();
  scene.background = new Color(0x0a0a0c);
  scene.fog = new Fog(0x0a0a0c, 5, 28);

  camera = new PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 0, 14);

  renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';

  nodePositions = initNodes();
  matrix = new Matrix4();
  quat = new Quaternion();

  const maxVerts = MAX_EDGES * CURVE_SAMPLES * 2;
  const lineGeo = new BufferGeometry();
  linePositions = new Float32BufferAttribute(new Float32Array(maxVerts * 3), 3);
  lineColors = new Float32BufferAttribute(new Float32Array(maxVerts * 3), 3);
  lineGeo.setAttribute('position', linePositions);
  lineGeo.setAttribute('color', lineColors);
  lineMaterial = new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: LINE_OPACITY_IDLE });
  lines = new LineSegments(lineGeo, lineMaterial);
  scene.add(lines);
  updateLines();

  const nucleusGeo = new SphereGeometry(NUCLEUS_RADIUS, 16, 12);
  const nucleusMat = new MeshBasicMaterial({ color: 0xe8e8ec, transparent: true, opacity: 0.92 });
  for (let c = 0; c < CLUSTER_COUNT; c++) {
    const [x, y, z] = CLUSTER_CENTERS[c];
    const nucleus = new Mesh(nucleusGeo.clone(), nucleusMat.clone());
    nucleus.position.set(x, y, z);
    nucleus.userData = { cluster: c };
    scene.add(nucleus);
    nuclei.push(nucleus);
  }

  thoughtNodes = new InstancedMesh(
    new SphereGeometry(THOUGHT_RADIUS, 8, 6),
    new MeshBasicMaterial({ color: 0xe8e8ec, transparent: true, opacity: 0.85 }),
    NODE_COUNT
  );
  scene.add(thoughtNodes);
  updateInstancedMatrices();

  raycaster = new Raycaster();
  mouse = new Vector2();
  const pickables = [thoughtNodes, ...nuclei];

  boundMouseMove = (e: MouseEvent) => {
    if (overlayPhase !== 'closed') return;
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(pickables, false);
    const first = hits[0] as Intersection | undefined;
    if (!first) { setHover(null, null); return; }
    if (first.object === thoughtNodes && first.instanceId != null) {
      setHover(first.instanceId, null);
      return;
    }
    const mesh = first.object as Mesh;
    if (mesh.userData?.cluster != null) setHover(null, mesh.userData.cluster as number);
    else setHover(null, null);
  };

  boundClick = () => {
    if (overlayPhase !== 'closed') return;
    const cluster = hoveredNucleusCluster ?? (hoveredInstanceId !== null ? nodePositions[hoveredInstanceId].cluster : null);
    if (cluster === null) return;
    selectCluster(cluster);
  };

  boundWheel = (e: WheelEvent) => {
    if (!e.shiftKey) return;
    e.preventDefault();
    rawMode = !rawMode;
    if (hoveredInstanceId !== null || hoveredNucleusCluster !== null) {
      const c = hoveredNucleusCluster ?? nodePositions[hoveredInstanceId!].cluster;
      const label = rawMode ? CLUSTER_RAW[c] : CLUSTER_TITLES[c];
      let x = 0;
      let y = 0;
      if (containerEl && camera) {
        if (hoveredInstanceId !== null) {
          const p = nodePositions[hoveredInstanceId];
          _projVec.set(p.x, p.y, p.z).project(camera);
        } else {
          const [cx, cy, cz] = CLUSTER_CENTERS[c];
          _projVec.set(cx, cy, cz).project(camera);
        }
        x = (_projVec.x * 0.5 + 0.5) * containerEl.clientWidth;
        y = (-_projVec.y * 0.5 + 0.5) * containerEl.clientHeight;
      }
      callbacks.onHover?.(c, label, x, y);
    }
  };

  renderer.domElement.addEventListener('mousemove', boundMouseMove);
  renderer.domElement.addEventListener('click', boundClick);
  renderer.domElement.addEventListener('wheel', boundWheel, { passive: false });

  resizeObserver = new ResizeObserver(() => onResize(container));
  resizeObserver.observe(container);

  onVisibility = () => {
    if (document.hidden) { if (rafId) cancelAnimationFrame(rafId); rafId = 0; }
    else rafId = requestAnimationFrame(tick);
  };
  document.addEventListener('visibilitychange', onVisibility);

  rafId = requestAnimationFrame(tick);
  cb.onReady?.();

  return {
    dispose,
    setRawMode: (v: boolean) => { rawMode = v; },
    setOverlayPhase: (phase: OverlayPhase) => {
      overlayPhase = phase;
      if (phase === 'closed') {
        flyTarget = null;
        flyStart = null;
        camera.position.set(0, 0, 14);
        camera.lookAt(0, 0, 0);
      }
    },
    getOverlayPhase: () => overlayPhase,
  };
}
