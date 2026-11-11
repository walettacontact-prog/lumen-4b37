// Beytuş Burger deneme sayfası.
// Giriş: 3B burger sahnesi ayrı dosyada (burger3d.js). Bu dosya: üst şerit, kayan şeritler, bölüm hareketleri, videolar.
// Kayan şeritler kaydırma hızıyla hızlanır, yukarı kaydırınca ters akar. Videolar yalnız ekrandayken oynar.
// Kütüphaneler: GSAP + ScrollTrigger, Lenis (yalnız fareyle yumuşak kaydırma).
(function () {
  "use strict";
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  var test = location.hash.match(/^#y=(\d+)/); // ekran görüntüsü denemesi: adres sonuna #y=1200
  var azHareket = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dokunmatik = matchMedia("(hover: none)").matches;
  var lenis = null;

  function goster() {}

  // ---------- Üst şerit ve telefondaki hızlı düğme: aşağı inerken saklan, yukarı çıkınca gel ----------
  var ust = $("#ust"), hizli = $(".hizli"), sahne3d = $(".sahne3d"), sonY = window.scrollY;
  function kaydirinca() {
    var y = window.scrollY;
    ust.classList.toggle("dolu", y > (sahne3d ? sahne3d.offsetTop + sahne3d.offsetHeight - 80 : innerHeight * 0.85));
    if (Math.abs(y - sonY) > 8) {
      var asagi = y > sonY && y > 160;
      ust.classList.toggle("sakla", asagi);
      sonY = y;
    }
    // girişte kendi düğmeleri var; küçük hızlı düğme girişten sonra gelir
    var sahneSonu = sahne3d ? sahne3d.offsetTop + sahne3d.offsetHeight - innerHeight * 0.6 : innerHeight * 0.6;
    if (hizli) hizli.classList.toggle("sakla", y < sahneSonu || (ust.classList.contains("sakla") && y < document.documentElement.scrollHeight - innerHeight * 1.6));
  }
  window.addEventListener("scroll", kaydirinca, { passive: true });
  kaydirinca();

  // ---------- Videolar: ekrana gelince yüklenir ve oynar, çıkınca durur ----------
  function videolar() {
    var vs = $$("video[data-oto]");
    if (azHareket || !("IntersectionObserver" in window)) { vs.forEach(function (v) { v.controls = true; }); return; }
    var io = new IntersectionObserver(function (gs) {
      gs.forEach(function (g) {
        var v = g.target;
        if (g.isIntersecting) { if (v.preload !== "auto") { v.preload = "auto"; v.load(); } var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.15 });
    vs.forEach(function (v) { io.observe(v); });
    // ekrana gelmeden bir buçuk ekran önce yüklemeye başla: sahneye gelince hemen oynasın
    var yukle = new IntersectionObserver(function (gs) {
      gs.forEach(function (g) { if (!g.isIntersecting) return; var v = g.target; yukle.unobserve(v); if (v.preload !== "auto") { v.preload = "auto"; v.load(); } });
    }, { rootMargin: "0px 0px 150% 0px" });
    vs.forEach(function (v) { yukle.observe(v); });
    // sayfa yüklenince kalan videoları arka planda sırayla indir (biri bitince öteki): kaydırınca beklemeden oynasın
    function sirayla() {
      var kalan = vs.filter(function (v) { return v.preload !== "auto"; });
      (function sonraki() {
        var v = kalan.shift(); if (!v) return;
        if (v.preload === "auto") return sonraki();
        v.preload = "auto"; v.load();
        var bitti = false, devam = function () { if (!bitti) { bitti = true; setTimeout(sonraki, 150); } };
        v.addEventListener("canplaythrough", devam, { once: true }); setTimeout(devam, 6000);
      })();
    }
    var basla = function () { setTimeout(sirayla, 900); };
    if (document.readyState === "complete") basla(); else window.addEventListener("load", basla);
  }
  videolar();

  if (!window.gsap || !window.ScrollTrigger) { goster(); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var fontlar = document.fonts ? document.fonts.ready : Promise.resolve();
  function enGec(ms, p) { return Promise.race([p, new Promise(function (r) { setTimeout(r, ms); })]); }

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

  // =====================================================================
  // Kayan şeritler: [data-kayan] (1 sağa, -1 sola), data-hiz = saniyede piksel
  // =====================================================================
  var seritler = [];
  function seritKur(el) {
    var ic = $(".kayan-ic", el), grup = $(".kayan-grup", ic);
    var yon = Number(el.dataset.kayan) || -1, hiz = Number(el.dataset.hiz) || 60;
    var gw = grup.getBoundingClientRect().width || 1;
    var kopya = Math.max(1, Math.ceil((el.clientWidth || innerWidth) * 1.2 / gw));
    for (var i = 0; i < kopya; i++) { var g = grup.cloneNode(true); g.setAttribute("aria-hidden", "true"); ic.appendChild(g); }
    var tum = ic.cloneNode(true); $$(".kayan-grup", tum).forEach(function (g) { g.setAttribute("aria-hidden", "true"); });
    while (tum.firstChild) ic.appendChild(tum.firstChild);
    var tw = gsap.fromTo(ic, { xPercent: yon < 0 ? 0 : -50 }, { xPercent: yon < 0 ? -50 : 0, ease: "none", repeat: -1, duration: (ic.scrollWidth / 2) / hiz });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (g) { if (g[0].isIntersecting) tw.resume(); else tw.pause(); }, { rootMargin: "120px 0px" }).observe(el);
    seritler.push(tw);
  }
  function seritHizlari() {
    var hedef = { v: 1 };
    function uygula() { seritler.forEach(function (tw) { tw.timeScale(hedef.v); }); }
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: function (st) {
        var yon = st.direction < 0 ? -1 : 1, v = Math.min(Math.abs(st.getVelocity()) / 200, 8);
        gsap.killTweensOf(hedef);
        hedef.v = yon * (1 + v); uygula();
        gsap.to(hedef, { v: yon, duration: 1.1, delay: 0.15, ease: "power2.out", onUpdate: uygula });
      }
    });
  }

  // =====================================================================
  // Kaydırmaya bağlı diğer hareketler
  // =====================================================================
  function digerleri() {
    // Bölümler yuvarlak köşeli kart gibi açılarak gelir
    $$(".acilir").forEach(function (b) {
      gsap.fromTo(b, { clipPath: "inset(0% 5% 0% 5% round 44px 44px 0px 0px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)", ease: "none",
        scrollTrigger: { trigger: b, start: "top bottom", end: "top 35%", scrub: true }
      });
    });
    // Çapraz bantlar kaydırınca biraz daha eğilir
    gsap.fromTo(".bant.b1", { rotation: -1 }, { rotation: -7, ease: "none", scrollTrigger: { trigger: ".capraz", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.fromTo(".bant.b2", { rotation: 1 }, { rotation: 6, ease: "none", scrollTrigger: { trigger: ".capraz", start: "top bottom", end: "bottom top", scrub: true } });

    // Başlıklar kelime kelime yükselir
    $$(".menu-bas h2, .kareler-bas h2, .ziyaret h2, .hikaye-metin, .karavan-bas h2, .mutfak h2").forEach(function (el) {
      gsap.fromTo($$(".kelime > span", el), { yPercent: 115, rotation: 7 }, {
        yPercent: 0, rotation: 0, duration: 1, ease: "expo.out", stagger: 0.045, scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });
    gsap.from(".hikaye-not, .hikaye .kucuk", { y: 30, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: ".hikaye", start: "top 70%" } });
    gsap.fromTo(".hikaye .cerceve", { rotation: 12, yPercent: 10 }, { rotation: -3, yPercent: -6, ease: "none", scrollTrigger: { trigger: ".hikaye", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.fromTo(".hikaye figure img", { yPercent: -10 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".hikaye", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(".etiket-1983", { scale: 0, rotation: -60, duration: 0.9, ease: "back.out(2.2)", scrollTrigger: { trigger: ".hikaye figure", start: "top 75%" } });

    // Mutfak videosu: dönerek ve büyüyerek gelir
    gsap.fromTo(".video-kart", { rotation: 8, scale: 0.86, yPercent: 8 }, { rotation: -2, scale: 1, yPercent: -4, ease: "none", scrollTrigger: { trigger: ".mutfak", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(".mutfak p.not, .mutfak .kucuk", { y: 26, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: ".mutfak", start: "top 70%" } });

    // Karavan kartları: yelpaze gibi açılır
    gsap.from(".karavan-ray figure", { y: 90, rotation: function (k) { return (k - 1) * 9; }, autoAlpha: 0, duration: 1.1, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".karavan-ray", start: "top 85%" } });

    // Menü: aşağı kaydırdıkça kartlar yana akar (telefonda da); bölüm yapışık kalır, alttaki çubuk ilerlemeyi gösterir
    var menu = $(".menu"), ray = $(".ray"), rayCubuk = $(".ray-cubuk i");
    if (menu && ray) {
      menu.classList.add("akar");
      var mesafe = function () { return Math.max(0, ray.scrollWidth - innerWidth); };
      var yolAyarla = function () { menu.style.setProperty("--yol", Math.round(mesafe() * (innerWidth < 900 ? 0.85 : 1)) + "px"); };
      yolAyarla();
      ScrollTrigger.addEventListener("refreshInit", yolAyarla);
      gsap.to(ray, {
        x: function () { return -mesafe(); }, ease: "none",
        scrollTrigger: { trigger: menu, start: "top top", end: "bottom bottom", scrub: innerWidth < 900 ? 0.25 : 0.6, invalidateOnRefresh: true,
          onUpdate: function (st) {
            if (rayCubuk) rayCubuk.style.transform = "scaleX(" + Math.max(0.08, st.progress).toFixed(3) + ")";
            gsap.to(ray, { skewX: gsap.utils.clamp(-6, 6, st.getVelocity() / -300), duration: 0.35, overwrite: "auto" });
          },
          onScrubComplete: function () { gsap.to(ray, { skewX: 0, duration: 0.6, ease: "power3.out" }); } }
      });
      gsap.from($$(".kart, .kart-son", ray), { yPercent: 18, rotation: 3, autoAlpha: 0, duration: 0.9, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: menu, start: "top 70%" } });
    }

    // Fotoğraf şeritleri eğik girip düzelir
    gsap.utils.toArray(".foto-kayan").forEach(function (f, k) {
      gsap.fromTo(f, { rotation: k ? 3 : -3, xPercent: k ? -6 : 6 }, { rotation: 0, xPercent: 0, ease: "none", scrollTrigger: { trigger: f, start: "top bottom", end: "center center", scrub: true } });
    });

    // Bizi bulun
    gsap.fromTo(".ziyaret .dev-logo", { rotation: -30, xPercent: 20 }, { rotation: 8, xPercent: -6, ease: "none", scrollTrigger: { trigger: ".ziyaret", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(".ziyaret address, .ziyaret .tel, .ziyaret .dugmeler > *", { y: 34, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: ".ziyaret address", start: "top 88%" } });

    // Fareyle: imleç, mıknatıslı düğmeler, imleç büyür
    if (!dokunmatik) {
      var im = $(".imlec");
      var ix = gsap.quickTo(im, "x", { duration: 0.35, ease: "power3" }), iy = gsap.quickTo(im, "y", { duration: 0.35, ease: "power3" });
      window.addEventListener("pointermove", function (ev) {
        ix(ev.clientX); iy(ev.clientY);
      }, { passive: true });
      $$("a, button, .kart").forEach(function (el) {
        el.addEventListener("pointerenter", function () { im.classList.add("buyuk"); });
        el.addEventListener("pointerleave", function () { im.classList.remove("buyuk"); });
      });
      $$(".dugme").forEach(function (d) {
        var qx = gsap.quickTo(d, "x", { duration: 0.6, ease: "elastic.out(1, .45)" }), qy = gsap.quickTo(d, "y", { duration: 0.6, ease: "elastic.out(1, .45)" });
        d.addEventListener("pointermove", function (ev) { var r = d.getBoundingClientRect(); qx((ev.clientX - r.left - r.width / 2) * 0.28); qy((ev.clientY - r.top - r.height / 2) * 0.38); });
        d.addEventListener("pointerleave", function () { qx(0); qy(0); });
      });
    }
  }

  // ---------- Giriş hareketi ----------
  function girisOyna() {
    var tl = gsap.timeline();
    // kart yazıları ve burgerin düşüşü burger3d.js'de
    tl.fromTo(".ust .logo, .ust nav", { y: -30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out", stagger: 0.08 }, 0.1);
    return tl;
  }

  // ---------- Kurulum ----------
  function kur() {
    $$(".menu-bas h2, .kareler-bas h2, .ziyaret h2, .hikaye-metin, .karavan-bas h2, .mutfak h2").forEach(kelimele);

    if (!test && !dokunmatik && !azHareket && window.Lenis) {
      lenis = new Lenis({ lerp: 0.1 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (ev) {
        var h = a.getAttribute("href"), t = h.length > 1 ? $(h) : null;
        if (h.length > 1 && !t) return;
        ev.preventDefault();
        if (lenis) lenis.scrollTo(t || 0); else window.scrollTo({ top: t ? t.getBoundingClientRect().top + scrollY : 0, behavior: azHareket ? "auto" : "smooth" });
      });
    });

    if (!azHareket) {
      $$("[data-kayan]").forEach(seritKur);
      seritHizlari();
      digerleri();
    }
    if (!azHareket && !test) enGec(400, fontlar).then(girisOyna);
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
  kur();
})();
