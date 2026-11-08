// Beytuş Burger deneme sayfası: giriş, kayan şerit, kat kat burger sahnesi, açılan bölümler, menü rayı, kareler, imleç.
// Kütüphaneler: GSAP + ScrollTrigger (kaydırmaya bağlı hareket), Lenis (yumuşak kaydırma, yalnız fareyle).
(function () {
  "use strict";
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  var test = location.hash.match(/^#y=(\d+)/); // ekran görüntüsü denemesi: adres sonuna #y=1200
  var azHareket = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dokunmatik = matchMedia("(hover: none)").matches;
  var genisEkran = function () { return innerWidth >= 900; };
  var fare = { x: 0, y: 0, hx: 0, hy: 0 };
  var lenis = null;

  function goster() { var g = $(".giris"); if (g) g.style.opacity = "1"; }

  // ---------- Metni harf / kelime olarak ayır (ekran okuyucu tam metni okur) ----------
  function harfle(el) {
    var metin = el.textContent;
    el.setAttribute("aria-label", metin.trim());
    el.textContent = "";
    metin.split(/(\s+)/).forEach(function (parca) {
      if (!parca) return;
      if (/^\s+$/.test(parca)) { el.appendChild(document.createTextNode(" ")); return; }
      var k = document.createElement("span"); k.className = "kelime"; k.setAttribute("aria-hidden", "true");
      Array.from(parca).forEach(function (h) { var s = document.createElement("span"); s.className = "harf"; s.textContent = h; k.appendChild(s); });
      el.appendChild(k);
    });
  }
  // Kelimeleri maskeli kutulara sarar; <em>, <br> korunur
  function kelimele(el) {
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    function isle(kaynak, hedef) {
      Array.prototype.slice.call(kaynak.childNodes).forEach(function (d) {
        if (d.nodeType === 3) {
          d.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { hedef.appendChild(document.createTextNode(" ")); return; }
            var k = document.createElement("span"); k.className = "kelime"; k.setAttribute("aria-hidden", "true");
            var ic = document.createElement("span"); ic.textContent = p; k.appendChild(ic); hedef.appendChild(k);
          });
        } else if (d.nodeName === "BR") {
          hedef.appendChild(document.createElement("br"));
        } else {
          var kopya = d.cloneNode(false); hedef.appendChild(kopya); isle(d, kopya);
        }
      });
    }
    var gecici = document.createElement("div");
    isle(el, gecici);
    el.textContent = "";
    while (gecici.firstChild) el.appendChild(gecici.firstChild);
  }

  // ---------- Üst şerit: aşağı inerken saklan, yukarı çıkınca gel ----------
  var ust = $("#ust"), sonY = window.scrollY;
  function ustGuncelle() {
    var y = window.scrollY;
    ust.classList.toggle("dolu", y > 30);
    if (Math.abs(y - sonY) > 6) { ust.classList.toggle("sakla", y > sonY && y > 160); sonY = y; }
  }
  window.addEventListener("scroll", ustGuncelle, { passive: true });
  ustGuncelle();

  if (!window.gsap || !window.ScrollTrigger) { goster(); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var fontlar = document.fonts ? document.fonts.ready : Promise.resolve();
  function enGec(ms, p) { return Promise.race([p, new Promise(function (r) { setTimeout(r, ms); })]); }

  // =====================================================================
  // Kat kat burger sahnesi. Katmanlar: katman/katmanlar.json (alttan üste).
  // Her katman: { ad, dosya, x, y, w, h, bas } — x/y/w/h havadaki (ayrık) görseldeki konum,
  // bas: üstüne oturduğu kata ne kadar gömüldüğü (kendi boyunun oranı).
  // =====================================================================
  var KISA = { "alt ekmek": "Ekmek", "%100 dana köfte": "Köfte", "karamelize soğan": "Soğan", "üst ekmek ve beytuş sos": "Beytuş sos" };
  function kisaAd(ad) { return KISA[ad.toLowerCase()] || ad; }

  function burgerKur(veri) {
    var burger = $(".burger"), sirt = $(".burger-sirt"), kamera = $(".burger-kamera"), alan = $(".burger-alan"), golge = $(".burger .golge");
    var spot = $(".spot"), devAd = $(".dev-ad"), sayacEl = $(".sayac-kat"), ipucu = $(".ipucu-kaydir");
    var K = veri.katmanlar, n = K.length, GW = veri.genislik, GH = veri.yukseklik;
    if (veri.ad) burger.setAttribute("aria-label", veri.ad);

    // Yığılınca her katın üst kenarı
    var yig = [K[0].y];
    for (var i = 1; i < n; i++) yig[i] = yig[i - 1] - K[i].h * (1 - (K[i].bas == null ? 0.25 : K[i].bas));
    var yigUst = yig[n - 1];

    var katlar = K.map(function (k, i) {
      var d = document.createElement("div"); d.className = "kat";
      d.style.left = (k.x / GW * 100) + "%"; d.style.top = (k.y / GH * 100) + "%"; d.style.width = (k.w / GW * 100) + "%"; d.style.zIndex = String(i + 2);
      var ic = document.createElement("div"); ic.className = "kat-ic";
      var img = new Image(); img.src = "katman/" + k.dosya; img.alt = ""; img.width = k.w; img.height = k.h; img.decoding = "async";
      ic.appendChild(img); d.appendChild(ic); sirt.appendChild(d);
      return { d: d, ic: ic };
    });

    var liste = $(".liste");
    K.forEach(function (k) { var li = document.createElement("li"); li.textContent = k.ad; liste.appendChild(li); });
    var maddeler = $$("li", liste);

    var s = 1;
    function boyutla() {
      var r = alan.getBoundingClientRect();
      s = Math.min(r.width / GW, r.height / GH);
      burger.style.width = (GW * s) + "px"; burger.style.height = (GH * s) + "px";
      // telefonda dev yazı başlığın yerine oturur
      var h2 = $(".sahne-bas h2"), bas = $(".sahne-bas");
      devAd.style.top = genisEkran() ? "" : (bas.offsetTop + h2.offsetTop) + "px";
      sigdir();
    }
    // Dev yazı ekrana sığsın (uzun adlar küçülür)
    var devSpan = $("span", devAd);
    function sigdir() {
      devSpan.style.fontSize = "";
      var tam = parseFloat(getComputedStyle(devSpan).fontSize), en = devAd.clientWidth * 0.94, w = devSpan.scrollWidth;
      if (w > en) devSpan.style.fontSize = (tam * en / w) + "px";
    }
    boyutla();
    ScrollTrigger.addEventListener("refreshInit", boyutla);
    // Son ekmek oturunca kamera yaklaşır (alttan büyür, ekrana sığacak kadar)
    var kameraOlcek = function () {
      var z = Math.min(1.3, 0.94 * GH / (GH - yigUst)), r = alan.getBoundingClientRect();
      return Math.max(1, Math.min(z, r.width / (GW * s), r.height / ((GH - yigUst) * s)));
    };

    // Susam taneleri (son ekmek oturunca saçılır)
    var ustK = K[n - 1], susamlar = [];
    for (var j = 0; j < 18; j++) {
      var e = document.createElement("span"); e.className = "susam";
      e.style.left = ((ustK.x + ustK.w * (0.25 + 0.5 * (j / 17))) / GW * 100) + "%";
      e.style.top = ((yig[n - 1] + ustK.h * 0.3) / GH * 100) + "%";
      sirt.appendChild(e); susamlar.push(e);
    }

    // Havada süzülme (yere inince söner) + fareyle derinlik
    var bob = K.map(function (_, i) { return { a: i === 0 ? 0.35 : 1, f: 0.55 + (i % 4) * 0.11, ph: i * 1.37 }; });
    var gorunur = false;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (g) { gorunur = g[0].isIntersecting; }).observe(burger);
    else gorunur = true;
    if (!azHareket) gsap.ticker.add(function (t) {
      if (!gorunur) return;
      fare.x += (fare.hx - fare.x) * 0.06; fare.y += (fare.hy - fare.y) * 0.06;
      for (var i = 0; i < n; i++) {
        var b = bob[i];
        if (b.a < 0.002) { if (katlar[i].ic.style.transform) katlar[i].ic.style.transform = ""; continue; }
        var y = Math.sin(t * b.f * 2 + b.ph) * 8 * b.a + fare.y * (i - n / 2) * 6 * b.a;
        var x = fare.x * (i - n / 2) * 7 * b.a;
        var r = Math.sin(t * b.f + b.ph) * 2.4 * b.a;
        katlar[i].ic.style.transform = "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0) rotate(" + r.toFixed(2) + "deg)";
      }
    });

    // Zaman çizelgesi (birim: kat), kaydırmaya bağlı
    var BAS = 0.45, DUS = 1, INIS = 0.62;
    var baslar = [0], inisler = [BAS];
    for (var q = 1; q < n; q++) { baslar[q] = BAS + (q - 1) * DUS; inisler[q] = baslar[q] + INIS; }
    var SON = inisler[n - 1];

    function yigilmis() { // azaltılmış hareket: doğrudan bitmiş hâl
      katlar.forEach(function (k, i) { gsap.set(k.d, { y: (yig[i] - K[i].y) * s }); });
      bob.forEach(function (b) { b.a = 0; });
      gsap.set(kamera, { scale: kameraOlcek() });
      gsap.set(".damga", { autoAlpha: 1, rotation: -7 });
      gsap.set(".sahne-alt .dugme", { autoAlpha: 1 });
      maddeler.forEach(function (m) { m.classList.add("tamam"); });
      sayacEl.textContent = n + " / " + n; devSpan.textContent = "Beytuş."; devSpan.classList.add("son"); sigdir();
      if (ipucu) ipucu.style.display = "none";
    }
    if (azHareket) { yigilmis(); return; }

    // Dev yazı değişimi (kaydırmadan bağımsız kısa geçiş)
    var simdiki = null, devTl = null;
    function devYaz(metin, son) {
      if (metin === simdiki) return;
      var ilk = simdiki === null; simdiki = metin;
      var degis = function () { devSpan.textContent = metin; devSpan.classList.toggle("son", !!son); sigdir(); };
      if (ilk) { degis(); return; }
      if (devTl) devTl.kill(); // hızlı kaydırmada eski geçiş yarım kalır, son ad yazılır
      devTl = gsap.timeline()
        .to(devSpan, { yPercent: -105, duration: 0.18, ease: "power2.in" })
        .add(degis)
        .fromTo(devSpan, { yPercent: 105 }, { yPercent: 0, duration: 0.42, ease: "expo.out" });
    }

    var cubuk = $(".ilerleme i");
    function durum(t) {
      var c = 0;
      for (var i = 1; i < n; i++) if (t >= baslar[i] - 0.02) c = i;
      var bitti = t >= SON + 0.04;
      maddeler.forEach(function (m, i) {
        m.classList.toggle("tamam", t >= inisler[i]);
        m.classList.toggle("simdi", i === c && t < inisler[i]);
      });
      var oturan = 1; for (var k = 1; k < n; k++) if (t >= inisler[k]) oturan = k + 1;
      sayacEl.textContent = (t < 0.05 ? 0 : oturan) + " / " + n;
      if (bitti) devYaz("Beytuş.", true);
      else if (t < 0.05) devYaz(genisEkran() ? "Kat kat" : "Burgerini kur!");
      else devYaz(kisaAd(K[c].ad));
    }

    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".sahne", start: "top top", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        // telefonda daha kısa: parmak yorulmasın
        end: function () { return "+=" + Math.round(innerHeight * (genisEkran() ? (n - 1) * 0.5 + 1.2 : (n - 1) * 0.36 + 1)); },
        onUpdate: function (st) { cubuk.style.transform = "scaleX(" + st.progress.toFixed(4) + ")"; durum(tl.time()); },
        onToggle: function (st) { document.body.classList.toggle("sahnede", st.isActive); }
      }
    });
    tl.to(bob[0], { a: 0, duration: BAS }, 0)
      .to(ipucu, { autoAlpha: 0, y: 20, duration: 0.3 }, 0.05);
    for (var i2 = 1; i2 < n; i2++) (function (i) {
      var t = baslar[i], hedef = function () { return (yig[i] - K[i].y) * s; };
      tl.to(katlar[i].d, { y: hedef, duration: INIS, ease: "power3.in" }, t)
        .to(katlar[i].d, { scaleY: 1.07, scaleX: 0.97, duration: INIS * 0.85, ease: "power2.in" }, t)       // düşerken uzar
        .to(katlar[i].d, { scaleY: 1, scaleX: 1, duration: 0.3, ease: "elastic.out(1, .5)" }, t + INIS)      // çarpınca toparlanır
        .to(bob[i], { a: 0, duration: INIS * 0.8 }, t)
        .to(sirt, { scaleY: 0.94, scaleX: 1.04, duration: 0.06, ease: "power2.out" }, t + INIS)             // yığın ezilir
        .to(sirt, { scaleY: 1, scaleX: 1, duration: 0.34, ease: "elastic.out(1, .35)" }, t + INIS + 0.06)
        .fromTo(spot, { scale: 1.12, opacity: 1 }, { scale: 1, opacity: 0.85, duration: 0.4, ease: "power2.out", immediateRender: false }, t + INIS);
    })(i2);
    tl.fromTo(kamera, { scale: 1 }, { scale: kameraOlcek, duration: 0.7, ease: "power2.inOut" }, SON - 0.05)
      .to(sirt, { y: function () { return -26 * Math.max(s, 0.4); }, rotation: -3, duration: 0.16, ease: "power2.out" }, SON + 0.12)     // sevinç zıplaması
      .to(sirt, { y: 0, rotation: 0, duration: 0.42, ease: "bounce.out" }, SON + 0.28)
      .fromTo(golge, { scaleX: 0.7, opacity: 0.4 }, { scaleX: 1, opacity: 1, duration: SON }, 0)
      .fromTo(susamlar, { x: 0, y: 0, rotation: 0, scale: 0.3, autoAlpha: 1 }, {
        immediateRender: false,
        x: function (k) { return Math.cos(-Math.PI * (0.08 + 0.84 * k / 17)) * gsap.utils.random(70, 180) * Math.max(s, 0.5); },
        y: function (k) { return Math.sin(-Math.PI * (0.08 + 0.84 * k / 17)) * gsap.utils.random(60, 150) * Math.max(s, 0.5); },
        rotation: function () { return gsap.utils.random(-300, 300); },
        scale: 1, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.004
      }, SON + 0.12)
      .fromTo(".damga", { autoAlpha: 0, scale: 2.6, rotation: -30 }, { autoAlpha: 1, scale: 1, rotation: -7, duration: 0.4, ease: "back.out(2.4)" }, SON + 0.2)
      .fromTo(".sahne-alt .dugme", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, SON + 0.35)
      .to({}, { duration: 0.7 });
    durum(0);
  }

  // =====================================================================
  // Sayfanın geri kalanı
  // =====================================================================
  function digerleri() {
    // Giriş: kaydırınca başlık yukarı, fotoğraf aşağı kayar
    var girisST = { trigger: ".giris", start: "top top", end: "bottom top", scrub: true };
    gsap.to(".giris-yazi", { yPercent: -14, ease: "none", scrollTrigger: girisST });
    gsap.to(".kemer img", { yPercent: 9, ease: "none", scrollTrigger: girisST });
    gsap.to(".giris-gorsel", { rotation: 4, y: 40, ease: "none", scrollTrigger: girisST });

    // Kayan şerit: kaydırma hızlanınca o da hızlanır, yön değişince geri akar
    var serit = gsap.to(".serit-ic", { xPercent: -50, ease: "none", duration: 22, repeat: -1 });
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: function (st) {
        var v = Math.min(Math.abs(st.getVelocity()) / 240, 7), yon = st.direction < 0 ? -1 : 1;
        gsap.to(serit, { timeScale: yon * (1 + v), duration: 0.2, overwrite: true });
        gsap.to(serit, { timeScale: yon, duration: 1.2, delay: 0.25 });
      }
    });

    // Bölümler yuvarlak köşeli kart gibi açılarak gelir
    $$(".acilir").forEach(function (b) {
      gsap.fromTo(b, { clipPath: "inset(0% 5% 0% 5% round 44px 44px 0px 0px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)", ease: "none",
        scrollTrigger: { trigger: b, start: "top bottom", end: "top 35%", scrub: true }
      });
    });

    // Başlıklar kelime kelime yükselir
    $$(".menu-bas h2, .kareler-bas h2, .ziyaret h2, .hikaye-metin").forEach(function (el) {
      gsap.fromTo($$(".kelime > span", el), { yPercent: 115, rotation: 7 }, {
        yPercent: 0, rotation: 0, duration: 1, ease: "expo.out", stagger: 0.045,
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });
    gsap.from(".hikaye-not, .hikaye .kucuk", { y: 30, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: ".hikaye", start: "top 70%" } });
    gsap.fromTo(".hikaye .cerceve", { rotation: 12, yPercent: 10 }, { rotation: -3, yPercent: -6, ease: "none", scrollTrigger: { trigger: ".hikaye", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.fromTo(".hikaye figure img", { yPercent: -10 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".hikaye", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(".etiket-1983", { scale: 0, rotation: -60, duration: 0.9, ease: "back.out(2.2)", scrollTrigger: { trigger: ".hikaye figure", start: "top 75%" } });

    // Menü: masaüstünde kaydırınca kartlar yana akar; telefonda parmakla kaydırılır, ortadaki kart öne çıkar
    var ray = $(".ray"), rayCubuk = $(".ray-cubuk i");
    var mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", function () {
      var mesafe = function () { return Math.max(0, ray.scrollWidth - innerWidth); };
      var tw = gsap.to(ray, {
        x: function () { return -mesafe(); }, ease: "none",
        scrollTrigger: { trigger: ".menu", start: "top top", end: function () { return "+=" + mesafe(); }, pin: true, scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: function (st) { gsap.to(ray, { skewX: gsap.utils.clamp(-7, 7, st.getVelocity() / -280), duration: 0.35, overwrite: "auto" }); },
          onScrubComplete: function () { gsap.to(ray, { skewX: 0, duration: 0.6, ease: "power3.out" }); } }
      });
      return function () { tw.kill(); gsap.set(ray, { clearProps: "transform" }); };
    });
    mm.add("(max-width: 899px)", function () {
      var kartlar = $$(".kart, .kart-son", ray), bekliyor = false;
      function ciz() {
        bekliyor = false;
        var orta = innerWidth / 2, maks = Math.max(1, ray.scrollWidth - ray.clientWidth);
        rayCubuk.style.transform = "scaleX(" + Math.max(0.08, ray.scrollLeft / maks).toFixed(3) + ")";
        kartlar.forEach(function (k) {
          var r = k.getBoundingClientRect(), d = (r.left + r.width / 2 - orta) / innerWidth; // -1..1
          var a = Math.min(1, Math.abs(d) * 1.4);
          k.style.transform = "scale(" + (1 - a * 0.08).toFixed(3) + ") rotate(" + (d * 4).toFixed(2) + "deg)";
        });
      }
      var dinle = function () { if (!bekliyor) { bekliyor = true; requestAnimationFrame(ciz); } };
      ray.addEventListener("scroll", dinle, { passive: true });
      ciz();
      return function () { ray.removeEventListener("scroll", dinle); kartlar.forEach(function (k) { k.style.transform = ""; }); };
    });
    gsap.from(".ray", { x: 120, autoAlpha: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".ray", start: "top 88%" } });

    // Kareler: farklı hızlarda kayar, eğik başlayıp düzelir
    $$(".kolaj > *").forEach(function (f) {
      var h = Number(f.dataset.hiz) || 0, d = Number(f.dataset.don) || 0;
      gsap.fromTo(f, { yPercent: h, rotation: d * 2 }, { yPercent: -h, rotation: d * 0.4, ease: "none",
        scrollTrigger: { trigger: ".kolaj", start: "top bottom", end: "bottom top", scrub: true } });
    });

    // Bizi bulun
    gsap.fromTo(".ziyaret .dev-logo", { rotation: -30, xPercent: 20 }, { rotation: 8, xPercent: -6, ease: "none", scrollTrigger: { trigger: ".ziyaret", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(".ziyaret address, .ziyaret .tel, .ziyaret .dugmeler > *", { y: 34, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: ".ziyaret address", start: "top 88%" } });

    // İmleç ve mıknatıslı düğmeler (yalnız fareyle)
    if (!dokunmatik) {
      var im = $(".imlec");
      var ix = gsap.quickTo(im, "x", { duration: 0.35, ease: "power3" }), iy = gsap.quickTo(im, "y", { duration: 0.35, ease: "power3" });
      window.addEventListener("pointermove", function (e) {
        ix(e.clientX); iy(e.clientY);
        fare.hx = e.clientX / innerWidth - 0.5; fare.hy = e.clientY / innerHeight - 0.5;
      }, { passive: true });
      $$("a, button, .kart").forEach(function (el) {
        el.addEventListener("pointerenter", function () { im.classList.add("buyuk"); });
        el.addEventListener("pointerleave", function () { im.classList.remove("buyuk"); });
      });
      $$(".dugme").forEach(function (d) {
        var qx = gsap.quickTo(d, "x", { duration: 0.6, ease: "elastic.out(1, .45)" }), qy = gsap.quickTo(d, "y", { duration: 0.6, ease: "elastic.out(1, .45)" });
        d.addEventListener("pointermove", function (e) { var r = d.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * 0.28); qy((e.clientY - r.top - r.height / 2) * 0.38); });
        d.addEventListener("pointerleave", function () { qx(0); qy(0); });
      });
    }
  }

  // ---------- Giriş hareketi: beklemeden başlar ----------
  function girisOyna() {
    goster();
    var tl = gsap.timeline();
    tl.fromTo(".giris h1 .harf", { yPercent: 118, rotation: 10 }, { yPercent: 0, rotation: 0, duration: 1.05, ease: "expo.out", stagger: 0.035 }, 0)
      .fromTo(".kemer", { clipPath: "inset(100% 0% 0% 0% round 999px 999px 32px 32px)" }, { clipPath: "inset(0% 0% 0% 0% round 999px 999px 32px 32px)", duration: 1.1, ease: "expo.inOut", clearProps: "clipPath" }, 0.05)
      .fromTo(".kemer img", { scale: 1.4 }, { scale: 1, duration: 1.7, ease: "expo.out" }, 0.2)
      .fromTo(".kemer-golge", { x: 0, y: 0, autoAlpha: 0 }, { x: 12, y: 12, autoAlpha: 1, duration: 0.7, ease: "power3.out" }, 0.7)
      .fromTo(".rozet", { scale: 0, rotation: -200 }, { scale: 1, rotation: 0, duration: 1, ease: "back.out(1.7)" }, 0.6)
      .fromTo(".giris .kucuk, .giris .alt-yazi, .giris .dugmeler > *", { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.06 }, 0.3)
      .fromTo(".ust .logo, .ust nav", { y: -30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out", stagger: 0.08 }, 0.2)
      .fromTo(".serit", { yPercent: 160 }, { yPercent: 0, duration: 1, ease: "expo.out" }, 0.45)
      .fromTo(".alt-cubuk", { y: 120 }, { y: 0, duration: 0.9, ease: "expo.out", clearProps: "transform" }, 0.5);
    return tl;
  }

  // ---------- Kurulum ----------
  function kur(veri) {
    $$(".giris h1 .satir").forEach(harfle);
    $$(".menu-bas h2, .kareler-bas h2, .ziyaret h2, .hikaye-metin").forEach(kelimele);

    if (!test && !dokunmatik && !azHareket && window.Lenis) {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    // Sayfa içi bağlantılar yumuşak kayar ("#" başa döner)
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var h = a.getAttribute("href"), t = h.length > 1 ? $(h) : null;
        if (h.length > 1 && !t) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(t || 0); else window.scrollTo({ top: t ? t.getBoundingClientRect().top + scrollY : 0, behavior: azHareket ? "auto" : "smooth" });
      });
    });

    if (veri && veri.katmanlar && veri.katmanlar.length > 1) burgerKur(veri);
    else $(".sahne").classList.add("sahne-yok");
    if (!azHareket) digerleri();

    if (azHareket || test) { goster(); gsap.set(".kemer-golge", { x: 12, y: 12, autoAlpha: 1 }); }
    else enGec(450, fontlar).then(girisOyna);
    fontlar.then(function () { ScrollTrigger.refresh(); });

    if (test) {
      var git = function () {
        fontlar.then(function () {
          ScrollTrigger.refresh();
          window.scrollTo(0, Number(test[1]));
          ScrollTrigger.update();
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.vars.scrub) { var tw = st.getTween && st.getTween(); if (tw) tw.progress(1); }
            else if (st.animation && (st.progress > 0 || st.isActive)) st.animation.progress(1);
          });
        });
      };
      if (document.readyState === "complete") git(); else window.addEventListener("load", git);
    }
  }

  fetch("katman/katmanlar.json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(kur);
})();
