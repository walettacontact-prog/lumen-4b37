// Beytuş 3B burger (Three.js). Ekmek: Poly Haven "Hamburger Buns" (CC0) gerçek taranmış ekmekten kesildi (ekmek-kes.py).
// Köfte, cheddar, marul, domates, soğan, turşu ve Beytuş Burger Sos koddan modellenir; renkler Beytuş'un kendi fotoğraflarından.
// Kaydırma: oturmuş burger → katlar dikey açılır → kamera köfteye, yeşilliklere, sosa iner → katlar sırayla oturur.
import * as THREE from "three";
import { RoomEnvironment } from "../ortak/lib3/RoomEnvironment.js";

const bolum = document.querySelector(".sahne3d");
const sabit = document.querySelector(".sahne3d-sabit");
const tuval = document.querySelector(".sahne3d canvas");
const azHareket = matchMedia("(prefers-reduced-motion: reduce)").matches;
const test = location.hash.match(/^#y=(\d+)/);
const testP = location.hash.match(/[&#]p=([\d.]+)/); // ekran görüntüsü denemesi: #y=0&p=0.4

// ---------- yardımcılar ----------
const kesir = (x) => x - Math.floor(x);
const ozet = (n) => kesir(Math.sin(n * 127.1 + 311.7) * 43758.5453);
const ozet3 = (x, y, z) => kesir(Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453);
const sinirla = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const yumusak = (x) => { x = sinirla(x); return x * x * (3 - 2 * x); };
const icDis = (x) => { x = sinirla(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const disa = (x) => { x = sinirla(x); return 1 - Math.pow(1 - x, 3); };
const geriCik = (x) => { x = sinirla(x); const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const karis = (a, b, t) => a + (b - a) * t;
function gurultu3(x, y, z) { // 3B değer gürültüsü (0..1)
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const s = (t) => t * t * (3 - 2 * t), u = s(x - xi), v = s(y - yi), w = s(z - zi);
  const h = (a, b, c) => ozet3(xi + a, yi + b, zi + c);
  const x00 = karis(h(0, 0, 0), h(1, 0, 0), u), x10 = karis(h(0, 1, 0), h(1, 1, 0), u);
  const x01 = karis(h(0, 0, 1), h(1, 0, 1), u), x11 = karis(h(0, 1, 1), h(1, 1, 1), u);
  return karis(karis(x00, x10, v), karis(x01, x11, v), w);
}
const fbm3 = (x, y, z, o = 4) => { let t = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < o; i++) { t += gurultu3(x * f, y * f, z * f) * a; n += a; a *= 0.5; f *= 2.03; } return t / n; };

// tekrarlanabilir (dikişsiz) gürültü dokusu: kabarıklık ve pürüz için
function gurultuDoku(boyut, olcek, oktav, isle) {
  const c = document.createElement("canvas"); c.width = c.height = boyut;
  const g = c.getContext("2d"), img = g.createImageData(boyut, boyut), d = img.data;
  const P = olcek; // periyot
  const h = (x, y) => ozet3(((x % P) + P) % P, ((y % P) + P) % P, 3.3);
  const deger = (x, y, per) => {
    const xi = Math.floor(x), yi = Math.floor(y), s = (t) => t * t * (3 - 2 * t), u = s(x - xi), v = s(y - yi);
    const k = (a, b) => ozet3((((xi + a) % per) + per) % per, (((yi + b) % per) + per) % per, per);
    return karis(karis(k(0, 0), k(1, 0), u), karis(k(0, 1), k(1, 1), u), v);
  };
  for (let y = 0; y < boyut; y++) for (let x = 0; x < boyut; x++) {
    let t = 0, a = 0.5, n = 0, per = P;
    for (let o = 0; o < oktav; o++) { t += deger((x / boyut) * per, (y / boyut) * per, per) * a; n += a; a *= 0.5; per *= 2; }
    const v = isle(t / n, x, y), i = (y * boyut + x) * 4;
    d[i] = v[0]; d[i + 1] = v[1]; d[i + 2] = v[2]; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  void h;
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  return t;
}
function tuvalDoku(w, h, ciz, renkli = true) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  ciz(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); if (renkli) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function renkVer(geo, f) {
  const p = geo.attributes.position, r = new Float32Array(p.count * 3), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { f(p.getX(i), p.getY(i), p.getZ(i), c, i); r.set([c.r, c.g, c.b], i * 3); }
  geo.setAttribute("color", new THREE.BufferAttribute(r, 3));
}
const R = (h) => new THREE.Color(h);

async function binYukle(yol) {
  const b = await (await fetch(yol)).arrayBuffer();
  const [nv, ni, nk] = new Uint32Array(b, 0, 3);
  let o = 12; const al = (T, n) => { const a = new T(b, o, n); o += n * 4; return a; };
  const pos = al(Float32Array, nv * 3), nor = al(Float32Array, nv * 3), uv = al(Float32Array, nv * 2), idx = al(Uint32Array, ni), kenar = al(Float32Array, nk * 2);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setIndex(new THREE.BufferAttribute(idx, 1));
  const nokta = []; for (let i = 0; i < nk; i++) nokta.push(new THREE.Vector2(kenar[i * 2], kenar[i * 2 + 1]));
  return { g, nokta };
}

// ---------- kurulum ----------
async function kur() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: tuval, antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: !!test }); }
  catch (e) { bolum.classList.add("yedek"); return; }
  const kucukEkran = innerWidth < 900;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, kucukEkran ? 2 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const anizo = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  // gerçek ekmek: geometri + dokular
  const boyut = kucukEkran ? 1024 : 2048, tl = new THREE.TextureLoader();
  const doku = async (ad, renkli) => { const t = await tl.loadAsync("../ortak/3b/ekmek-" + ad + "-" + boyut + ".webp"); t.flipY = false; if (renkli) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = anizo; return t; };
  let alt, ust, dDiff, dNor, dArm, logoDoku;
  try {
    [alt, ust, dDiff, dNor, dArm, logoDoku] = await Promise.all([
      binYukle("../ortak/3b/ekmek-alt.bin"), binYukle("../ortak/3b/ekmek-ust.bin"), doku("diff", true), doku("nor"), doku("arm"),
      tl.loadAsync("../ortak/img/logo-320.webp").then((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = anizo; return t; }),
    ]);
  } catch (e) { bolum.classList.add("yedek"); return; }

  // ---------- koddan dokular ----------
  const icDoku = tuvalDoku(512, 512, (g, w, h) => { // kızarmış ekmek içi
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, "#e9b56c"); gr.addColorStop(0.55, "#f0c88a"); gr.addColorStop(0.86, "#f6dcaa"); gr.addColorStop(1, "#d79b55");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2200; i++) { // gözenekler
      const x = ozet(i * 1.7) * w, y = ozet(i * 2.3) * h, r = 0.6 + ozet(i * 4.1) * 2.6;
      g.fillStyle = i % 3 ? "rgba(150, 92, 40, .35)" : "rgba(255, 244, 220, .55)";
      g.beginPath(); g.ellipse(x, y, r, r * (0.5 + ozet(i * 5.3) * 0.6), ozet(i) * 3, 0, 7); g.fill();
    }
  });
  const kofteKabarik = gurultuDoku(256, 8, 5, (v, x, y) => { const k = Math.pow(v, 1.6) * 255; return [k, k, k]; });
  kofteKabarik.repeat.set(9, 3);
  const marulKabarik = gurultuDoku(256, 6, 4, (v) => { const k = 128 + (v - 0.5) * 300; return [k, k, k]; });
  const temasDoku = tuvalDoku(128, 128, (g, w) => { // katın altındaki yumuşak temas gölgesi
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(0.72, "rgba(0,0,0,.85)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  }, false);
  const domatesDoku = tuvalDoku(512, 512, (g, w) => {
    const m = w / 2;
    g.fillStyle = "#b51d14"; g.fillRect(0, 0, w, w);
    const gr = g.createRadialGradient(m, m, m * 0.2, m, m, m * 0.95); gr.addColorStop(0, "#f04a33"); gr.addColorStop(1, "#d42d1f");
    g.fillStyle = gr; g.beginPath(); g.arc(m, m, m * 0.93, 0, 7); g.fill();
    for (let i = 0; i < 5; i++) { // çekirdek odaları (jöle + çekirdek)
      const a = (i / 5) * Math.PI * 2 + 0.3;
      g.fillStyle = "#ff8a63"; g.beginPath(); g.ellipse(m + Math.cos(a) * m * 0.5, m + Math.sin(a) * m * 0.5, m * 0.27, m * 0.18, a, 0, 7); g.fill();
      g.fillStyle = "rgba(255, 190, 150, .6)"; g.beginPath(); g.ellipse(m + Math.cos(a) * m * 0.5, m + Math.sin(a) * m * 0.5, m * 0.2, m * 0.11, a, 0, 7); g.fill();
      for (let k = 0; k < 8; k++) { g.fillStyle = "#fff0b8"; g.beginPath(); g.ellipse(m + Math.cos(a + (k - 4) * 0.07) * m * (0.42 + (k % 3) * 0.07), m + Math.sin(a + (k - 4) * 0.07) * m * (0.42 + (k % 3) * 0.07), 6, 3.6, a + 1.2, 0, 7); g.fill(); }
    }
    g.fillStyle = "#e5402c"; g.beginPath(); g.arc(m, m, m * 0.17, 0, 7); g.fill();
  });
  const tursuDoku = tuvalDoku(256, 256, (g, w) => {
    const m = w / 2;
    g.fillStyle = "#4f6a16"; g.fillRect(0, 0, w, w);
    g.fillStyle = "#8eab3c"; g.beginPath(); g.arc(m, m, m * 0.88, 0, 7); g.fill();
    g.fillStyle = "#c2d27a"; g.beginPath(); g.arc(m, m, m * 0.52, 0, 7); g.fill();
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; g.fillStyle = "#eef1c9"; g.beginPath(); g.ellipse(m + Math.cos(a) * m * 0.33, m + Math.sin(a) * m * 0.33, 8, 4.5, a, 0, 7); g.fill(); }
  });

  // ---------- malzemeler ----------
  const M = {
    altEkmek: new THREE.MeshStandardMaterial({ map: dDiff, normalMap: dNor, roughnessMap: dArm, aoMap: dArm, color: "#ffe9c6", side: THREE.DoubleSide }),
    ustEkmek: new THREE.MeshPhysicalMaterial({ map: dDiff, normalMap: dNor, normalScale: new THREE.Vector2(0.7, 0.7), roughnessMap: dArm, aoMap: dArm, vertexColors: true,
      clearcoat: 0.3, clearcoatRoughness: 0.38, side: THREE.DoubleSide }),
    ic: new THREE.MeshStandardMaterial({ map: icDoku, bumpMap: icDoku, bumpScale: 1.5, roughness: 0.92, emissive: R("#b9772f"), emissiveIntensity: 0.25, emissiveMap: icDoku }),
    susam: new THREE.MeshPhysicalMaterial({ color: "#fff6df", roughness: 0.42, clearcoat: 0.3, sheen: 0.3 }),
    sos: new THREE.MeshPhysicalMaterial({ color: "#fbf4e6", roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.12, emissive: R("#f3e3c4"), emissiveIntensity: 0.28 }),
    marul: new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.42, bumpMap: marulKabarik, bumpScale: 0.8, clearcoat: 0.35, clearcoatRoughness: 0.4,
      emissive: R("#2f5c10"), emissiveIntensity: 0.1, side: THREE.DoubleSide }),
    domatesYan: new THREE.MeshPhysicalMaterial({ color: "#c0261b", roughness: 0.25, clearcoat: 0.9, clearcoatRoughness: 0.15 }),
    domatesKesit: new THREE.MeshPhysicalMaterial({ map: domatesDoku, roughness: 0.2, clearcoat: 0.85, clearcoatRoughness: 0.12, emissive: R("#7a0f06"), emissiveIntensity: 0.18 }),
    kofte: new THREE.MeshPhysicalMaterial({ vertexColors: true, bumpMap: kofteKabarik, bumpScale: 7, roughnessMap: kofteKabarik, roughness: 0.92, clearcoat: 0.06, clearcoatRoughness: 0.55 }),
    cheddar: new THREE.MeshPhysicalMaterial({ color: "#ffb300", roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.3,
      emissive: R("#ff9500"), emissiveIntensity: 0.22, side: THREE.DoubleSide }),
    sogan: new THREE.MeshPhysicalMaterial({ color: "#c27a35", roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.2, emissive: R("#7a3a0c"), emissiveIntensity: 0.22, transmission: 0 }),
    tursuYan: new THREE.MeshStandardMaterial({ color: "#4f6b17", roughness: 0.38 }),
    tursuKesit: new THREE.MeshPhysicalMaterial({ map: tursuDoku, roughness: 0.25, clearcoat: 0.7 }),
    kurdan: new THREE.MeshStandardMaterial({ color: "#e6c78d", roughness: 0.7 }),
    temas: new THREE.MeshBasicMaterial({ color: "#2a0e00", alphaMap: temasDoku, transparent: true, opacity: 0.42, depthWrite: false }),
  };
  [M.altEkmek, M.ustEkmek].forEach((m) => { m.aoMapIntensity = 1; });

  // ---------- parçalar (her parçanın tabanı y=0) ----------
  function kapak(nokta, y, yukari) { // kesik ekmek yüzü
    const sekil = new THREE.Shape(nokta.map((p) => new THREE.Vector2(p.x, yukari ? -p.y : p.y)));
    const geo = new THREE.ShapeGeometry(sekil, 1);
    const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + 1.15) / 2.3, (uv.getY(i) + 1.15) / 2.3);
    geo.rotateX(yukari ? -Math.PI / 2 : Math.PI / 2);
    const m = new THREE.Mesh(geo, M.ic); m.position.y = y; m.receiveShadow = true;
    return m;
  }
  function altEkmek() {
    const g = new THREE.Group();
    const m = new THREE.Mesh(alt.g, M.altEkmek); m.castShadow = true; m.receiveShadow = true; g.add(m);
    g.add(kapak(alt.nokta, 0.478, true));
    return { g, h: 0.48 };
  }
  function ustEkmek() {
    const g = new THREE.Group(), geo = ust.g;
    // taban açık krem halka, gövde altın, tepe kızarmış (Beytuş ekmeği gibi)
    renkVer(geo, (x, y, z, c) => {
      const t = sinirla(y / 0.62), n = (fbm3(x * 2.2, y * 2.2, z * 2.2, 3) - 0.5) * 0.18;
      if (t < 0.13) c.copy(R("#fff0d4")).lerp(R("#f6a95c"), yumusak(t / 0.13));
      else c.copy(R("#f6a95c")).lerp(R("#c2621f"), Math.pow((t - 0.13) / 0.87, 0.8));
      c.offsetHSL(0, 0, n);
    });
    const m = new THREE.Mesh(geo, M.ustEkmek); m.castShadow = true; m.receiveShadow = true; g.add(m);
    g.add(kapak(ust.nokta, 0.004, false));
    const sosu = sos(); sosu.g.position.y = -0.05; sosu.g.scale.set(1.02, 1, 1.02); g.add(sosu.g); // Beytuş Burger Sos ekmeğin altında
    // susamlar: kubbenin üst yüzüne alana göre dağıtılır
    const p = geo.attributes.position, ix = geo.index.array, uc = [], alanlar = [];
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), ab = new THREE.Vector3(), ac = new THREE.Vector3(), n = new THREE.Vector3();
    let top = 0;
    for (let i = 0; i < ix.length; i += 3) {
      a.fromBufferAttribute(p, ix[i]); b.fromBufferAttribute(p, ix[i + 1]); c.fromBufferAttribute(p, ix[i + 2]);
      ab.subVectors(b, a); ac.subVectors(c, a); n.crossVectors(ab, ac);
      const alan = n.length() / 2; n.normalize(); if (n.y < 0) n.negate();
      if (n.y > 0.42 && (a.y + b.y + c.y) / 3 > 0.2) { top += alan; uc.push(i); alanlar.push(top); }
    }
    const adet = kucukEkran ? 150 : 210;
    const sus = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 6), M.susam, adet);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), q2 = new THREE.Quaternion(), yuk = new THREE.Vector3(0, 1, 0), renk = new THREE.Color();
    for (let k = 0; k < adet; k++) {
      const hedef = ozet(k * 3.17 + 0.5) * top; let s = 0, e = alanlar.length - 1;
      while (s < e) { const o = (s + e) >> 1; if (alanlar[o] < hedef) s = o + 1; else e = o; }
      const i = uc[s];
      a.fromBufferAttribute(p, ix[i]); b.fromBufferAttribute(p, ix[i + 1]); c.fromBufferAttribute(p, ix[i + 2]);
      let r1 = ozet(k * 5.9), r2 = ozet(k * 7.3); if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
      const pos = a.clone().addScaledVector(ab.subVectors(b, a), r1).addScaledVector(ac.subVectors(c, a), r2);
      n.crossVectors(ab, ac).normalize(); if (n.y < 0) n.negate();
      pos.addScaledVector(n, 0.004);
      q.setFromUnitVectors(yuk, n); q2.setFromAxisAngle(yuk, ozet(k * 9.1) * Math.PI); q.multiply(q2);
      m4.compose(pos, q, new THREE.Vector3(0.022, 0.009, 0.042));
      sus.setMatrixAt(k, m4);
      sus.setColorAt(k, renk.set("#fff7e6").lerp(R("#e9c58a"), ozet(k * 2.7) * 0.7));
    }
    sus.castShadow = true; g.add(sus);
    // Beytuş logolu kürdan bayrağı
    const bayrak = new THREE.Group();
    const kurdan = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.1, 12), M.kurdan); kurdan.position.y = 0.55; kurdan.castShadow = true; bayrak.add(kurdan);
    const en = 0.56, boy = en * 214 / 320;
    const bez = new THREE.Mesh(new THREE.PlaneGeometry(en, boy), new THREE.MeshStandardMaterial({ map: logoDoku, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide, roughness: 0.6 }));
    bez.position.set(en / 2 + 0.012, 0.88, 0); bez.castShadow = true; bayrak.add(bez);
    bayrak.position.set(0.08, 0.45, 0.04); bayrak.rotation.z = -0.1; g.add(bayrak);
    return { g, h: 0.665 };
  }
  function sos() { // Beytuş Burger Sos: kenarlardan süzülen beyaz sos
    const g = new THREE.Group(), sekil = new THREE.Shape();
    for (let i = 0; i <= 200; i++) {
      const a = (i / 200) * Math.PI * 2, r = 0.98 + 0.05 * Math.pow(Math.max(0, Math.sin(a * 5 + 1)), 2) + 0.03 * Math.pow(Math.max(0, Math.sin(a * 9 + 2)), 2) + 0.012 * Math.sin(a * 23);
      i ? sekil.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sekil.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const geo = new THREE.ExtrudeGeometry(sekil, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.035, bevelSegments: 5, curveSegments: 200 });
    geo.rotateX(-Math.PI / 2); geo.translate(0, 0.02, 0);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const r = Math.hypot(p.getX(i), p.getZ(i)); if (r > 1.0) p.setY(i, p.getY(i) - Math.pow(r - 1.0, 1.1) * 0.9); } // kenardan süzülür
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, M.sos); m.castShadow = true; m.receiveShadow = true; g.add(m);
    return { g, h: 0.05 };
  }
  function marul() {
    const g = new THREE.Group();
    [[0, 1.28, 0, 0], [1.1, 1.2, 0.035, 1], [2.3, 1.12, 0.06, 2]].forEach(([don, Rr, dy, li]) => {
      const geo = new THREE.RingGeometry(0.02, Rr, 220, 16).rotateX(-Math.PI / 2);
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z), a = Math.atan2(z, x), e = Math.pow(r / Rr, 2.4);
        const dal = 0.05 * Math.sin(a * 13 + li * 2 + fbm3(Math.cos(a) * 2, Math.sin(a) * 2, li, 2) * 5) + 0.035 * Math.sin(a * 37 + li) + 0.05 * (fbm3(Math.cos(a) * 6, Math.sin(a) * 6, li + 3, 2) - 0.5);
        const kr = r * (1 + e * (0.07 * Math.sin(a * 11 + li) + 0.06 * (fbm3(Math.cos(a) * 4, Math.sin(a) * 4, li + 7, 2) - 0.5)));
        p.setXYZ(i, Math.cos(a) * kr, e * dal - e * 0.11 + 0.012 * fbm3(x * 4, z * 4, li, 2), Math.sin(a) * kr);
      }
      renkVer(geo, (x, y, z, c) => {
        const r = Math.hypot(x, z) / Rr, a = Math.atan2(z, x);
        const damar = Math.pow(Math.abs(Math.sin(a * 14 + li)), 30) * (1 - r) * 0.5; // açık damarlar
        c.copy(R("#d6e9a0")).lerp(R("#6aa335"), Math.pow(r, 1.1)).lerp(R("#eef4cf"), damar);
        c.offsetHSL(0, 0, (fbm3(x * 6, z * 6, li, 2) - 0.5) * 0.1);
      });
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, M.marul); m.rotation.y = don; m.position.y = dy; m.castShadow = true; m.receiveShadow = true; g.add(m);
    });
    return { g, h: 0.1 };
  }
  function domates() {
    const g = new THREE.Group();
    [[-0.42, 0.18, 0.1, 0.03], [0.46, -0.05, -0.1, -0.03], [-0.05, -0.5, 0.05, 0.02]].forEach(([x, z, r, t], i) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.09, 72), [M.domatesYan, M.domatesKesit, M.domatesKesit]);
      m.position.set(x, 0.045 + i * 0.012, z); m.rotation.set(t, r + i, 0); m.castShadow = true; m.receiveShadow = true; g.add(m);
    });
    return { g, h: 0.1 };
  }
  function kofte(tohum) { // kenarları çıtır, üstü pürüzlü, %100 dana
    const H = 0.3, Rk = 1.06, prof = [];
    for (let i = 0; i <= 14; i++) prof.push(new THREE.Vector2((i / 14) * (Rk - 0.12), 0)); // alt yüz
    for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + (i / 16) * Math.PI; prof.push(new THREE.Vector2(Rk - 0.12 + Math.cos(a) * 0.12 + (i > 3 && i < 13 ? 0.02 : 0), H / 2 + Math.sin(a) * H / 2)); }
    for (let i = 14; i >= 0; i--) prof.push(new THREE.Vector2((i / 14) * (Rk - 0.12), H)); // üst yüz
    const geo = new THREE.LatheGeometry(prof, 200);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const r = Math.hypot(x, z), a = Math.atan2(z, x), ux = Math.cos(a), uz = Math.sin(a);
      const kenar = 1 + 0.045 * (fbm3(ux * 1.6 + tohum, uz * 1.6, tohum, 3) - 0.5) * 2 + 0.03 * (fbm3(ux * 7, uz * 7, tohum + 4, 2) - 0.5);
      const rr = r * kenar;
      const ustte = y > H * 0.6 ? 1 : 0, altta = y < H * 0.4 ? 1 : 0;
      y += (ustte - altta * 0.6) * 0.035 * (fbm3(x * 2.5 + tohum, z * 2.5, 1, 3) - 0.45) * Math.min(1, (Rk - r) * 8 + 0.3);
      y += 0.015 * (fbm3(ux * 9, y * 9, uz * 9 + tohum, 2) - 0.5) * (1 - ustte) * (1 - altta);
      p.setXYZ(i, ux * rr, y, uz * rr);
    }
    geo.computeVertexNormals();
    renkVer(geo, (x, y, z, c) => { // Beytuş köftesi: koyu kızarmış, kenarlar çıtır
      const r = Math.hypot(x, z), kenar = sinirla((r - 0.82) / 0.24);
      const n1 = fbm3(x * 3 + tohum, y * 3, z * 3, 4), n2 = fbm3(x * 11, y * 11, z * 11 + tohum, 2);
      c.copy(R("#5c2a10")).lerp(R("#2c1207"), sinirla(n1 * 1.7 - 0.4)).lerp(R("#160803"), kenar * 0.75 * n2 + Math.pow(n2, 3) * 0.45);
      if (n2 > 0.7) c.lerp(R("#8f4f22"), (n2 - 0.7) * 2.4);
    });
    const m = new THREE.Mesh(geo, M.kofte); m.castShadow = true; m.receiveShadow = true;
    const g = new THREE.Group(); g.add(m); return { g, h: H };
  }
  function cheddar(don) { // köfte kenarından sarkan, ısıdan erimiş dilim
    const geo = new THREE.PlaneGeometry(1.92, 1.92, 70, 70).rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), z = p.getZ(i);
      const d = Math.hypot(x, z), a = Math.atan2(z, x);
      let y = 0.006 * Math.sin(x * 7 + don) * Math.cos(z * 6);
      const esik = 0.92 + 0.04 * Math.sin(a * 3 + don);
      if (d > esik) { const t = d - esik, yeni = Math.min(d, 1.12 + t * 0.1); y -= Math.pow(t, 1.3) * 0.62; x *= yeni / d; z *= yeni / d; } // kenardan biraz sarkar
      p.setXYZ(i, x, y + 0.012, z);
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, M.cheddar); m.rotation.y = don; m.castShadow = true; m.receiveShadow = true;
    const g = new THREE.Group(); g.add(m); return { g, h: 0.025 };
  }
  function sogan() { // karamelize soğan
    const g = new THREE.Group();
    for (let i = 0; i < 26; i++) {
      const r = 0.12 + ozet(i * 3.3) * 0.22, yay = 1.0 + ozet(i * 5.1) * 2.2;
      const geo = new THREE.TorusGeometry(r, 0.034 + ozet(i) * 0.012, 8, 40, yay); geo.scale(1, 1, 0.38); // yassı şerit
      const m = new THREE.Mesh(geo, M.sogan);
      const a = ozet(i * 1.9) * Math.PI * 2, rr = Math.sqrt(ozet(i * 2.7)) * 0.78;
      m.position.set(Math.cos(a) * rr, 0.03 + ozet(i * 4.4) * 0.035, Math.sin(a) * rr);
      m.rotation.set(Math.PI / 2 + (ozet(i * 6.1) - 0.5) * 0.35, (ozet(i * 7.3) - 0.5) * 0.3, ozet(i * 8.9) * Math.PI * 2);
      m.castShadow = true; g.add(m);
    }
    return { g, h: 0.07 };
  }
  function tursu() {
    const g = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.4, merkez = i === 5;
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.035, 48), [M.tursuYan, M.tursuKesit, M.tursuKesit]);
      m.position.set(merkez ? 0.05 : Math.cos(a) * 0.52, 0.02 + (merkez ? 0.03 : 0), merkez ? 0.02 : Math.sin(a) * 0.52);
      m.rotation.set((ozet(i * 3) - 0.5) * 0.25, 0, (ozet(i * 5) - 0.5) * 0.25); m.castShadow = true; g.add(m);
    }
    return { g, h: 0.05 };
  }

  // ---------- sahne ----------
  const sahne = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  sahne.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  sahne.environmentIntensity = 0.5;
  const kamera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const anaIsik = new THREE.DirectionalLight("#fff3e2", 3.6);
  anaIsik.position.set(-4, 7, 5); anaIsik.castShadow = true;
  anaIsik.shadow.mapSize.set(kucukEkran ? 1024 : 2048, kucukEkran ? 1024 : 2048);
  Object.assign(anaIsik.shadow.camera, { left: -5, right: 5, top: 6, bottom: -4, near: 1, far: 24 });
  anaIsik.shadow.radius = 5; anaIsik.shadow.bias = -0.0005; anaIsik.shadow.normalBias = 0.025;
  sahne.add(anaIsik);
  const arkaIsik = new THREE.DirectionalLight("#ffb36b", 3.0); arkaIsik.position.set(5, 4, -5); sahne.add(arkaIsik);
  const dolguIsik = new THREE.DirectionalLight("#fff0e0", 0.7); dolguIsik.position.set(3, 1.2, 6); sahne.add(dolguIsik);
  const altIsik = new THREE.DirectionalLight("#ffe3bd", 1.1); altIsik.position.set(-1, -4, 5); sahne.add(altIsik);

  const kok = new THREE.Group(); sahne.add(kok);
  const donus = new THREE.Group(); kok.add(donus);
  const zemin = new THREE.Mesh(new THREE.PlaneGeometry(14, 14).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ color: "#5a2300", opacity: 0.26 }));
  zemin.receiveShadow = true; kok.add(zemin);

  // alttan üste: alt ekmek, marul, domates, köfte, cheddar, köfte, cheddar, karamelize soğan, turşu, üst ekmek (altında Beytuş Burger Sos)
  const tanim = [altEkmek(), marul(), domates(), kofte(1.3), cheddar(0.35), kofte(7.7), cheddar(1.2), sogan(), tursu(), ustEkmek()];
  const bas = [0, 0.035, 0.03, 0.02, 0.0, 0.05, 0.0, 0.03, 0.03, -0.01]; // altındakine gömülme
  const ARA = 0.44; // açılmış hâlde katlar arası
  let y = 0, yAcik = 0;
  const parcalar = tanim.map((t, i) => {
    const yer = new THREE.Group(); yer.add(t.g); donus.add(yer);
    if (i) { y -= bas[i]; yAcik += ARA; }
    // temas gölgesi: katın altında, oturunca belirginleşir
    const tm = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5).rotateX(-Math.PI / 2), M.temas.clone());
    tm.position.y = 0.006; tm.renderOrder = 1;
    if (i) yer.add(tm);
    const p = { yer, tm: i ? tm : null, h: t.h, asm: { x: 0, y, z: 0, rx: 0, ry: 0, rz: 0 }, acik: { x: 0, y: y + yAcik, z: 0, rx: 0.3, ry: (i % 2 ? 0.22 : -0.22), rz: (ozet(i * 8.1) - 0.5) * 0.12 } };
    y += t.h; return p;
  });
  // temas gölgesi bir alttaki katın üstüne düşmeli: alt kata göre konum
  parcalar.forEach((p, i) => { if (p.tm) { p.tm.position.y = i === 9 ? -0.06 : -0.004; p.tm.scale.setScalar(i === 9 ? 0.98 : i === 1 ? 0.9 : 0.86); } });
  const n = parcalar.length, boyKapali = y, boyAcik = parcalar[n - 1].acik.y + parcalar[n - 1].h;
  const merkez = (i, j) => (parcalar[i].acik.y + parcalar[j].acik.y + parcalar[j].h) / 2;

  // ---------- kaydırma: anlar ----------
  // 0–.07 oturmuş · .07–.24 açılır · .30–.44 köfte · .50–.62 yeşillik · .67–.75 sos · .78–.9 sırayla oturur · .9–1 son
  const A = { acBas: 0.07, acSon: 0.24, kapBas: 0.77, kapSon: 0.9 };
  let genis = innerWidth >= 900;
  function cerceveler() { // [p, x, ekranY, ölçek, odak(yerel y), kapalı mı]
    const g = genis;
    const ek = g ? 0.95 : 1.6, x0 = g ? 1.55 : 0, sk = g ? 1.12 : 0.78, sa = g ? 0.56 : 0.47, sf = g ? 0.84 : 0.62;
    const kap = boyKapali / 2, ac = boyAcik / 2;
    return [
      [0, x0, ek, sk, kap],
      [A.acBas, x0, ek, sk, kap],
      [A.acSon, g ? 1.7 : 0, ek, sa, ac],
      [0.3, g ? 1.6 : 0, ek, sf, merkez(3, 6)],
      [0.44, g ? 1.6 : 0, ek, sf, merkez(3, 6)],
      [0.5, g ? 1.6 : 0, ek, sf, merkez(0, 2) + 0.15],
      [0.62, g ? 1.6 : 0, ek, sf, merkez(0, 2) + 0.15],
      [0.67, g ? 1.6 : 0, ek, sf, merkez(8, 9) - 0.1],
      [0.75, g ? 1.6 : 0, ek, sf, merkez(8, 9) - 0.1],
      [A.kapBas + 0.02, g ? 1.7 : 0, ek, sa, ac],
      [A.kapSon, x0, ek, sk, kap],
      [1, x0, ek, sk, kap],
    ];
  }
  let CK = cerceveler();
  function cerceve(p) {
    for (let i = 1; i < CK.length; i++) if (p <= CK[i][0]) {
      const a = CK[i - 1], b = CK[i], t = icDis((p - a[0]) / (b[0] - a[0] || 1));
      return { x: karis(a[1], b[1], t), ey: karis(a[2], b[2], t), s: karis(a[3], b[3], t), o: karis(a[4], b[4], t) };
    }
    const s = CK[CK.length - 1]; return { x: s[1], ey: s[2], s: s[3], o: s[4] };
  }
  function acilma(p, i) { // 0 = oturmuş, 1 = açık
    const s = i / (n - 1);
    if (p < A.acBas) return 0;
    if (p < A.kapBas) return icDis(((p - A.acBas) / (A.acSon - A.acBas)) * 1.5 - (1 - s) * 0.5); // üstteki önce kalkar
    if (p < A.kapSon) return 1 - geriCik(((p - A.kapBas) / (A.kapSon - A.kapBas)) * 1.7 - s * 0.7); // alttan üste sırayla oturur
    return 0;
  }

  // ---------- zemin rengi (bölüme göre değişir) ----------
  const renkler = [[0, "#ffc43d"], [0.2, "#ffa64d"], [0.36, "#ffb38a"], [0.56, "#c3e07c"], [0.71, "#ffd9a6"], [0.86, "#ffc43d"], [1, "#ffc43d"]].map(([p, h]) => [p, R(h)]);
  const zr = new THREE.Color(), zr2 = new THREE.Color();
  let sonZemin = "";
  function zeminRengi(p) {
    for (let i = 1; i < renkler.length; i++) if (p <= renkler[i][0]) { zr.copy(renkler[i - 1][1]).lerp(renkler[i][1], yumusak((p - renkler[i - 1][0]) / (renkler[i][0] - renkler[i - 1][0]))); break; }
    zr2.copy(zr).lerp(R("#ffffff"), 0.38);
    const s = zr.getHexString() + zr2.getHexString();
    if (s !== sonZemin) { sonZemin = s; sabit.style.setProperty("--zemin", "#" + zr.getHexString()); sabit.style.setProperty("--zemin-2", "#" + zr2.getHexString()); }
  }

  // ---------- yazı kartları: satırlar maskeden kayarak gelir ----------
  const kartlar = [...document.querySelectorAll(".vurus")].map((el) => ({ el, a: +el.dataset.bas, b: +el.dataset.son, satir: [...el.querySelectorAll(".satir > span")], digerleri: [...el.querySelectorAll(".no, p, .dugmeler, .kucuk")] }));
  const cizgi = document.querySelector(".sahne3d .ilerle i");
  const onceki = new Map();
  function yaz(el, ad, deger) { const k = onceki.get(el) || {}; if (k[ad] !== deger) { k[ad] = deger; onceki.set(el, k); if (ad === "o") el.style.opacity = deger; else if (ad === "v") el.style.visibility = deger; else el.style.transform = deger; } }
  function kartGuncelle(p, giris) {
    kartlar.forEach((k) => {
      const gir = k.a <= 0 ? sinirla((giris - 0.3) / 0.7) : sinirla((p - k.a) / 0.05), cik = k.b >= 1 ? 1 : 1 - sinirla((p - k.b) / 0.04);
      const v = Math.min(gir, cik);
      yaz(k.el, "v", v < 0.005 ? "hidden" : "visible");
      if (v < 0.005) return;
      k.satir.forEach((s, j) => {
        const tg = disa(gir * 1.35 - j * 0.18), tc = cik >= 1 ? 1 : yumusak(cik * 1.3 - (k.satir.length - 1 - j) * 0.15);
        yaz(s, "t", "translate3d(0," + ((1 - tg) * 112 - (1 - tc) * 112).toFixed(1) + "%,0)");
      });
      k.digerleri.forEach((d) => { yaz(d, "o", (yumusak(gir * 1.4 - 0.3) * yumusak(cik)).toFixed(3)); });
    });
    if (cizgi) yaz(cizgi, "t", "scaleX(" + p.toFixed(4) + ")");
  }

  // ---------- boyut ----------
  function boyutla() {
    const w = tuval.clientWidth, h = tuval.clientHeight;
    genis = innerWidth >= 900; CK = cerceveler();
    renderer.setSize(w, h, false);
    kamera.aspect = w / h;
    kamera.fov = genis ? 26 : 30;
    kamera.position.set(0, 2.6, genis ? 11 : 11.5); kamera.lookAt(0, 1.05, 0);
    kamera.updateProjectionMatrix();
  }
  boyutla(); addEventListener("resize", boyutla);

  // ---------- döngü ----------
  const durum = { hedef: 0, simdi: 0, inis: false, ezil: 0 };
  function ilerleme() { const r = bolum.getBoundingClientRect(), yol = bolum.offsetHeight - innerHeight; return sinirla(-r.top / (yol || 1)); }
  durum.hedef = durum.simdi = ilerleme();
  addEventListener("scroll", () => { durum.hedef = ilerleme(); }, { passive: true });
  let gorunur = true;
  new IntersectionObserver((g) => { gorunur = g[0].isIntersecting; }).observe(bolum);
  const saat = new THREE.Clock();
  let fx = 0, fy = 0, hx = 0, hy = 0, oncekiZaman = 0, hazirZaman = -1, girisBitti = false;
  if (matchMedia("(hover: hover)").matches) addEventListener("pointermove", (e) => { hx = e.clientX / innerWidth - 0.5; hy = e.clientY / innerHeight - 0.5; }, { passive: true });

  function adim(zaman) {
    const dt = Math.min(0.05, zaman - oncekiZaman); oncekiZaman = zaman;
    if (hazirZaman < 0) hazirZaman = zaman;
    const giris = test || azHareket ? 1 : sinirla((zaman - hazirZaman) / 1.5);
    if (giris >= 1 && !girisBitti) { girisBitti = true; if (!test && !azHareket) durum.ezil = 1; }
    durum.simdi += (durum.hedef - durum.simdi) * (test ? 1 : 1 - Math.exp(-dt * 7));
    const p = testP ? +testP[1] : azHareket ? 0 : durum.simdi;
    if (p >= A.kapSon - 0.004 && !durum.inis) { durum.inis = true; durum.ezil = 1; }
    if (p < A.kapSon - 0.03) durum.inis = false;
    durum.ezil = Math.max(0, durum.ezil - dt * 2.2);
    const c = cerceve(p);
    kok.position.set(c.x, c.ey - c.o * c.s, 0); kok.scale.setScalar(c.s);
    fx += (hx - fx) * 0.05; fy += (hy - fy) * 0.05;
    const don = azHareket ? 0 : zaman * 0.16;
    donus.rotation.y = -0.6 + p * Math.PI * 1.5 + don + fx * 0.45;
    donus.rotation.x = fy * 0.12;
    const ez = Math.sin(durum.ezil * Math.PI) * 0.045 * durum.ezil;
    donus.scale.set(1 + ez, 1 - ez * 1.5, 1 + ez);
    for (let i = 0; i < n; i++) {
      const P = parcalar[i], t = acilma(p, i);
      const sz = Math.sin(zaman * (0.8 + i * 0.07) + i * 1.7) * 0.035 * t; // havada hafif süzülme
      const dus = sinirla(giris * 1.8 - (i / (n - 1)) * 0.8), d = 1 - dus * dus; // yerçekimiyle düşer
      P.yer.position.set(0, karis(P.asm.y, P.acik.y, t) + sz + d * (3.4 + i * 0.3), 0);
      P.yer.rotation.set(P.acik.rx * t, P.acik.ry * t, P.acik.rz * t + sz * 0.5);
      if (P.tm) P.tm.material.opacity = 0.42 * Math.pow(1 - sinirla(t * 3), 2) * (1 - d);
    }
    zeminRengi(p);
    kartGuncelle(p, giris);
    renderer.render(sahne, kamera);
  }
  function kare() { requestAnimationFrame(kare); if (gorunur) adim(saat.getElapsedTime()); }
  // deneme için: belli bir ilerlemede tek kare çiz (ekran görüntüsü alırken)
  window.__burger3d = (p) => { durum.hedef = durum.simdi = p; adim(saat.getElapsedTime()); };
  kare();
  bolum.classList.add("hazir");
}

if (bolum && tuval) kur();
