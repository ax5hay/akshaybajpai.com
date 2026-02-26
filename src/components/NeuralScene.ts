/**
 * Neural constellation: 5 clusters with hover (expand, title, dim, lines intensify),
 * click (camera fly + full-screen overlay), cursor halo, and Raw Mode (Shift+scroll).
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
  Vector2,
  Matrix4,
  Quaternion,
  Mesh,
  Raycaster,
  type Intersection,
} from 'three';

const REDUCE_MOTION =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const CLUSTER_COUNT = 5;
const NODES_PER_CLUSTER = 22;
const NODE_COUNT = CLUSTER_COUNT * NODES_PER_CLUSTER;
const CONNECT_THRESHOLD = 2.2;
const NUCLEUS_RADIUS = 0.22;
const THOUGHT_RADIUS = 0.06;
const FOG_NEAR = 6;
const FOG_FAR = 32;
const ORBIT_SPEED = 0.04;
const DRIFT = 0.015;

// Cluster centers — spread in 3D (AI Infra, Systems Thinking, Perf Eng, Product & SaaS, Experimental UI)
const CLUSTER_CENTERS: [number, number, number][] = [
  [-2.8, 0.8, 1.5],
  [2.2, -0.6, 2],
  [0, 2.2, -1.8],
  [2.5, 0.5, 0.5],
  [-1.8, -1.8, -0.8],
];

const CLUSTER_TITLES = ['Essays', 'About', 'Work', 'Blog', 'Contact'];

const CLUSTER_URLS = ['/essays', '/about', '/work', '/blog', '/contact'];

const CLUSTER_RAW_SNIPPETS = [
  'model = load(embedding); index.add(vectors);',
  'constraints → invariants → feedback loops',
  'latency_p99 < 50ms; throughput 10k/s',
  'auth, billing, webhooks, docs',
  'scroll-linked camera; instanced mesh',
];

interface NodePosition {
  x: number;
  y: number;
  z: number;
  cluster: number;
  angle: number;
  orbitRadius: number;
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
let nodePositions: NodePosition[] = [];
let rafId = 0;
let resizeObserver: ResizeObserver;
let matrix: Matrix4;
let quat: Quaternion;
let scrollY = 0;

// Interaction state
let raycaster: Raycaster;
let mouse: Vector2;
let hoveredInstanceId: number | null = null;
let hoveredNucleusCluster: number | null = null;
let dimOverlay: HTMLElement | null = null;
let labelEl: HTMLElement | null = null;
let overlayEl: HTMLElement | null = null;
let haloEl: HTMLElement | null = null;
let rawMode = false;
let haloX = 0;
let haloY = 0;
let mouseX = 0;
let mouseY = 0;
let flyTarget: { x: number; y: number; z: number } | null = null;
let flyStart: { x: number; y: number; z: number } | null = null;
let flyStartTime = 0;
const FLY_DURATION = 1.2;
let containerEl: HTMLElement | null = null;
const HOVER_SCALE = 1.5;
const LINE_OPACITY_IDLE = 0.35;
const LINE_OPACITY_HOVER = 0.7;
const HALO_SIZE_IDLE = 80;
const HALO_SIZE_NEAR = 140;
const NODE_SCREEN_RADIUS = 24;

function initNodes(): NodePosition[] {
  const list: NodePosition[] = [];
  for (let c = 0; c < CLUSTER_COUNT; c++) {
    const [cx, cy, cz] = CLUSTER_CENTERS[c];
    for (let i = 0; i < NODES_PER_CLUSTER; i++) {
      const angle = (i / NODES_PER_CLUSTER) * Math.PI * 2 + Math.random() * 0.5;
      const orbitRadius = 0.8 + Math.random() * 1.2;
      const x = cx + Math.cos(angle) * orbitRadius + (Math.random() - 0.5) * 0.3;
      const y = cy + Math.sin(angle) * orbitRadius * 0.6 + (Math.random() - 0.5) * 0.3;
      const z = cz + (Math.random() - 0.5) * 0.6;
      list.push({
        x, y, z,
        cluster: c,
        angle,
        orbitRadius,
        vx: (Math.random() - 0.5) * 0.008,
        vy: (Math.random() - 0.5) * 0.008,
        vz: (Math.random() - 0.5) * 0.008,
      });
    }
  }
  return list;
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
      const sameCluster = a.cluster === b.cluster ? 1.4 : 1;
      if (d < CONNECT_THRESHOLD * sameCluster) {
        pairs.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(pairs, 3));
  return geo;
}

function updateInstancedMatrices(): void {
  if (!thoughtNodes || !matrix || !quat) return;
  quat.identity();
  for (let i = 0; i < nodePositions.length; i++) {
    const p = nodePositions[i];
    const scale = hoveredInstanceId === i ? HOVER_SCALE : 1;
    matrix.compose(
      new Vector3(p.x, p.y, p.z),
      quat,
      new Vector3(scale, scale, scale)
    );
    thoughtNodes.setMatrixAt(i, matrix);
  }
  thoughtNodes.instanceMatrix.needsUpdate = true;
}

function updateLines(): void {
  if (!lines) return;
  lines.geometry.dispose();
  lines.geometry = buildEdgeGeometry(nodePositions);
}

function setHovered(instanceId: number | null, nucleusCluster: number | null): void {
  const was = hoveredInstanceId !== null || hoveredNucleusCluster !== null;
  hoveredInstanceId = instanceId;
  hoveredNucleusCluster = nucleusCluster;
  const isHovered = instanceId !== null || nucleusCluster !== null;
  if (lineMaterial) lineMaterial.opacity = isHovered ? LINE_OPACITY_HOVER : LINE_OPACITY_IDLE;
  if (dimOverlay) dimOverlay.classList.toggle('active', isHovered);
  if (labelEl) {
    if (isHovered) {
      const cluster = nucleusCluster !== null ? nucleusCluster : (instanceId !== null ? nodePositions[instanceId].cluster : 0);
      labelEl.textContent = rawMode ? CLUSTER_RAW_SNIPPETS[cluster] : CLUSTER_TITLES[cluster];
      labelEl.style.display = 'block';
    } else {
      labelEl.style.display = 'none';
    }
  }
}

function updatePositions(): void {
  if (REDUCE_MOTION) return;
  const now = Date.now() * 0.001;
  for (const p of nodePositions) {
    const [cx, cy, cz] = CLUSTER_CENTERS[p.cluster];
    p.angle += ORBIT_SPEED * 0.016;
    const baseX = cx + Math.cos(p.angle) * p.orbitRadius;
    const baseY = cy + Math.sin(p.angle) * p.orbitRadius * 0.6;
    const baseZ = cz;
    p.x = baseX + (p.x - baseX) * 0.98 + p.vx;
    p.y = baseY + (p.y - baseY) * 0.98 + p.vy;
    p.z = baseZ + (p.z - baseZ) * 0.98 + p.vz;
  }
}

const _projVec = new Vector3();

function updateLabelPosition(): void {
  if (!labelEl || !containerEl || !camera) return;
  let x = 0;
  let y = 0;
  if (hoveredInstanceId !== null && nodePositions[hoveredInstanceId]) {
    const p = nodePositions[hoveredInstanceId];
    _projVec.set(p.x, p.y, p.z).project(camera);
  } else if (hoveredNucleusCluster !== null && CLUSTER_CENTERS[hoveredNucleusCluster]) {
    const [cx, cy, cz] = CLUSTER_CENTERS[hoveredNucleusCluster];
    _projVec.set(cx, cy, cz).project(camera);
  } else return;
  const w = containerEl.clientWidth;
  const h = containerEl.clientHeight;
  x = (_projVec.x * 0.5 + 0.5) * w;
  y = (-_projVec.y * 0.5 + 0.5) * h;
  labelEl.style.left = `${x}px`;
  labelEl.style.top = `${y}px`;
  labelEl.style.transform = `translate(-50%, -50%)`;
}

function tick(): void {
  if (!renderer || !scene || !camera) return;

  const now = Date.now() * 0.001;

  // Fly-to animation
  if (flyTarget && flyStart) {
    const elapsed = now - flyStartTime;
    const t = Math.min(1, elapsed / FLY_DURATION);
    const smooth = 1 - (1 - t) * (1 - t);
    camera.position.x = flyStart.x + (flyTarget.x - flyStart.x) * smooth;
    camera.position.y = flyStart.y + (flyTarget.y - flyStart.y) * smooth;
    camera.position.z = flyStart.z + (flyTarget.z - flyStart.z) * smooth;
    camera.lookAt(flyTarget.x, flyTarget.y, flyTarget.z);
    if (t >= 1) {
      flyTarget = null;
      flyStart = null;
      if (overlayEl) {
        overlayEl.classList.add('active');
      }
    }
  } else {
    const t = now * 0.12;
    const baseZ = Math.max(6, 14 - scrollY * 0.012);
    const orbitR = 1.2;
    camera.position.x = Math.sin(t) * orbitR;
    camera.position.z = baseZ + Math.cos(t) * orbitR;
    camera.position.y = Math.sin(now * 0.2) * 0.8;
    camera.lookAt(0, 0, 0);
  }

  camera.updateMatrixWorld(true);
  updatePositions();
  updateInstancedMatrices();
  updateLines();
  updateLabelPosition();

  // Halo follow (smooth) and expand near nodes
  if (haloEl && containerEl) {
    const dx = mouseX - haloX;
    const dy = mouseY - haloY;
    haloX += dx * 0.12;
    haloY += dy * 0.12;
    haloEl.style.left = `${haloX}px`;
    haloEl.style.top = `${haloY}px`;
    const nearNode = hoveredInstanceId !== null || hoveredNucleusCluster !== null;
    const size = nearNode ? HALO_SIZE_NEAR : HALO_SIZE_IDLE;
    haloEl.style.width = `${size}px`;
    haloEl.style.height = `${size}px`;
    haloEl.style.marginLeft = `${-size / 2}px`;
    haloEl.style.marginTop = `${-size / 2}px`;
  }

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

function onScroll(): void {
  scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
}

let boundMouseMove: ((e: MouseEvent) => void) | null = null;
let boundMouseClick: (() => void) | null = null;
let boundWheel: ((e: WheelEvent) => void) | null = null;

function dispose(): void {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  window.removeEventListener('scroll', onScroll, { passive: true });
  if (renderer?.domElement) {
    if (boundMouseMove) renderer.domElement.removeEventListener('mousemove', boundMouseMove as EventListener);
    if (boundMouseClick) renderer.domElement.removeEventListener('click', boundMouseClick);
    if (boundWheel) renderer.domElement.removeEventListener('wheel', boundWheel);
  }
  overlayEl?.classList.remove('active');
  overlayEl?.remove();
  overlayEl = null;
  dimOverlay?.remove();
  dimOverlay = null;
  labelEl?.remove();
  labelEl = null;
  haloEl?.remove();
  haloEl = null;
  containerEl = null;
  if (thoughtNodes) {
    thoughtNodes.geometry.dispose();
    (thoughtNodes.material as MeshBasicMaterial).dispose();
  }
  nuclei.forEach((m) => {
    m.geometry.dispose();
    (m.material as MeshBasicMaterial).dispose();
  });
  nuclei = [];
  if (lines) {
    lines.geometry.dispose();
    (lines.material as LineBasicMaterial).dispose();
  }
  lineMaterial = null!;
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
      scrollY = window.scrollY ?? 0;
      window.addEventListener('scroll', onScroll, { passive: true });

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

      // Nucleus per cluster — larger, slightly glowing
      const nucleusGeo = new SphereGeometry(NUCLEUS_RADIUS, 20, 16);
      const nucleusMat = new MeshBasicMaterial({
        color: 0xe8e8ec,
        transparent: true,
        opacity: 0.95,
      });
      for (let c = 0; c < CLUSTER_COUNT; c++) {
        const [x, y, z] = CLUSTER_CENTERS[c];
        const nucleus = new Mesh(nucleusGeo.clone(), nucleusMat.clone());
        nucleus.position.set(x, y, z);
        scene.add(nucleus);
        nuclei.push(nucleus);
      }

      const thoughtGeo = new SphereGeometry(THOUGHT_RADIUS, 10, 8);
      const thoughtMat = new MeshBasicMaterial({
        color: 0xe8e8ec,
        transparent: true,
        opacity: 0.8,
      });
      thoughtNodes = new InstancedMesh(thoughtGeo, thoughtMat, NODE_COUNT);
      scene.add(thoughtNodes);
      updateInstancedMatrices();

      const lineGeo = buildEdgeGeometry(nodePositions);
      lineMaterial = new LineBasicMaterial({
        color: 0xc9a227,
        transparent: true,
        opacity: LINE_OPACITY_IDLE,
      });
      lines = new LineSegments(lineGeo, lineMaterial);
      scene.add(lines);

      containerEl = container;
      raycaster = new Raycaster();
      mouse = new Vector2();

      // DOM overlays: dim, label, fullscreen overlay, cursor halo
      dimOverlay = document.createElement('div');
      dimOverlay.className = 'neural-dim-overlay';
      dimOverlay.setAttribute('aria-hidden', 'true');
      container.appendChild(dimOverlay);

      labelEl = document.createElement('div');
      labelEl.className = 'neural-node-label';
      labelEl.style.cssText = 'position:absolute;pointer-events:none;display:none;white-space:nowrap;font-family:var(--font-serif),serif;font-size:clamp(14px,1.8vw,20px);color:rgba(232,232,236,0.95);text-shadow:0 0 20px rgba(0,0,0,0.8);z-index:5;';
      container.appendChild(labelEl);

      overlayEl = document.createElement('div');
      overlayEl.className = 'neural-fullscreen-overlay';
      overlayEl.innerHTML = '<div class="neural-overlay-inner"><button type="button" class="neural-overlay-back" aria-label="Back to intro">×</button><button type="button" class="neural-overlay-close" aria-label="Close">×</button><iframe class="neural-overlay-iframe" title="Content"></iframe></div>';
      const backBtn = overlayEl.querySelector('.neural-overlay-back');
      const closeBtn = overlayEl.querySelector('.neural-overlay-close');
      const iframe = overlayEl.querySelector('.neural-overlay-iframe') as HTMLIFrameElement;
      const closeOverlay = (): void => {
        overlayEl?.classList.remove('active');
        if (iframe) iframe.src = 'about:blank';
        setHovered(null, null);
        flyTarget = null;
        flyStart = null;
      };
      backBtn?.addEventListener('click', () => {
        if (iframe) iframe.src = '/hero-placard';
      });
      closeBtn?.addEventListener('click', closeOverlay);
      document.body.appendChild(overlayEl);

      haloEl = document.createElement('div');
      haloEl.className = 'neural-cursor-halo';
      haloEl.setAttribute('aria-hidden', 'true');
      container.appendChild(haloEl);
      haloX = container.clientWidth / 2;
      haloY = container.clientHeight / 2;

      // Inject overlay and halo styles once
      if (!document.getElementById('neural-interaction-styles')) {
        const style = document.createElement('style');
        style.id = 'neural-interaction-styles';
        style.textContent = `
          .neural-dim-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.5);pointer-events:none;z-index:2;opacity:0;transition:opacity 0.35s ease;}
          .neural-dim-overlay.active{opacity:1;}
          .neural-fullscreen-overlay{position:fixed;inset:0;z-index:1000;display:none;opacity:0;transition:opacity 0.5s cubic-bezier(0.16,1,0.3,1);}
          .neural-fullscreen-overlay.active{display:block;opacity:1;}
          .neural-fullscreen-overlay::before{content:'';position:absolute;inset:0;background:rgba(10,10,12,0.4);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);pointer-events:none;}
          .neural-overlay-inner{position:absolute;inset:0;padding:var(--space-8);box-sizing:border-box;}
          .neural-overlay-back{position:absolute;top:var(--space-4);right:calc(var(--space-4) + 52px);width:44px;height:44px;border:none;background:rgba(255,255,255,0.08);color:var(--color-text);font-size:28px;line-height:1;cursor:pointer;border-radius:4px;z-index:10;}
          .neural-overlay-back:hover{background:rgba(255,255,255,0.12);}
          .neural-overlay-close{position:absolute;top:var(--space-4);right:var(--space-4);width:44px;height:44px;border:none;background:rgba(255,255,255,0.08);color:var(--color-text);font-size:28px;line-height:1;cursor:pointer;border-radius:4px;z-index:10;}
          .neural-overlay-close:hover{background:rgba(255,255,255,0.12);}
          .neural-overlay-iframe{width:100%;height:100%;border:none;background:rgba(10,10,12,0.85);}
          .neural-cursor-halo{position:absolute;pointer-events:none;z-index:1;border-radius:50%;background:radial-gradient(circle,rgba(201,162,39,0.12) 0%,transparent 70%);width:80px;height:80px;margin-left:-40px;margin-top:-40px;transition:width 0.2s,height 0.2s;}
        `;
        document.head.appendChild(style);
      }

      // Nucleus userData for raycaster
      nuclei.forEach((n, c) => {
        n.userData = { cluster: c };
      });

      const allPickables = [thoughtNodes, ...nuclei];

      const onMouseMove = (e: MouseEvent): void => {
        const rect = container.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        mouse.x = (mouseX / rect.width) * 2 - 1;
        mouse.y = -(mouseY / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits: Intersection[] = raycaster.intersectObjects(allPickables, false);
        const first = hits[0];
        if (!first) {
          setHovered(null, null);
          return;
        }
        if (first.object === thoughtNodes && first.instanceId != null) {
          setHovered(first.instanceId, null);
          return;
        }
        const mesh = first.object as Mesh;
        if (mesh.userData?.cluster != null) {
          setHovered(null, mesh.userData.cluster as number);
          return;
        }
        setHovered(null, null);
      };

      const onMouseClick = (): void => {
        const cluster = hoveredNucleusCluster !== null ? hoveredNucleusCluster : (hoveredInstanceId !== null ? nodePositions[hoveredInstanceId].cluster : null);
        if (cluster === null) return;
        const [cx, cy, cz] = CLUSTER_CENTERS[cluster];
        flyStart = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
        flyTarget = { x: cx + 0.5, y: cy, z: cz + 1.2 };
        flyStartTime = Date.now() * 0.001;
        const url = CLUSTER_URLS[cluster];
        if (iframe) iframe.src = url;
      };

      const onWheel = (e: WheelEvent): void => {
        if (e.shiftKey) {
          e.preventDefault();
          rawMode = !rawMode;
          if (hoveredInstanceId !== null || hoveredNucleusCluster !== null) {
            const c = hoveredNucleusCluster !== null ? hoveredNucleusCluster : nodePositions[hoveredInstanceId!].cluster;
            if (labelEl) labelEl.textContent = rawMode ? CLUSTER_RAW_SNIPPETS[c] : CLUSTER_TITLES[c];
          }
        }
      };

      boundMouseMove = onMouseMove;
      boundMouseClick = onMouseClick;
      boundWheel = onWheel;
      renderer.domElement.addEventListener('mousemove', onMouseMove as EventListener);
      renderer.domElement.addEventListener('click', onMouseClick);
      renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

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
