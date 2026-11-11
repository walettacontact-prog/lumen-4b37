// Beytuş Burger deneme sayfası.
// Giriş: Instagram hikâyesi gibi slayt — Beytuş'un üç gerçek videosu, üstte dolan çubuklar, dokun/kaydır ile geçiş.
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
  var ust = $("#ust"), hizli = $(".hizli"), sonY = window.scrollY;
  function kaydirinca() {
    var y = window.scrollY;
    ust.classList.toggle("dolu", y > innerHeight * 0.85);
    if (Math.abs(y - sonY) > 8) {
      var asagi = y > sonY && y > 160;
      ust.classList.toggle("sakla", asagi);
      sonY = y;
    }
    // girişte kendi düğmeleri var; küçük hızlı düğme girişten sonra gelir
    if (hizli) hizli.classList.toggle("sakla", y < innerHeight * 0.6 || (ust.classList.contains("sakla") && y < document.documentElement.scrollHeight - innerHeight * 1.6));
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
    }, { threshold: 0.25 });
    vs.forEach(function (v) { io.observe(v); });
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
  // Giriş slaytı: üç video; çubuk dolunca sonrakine geçer. Telefonda solu/sağı dokun, yana kaydır, basılı tut = dur.
  // =====================================================================
  function slaytKur() {
    var cerceve = $(".giris-cerceve"), slaytlar = $$(".slayt"), cubuklar = $$(".cubuklar button"), n = slaytlar.length;
    var videolarS = slaytlar.map(function (sl) { return $("video", sl); });
    var aktif = 0, dolum = null, kilit = false, durdu = false, ekranda = true;
    videolarS.forEach(function (v) { if (v) v.loop = true; });

    function hazirla(i) { var v = videolarS[i]; if (v && v.preload !== "auto") { v.preload = "auto"; v.load(); } }
    function oynat(i) { var v = videolarS[i]; if (!v) return; try { v.currentTime = 0; } catch (e) {} var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    function cubukGuncelle(i) {
      cubuklar.forEach(function (c, k) { var ic = $("i", c); gsap.killTweensOf(ic); gsap.set(ic, { scaleX: k < i ? 1 : 0 }); c.setAttribute("aria-selected", k === i ? "true" : "false"); });
    }
    function baslat(i) {
      var sure = Number(slaytlar[i].dataset.sure) || 8;
      if (dolum) dolum.kill();
      dolum = gsap.fromTo($("i", cubuklar[i]), { scaleX: 0 }, { scaleX: 1, duration: sure, ease: "none", onComplete: function () { git(i + 1, 1); } });
      if (durdu || !ekranda) dolum.pause();
      hazirla((i + 1) % n);
    }
    function yaziGir(sl) {
      var tl = gsap.timeline();
      tl.fromTo($$(".slayt-baslik .harf", sl), { yPercent: 120, rotation: 8 }, { yPercent: 0, rotation: 0, duration: 1, ease: "expo.out", stagger: 0.028 }, 0)
        .fromTo($$(".slayt-yazi .kucuk, .slayt-yazi .alt", sl), { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 0.15);
      return tl;
    }
    function yaricap() { return innerWidth >= 900 ? 34 : 0; }
    function git(i, yon) {
      i = (i + n) % n;
      if (i === aktif || kilit) return;
      kilit = true;
      var eskiNo = aktif, eski = slaytlar[eskiNo], yeni = slaytlar[i], r = yaricap();
      yon = yon || (i > eskiNo ? 1 : -1);
      eski.classList.remove("aktif"); eski.classList.add("cikiyor"); yeni.classList.add("aktif");
      cubukGuncelle(i); oynat(i);
      var tl = gsap.timeline({ onComplete: function () {
        eski.classList.remove("cikiyor"); var v = videolarS[eskiNo]; if (v) v.pause();
        gsap.set([$(".slayt-medya", eski)].concat($$(".slayt-yazi > *", eski)), { clearProps: "all" });
        kilit = false;
      } });
      // yeni video perde gibi açılır ve yakından uzaklaşır; eskisi geri çekilir
      tl.fromTo($(".slayt-medya", yeni), { clipPath: yon > 0 ? "inset(100% 0% 0% 0% round " + r + "px)" : "inset(0% 0% 100% 0% round " + r + "px)" },
          { clipPath: "inset(0% 0% 0% 0% round " + r + "px)", duration: 1, ease: "expo.inOut", clearProps: "clipPath" }, 0)
        .fromTo($(".slayt-medya video", yeni), { scale: 1.3 }, { scale: 1, duration: 1.7, ease: "expo.out" }, 0.1)
        .to($(".slayt-medya", eski), { scale: 0.9, autoAlpha: 0.3, duration: 1, ease: "expo.inOut" }, 0)
        .to($$(".slayt-yazi > *", eski), { y: -36, autoAlpha: 0, duration: 0.45, ease: "power2.in", stagger: 0.04 }, 0)
        .fromTo($(".slayt-arka", yeni), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.1 }, 0)
        .add(yaziGir(yeni), 0.42);
      aktif = i;
      baslat(i);
    }
    function dur(d) {
      durdu = d;
      if (!dolum) return;
      var v = videolarS[aktif];
      if (d || !ekranda) { dolum.pause(); if (v) v.pause(); }
      else { dolum.resume(); if (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
    }

    cubuklar.forEach(function (c, k) { c.addEventListener("click", function () { git(k); }); });
    var ok1 = $(".slayt-ok.onceki"), ok2 = $(".slayt-ok.sonraki");
    if (ok1) ok1.addEventListener("click", function () { git(aktif - 1, -1); });
    if (ok2) ok2.addEventListener("click", function () { git(aktif + 1, 1); });

    // Telefonda: dokun (sol/sağ), yana kaydır, basılı tut
    var basla = null;
    $$(".dokun-alan").forEach(function (b) {
      b.style.touchAction = "pan-y";
      b.addEventListener("pointerdown", function (e) { basla = { x: e.clientX, y: e.clientY, t: Date.now(), sol: b.classList.contains("sol") }; dur(true); });
      b.addEventListener("pointercancel", function () { basla = null; dur(false); });
      b.addEventListener("pointerup", function (e) {
        if (!basla) return;
        var dx = e.clientX - basla.x, dy = e.clientY - basla.y, sure = Date.now() - basla.t, sol = basla.sol;
        basla = null; dur(false);
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) git(aktif + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
        else if (sure < 280 && Math.abs(dx) < 10) git(aktif + (sol ? -1 : 1), sol ? -1 : 1);
      });
    });
    // Ekrandan çıkınca ya da sekme gizlenince durur
    if ("IntersectionObserver" in window) new IntersectionObserver(function (g) { ekranda = g[0].isIntersecting; dur(durdu); }, { threshold: 0.15 }).observe(cerceve);
    document.addEventListener("visibilitychange", function () { ekranda = !document.hidden; dur(durdu); });

    // Kaydırınca giriş, kart gibi küçülüp geri çekilir
    gsap.fromTo(cerceve, { scale: 1, borderRadius: 0 }, { scale: 0.88, borderRadius: 40, yPercent: 8, ease: "none",
      scrollTrigger: { trigger: ".giris", start: "top top", end: "bottom top", scrub: true } });

    return {
      ilk: function () {
        var r = yaricap();
        cubukGuncelle(0); oynat(0);
        var tl = yaziGir(slaytlar[0]);
        tl.fromTo($(".slayt-medya", slaytlar[0]), { clipPath: "inset(100% 0% 0% 0% round " + r + "px)" },
            { clipPath: "inset(0% 0% 0% 0% round " + r + "px)", duration: 1.2, ease: "expo.inOut", clearProps: "clipPath" }, 0)
          .fromTo($(".slayt-medya video", slaytlar[0]), { scale: 1.35 }, { scale: 1, duration: 1.9, ease: "expo.out" }, 0.1);
        baslat(0);
        return tl;
      }
    };
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
    $$(".menu-bas h2, .kareler-bas h2, .ziyaret h2, .hikaye-metin, .karavan-bas h2").forEach(function (el) {
      gsap.fromTo($$(".kelime > span", el), { yPercent: 115, rotation: 7 }, {
        yPercent: 0, rotation: 0, duration: 1, ease: "expo.out", stagger: 0.045, scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });
    gsap.from(".hikaye-not, .hikaye .kucuk", { y: 30, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: ".hikaye", start: "top 70%" } });
    gsap.fromTo(".hikaye .cerceve", { rotation: 12, yPercent: 10 }, { rotation: -3, yPercent: -6, ease: "none", scrollTrigger: { trigger: ".hikaye", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.fromTo(".hikaye figure img", { yPercent: -10 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".hikaye", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(".etiket-1983", { scale: 0, rotation: -60, duration: 0.9, ease: "back.out(2.2)", scrollTrigger: { trigger: ".hikaye figure", start: "top 75%" } });

    // Karavan kartları: yelpaze gibi açılır
    gsap.from(".karavan-ray figure", { y: 90, rotation: function (k) { return (k - 1) * 9; }, autoAlpha: 0, duration: 1.1, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".karavan-ray", start: "top 85%" } });

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
        rayCubuk.style.transform = "scaleX(" + Math.max(0.12, ray.scrollLeft / maks).toFixed(3) + ")";
        kartlar.forEach(function (k) {
          var r = k.getBoundingClientRect(), d = (r.left + r.width / 2 - orta) / innerWidth;
          var a = Math.min(1, Math.abs(d) * 1.4);
          k.style.transform = "scale(" + (1 - a * 0.07).toFixed(3) + ") rotate(" + (d * 4).toFixed(2) + "deg)";
        });
      }
      var dinle = function () { if (!bekliyor) { bekliyor = true; requestAnimationFrame(ciz); } };
      ray.addEventListener("scroll", dinle, { passive: true });
      ciz();
      return function () { ray.removeEventListener("scroll", dinle); kartlar.forEach(function (k) { k.style.transform = ""; }); };
    });
    gsap.from(".ray", { x: 120, autoAlpha: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".ray", start: "top 88%" } });

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
  function girisOyna(slayt) {
    var tl = gsap.timeline();
    tl.add(slayt.ilk(), 0)
      .fromTo(".ust .logo, .ust nav", { y: -30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out", stagger: 0.08 }, 0.2)
      .fromTo(".cubuklar", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0.5)
      .fromTo(".giris-dugmeler > *", { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.07 }, 0.6)
      .fromTo(".slayt-ok", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 1.2)
      .fromTo(".serit", { yPercent: 160 }, { yPercent: 0, duration: 1, ease: "expo.out" }, 0.6);
    return tl;
  }

  // ---------- Kurulum ----------
  function kur() {
    $$(".slayt-baslik").forEach(function (b) {
      b.setAttribute("aria-label", b.textContent.replace(/\s+/g, " ").trim());
      $$(".satir", b).forEach(function (st) { harfle($("em", st) || st); });
    });
    $$(".menu-bas h2, .kareler-bas h2, .ziyaret h2, .hikaye-metin, .karavan-bas h2").forEach(kelimele);

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

    var slayt = slaytKur();
    if (!azHareket) {
      $$("[data-kayan]").forEach(seritKur);
      seritHizlari();
      digerleri();
    }
    if (azHareket || test) { slayt.ilk().progress(1); }
    else enGec(400, fontlar).then(function () { girisOyna(slayt); });
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
