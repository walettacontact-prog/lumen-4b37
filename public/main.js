(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ── 3D parçacık sahnesi (WebGL2) ───────────────────────────────
     Tüm hareket GPU'da hesaplanır; işlemci her karede sadece birkaç
     sayı gönderir. Bu yüzden telefonlarda da akıcı çalışır. */

  const VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aHome;
layout(location=1) in vec4 aSeed;
layout(location=2) in vec3 aSphere;
layout(location=3) in float aKind;
uniform mat4 uProj;
uniform float uTime, uIntro, uScroll, uEnd, uPage, uSize, uCamZ, uNameAlpha, uDustY, uDustA;
uniform vec3 uMouse;
uniform vec2 uTilt;
uniform vec4 uSphere;
out float vAlpha;
out float vHeat;

mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }

void main() {
  vec3 p;
  float alpha;
  float heat = 0.;
  if (aKind < .5) {
    // Açılış: uzaktaki bir girdaptan dönerek yerine oturur
    float delay = aSeed.x * .45 + clamp(aHome.x * .08 + .5, 0., 1.) * .35;
    float k = clamp(uIntro * 1.8 - delay, 0., 1.);
    float e = 1. - pow(1. - k, 4.);
    float ang = aSeed.y * 6.2831853;
    float r = 3.5 + aSeed.z * 6.;
    vec3 start = vec3(cos(ang) * r, (aSeed.w - .5) * 8., sin(ang) * r - 4.);
    p = rotY((1. - e) * 2.6) * mix(start, aHome, e);
    p += .012 * vec3(sin(uTime * 1.3 + aSeed.y * 60.), cos(uTime * 1.1 + aSeed.z * 60.), sin(uTime * .9 + aSeed.w * 60.));

    // Kaydırınca: her parçacık kendi yönüne patlar
    float s = uScroll * uScroll;
    vec3 dir = normalize(vec3(aSeed.y - .5, aSeed.z - .5, (aSeed.w - .35) * 1.4) + 1e-4);
    p += dir * s * (2.5 + aSeed.x * 7.);

    // Sayfa sonu: dönen bir küreye toplanır
    float g = clamp(uEnd * 1.5 - aSeed.x * .5, 0., 1.);
    g = g * g * (3. - 2. * g);
    vec3 sph = rotY(uTime * .15) * rotX(.4) * aSphere * uSphere.w + uSphere.xyz;
    p = mix(p, sph, g);

    alpha = uNameAlpha * min(1., uIntro * 4.) * mix(1. - s * .8, 1., g);
    heat = max((1. - e) * .9, s * .5 * (1. - g));
  } else {
    // Arka plandaki toz: yakın olan daha hızlı kayar (derinlik hissi)
    p = aHome;
    float sp = .25 + .75 * (aHome.z + 12.) / 13.5;
    p.y = mod(p.y + uPage * sp * 1.6 + uDustY, 2. * uDustY) - uDustY;
    p.x += sin(uTime * .07 + aSeed.y * 6.2831853) * .25;
    alpha = (.22 + aSeed.w * .45) * uDustA;
  }

  // İmleç: parçacıkları iter ve kameraya doğru kabartır
  vec2 d = p.xy - uMouse.xy;
  float f = uMouse.z * (1. - smoothstep(0., .75, length(d)));
  p.xy += normalize(d + 1e-5) * f * .3;
  p.z += f * .9;
  heat = max(heat, f * .9);

  p = rotX(uTilt.y) * rotY(uTilt.x) * p;
  vec4 view = vec4(p.x, p.y, p.z - uCamZ, 1.);
  float depth = -view.z;
  gl_Position = depth < .4 ? vec4(2., 2., 2., 1.) : uProj * view;
  gl_PointSize = uSize * (.6 + aSeed.z * .8) * uCamZ / max(depth, .4);
  vAlpha = alpha * smoothstep(.4, 1.6, depth);
  vHeat = heat;
}`;

  const FS = `#version 300 es
precision mediump float;
in float vAlpha;
in float vHeat;
uniform vec3 uColA, uColB;
out vec4 outColor;
void main() {
  vec2 c = gl_PointCoord - .5;
  float d = dot(c, c);
  if (d > .25) discard;
  float a = (1. - d * 4.) * vAlpha;
  outColor = vec4(mix(uColA, uColB, clamp(vHeat, 0., 1.)) * a, 1.);
}`;

  // Ay: tek bir kare üzerine, ışığı ve kraterleri anlık hesaplanan bir küre çizilir
  const MOON_VS = `#version 300 es
precision highp float;
uniform mat4 uProj;
uniform vec3 uMoon;
uniform vec2 uTilt;
uniform vec2 uRes;
uniform float uPx, uCamZ;
out vec2 vUv;

mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }

void main() {
  vec2 c = vec2(float(gl_VertexID & 1), float((gl_VertexID >> 1) & 1)) * 2. - 1.;
  vec3 p = rotX(uTilt.y) * rotY(uTilt.x) * uMoon;
  vec4 clip = uProj * vec4(p.x, p.y, p.z - uCamZ, 1.);
  clip.xy += c * uPx * 2. / uRes * clip.w;
  gl_Position = clip;
  vUv = c;
}`;

  const MOON_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform float uTime, uFade;
out vec4 outColor;

float hash(vec3 p) { p = fract(p * .3183099 + .1); p *= 17.; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3. - 2. * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= .5; } return v; }

void main() {
  vec2 uv = vUv * 1.9;
  float r = length(uv);
  vec3 col = vec3(0.);
  float a = 0.;
  if (r < 1.) {
    vec3 n = vec3(uv, sqrt(1. - r * r));
    float ang = uTime * .03;
    vec3 q = vec3(n.x * cos(ang) - n.z * sin(ang), n.y, n.x * sin(ang) + n.z * cos(ang));
    float maria = smoothstep(.42, .62, fbm(q * 2.1 + 4.));
    float detail = fbm(q * 10.);
    float pits = smoothstep(.68, .8, noise(q * 18.));
    vec3 base = mix(vec3(.88, .86, .81), vec3(.47, .46, .44), maria * .8);
    base *= .8 + detail * .35;
    base *= 1. - pits * .25;
    float light = smoothstep(-.1, .45, dot(n, normalize(vec3(-.8, .4, .45))));
    a = 1. - smoothstep(.96, 1., r);
    col = base * (light + .03) * a;
  }
  float glow = exp(-max(r - 1., 0.) * 4.) * .14 * smoothstep(.95, 1.05, r);
  col += vec3(.95, .92, .85) * glow;
  a = max(a, glow);
  outColor = vec4(col, a) * uFade;
}`;

  const FOV = (40 * Math.PI) / 180;
  const CAMZ = 6;
  const TAN = Math.tan(FOV / 2);
  const HALF_H = TAN * CAMZ;
  const DUST_Y = 7;
  const STRIDE = 11;

  const canvas = document.getElementById('gl');
  let gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, powerPreference: 'high-performance' });
  const U = {};
  const UM = {};
  let prog, moonProg, pVao, moonVao;
  let buf, count = 0, aspect = 1, halfW = 1, narrow = false;
  let nameReady = false, introStart = 0, sized = false;
  let sphere = [0, 0, 0, 1];
  let moon = [0, 0, -10], moonMaxY = 0;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  function link(vs, fs, names, store) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    for (const n of names) store[n] = gl.getUniformLocation(p, n);
    return p;
  }

  function initGL() {
    moonProg = link(MOON_VS, MOON_FS, ['uProj', 'uMoon', 'uTilt', 'uRes', 'uPx', 'uCamZ', 'uTime', 'uFade'], UM);
    moonVao = gl.createVertexArray();
    gl.useProgram(moonProg);
    gl.uniform1f(UM.uCamZ, CAMZ);

    prog = link(VS, FS, ['uProj', 'uTime', 'uIntro', 'uScroll', 'uEnd', 'uPage', 'uSize', 'uCamZ', 'uNameAlpha',
      'uDustY', 'uDustA', 'uMouse', 'uTilt', 'uSphere', 'uColA', 'uColB'], U);
    gl.useProgram(prog);
    pVao = gl.createVertexArray();
    gl.bindVertexArray(pVao);
    buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    const B = STRIDE * 4;
    [[0, 3, 0], [1, 4, 12], [2, 3, 28], [3, 1, 40]].forEach(([loc, size, offset]) => {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, B, offset);
    });

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.clearColor(6 / 255, 6 / 255, 6 / 255, 1);
    gl.uniform1f(U.uCamZ, CAMZ);
    gl.uniform1f(U.uDustY, DUST_Y);
    gl.uniform3f(U.uColA, 0.95, 0.93, 0.89);
    gl.uniform3f(U.uColB, 1, 0.35, 0.12);
  }

  function perspective(fovy, asp, near, far) {
    const f = 1 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);
    return new Float32Array([f / asp, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
  }

  // İsmi görünmez bir tuvale yazar, dolu pikselleri örnekler
  function sampleName(lines, target, maxW, maxH, spacing) {
    const c = document.createElement('canvas');
    const o = c.getContext('2d', { willReadFrequently: true });
    const fs = 200;
    const lh = fs * 0.92;
    const font = () => {
      o.font = `600 ${fs}px "Geist", ui-sans-serif, system-ui, sans-serif`;
      if ('letterSpacing' in o) o.letterSpacing = `${fs * spacing}px`;
    };
    font();
    const tw = Math.ceil(Math.max(...lines.map(l => o.measureText(l).width)));
    c.width = tw + 40;
    c.height = Math.ceil(lh * lines.length + fs * 0.4);
    font();
    o.fillStyle = '#fff';
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    lines.forEach((l, i) => o.fillText(l, c.width / 2, c.height / 2 + (i - (lines.length - 1) / 2) * lh));

    const img = o.getImageData(0, 0, c.width, c.height).data;
    let step = 2;
    let pts;
    do {
      pts = [];
      for (let y = 0; y < c.height; y += step)
        for (let x = 0; x < c.width; x += step)
          if (img[(y * c.width + x) * 4 + 3] > 128) pts.push(x - c.width / 2, c.height / 2 - y);
    } while (pts.length / 2 > target && ++step);
    // Dünya birimine ölçek: hem genişliğe hem yüksekliğe sığacak kadar
    return { pts, step, scale: Math.min(maxW / tw, maxH / c.height) };
  }

  function build() {
    const layers = narrow ? 2 : 3;
    const name = nameReady
      ? sampleName(
          narrow ? ['NURETTİN', 'ENSAR', 'OCAKÇI'] : ['NURETTİN', 'ENSAR OCAKÇI'],
          narrow ? 4200 : 7000,
          halfW * 2 * (narrow ? 0.84 : 0.78),
          HALF_H * 2 * (narrow ? 0.42 : 0.5),
          narrow ? 0.03 : -0.03,
        )
      : null;
    const nN = name ? (name.pts.length / 2) * layers : 0;
    const dN = narrow ? 1200 : 2400;
    const data = new Float32Array((nN + dN) * STRIDE);
    const rnd = Math.random;
    let o = 0;

    if (name) {
      const scale = name.scale;
      const jitter = name.step * scale * (narrow ? 0.4 : 0.7);
      const yOff = HALF_H * (narrow ? 0.1 : 0.06);
      for (let i = 0; i < name.pts.length; i += 2) {
        for (let l = 0; l < layers; l++) {
          data[o++] = name.pts[i] * scale + (rnd() - 0.5) * jitter;
          data[o++] = name.pts[i + 1] * scale + yOff + (rnd() - 0.5) * jitter;
          data[o++] = (l / (layers - 1) - 0.5) * (narrow ? 0.14 : 0.24) + (rnd() - 0.5) * 0.04;
          data[o++] = rnd(); data[o++] = rnd(); data[o++] = rnd(); data[o++] = rnd();
          const u = rnd() * 2 - 1;
          const th = rnd() * Math.PI * 2;
          const r = Math.sqrt(1 - u * u);
          const rr = 0.94 + rnd() * 0.12;
          data[o++] = r * Math.cos(th) * rr; data[o++] = u * rr; data[o++] = r * Math.sin(th) * rr;
          data[o++] = 0;
        }
      }
      if (!introStart) introStart = performance.now();
    }

    for (let i = 0; i < dN; i++) {
      const z = -12 + rnd() * 13.5;
      data[o++] = (rnd() * 2 - 1) * TAN * (CAMZ - z) * aspect * 1.1;
      data[o++] = (rnd() * 2 - 1) * DUST_Y;
      data[o++] = z;
      data[o++] = rnd(); data[o++] = rnd(); data[o++] = rnd(); data[o++] = rnd();
      data[o++] = 0; data[o++] = 0; data[o++] = 0;
      data[o++] = 1;
    }

    count = nN + dN;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    sphere = narrow
      ? [0, HALF_H * 0.55, -0.5, halfW * 0.66]
      : [halfW * 0.46, 0, 0, Math.min(1.7, HALF_H * 0.7)];

    // Ay sağ üstte, çok uzakta durur
    const far = TAN * (CAMZ - moon[2]);
    moon = narrow ? [far * aspect * 0.5, far * 0.62, moon[2]] : [far * aspect * 0.64, far * 0.52, moon[2]];
    moonMaxY = far * (narrow ? 0.76 : 0.8);
  }

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, w < 760 ? 1.75 : 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect = w / h;
    halfW = HALF_H * aspect;
    narrow = aspect < 0.85;
    const proj = perspective(FOV, aspect, 0.1, 100);
    gl.useProgram(moonProg);
    gl.uniformMatrix4fv(UM.uProj, false, proj);
    gl.uniform2f(UM.uRes, canvas.width, canvas.height);
    gl.uniform1f(UM.uPx, (narrow ? 24 : 32) * 1.9 * dpr);
    gl.useProgram(prog);
    gl.uniformMatrix4fv(U.uProj, false, proj);
    gl.uniform1f(U.uSize, (narrow ? 2.1 : 2.6) * dpr);
    gl.uniform1f(U.uNameAlpha, narrow ? 0.7 : 0.5);
    build();
    return true;
  }

  function fontsReady() {
    // Metni de veriyoruz ki İ harfini içeren Türkçe karakter seti de yüklensin
    const load = document.fonts ? document.fonts.load('600 100px "Geist"', 'NURETTİN ENSAR OCAKÇI') : null;
    return Promise.race([load, new Promise(r => setTimeout(r, 1800))]).catch(() => {});
  }

  if (gl) {
    try {
      initGL();
    } catch (err) {
      console.error(err);
      gl = null;
    }
  }

  if (gl) {
    let resizeTimer;
    new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { sized = resize() || sized; }, sized ? 120 : 0);
    }).observe(canvas);

    fontsReady().then(() => {
      nameReady = true;
      if (sized) build();
    });

    canvas.addEventListener('webglcontextlost', e => {
      e.preventDefault();
      gl = null;
      root.classList.add('nogl');
    });
  } else {
    root.classList.add('nogl');
  }

  /* ── İmleç ve dokunma ───────────────────────────────────────── */
  const m = { x: 0, y: 0, tx: 0, ty: 0, on: 0, ton: 0 };
  const tilt = { x: 0, y: 0 };
  const setPtr = (cx, cy) => {
    m.tx = (cx / innerWidth) * 2 - 1;
    m.ty = 1 - (cy / (canvas.clientHeight || innerHeight)) * 2;
    m.ton = 1;
  };
  const clearPtr = () => { m.ton = 0; };
  addEventListener('pointermove', e => setPtr(e.clientX, e.clientY), { passive: true });
  addEventListener('touchstart', e => e.touches[0] && setPtr(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  addEventListener('touchmove', e => e.touches[0] && setPtr(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  addEventListener('touchend', clearPtr, { passive: true });
  document.documentElement.addEventListener('mouseleave', clearPtr);

  /* ── Kaydırdıkça kelime kelime yanan metin ─────────────────── */
  const words = [];
  (function split(node) {
    for (const n of [...node.childNodes]) {
      if (n.nodeType === 1) { split(n); continue; }
      if (n.nodeType !== 3) continue;
      const frag = document.createDocumentFragment();
      for (const part of n.textContent.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { frag.append(part); continue; }
        const s = document.createElement('span');
        s.className = 'w';
        s.textContent = part;
        frag.append(s);
        words.push(s);
      }
      n.replaceWith(frag);
    }
  })(document.querySelector('.reveal'));

  function revealWords(vh, vw) {
    if (reduce) return;
    const rects = words.map(w => w.getBoundingClientRect());
    for (let i = 0; i < words.length; i++) {
      const pos = rects[i].top + (rects[i].left / vw) * vh * 0.12;
      const v = (0.16 + 0.84 * clamp((vh * 0.8 - pos) / (vh * 0.25), 0, 1)).toFixed(2);
      if (words[i]._o !== v) { words[i]._o = v; words[i].style.opacity = v; }
    }
  }

  /* ── Kayan yazı bandı: kaydırma hızına ve yönüne tepki verir ── */
  const track = document.querySelector('.track');
  let mqW = 0;
  let mqX = 0;
  new ResizeObserver(() => { mqW = track.scrollWidth / 2; }).observe(track);

  /* ── Ana döngü ──────────────────────────────────────────────── */
  const endEl = document.getElementById('iletisim');
  let raf = 0;
  let lastY = -1;
  let vel = 0;
  let spCss = -1;
  let sS = 0;
  let eS = 0;
  const t0 = performance.now();

  function frame(now) {
    raf = 0;
    const y = scrollY;
    const vh = innerHeight;
    const vw = innerWidth;
    const dy = lastY < 0 ? 0 : y - lastY;
    const scrolled = y !== lastY;
    lastY = y;

    // Önce okumalar, sonra yazmalar
    const endTop = gl ? endEl.getBoundingClientRect().top : 0;
    if (scrolled) revealWords(vh, vw);

    const heroP = clamp(y / (vh * 0.9), 0, 1);
    if (Math.abs(heroP - spCss) > 0.002) {
      spCss = heroP;
      root.style.setProperty('--sp', heroP.toFixed(3));
    }

    vel = lerp(vel, dy, 0.12);
    if (mqW && !reduce) {
      const dir = vel < -0.5 ? -1 : 1;
      mqX -= (0.7 + Math.min(Math.abs(vel), 60) * 0.35) * dir;
      if (mqX <= -mqW) mqX += mqW;
      if (mqX > 0) mqX -= mqW;
      track.style.transform = `translate3d(${mqX.toFixed(1)}px,0,0)`;
    }

    if (gl && count) {
      const t = reduce ? 0 : (now - t0) / 1000;
      const intro = reduce ? 1 : introStart ? clamp((now - introStart) / 2600, 0, 1) : 0;
      sS = reduce ? heroP : lerp(sS, heroP, 0.1);
      eS = lerp(eS, clamp(1 - endTop / (vh * 0.85), 0, 1), reduce ? 1 : 0.08);
      m.x = lerp(m.x, m.tx, 0.1);
      m.y = lerp(m.y, m.ty, 0.1);
      m.on = lerp(m.on, m.ton, 0.06);
      const sway = reduce ? 0 : 1 - m.on;
      tilt.x = lerp(tilt.x, m.x * 0.28 * m.on + Math.sin(t * 0.35) * 0.12 * sway, 0.05);
      tilt.y = lerp(tilt.y, -m.y * 0.2 * m.on + Math.sin(t * 0.27) * 0.05 * sway, 0.05);

      const fade = reduce ? 1 : clamp(t * 0.7, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Önce ay (normal karışım), sonra parçacıklar (ışık gibi üst üste toplanır)
      gl.useProgram(moonProg);
      gl.bindVertexArray(moonVao);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform3f(UM.uMoon, moon[0], Math.min(moon[1] + (y / vh) * 0.3, moonMaxY), moon[2]);
      gl.uniform2f(UM.uTilt, tilt.x * 0.3, tilt.y * 0.3);
      gl.uniform1f(UM.uTime, t);
      gl.uniform1f(UM.uFade, fade * (1 - eS));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      gl.useProgram(prog);
      gl.bindVertexArray(pVao);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.uniform1f(U.uTime, t);
      gl.uniform1f(U.uIntro, intro);
      gl.uniform1f(U.uScroll, sS);
      gl.uniform1f(U.uEnd, eS);
      gl.uniform1f(U.uPage, y / vh);
      gl.uniform1f(U.uDustA, fade);
      gl.uniform3f(U.uMouse, m.x * halfW, m.y * HALF_H, reduce ? 0 : m.on);
      gl.uniform2f(U.uTilt, tilt.x, tilt.y);
      gl.uniform4f(U.uSphere, sphere[0], sphere[1], sphere[2], sphere[3]);
      gl.drawArrays(gl.POINTS, 0, count);
    }
    schedule();
  }

  function schedule() {
    if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', schedule);
  schedule();

  /* ── Bölümler ekrana girerken ───────────────────────────────── */
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.fade').forEach(el => io.observe(el));

  /* ── Küçük detaylar ─────────────────────────────────────────── */
  document.querySelector('[data-year]').textContent = new Date().getFullYear();

  // Sayfanın kullanılabilir hâle geldiği süre; yavaş bağlantılarda hiç gösterilmez
  addEventListener('load', () => {
    const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    const ms = nav && Math.round(nav.domContentLoadedEventEnd);
    if (ms && ms < 1000) document.querySelector('[data-loadtime]').textContent = `Bu sayfa ${ms} ms'de açıldı.`;
  });

  // Hafif film greni: küçük bir gürültü dokusu üretip tüm sayfaya döşer
  try {
    const n = document.createElement('canvas');
    n.width = n.height = 140;
    const g = n.getContext('2d');
    const id = g.createImageData(140, 140);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
      id.data[i + 3] = 255;
    }
    g.putImageData(id, 0, 0);
    document.body.style.setProperty('--noise', `url(${n.toDataURL()})`);
  } catch {}
})();
