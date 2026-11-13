// フッターに積もるアイコンの板。アプリの色の板に、表と裏へアイコンを貼って降らせる。
// three.js 0.170.0 と cannon-es 0.20.0（どちらも MIT）。CSP が外の CDN を許さないので npm から束ねる。
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

type Thing = { mesh: THREE.Mesh; body: CANNON.Body };

/** `icon` は `/apps/<slug>/<icon>` の絶対パス（同じオリジン）。 */
export type PileItem = { color: string; icon: string };

export type Pile = { replay: () => void; destroy: () => void };

export function createPile(canvas: HTMLCanvasElement, zone: HTMLElement, items: PileItem[]): Pile {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const isSmall = () => matchMedia("(max-width: 640px)").matches;
  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)] as T;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xdceeff, 1.0));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-8, 24, 10);
  sun.castShadow = true;
  const small0 = matchMedia("(max-width: 640px)").matches;
  sun.shadow.mapSize.set(small0 ? 1024 : 2048, small0 ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30 });
  sun.shadow.radius = 4;
  scene.add(sun);

  const shadowMat = new THREE.ShadowMaterial({ opacity: 0.18 });
  const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), shadowMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  // アイコンは 256px へ縮めてから GPU へ上げる（同じオリジンの画像だけ。外へは出ない）
  let destroyed = false;
  const ICON_PX = 256;
  const textures: THREE.Texture[] = [];
  const kinds = items.map((item) => {
    const iconCanvas = document.createElement("canvas");
    iconCanvas.width = iconCanvas.height = ICON_PX;
    const tex = new THREE.CanvasTexture(iconCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    textures.push(tex);
    const img = new Image();
    img.onload = () => {
      if (destroyed) return;
      iconCanvas.getContext("2d")?.drawImage(img, 0, 0, ICON_PX, ICON_PX);
      tex.needsUpdate = true;
      if (!running) renderer.render(scene, camera);
    };
    img.src = item.icon;
    return {
      body: new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.45, metalness: 0 }),
      face: new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }),
    };
  });
  const materials = kinds.flatMap((k) => [k.body, k.face]);

  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -30, 0) });
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = true;
  const mat = new CANNON.Material("thing");
  world.addContactMaterial(new CANNON.ContactMaterial(mat, mat, { friction: 0.5, restitution: 0.12 }));
  world.defaultContactMaterial.friction = 0.5;
  world.defaultContactMaterial.restitution = 0.12;
  const floorBody = new CANNON.Body({ mass: 0, material: mat, shape: new CANNON.Plane() });
  floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(floorBody);

  // 画面に見えている床の範囲（四隅から床へ光線を飛ばして求める）
  const bounds = { xMin: -10, xMax: 10, zMin: -8, zMax: 8 };
  let walls: CANNON.Body[] = [];
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const ray = new THREE.Raycaster();
  function floorPoint(nx: number, ny: number) {
    ray.setFromCamera(new THREE.Vector2(nx, ny), camera);
    const p = new THREE.Vector3();
    ray.ray.intersectPlane(groundPlane, p);
    return p;
  }
  function rebuildWalls() {
    // 奥の壁は画面の上から 1/4 の所に置き、フッターの文字の上へ物が転がらないようにする
    const bl = floorPoint(-1, -1), br = floorPoint(1, -1), tl = floorPoint(-1, 0.5);
    bounds.xMin = bl.x + 0.6; bounds.xMax = br.x - 0.6;
    bounds.zMax = bl.z - 0.5; bounds.zMin = tl.z + 0.5;
    for (const w of walls) world.removeBody(w);
    walls = [];
    const add = (x: number, z: number, ex: number, ey: number) => {
      const b = new CANNON.Body({ mass: 0, material: mat, shape: new CANNON.Plane() });
      b.position.set(x, 0, z);
      b.quaternion.setFromEuler(ex, ey, 0);
      world.addBody(b);
      walls.push(b);
    };
    add(bounds.xMin, 0, 0, Math.PI / 2);
    add(bounds.xMax, 0, 0, -Math.PI / 2);
    add(0, bounds.zMax, 0, Math.PI);
    add(0, bounds.zMin, 0, 0);
  }

  const things: Thing[] = [];
  // 板の台は厚みごとに 1 つ（縦横 1 の単位形）。大きさは mesh の scale で変える
  const boxGeoCache = new Map<number, RoundedBoxGeometry>();
  const boxGeo = (t: number) => {
    let g = boxGeoCache.get(t);
    if (!g) { g = new RoundedBoxGeometry(1, t, 1, 4, t * 0.22); boxGeoCache.set(t, g); }
    return g;
  };
  const faceGeo = new THREE.PlaneGeometry(1, 1);

  function spawnOne(yMin = 6, yMax = 12) {
    const scale = isSmall() ? 0.9 : 1;
    const kind = pick(kinds);
    // アイコンの板: アプリの色の台に、表と裏の両方へアイコンを貼る（裏返っても分かる）
    const s = rand(1.7, 2.3) * scale, t = 0.42 * scale;
    const mesh = new THREE.Mesh(boxGeo(t), kind.body);
    mesh.scale.set(s, 1, s);
    for (const side of [1, -1]) {
      const face = new THREE.Mesh(faceGeo, kind.face);
      face.scale.set(0.84, 0.84, 1);
      face.rotation.x = -side * Math.PI / 2;
      face.position.y = side * (t / 2 + 0.003);
      mesh.add(face);
    }
    const body = new CANNON.Body({ mass: s * s * t, material: mat, shape: new CANNON.Box(new CANNON.Vec3(s / 2, t / 2, s / 2)) });
    mesh.castShadow = true; mesh.receiveShadow = true;
    // 文字のある上のほうを空けて、手前（画面の下）と左右に寄せて落とす
    const xSpan = bounds.xMax - bounds.xMin;
    const xEdge = Math.random() < 0.5
      ? rand(bounds.xMin + 1, bounds.xMin + xSpan * 0.34)
      : rand(bounds.xMax - xSpan * 0.34, bounds.xMax - 1);
    const x = Math.random() < 0.12 ? rand(bounds.xMin + 1, bounds.xMax - 1) : xEdge;
    const zSpan = bounds.zMax - bounds.zMin;
    body.position.set(x, rand(yMin, yMax), rand(bounds.zMin + zSpan * 0.6, bounds.zMax - 1));
    body.quaternion.setFromEuler(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
    body.angularVelocity.set(rand(-2.5, 2.5), rand(-2.5, 2.5), rand(-2.5, 2.5));
    body.linearDamping = 0.05; body.angularDamping = 0.1;
    body.sleepSpeedLimit = 0.15; body.sleepTimeLimit = 0.6;
    world.addBody(body); scene.add(mesh);
    things.push({ mesh, body });
  }

  function clearAll() {
    for (const t of things) { world.removeBody(t.body); scene.remove(t.mesh); }
    things.length = 0;
  }
  function syncMeshes() {
    for (const { mesh, body } of things) {
      mesh.position.set(body.position.x, body.position.y, body.position.z);
      mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
    }
  }

  const total = () => (isSmall() ? 18 : 34);
  // 降り終えてから SETTLE_SECONDS 経っても眠らない板は、止めて眠らせる
  const SETTLE_SECONDS = 6;
  let idleTime = 0;
  let toSpawn = 0, spawnTimer = 0, running = false, visible = false, raf = 0, last = 0, started = false;
  const allAsleep = () => things.every((t) => t.body.sleepState === CANNON.Body.SLEEPING);

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (toSpawn > 0) {
      spawnTimer -= dt;
      while (spawnTimer <= 0 && toSpawn > 0) { spawnOne(); toSpawn--; spawnTimer += isSmall() ? 0.07 : 0.045; }
    }
    world.step(1 / 60, dt, 4);
    syncMeshes();
    renderer.render(scene, camera);
    if (toSpawn === 0) {
      idleTime += dt;
      if (allAsleep() || idleTime >= SETTLE_SECONDS) {
        for (const t of things) t.body.sleep();
        running = false;
        return;
      }
    }
    raf = requestAnimationFrame(frame);
  }
  function wake() {
    if (running || !visible || !started || reduceMotion.matches) return;
    running = true; idleTime = 0; last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function sleep() { cancelAnimationFrame(raf); running = false; }

  // 動きを減らす設定: 一度に計算して、積もったあとの 1 枚だけを描く
  function drawSettled() {
    clearAll();
    for (let i = 0; i < total(); i++) spawnOne(4, 20);
    for (let i = 0; i < 240; i++) world.step(1 / 60);
    syncMeshes();
    renderer.render(scene, camera);
  }
  function start() {
    started = true;
    if (reduceMotion.matches) { drawSettled(); return; }
    clearAll(); toSpawn = total(); spawnTimer = 0; idleTime = 0; wake();
  }

  function applyTheme() {
    shadowMat.opacity = document.documentElement.dataset.theme === "dark" ? 0.4 : 0.18;
    if (!running) renderer.render(scene, camera);
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tall = w / h < 0.8;
    camera.position.set(0, tall ? 52 : 34, tall ? 12 : 9);
    camera.lookAt(0, 0, 0.5);
    camera.updateProjectionMatrix();
    rebuildWalls();
    for (const t of things) t.body.wakeUp();
    if (!running) renderer.render(scene, camera);
    wake();
  }
  // カメラと壁を先に決めておく。降り始めが ResizeObserver より先に来ると、床の範囲が求まらない
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const io = new IntersectionObserver(([e]) => {
    if (!e) return;
    visible = e.isIntersecting;
    if (visible && !started && e.intersectionRatio >= 0.35) start();
    if (visible) wake(); else sleep();
  }, { threshold: [0, 0.35] });
  io.observe(zone);

  // クリック（タップ）したところのまわりの物を跳ね上げる
  function onPointerDown(e: PointerEvent) {
    if (reduceMotion.matches) return;
    const target = e.target as Element | null;
    if (target?.closest("a, button, summary, details[open]")) return;
    const r = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const p = new THREE.Vector3();
    if (!ray.ray.intersectPlane(groundPlane, p)) return;
    for (const { body } of things) {
      const dx = body.position.x - p.x, dz = body.position.z - p.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 5) continue;
      const k = (1 - dist / 5) * body.mass;
      body.wakeUp();
      body.applyImpulse(new CANNON.Vec3((dx / (dist || 1)) * 6 * k, 14 * k, (dz / (dist || 1)) * 6 * k));
      body.angularVelocity.set(rand(-6, 6), rand(-6, 6), rand(-6, 6));
    }
    idleTime = 0;
    wake();
  }
  zone.addEventListener("pointerdown", onPointerDown);

  const onMotionChange = () => { sleep(); if (started) start(); };
  reduceMotion.addEventListener("change", onMotionChange);
  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  applyTheme();

  return {
    replay: start,
    destroy() {
      destroyed = true;
      sleep();
      ro.disconnect(); io.disconnect(); themeObserver.disconnect();
      zone.removeEventListener("pointerdown", onPointerDown);
      reduceMotion.removeEventListener("change", onMotionChange);
      clearAll();
      for (const g of boxGeoCache.values()) g.dispose();
      faceGeo.dispose();
      for (const tx of textures) tx.dispose();
      for (const m of materials) m.dispose();
      shadowMat.dispose();
      floorMesh.geometry.dispose();
      sun.shadow.map?.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
    },
  };
}
