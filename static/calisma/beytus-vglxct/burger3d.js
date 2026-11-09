// Beytuş 3B burger: koddan modellenmiş katlar (Three.js), kaydırdıkça dağılır, havada dizilir ve yeniden birleşir.
// Sahne: .sahne3d (uzun bölüm) içinde .sahne3d-sabit (ekrana yapışık). Kaydırma ilerlemesi 0→1 yumuşak takip edilir.
import * as THREE from "three";
import { RoomEnvironment } from "./lib3/RoomEnvironment.js";

const bolum = document.querySelector(".sahne3d");
const tuval = document.querySelector(".sahne3d canvas");
const azHareket = matchMedia("(prefers-reduced-motion: reduce)").matches;
const test = location.hash.match(/^#y=(\d+)/);

// ---------- yardımcılar ----------
const kesir = (x) => x - Math.floor(x);
const ozet = (n) => kesir(Math.sin(n * 127.1 + 311.7) * 43758.5453);
function gurultu(x, y = 0) { // basit değer gürültüsü (0..1)
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const s = (t) => t * t * (3 - 2 * t);
  const a = ozet(xi + yi * 57), b = ozet(xi + 1 + yi * 57), c = ozet(xi + (yi + 1) * 57), d = ozet(xi + 1 + (yi + 1) * 57);
  return a + (b - a) * s(xf) + (c - a) * s(yf) + (a - b - c + d) * s(xf) * s(yf);
}
const sinirla = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const yumusak = (x) => { x = sinirla(x); return x * x * (3 - 2 * x); };
const icDis = (x) => { x = sinirla(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const geriCik = (x) => { x = sinirla(x); const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const karis = (a, b, t) => a + (b - a) * t;

function tuvalDoku(w, h, ciz) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  ciz(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function benekler(g, w, h, adet, renkler, rMin, rMax) {
  for (let i = 0; i < adet; i++) {
    g.fillStyle = renkler[i % renkler.length];
    g.globalAlpha = 0.25 + ozet(i * 3.1) * 0.6;
    g.beginPath(); g.ellipse(ozet(i * 1.7) * w, ozet(i * 2.3) * h, rMin + ozet(i * 4.1) * (rMax - rMin), rMin + ozet(i * 5.3) * (rMax - rMin), ozet(i) * 3, 0, 7); g.fill();
  }
  g.globalAlpha = 1;
}

// ---------- dokular (koddan çizilir, dosya indirilmez) ----------
const icEkmekDoku = tuvalDoku(512, 512, (g, w, h) => {
  const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
  gr.addColorStop(0, "#f6dfb3"); gr.addColorStop(0.8, "#efcd92"); gr.addColorStop(1, "#c9853f");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  benekler(g, w, h, 900, ["#e2b778", "#fff0d2", "#d9a565"], 1, 4);
});
const kofteDoku = tuvalDoku(1024, 512, (g, w, h) => {
  g.fillStyle = "#4a2414"; g.fillRect(0, 0, w, h);
  benekler(g, w, h, 2600, ["#6b3720", "#2e140a", "#8a4a2a", "#3b1b0e"], 2, 9);
  benekler(g, w, h, 500, ["#a8653c", "#1c0b05"], 1, 3);
});
const domatesDoku = tuvalDoku(512, 512, (g, w, h) => {
  const m = w / 2;
  g.fillStyle = "#c4251a"; g.fillRect(0, 0, w, h);
  g.fillStyle = "#e0402f"; g.beginPath(); g.arc(m, m, m * 0.92, 0, 7); g.fill();
  for (let i = 0; i < 6; i++) { // çekirdek odaları
    const a = (i / 6) * Math.PI * 2;
    g.fillStyle = "#f2795c"; g.beginPath(); g.ellipse(m + Math.cos(a) * m * 0.48, m + Math.sin(a) * m * 0.48, m * 0.26, m * 0.17, a, 0, 7); g.fill();
    for (let k = 0; k < 7; k++) { g.fillStyle = "#f8e3a6"; g.beginPath(); g.ellipse(m + Math.cos(a) * m * (0.36 + k * 0.035), m + Math.sin(a) * m * (0.42 + (k % 2) * 0.12), 5, 3, a, 0, 7); g.fill(); }
  }
  g.fillStyle = "#d63a2a"; g.beginPath(); g.arc(m, m, m * 0.16, 0, 7); g.fill();
});
const tursuDoku = tuvalDoku(256, 256, (g, w, h) => {
  const m = w / 2;
  g.fillStyle = "#58731c"; g.fillRect(0, 0, w, h);
  g.fillStyle = "#9db84a"; g.beginPath(); g.arc(m, m, m * 0.86, 0, 7); g.fill();
  g.fillStyle = "#c4d77a"; g.beginPath(); g.arc(m, m, m * 0.5, 0, 7); g.fill();
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; g.fillStyle = "#eef0c8"; g.beginPath(); g.ellipse(m + Math.cos(a) * m * 0.32, m + Math.sin(a) * m * 0.32, 7, 4, a, 0, 7); g.fill(); }
});

// ---------- malzemeler ----------
const M = {
  ekmek: new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.45, sheen: 0.5, sheenRoughness: 0.6, sheenColor: new THREE.Color("#ffc27a") }),
  icEkmek: new THREE.MeshStandardMaterial({ map: icEkmekDoku, bumpMap: icEkmekDoku, bumpScale: 1.2, roughness: 0.9 }),
  susam: new THREE.MeshStandardMaterial({ color: "#f6e8c6", roughness: 0.45 }),
  sos: new THREE.MeshPhysicalMaterial({ color: "#f4ead7", roughness: 0.22, clearcoat: 0.9, clearcoatRoughness: 0.15 }),
  marul: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, side: THREE.DoubleSide }),
  domatesYan: new THREE.MeshPhysicalMaterial({ color: "#c62a1e", roughness: 0.3, clearcoat: 0.8 }),
  domatesKesit: new THREE.MeshPhysicalMaterial({ map: domatesDoku, roughness: 0.28, clearcoat: 0.7 }),
  kofte: new THREE.MeshStandardMaterial({ map: kofteDoku, bumpMap: kofteDoku, bumpScale: 4, roughness: 0.72, color: "#d9c2b5" }),
  cheddar: new THREE.MeshPhysicalMaterial({ color: "#ff9f0a", roughness: 0.33, clearcoat: 0.35, side: THREE.DoubleSide, sheen: 0.3, sheenColor: new THREE.Color("#ffe08a") }),
  sogan: new THREE.MeshPhysicalMaterial({ color: "#b3612a", roughness: 0.28, clearcoat: 0.6 }),
  tursuYan: new THREE.MeshStandardMaterial({ color: "#5f7d1f", roughness: 0.4 }),
  tursuKesit: new THREE.MeshStandardMaterial({ map: tursuDoku, roughness: 0.35 }),
  kurdan: new THREE.MeshStandardMaterial({ color: "#e3c48a", roughness: 0.7 }),
};

// ---------- parçalar ----------
function ekmekProfil(noktalar, bolme) {
  return new THREE.SplineCurve(noktalar.map(([x, y]) => new THREE.Vector2(x, y))).getPoints(bolme);
}
function ekmekRenk(geo, altRenk, ustRenk, yMin, yMax) {
  const p = geo.attributes.position, renk = new Float32Array(p.count * 3), a = new THREE.Color(altRenk), b = new THREE.Color(ustRenk), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), t = sinirla((y - yMin) / (yMax - yMin));
    c.copy(a).lerp(b, Math.pow(t, 0.8));
    const n = (gurultu(x * 6 + 3, z * 6) - 0.5) * 0.12; c.offsetHSL(0, 0, n);
    renk.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(renk, 3));
}
function altEkmek() {
  const g = new THREE.Group();
  const prof = ekmekProfil([[0, 0], [0.8, 0], [0.98, 0.02], [1.07, 0.09], [1.1, 0.18], [1.07, 0.27], [1.0, 0.33], [0.94, 0.355]], 40);
  const geo = new THREE.LatheGeometry(prof, 120); ekmekRenk(geo, "#9a4c17", "#d98a3a", 0, 0.36);
  const govde = new THREE.Mesh(geo, M.ekmek); govde.castShadow = true; g.add(govde);
  const kap = new THREE.Mesh(new THREE.CircleGeometry(0.945, 96).rotateX(-Math.PI / 2), M.icEkmek); kap.position.y = 0.352; g.add(kap);
  const s = sos(); s.g.position.y = 0.335; s.g.scale.set(0.95, 1, 0.95); g.add(s.g);
  return { g, h: 0.4 };
}
function ustEkmek(logoDoku) {
  const g = new THREE.Group();
  const nok = [[0, 0], [0.92, 0], [1.05, 0.035], [1.12, 0.13], [1.12, 0.26], [1.06, 0.43], [0.93, 0.6], [0.72, 0.75], [0.42, 0.84], [0, 0.875]];
  const prof = ekmekProfil(nok, 60);
  const geo = new THREE.LatheGeometry(prof, 140); ekmekRenk(geo, "#e0913f", "#8e4314", 0.05, 0.8);
  const kubbe = new THREE.Mesh(geo, M.ekmek); kubbe.castShadow = true; g.add(kubbe);
  const kap = new THREE.Mesh(new THREE.CircleGeometry(0.92, 96).rotateX(Math.PI / 2), M.icEkmek); kap.position.y = 0.002; g.add(kap);
  // susamlar: kubbenin üst kısmına yüzeye yatık
  const adet = 150, sus = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), M.susam, adet);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), qd = new THREE.Quaternion(), yukari = new THREE.Vector3(0, 1, 0);
  const pts = prof; let k = 0, deneme = 0;
  while (k < adet && deneme < 5000) {
    deneme++;
    const u = 22 + Math.floor(ozet(deneme * 1.3) * 36); // profil noktası: kenardan tepeye
    if (u >= pts.length - 1) continue;
    const a = ozet(deneme * 2.9) * Math.PI * 2, p0 = pts[u], p1 = pts[u + 1];
    const tr = p1.x - p0.x, ty = p1.y - p0.y, L = Math.hypot(tr, ty) || 1, nr = ty / L, ny = -tr / L;
    const n = new THREE.Vector3(nr * Math.cos(a), Math.abs(ny), nr * Math.sin(a)).normalize();
    const pos = new THREE.Vector3(p0.x * Math.cos(a), p0.y, p0.x * Math.sin(a)).addScaledVector(n, 0.006);
    q.setFromUnitVectors(yukari, n); qd.setFromAxisAngle(yukari, ozet(deneme * 7.7) * Math.PI); q.multiply(qd);
    m4.compose(pos, q, new THREE.Vector3(0.024, 0.011, 0.048));
    sus.setMatrixAt(k++, m4);
  }
  sus.castShadow = true; g.add(sus);
  // Beytuş logolu kürdan bayrağı
  const bayrak = new THREE.Group();
  const kurdan = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 1.05, 12), M.kurdan); kurdan.position.y = 0.52; kurdan.castShadow = true; bayrak.add(kurdan);
  if (logoDoku) {
    const en = 0.5, boy = en * 214 / 320;
    const bez = new THREE.Mesh(new THREE.PlaneGeometry(en, boy), new THREE.MeshStandardMaterial({ map: logoDoku, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide, roughness: 0.6 }));
    bez.position.set(en / 2 + 0.01, 0.86, 0); bez.castShadow = true; bayrak.add(bez);
  }
  bayrak.position.set(0.12, 0.62, 0.05); bayrak.rotation.z = -0.12; g.add(bayrak);
  return { g, h: 0.875 };
}
function sos() {
  const sekil = new THREE.Shape();
  for (let i = 0; i <= 160; i++) {
    const a = (i / 160) * Math.PI * 2, r = 0.9 + 0.045 * Math.sin(a * 7) + 0.025 * Math.sin(a * 13 + 1);
    i ? sekil.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sekil.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const geo = new THREE.ExtrudeGeometry(sekil, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.03, bevelSegments: 4, curveSegments: 160 });
  geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, M.sos); m.castShadow = true;
  const g = new THREE.Group(); g.add(m); return { g, h: 0.05 };
}
function marul() {
  const g = new THREE.Group();
  [[0, 1.3, 0], [1.3, 1.2, 0.03]].forEach(([don, R, dy], li) => {
    const geo = new THREE.RingGeometry(0.02, R, 200, 14).rotateX(-Math.PI / 2);
    const p = geo.attributes.position, renk = new Float32Array(p.count * 3), ic = new THREE.Color("#2f8a1c"), dis = new THREE.Color("#8fd64f"), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z), a = Math.atan2(z, x), e = Math.pow(r / R, 2.2);
      const dal = 0.085 * Math.sin(a * 9 + li * 2 + gurultu(a * 3) * 2) + 0.045 * Math.sin(a * 21 + li) + 0.03 * (gurultu(a * 6 + li * 5) - 0.5);
      const kr = r * (1 + e * (0.05 * Math.sin(a * 11 + li) + 0.04 * (gurultu(a * 9) - 0.5)));
      p.setXYZ(i, Math.cos(a) * kr, e * dal + 0.012 * gurultu(x * 5, z * 5), Math.sin(a) * kr);
      c.copy(ic).lerp(dis, Math.pow(r / R, 1.6)); c.offsetHSL(0, 0, (gurultu(a * 14, r * 8) - 0.5) * 0.08);
      renk.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(renk, 3)); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, M.marul); m.rotation.y = don; m.position.y = dy; m.castShadow = true; m.receiveShadow = true; g.add(m);
  });
  return { g, h: 0.1 };
}
function domates() {
  const g = new THREE.Group();
  [[-0.43, 0.05, 0.12, 0.04], [0.45, -0.06, -0.1, -0.03]].forEach(([x, z, r, t], i) => {
    const geo = new THREE.CylinderGeometry(0.54, 0.54, 0.085, 72);
    const m = new THREE.Mesh(geo, [M.domatesYan, M.domatesKesit, M.domatesKesit]);
    m.position.set(x, 0.043 + i * 0.012, z); m.rotation.set(t, r, 0); m.castShadow = true; m.receiveShadow = true; g.add(m);
  });
  return { g, h: 0.1 };
}
function kofte(tohum) {
  const geo = new THREE.CylinderGeometry(1.05, 1.08, 0.3, 140, 10);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const r = Math.hypot(x, z), a = Math.atan2(z, x);
    if (r > 0.9) { // kenar: düzensiz, yuvarlatılmış
      const kenar = Math.pow(Math.max(0, Math.abs(y) - 0.08) / 0.07, 2) * 0.08;
      const rr = r * (1 + 0.04 * (gurultu(a * 4 + tohum) - 0.5) + 0.02 * (gurultu(a * 17 + tohum) - 0.5)) - kenar;
      x = Math.cos(a) * rr; z = Math.sin(a) * rr; y += 0.02 * (gurultu(a * 9 + tohum, y * 10) - 0.5);
    } else if (Math.abs(y) > 0.14) { y += Math.sign(y) * 0.02 * (gurultu(x * 5 + tohum, z * 5) - 0.3); }
    p.setXYZ(i, x, y + 0.15, z);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, M.kofte); m.castShadow = true; m.receiveShadow = true;
  const g = new THREE.Group(); g.add(m); return { g, h: 0.3 };
}
function cheddar(don) {
  const geo = new THREE.PlaneGeometry(1.95, 1.95, 56, 56).rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), d = Math.hypot(x, z);
    let y = 0.004 * Math.sin(x * 9) * Math.cos(z * 7);
    if (d > 0.88) y -= Math.pow(d - 0.88, 1.2) * 1.25; // köfte kenarından sarkar
    p.setY(i, y);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, M.cheddar); m.rotation.y = don; m.castShadow = true; m.receiveShadow = true;
  const g = new THREE.Group(); g.add(m); return { g, h: 0.02 };
}
function sogan() {
  const g = new THREE.Group();
  for (let i = 0; i < 16; i++) {
    const r = 0.1 + ozet(i * 3.3) * 0.18, yay = 1.4 + ozet(i * 5.1) * 2.6;
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.03 + ozet(i) * 0.012, 10, 40, yay), M.sogan);
    const a = ozet(i * 1.9) * Math.PI * 2, rr = Math.sqrt(ozet(i * 2.7)) * 0.72;
    m.position.set(Math.cos(a) * rr, 0.035 + ozet(i * 4.4) * 0.04, Math.sin(a) * rr);
    m.rotation.set(Math.PI / 2 + (ozet(i * 6.1) - 0.5) * 0.5, (ozet(i * 7.3) - 0.5) * 0.4, ozet(i * 8.9) * Math.PI * 2);
    m.castShadow = true; g.add(m);
  }
  return { g, h: 0.08 };
}
function tursu() {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4, rr = i === 4 ? 0 : 0.5;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.035, 48), [M.tursuYan, M.tursuKesit, M.tursuKesit]);
    m.position.set(i === 4 ? 0.05 : Math.cos(a) * rr, 0.02 + (i === 4 ? 0.03 : 0), i === 4 ? 0.02 : Math.sin(a) * rr);
    m.rotation.set((ozet(i * 3) - 0.5) * 0.25, 0, (ozet(i * 5) - 0.5) * 0.25); m.castShadow = true; g.add(m);
  }
  return { g, h: 0.06 };
}

// ---------- kurulum ----------
function kur() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: tuval, antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: !!test }); }
  catch (e) { bolum.classList.add("yedek"); return; }
  const dpr = Math.min(window.devicePixelRatio || 1, innerWidth < 900 ? 1.75 : 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const sahne = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  sahne.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  sahne.environmentIntensity = 0.55;

  const kamera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const anaIsik = new THREE.DirectionalLight("#fff0d8", 3.2);
  anaIsik.position.set(-3.5, 6, 4.5); anaIsik.castShadow = true;
  anaIsik.shadow.mapSize.set(innerWidth < 900 ? 1024 : 2048, innerWidth < 900 ? 1024 : 2048);
  Object.assign(anaIsik.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
  anaIsik.shadow.radius = 6; anaIsik.shadow.bias = -0.0004; anaIsik.shadow.normalBias = 0.02;
  sahne.add(anaIsik);
  const arkaIsik = new THREE.DirectionalLight("#ffa65a", 2.6); arkaIsik.position.set(4.5, 3.5, -4); sahne.add(arkaIsik);
  const dolguIsik = new THREE.DirectionalLight("#ffe9cf", 0.6); dolguIsik.position.set(3, 1, 5); sahne.add(dolguIsik);

  const kok = new THREE.Group(); sahne.add(kok);           // konum/ölçek
  const donus = new THREE.Group(); kok.add(donus);          // dönüş
  const golge = new THREE.Mesh(new THREE.PlaneGeometry(9, 9).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.2 }));
  golge.receiveShadow = true; kok.add(golge);

  const logoDoku = new THREE.TextureLoader().load("img/logo-320.webp", (t) => { t.colorSpace = THREE.SRGBColorSpace; });
  // alttan üste: alt ekmek (üstünde Beytuş sos), marul, domates, köfte, cheddar, köfte, cheddar, soğan, turşu, üst ekmek
  const tanim = [altEkmek(), marul(), domates(), kofte(1), cheddar(0.3), kofte(7), cheddar(1.1), sogan(), tursu(), ustEkmek(logoDoku)];
  const bas = [0, 0.03, 0.02, 0.0, 0.0, 0.06, 0.0, 0.035, 0.03, 0.03]; // altındakine gömülme
  let y = 0;
  const parcalar = tanim.map((t, i) => {
    const yer = new THREE.Group(); yer.add(t.g); donus.add(yer);
    if (i) y -= bas[i];
    const p = { yer, asm: { x: 0, y, z: 0, rx: 0, ry: 0, rz: 0 } };
    y += t.h; return p;
  });
  const n = parcalar.length, boy = y;
  // dağınık hâl ve dikey dizi hâli
  parcalar.forEach((p, i) => {
    // dağınık: yüzleri kameraya dönük, birbirine çarpmadan havada
    const a = i * 2.39996 + 0.6, r = 1.25 + ozet(i * 9.1) * 0.75;
    p.dag = { x: Math.cos(a) * r * 1.1, y: 1.1 + (i - (n - 1) / 2) * 0.36 + (ozet(i * 3.7) - 0.5) * 0.5, z: Math.sin(a) * r * 0.55 - 0.3,
      rx: 0.38 + (ozet(i * 4.9) - 0.5) * 0.55, ry: ozet(i * 6.3) * Math.PI, rz: (ozet(i * 8.1) - 0.5) * 0.6 };
    p.dizi = { x: 0, y: i * 0.6 - 0.2, z: 0, rx: 0.62, ry: (i % 2 ? 0.25 : -0.25), rz: 0 };
    p.f = 0.6 + ozet(i * 2.2) * 0.6; p.ph = i * 1.7;
  });

  // ---------- kaydırma: anahtar anlar ----------
  const A = [0.1, 0.3, 0.46, 0.7, 0.88]; // dağıl başla, dağılma bitti, dizi oldu, birleş başla, birleşti
  let genis = innerWidth >= 900;
  function kok3(p) { // sahnenin konumu ve ölçeği (masaüstünde yazıya yer açar)
    const asm = [genis ? 1.55 : 0, genis ? 0 : 0.95, genis ? 1.15 : 0.78];  // oturmuş burger (telefonda yazı kartına yer bırakır)
    const ks = [ // [p, x, y, ölçek]
      [0, ...asm],
      [A[0], ...asm],
      [A[1], genis ? 1.2 : 0, genis ? -0.15 : 0.75, genis ? 0.72 : 0.5],
      [A[2], genis ? 1.75 : 0, genis ? -0.75 : -0.05, genis ? 0.58 : 0.5],
      [A[3], genis ? 1.75 : 0, genis ? -0.75 : -0.05, genis ? 0.58 : 0.5],
      [A[4], ...asm],
      [1, ...asm],
    ];
    for (let i = 1; i < ks.length; i++) if (p <= ks[i][0]) {
      const a = ks[i - 1], b = ks[i], t = icDis((p - a[0]) / (b[0] - a[0] || 1));
      return { x: karis(a[1], b[1], t), y: karis(a[2], b[2], t), s: karis(a[3], b[3], t) };
    }
    const s = ks[ks.length - 1]; return { x: s[1], y: s[2], s: s[3] };
  }
  function parcaHal(p, i, zaman) {
    const P = parcalar[i], s = i / (n - 1), h = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
    let k1, k2, t;
    if (p < A[0]) { k1 = P.asm; k2 = P.asm; t = 0; }
    else if (p < A[1]) { k1 = P.asm; k2 = P.dag; t = icDis(((p - A[0]) / (A[1] - A[0])) * 1.35 - s * 0.35); }
    else if (p < A[2]) { k1 = P.dag; k2 = P.dizi; t = icDis(((p - A[1]) / (A[2] - A[1])) * 1.3 - (1 - s) * 0.3); }
    else if (p < A[3]) { k1 = P.dizi; k2 = P.dizi; t = 0; }
    else if (p < A[4]) { k1 = P.dizi; k2 = P.asm; t = geriCik(((p - A[3]) / (A[4] - A[3])) * 1.6 - s * 0.6); }
    else { k1 = P.asm; k2 = P.asm; t = 0; }
    for (const k in h) h[k] = karis(k1[k], k2[k], t);
    // havadayken hafif süzülme
    const havada = p > A[0] && p < A[4] ? Math.sin(Math.PI * sinirla((p - A[0]) / (A[4] - A[0]))) : 0;
    h.y += Math.sin(zaman * P.f + P.ph) * 0.05 * havada; h.rz += Math.sin(zaman * P.f * 0.7 + P.ph) * 0.04 * havada;
    return h;
  }

  // ---------- yazı kartları ----------
  const kartlar = [...document.querySelectorAll(".vurus")].map((el) => ({ el, a: +el.dataset.bas, b: +el.dataset.son }));
  const cizgi = document.querySelector(".sahne3d .ilerle i");
  function kartGuncelle(p) {
    kartlar.forEach((k) => {
      const gir = k.a <= 0 ? 1 : yumusak((p - k.a) / 0.04), cik = k.b >= 1 ? 1 : 1 - yumusak((p - k.b) / 0.04);
      const v = Math.min(gir, cik);
      k.el.style.opacity = v.toFixed(3);
      k.el.style.transform = "translate3d(0," + ((1 - gir) * 40 - (1 - cik) * 40).toFixed(1) + "px,0)";
      k.el.style.visibility = v < 0.01 ? "hidden" : "visible";
    });
    if (cizgi) cizgi.style.transform = "scaleX(" + p.toFixed(4) + ")";
  }

  // ---------- boyut ----------
  function boyutla() {
    const w = tuval.clientWidth, h = tuval.clientHeight;
    genis = innerWidth >= 900;
    renderer.setSize(w, h, false);
    kamera.aspect = w / h;
    kamera.fov = genis ? 26 : 30;
    kamera.position.set(0, 2.4, genis ? 11 : 11.5); kamera.lookAt(0, 1.05, 0);
    kamera.updateProjectionMatrix();
  }
  boyutla(); addEventListener("resize", boyutla);

  // ---------- döngü ----------
  const durum = { hedef: 0, simdi: 0, inis: false, ezil: 0 };
  function ilerleme() {
    const r = bolum.getBoundingClientRect(), yol = bolum.offsetHeight - innerHeight;
    return sinirla(-r.top / (yol || 1));
  }
  durum.hedef = durum.simdi = ilerleme();
  addEventListener("scroll", () => { durum.hedef = ilerleme(); }, { passive: true });
  let gorunur = true;
  new IntersectionObserver((g) => { gorunur = g[0].isIntersecting; }).observe(bolum);
  const saat = new THREE.Clock();
  let fx = 0, fy = 0, hx = 0, hy = 0;
  if (matchMedia("(hover: hover)").matches) addEventListener("pointermove", (e) => { hx = e.clientX / innerWidth - 0.5; hy = e.clientY / innerHeight - 0.5; }, { passive: true });

  function kare() {
    requestAnimationFrame(kare);
    if (!gorunur) return;
    adim(saat.getElapsedTime());
  }
  // deneme için: belli bir ilerlemede tek kare çiz (ekran görüntüsü alırken)
  window.__burger3d = (p) => { durum.hedef = durum.simdi = p; adim(saat.getElapsedTime()); };
  function adim(zaman) {
    durum.simdi += (durum.hedef - durum.simdi) * (test ? 1 : 0.09);
    const p = azHareket ? 0 : durum.simdi;
    // birleşince oturma tepkisi
    if (p >= A[4] - 0.005 && !durum.inis) { durum.inis = true; durum.ezil = 1; }
    if (p < A[4] - 0.03) durum.inis = false;
    durum.ezil *= 0.9;
    const k = kok3(p);
    kok.position.set(k.x, k.y, 0); kok.scale.setScalar(k.s);
    fx += (hx - fx) * 0.05; fy += (hy - fy) * 0.05;
    donus.rotation.y = -0.5 + p * Math.PI * 1.6 + Math.sin(zaman * 0.35) * 0.12 + fx * 0.5;
    donus.rotation.x = fy * 0.15 + 0.04;
    const ez = Math.sin(durum.ezil * Math.PI) * 0.05;
    donus.scale.set(1 + ez, 1 - ez * 1.4, 1 + ez);
    for (let i = 0; i < n; i++) {
      const h = parcaHal(p, i, zaman), y = parcalar[i].yer;
      y.position.set(h.x, h.y, h.z); y.rotation.set(h.rx, h.ry, h.rz);
    }
    kartGuncelle(p);
    renderer.render(sahne, kamera);
  }
  kare();
  bolum.classList.add("hazir");
}

if (bolum && tuval) kur();
