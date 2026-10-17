// Siteyi content/ ve static/ klasörlerinden dist/ klasörüne üretir. Bağımlılık yok: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SERVICE_ART, SECTOR_ART } from './art.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'dist');
const SITE = 'https://ensarocakci.com';
const NAME = 'Nurettin Ensar Ocakçı';
const SHORT = 'Ensar Ocakçı';
const PHONE = { display: '0551 031 96 32', tel: '+905510319632', intl: '+90 551 031 96 32' };
const WA = 'https://wa.me/905510319632?text=' + encodeURIComponent('Merhaba, web sitenizden ulaşıyorum.');

// ---------- Yardımcılar ----------

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const TR = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
const slug = s => s.toLocaleLowerCase('tr').replace(/[çğıöşüâîû]/g, c => TR[c]).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const plain = s => s.replace(/\*\*|\*|`/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
const trDate = d => new Date(d + 'T12:00:00Z').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
const today = new Date().toISOString().slice(0, 10);

function read(file) {
  const raw = readFileSync(file, 'utf8').replace(/\r/g, '');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta = {};
  if (m) for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m ? m[2] : raw };
}

function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) =>
      `<a href="${u}"${/^https?:/.test(u) && !u.startsWith(SITE) ? ' rel="noopener" target="_blank"' : ''}>${t}</a>`);
}

// Başlık, paragraf, liste ve alıntı destekleyen küçük bir Markdown çevirici.
// "Sık sorulan sorular" başlığı altındaki ### soruları yapılandırılmış veri için ayrıca toplanır.
function markdown(src) {
  const out = [], toc = [], faq = [];
  let para = [], list = null, quote = [], inFaq = false, q = null;
  const flush = () => {
    if (para.length) {
      const text = para.join(' ');
      out.push(`<p>${inline(text)}</p>`);
      if (q) q.a.push(text);
      para = [];
    }
    if (list) {
      out.push(`<${list.tag}>${list.items.map(i => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`);
      if (q) q.a.push(...list.items);
      list = null;
    }
    if (quote.length) {
      out.push(`<blockquote><p>${inline(quote.join(' '))}</p></blockquote>`);
      quote = [];
    }
  };
  for (const line of src.split('\n')) {
    let m;
    if (!line.trim()) { flush(); continue; }
    if ((m = line.match(/^(#{2,3})\s+(.+)$/))) {
      flush();
      const level = m[1].length, text = m[2].trim(), id = slug(text);
      if (level === 2) { inFaq = /^sık sorulan/i.test(text); q = null; toc.push({ id, text: plain(text) }); }
      if (level === 3 && inFaq) { q = { q: plain(text), a: [] }; faq.push(q); }
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      continue;
    }
    const ul = line.match(/^\s*[-*]\s+(.+)$/), ol = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (ul || ol) {
      const tag = ul ? 'ul' : 'ol';
      if (para.length || quote.length || (list && list.tag !== tag)) flush();
      if (!list) list = { tag, items: [] };
      list.items.push((ul || ol)[1]);
      continue;
    }
    if ((m = line.match(/^>\s?(.*)$/))) {
      if (para.length || list) flush();
      quote.push(m[1]);
      continue;
    }
    if (list) { list.items[list.items.length - 1] += ' ' + line.trim(); continue; }
    para.push(line.trim());
  }
  flush();
  return { html: out.join('\n'), toc, faq: faq.map(f => ({ q: f.q, a: plain(f.a.join(' ')) })) };
}

const words = s => s.split(/\s+/).filter(Boolean).length;

// ---------- İçerik ----------

const load = dir => readdirSync(join(ROOT, 'content', dir))
  .filter(f => f.endsWith('.md'))
  .map(f => {
    const { meta, body } = read(join(ROOT, 'content', dir, f));
    const name = f.replace(/\.md$/, '');
    return { ...meta, name, path: `/${dir}/${name}/`, ...markdown(body), minutes: Math.max(1, Math.round(words(body) / 200)) };
  });

const services = load('hizmetler').sort((a, b) => Number(a.sira) - Number(b.sira));
const posts = load('yazilar').sort((a, b) => b.tarih.localeCompare(a.tarih) || (Number(a.sira) || 99) - (Number(b.sira) || 99));
const projects = load('projeler').sort((a, b) => (Number(a.sira) || 99) - (Number(b.sira) || 99) || b.tarih.localeCompare(a.tarih));
const pages = load('sayfalar').map(p => ({ ...p, path: `/${p.name}/` }));
const modified = x => x.guncelleme || x.tarih || today;
const latest = [...services, ...posts, ...projects, ...pages].map(modified).sort().pop() || today;
const trMonth = d => new Date(d + 'T12:00:00Z').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

// ---------- Simgeler ----------

const svg = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${d}</svg>`;
const ICONS = {
  web: svg('<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M6.5 6.5h.01M9 6.5h.01"/>'),
  kod: svg('<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>'),
  mobil: svg('<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/>'),
  yz: svg('<circle cx="12" cy="12" r="3"/><circle cx="5" cy="5" r="1.8"/><circle cx="19" cy="5" r="1.8"/><circle cx="5" cy="19" r="1.8"/><circle cx="19" cy="19" r="1.8"/><path d="m6.4 6.4 3.5 3.5M17.6 6.4l-3.5 3.5M6.4 17.6l3.5-3.5M17.6 17.6l-3.5-3.5"/>'),
  check: svg('<path d="M5 12.5 9.5 17 19 7.5"/>'),
  mesaj: svg('<path d="M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.5Z"/>'),
  tel: svg('<path d="M5 4h3.5l2 5-2.4 1.5a11 11 0 0 0 5.4 5.4L15 13.5l5 2V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>'),
  ok: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
};

// ---------- Logo ----------

// İşaret: "neo." (Nurettin Ensar Ocakçı). Ayrı bir çizim değil, yazı tipiyle yazılır; siyah-beyaz.
const MARK = '<span class="neo" aria-hidden="true">neo.</span>';
const LOGO = `${MARK}<span class="brand-name">${NAME}</span>`;

// ---------- Yapılandırılmış veri ----------

const PERSON_ID = SITE + '/#ensar';
const SITE_ID = SITE + '/#site';
const PERSON = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: NAME,
  givenName: 'Nurettin Ensar',
  familyName: 'Ocakçı',
  alternateName: [SHORT, 'Nurettin Ensar Ocakci', 'Ensar Ocakci'],
  url: SITE + '/',
  image: SITE + '/og.jpg',
  telephone: PHONE.intl,
  description: 'Tasarım, yazılım ve yapay zekâ üzerine çalışıyor. Kişisel sitesi neo\'da projelerini, yazılarını ve işletmelere verdiği hizmetleri paylaşıyor.',
  knowsAbout: ['Web tasarım', 'Kurumsal web sitesi', 'Yazılım geliştirme', 'Mobil uygulama geliştirme', 'Yapay zekâ', 'Arama motoru optimizasyonu'],
  makesOffer: services.map(s => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.baslik, url: SITE + s.path } })),
  // sameAs: profil bağlantıları (Instagram, LinkedIn, GitHub) açıldıkça buraya eklenecek
};
const WEBSITE = {
  '@type': 'WebSite', '@id': SITE_ID, url: SITE + '/', name: NAME,
  alternateName: ['neo', SHORT, 'ensarocakci.com'], inLanguage: 'tr-TR', publisher: { '@id': PERSON_ID },
};
const crumbsLd = items => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + path })),
});
const faqLd = faq => faq.length ? [{
  '@type': 'FAQPage',
  mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}] : [];

// ---------- Şablon ----------

const CSS = readFileSync(join(ROOT, 'site.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s*([{}:;,])\s*/g, '$1').replace(/;}/g, '}');

const NAV = [['/projeler/', 'Projeler'], ['/yazilar/', 'Yazılar'], ['/hizmetler/', 'Hizmetler'], ['/hakkinda/', 'Hakkında']];

function layout({ path, title, description, body, ld = [], type = 'website', noindex = false, script = '' }) {
  const url = SITE + path;
  const graph = JSON.stringify({ '@context': 'https://schema.org', '@graph': [WEBSITE, PERSON, ...ld] }).replace(/</g, '\\u003c');
  const nav = NAV.map(([href, label]) =>
    `<a href="${href}"${path.startsWith(href) ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">`}
<meta name="author" content="${NAME}">
<meta name="theme-color" content="#ffffff">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="neo · ${NAME}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="tr_TR">
<meta property="og:image" content="${SITE}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="Yazılar" href="${SITE}/yazilar/feed.xml">
<link rel="preload" href="/fonts/geist-latin.woff2" as="font" type="font/woff2" crossorigin>
<script>document.documentElement.className='js'</script>
<style>${CSS}</style>
<script type="application/ld+json">${graph}</script>
</head>
<body>
<a class="skip" href="#icerik">İçeriğe geç</a>
<header class="top">
  <div class="wrap top-in">
    <a class="brand" href="/" aria-label="${NAME}, ana sayfa">${LOGO}</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menü"><span></span><span></span></button>
    <nav id="nav" class="nav" aria-label="Ana menü">${nav}<a class="btn btn-sm" href="#iletisim">İletişim</a></nav>
  </div>
</header>
<main id="icerik">
${body}
</main>
${contact()}
${footer()}
<script>
var b=document.querySelector('.menu-btn');
b.addEventListener('click',function(){b.setAttribute('aria-expanded',document.body.classList.toggle('nav-open'))});
document.getElementById('nav').addEventListener('click',function(e){if(e.target.closest('a')){document.body.classList.remove('nav-open');b.setAttribute('aria-expanded','false')}});
${script}</script>
</body>
</html>
`;
}

function contact() {
  return `<section class="cta" id="iletisim" aria-labelledby="iletisim-baslik">
  <div class="wrap cta-in">
    <div>
      <h2 id="iletisim-baslik">İletişim</h2>
      <p>Bir iş, soru ya da öneri için doğrudan yazabilirsiniz. WhatsApp ve telefon; başka bir form yok.</p>
    </div>
    <div class="actions">
      <a class="btn" href="${WA}" rel="noopener" target="_blank">${ICONS.mesaj}WhatsApp'tan yazın</a>
      <a class="btn btn-ghost" href="tel:${PHONE.tel}">${ICONS.tel}${PHONE.display}</a>
    </div>
  </div>
</section>`;
}

function footer() {
  const li = items => items.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('');
  return `<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-about">
        <a class="brand" href="/" aria-label="${NAME}, ana sayfa">${LOGO}</a>
        <p>neo, Nurettin Ensar Ocakçı'nın kişisel sitesi: projeler, yazılar ve işletmelere verdiği hizmetler.</p>
      </div>
      <div><h2>Hizmetler</h2><ul>${li(services.map(s => [s.path, s.baslik]))}</ul></div>
      <div><h2>Site</h2><ul>${li([['/', 'Ana sayfa'], ...NAV])}</ul></div>
      <div><h2>İletişim</h2><ul>${li([[WA, 'WhatsApp'], ['tel:' + PHONE.tel, PHONE.display]])}</ul></div>
    </div>
    <div class="foot-mark" aria-hidden="true">${SHORT}</div>
    <div class="foot-bottom"><span>© ${new Date().getFullYear()} ${NAME}</span><span>neo · ensarocakci.com</span></div>
  </div>
</footer>`;
}

// Görünür yol yalnızca üst sayfaları gösterir; tam yol yapılandırılmış veride.
const crumbs = items => `<nav aria-label="Konum"><ol class="crumbs">${items.slice(0, -1).map(([name, path]) =>
  `<li><a href="${path}">${name}</a></li>`).join('')}</ol></nav>`;

const serviceCard = s => `<a class="card" href="${s.path}">
  <span class="card-art" aria-hidden="true">${SERVICE_ART[s.ikon] || ''}</span>
  <h3>${esc(s.baslik)}</h3>
  <p>${esc(s.kisa)}</p>
  <span class="go">Detaylı bilgi${ICONS.ok}</span>
</a>`;

// Dizin satırı: projeler, yazılar ve hizmetler aynı liste biçiminde gösterilir
const row = ({ href, n, meta = [], title, desc }) => `<li><a href="${href}">
  <span class="n">${String(n).padStart(2, '0')}</span>
  <div>${meta.length ? `<div class="meta">${meta.map(m => `<span>${m}</span>`).join('')}</div>` : ''}<h3>${esc(title)}</h3><p>${esc(desc)}</p></div>
  <span class="go" aria-hidden="true">${ICONS.ok}</span>
</a></li>`;
const rows = items => `<ol class="feed">${items.join('')}</ol>`;
const postRows = list => list.map((p, i) => row({ href: p.path, n: i + 1, meta: [`<time datetime="${p.tarih}">${trDate(p.tarih)}</time>`, `${p.minutes} dk okuma`], title: p.baslik, desc: p.aciklama }));
const projectRows = list => list.map((p, i) => row({ href: p.path, n: i + 1, meta: [p.etiket, p.durum].filter(Boolean).map(esc), title: p.baslik, desc: p.aciklama }));
const serviceRows = list => list.map((s, i) => row({ href: s.path, n: i + 1, title: s.baslik, desc: s.kisa }));

// Çalışılan sektörler. Müşteri işleri gösterilmiyor; katalog hazırlanana kadar projeler bölümünü bunlar taşır.
const SECTORS = [
  ['mobilya', 'Mobilya ve ev eşyası', 'Ürün kataloğu, kampanya sayfaları ve WhatsApp\'tan sipariş.'],
  ['beyaz', 'Beyaz eşya', 'Marka ve modele göre ürün sayfaları; servis ve garanti bilgileri.'],
  ['tekstil', 'Tekstil', 'Koleksiyon sayfaları; toptan ve perakende için ayrı akışlar.'],
  ['eticaret', 'E-ticaret', 'Ürün, sepet ve ödeme akışı; kargo ve iade süreçleri.'],
  ['restoran', 'Restoran ve kafe', 'QR menü, rezervasyon ve paket sipariş bağlantıları.'],
  ['servis', 'Teknik servis', 'Klima ve beyaz eşya servisleri için hizmet sayfaları ve tek dokunuşla arama.'],
  ['kuafor', 'Kuaför ve berber', 'Hizmet listesi, fiyatlar ve online randevu.'],
  ['saglik', 'Danışmanlık ve sağlık', 'Diyetisyen gibi randevuyla çalışan hizmetler için tanıtım ve randevu.'],
];
const sectorTile = ([k, t, d]) => `<div class="tile"><div class="tile-art" aria-hidden="true">${SECTOR_ART[k] || ''}</div><h3>${t}</h3><p>${d}</p></div>`;
const tiles = () => `<div class="tiles">${SECTORS.map(sectorTile).join('')}</div>`;
const KATALOG = `<p class="note"><span class="pulse" aria-hidden="true"></span><span><b>Katalog hazırlanıyor.</b> Bugüne kadar yapılan işlerin seçkisi derleniyor; tamamlanınca bu sayfada yayımlanacak.</span></p>`;

const STEPS = [
  ['Tanışma', 'İşinizi, hedefinizi ve ihtiyacınızı kısa bir görüşmede konuşuyoruz.'],
  ['Plan ve teklif', 'Kapsam, süre ve maliyet yazılı bir teklifle netleşir.'],
  ['Tasarım ve geliştirme', 'Onayınızla çalışma başlar; ara aşamalarda görüşünüz alınır.'],
  ['Yayın ve destek', 'Proje yayına alınır, arama motorlarına tanıtılır; sonrasında güncellemeler için ulaşabilirsiniz.'],
];
const steps = () => `<ol class="steps">${STEPS.map(([t, d], i) =>
  `<li><span class="n">0${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>`;

const contactBox = () => `<div class="box contact-box">
  <p class="box-title">İletişim</p>
  <p>Bir iş ya da sorunuz için doğrudan yazabilirsiniz.</p>
  <a class="btn" href="${WA}" rel="noopener" target="_blank">${ICONS.mesaj}WhatsApp</a>
  <a class="btn btn-ghost" href="tel:${PHONE.tel}">${ICONS.tel}Ara</a>
</div>`;

const tocBox = toc => toc.length >= 3 ? `<nav class="box" aria-label="İçindekiler">
  <p class="box-title">Bu sayfada</p>
  <ul class="toc">${toc.map(t => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}</ul>
</nav>` : '';

// ---------- Sayfalar ----------

const SERVICE_FAQ = [
  ['Web sitesi fiyatları nasıl belirleniyor?', 'Fiyat; sayfa sayısına, tasarım ihtiyacına ve eklenecek özelliklere (randevu, ödeme, yönetim paneli gibi) göre değişir. Kısa bir görüşmeden sonra kapsamı netleştirip yazılı teklif veriyorum.'],
  ['Bir web sitesi ne kadar sürede hazır olur?', 'Kapsama bağlıdır. Birkaç sayfalık bir tanıtım sitesi, içerikler hazırsa kısa sürede tamamlanır; yazılım ve uygulama projeleri daha uzun sürer. Süre, teklifte açıkça yazılır.'],
  ['Alan adı ve barındırma kimin adına olur?', 'Alan adı sizin adınıza kaydedilir ve tüm erişim bilgileri size teslim edilir. Kurulum aşamasında yardımcı oluyorum.'],
  ['Site yayına çıktıktan sonra değişiklik yapılabilir mi?', 'Evet. Metin, görsel, fiyat ya da yeni sayfa gibi değişiklikler için ulaşabilirsiniz. İsterseniz içerikleri kendiniz güncelleyebileceğiniz bir panel de kurulabilir.'],
];

// Canlı ölçüm: tarayıcının kendi ölçümü, hiçbir yere gönderilmez. Çerez ya da takip kodu eklenirse "Yok" ifadesi de güncellenmeli.
const HOME_JS = `
addEventListener('load',function(){setTimeout(function(){
  var n=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];if(!n)return;
  var ms=n.loadEventStart||n.domContentLoadedEventEnd,kb=[n].concat(performance.getEntriesByType('resource')).reduce(function(s,e){return s+(e.encodedBodySize||0)},0)/1024;
  document.querySelector('[data-load]').textContent=(ms/1000).toFixed(2).replace('.',',')+' sn';
  if(kb)document.querySelector('[data-size]').textContent=Math.round(kb)+' KB';
},0)});
`;

// Kapak kartı: sitenin künyesi; sayılar ve tarihler derlemede hesaplanır
function cover() {
  const last = posts[0];
  const spec = [
    ['Projeler', `<a href="/projeler/">${SECTORS.length} sektör · katalog hazırlanıyor</a>`],
    ['Yazılar', `<a href="/yazilar/">${posts.length} yazı</a>`],
    ['Hizmetler', `<a href="/hizmetler/">${services.length} hizmet</a>`],
    last && ['Son yazı', `<a href="${last.path}">${esc(last.baslik)}</a>`],
    ['Güncelleme', trDate(latest)],
    ['İletişim', `<a href="${WA}" rel="noopener" target="_blank">WhatsApp</a> · <a href="tel:${PHONE.tel}">${PHONE.display}</a>`],
  ].filter(Boolean);
  return `<aside class="cover" aria-label="Site künyesi">
  <div>
    <div class="cover-top">${MARK}<span class="cover-issue">${trMonth(latest)}</span></div>
    <p class="cover-name">${NAME}</p>
    <p class="cover-sub">Kişisel site · Tasarım, yazılım ve yapay zekâ</p>
  </div>
  <dl class="spec">${spec.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
</aside>`;
}

function home() {
  return layout({
    path: '/',
    title: `${NAME} | neo: Tasarım, Yazılım ve Yapay Zekâ`,
    description: `neo, Nurettin Ensar Ocakçı'nın kişisel sitesi. Tasarım, yazılım ve yapay zekâ üzerine projeler, yazılar ve işletmelere verdiği hizmetler.`,
    script: HOME_JS,
    ld: [{ '@type': 'WebPage', '@id': SITE + '/#webpage', url: SITE + '/', name: 'neo · ' + NAME, isPartOf: { '@id': SITE_ID }, about: { '@id': PERSON_ID }, inLanguage: 'tr-TR' }],
    body: `<section class="hero">
  <div class="hero-main">
  <div class="wrap hero-grid">
    <div>
      <p class="eyebrow">Nurettin Ensar Ocakçı'nın kişisel sitesi</p>
      <h1>Tasarım, yazılım ve yapay zekâ üzerine projeler, yazılar ve hizmetler.</h1>
      <p class="lead">Kendi projelerim, yazdıklarım ve işletmelere verdiğim hizmetler tek yerde.</p>
      <div class="actions">
        <a class="btn" href="/yazilar/">Yazıları okuyun</a>
        <a class="btn btn-ghost" href="/hizmetler/">Hizmetler</a>
      </div>
    </div>
    ${cover()}
  </div>
  <div class="hero-mark" aria-hidden="true">${SHORT}</div>
  </div>
  <div class="live">
    <div class="wrap live-in">
      <p class="live-t"><span class="pulse" aria-hidden="true"></span>Canlı ölçüm: bu sayfa, şu an sizin cihazınızda</p>
      <dl class="live-s">
        <div><dt>Yüklenme süresi</dt><dd data-load>–</dd></div>
        <div><dt>Sayfa boyutu</dt><dd data-size>–</dd></div>
        <div><dt>Çerez ve takip kodu</dt><dd>Yok</dd></div>
      </dl>
    </div>
  </div>
</section>

<section class="section" id="yazilar">
  <div class="wrap">
    <div class="sec-head">
      <div><h2 class="h2">Son yazılar</h2><p>Tasarım, yazılım, yapay zekâ ve çalışma hayatı üzerine notlar.</p></div>
      <a class="more" href="/yazilar/">Tüm yazılar${ICONS.ok}</a>
    </div>
    ${rows(postRows(posts.slice(0, 4)))}
  </div>
</section>

<section class="section alt" id="projeler">
  <div class="wrap">
    <div class="sec-head">
      <div><h2 class="h2">Projeler</h2><p>Bugüne kadar farklı sektörlerden işletmelerle çalıştım; işlerin kataloğu hazırlanıyor. Şimdilik sektörler ve her birinde neye ihtiyaç duyulduğu.</p></div>
      <a class="more" href="/projeler/">Projeler sayfası${ICONS.ok}</a>
    </div>
    ${tiles()}
  </div>
</section>

<section class="section" id="hizmetler">
  <div class="wrap">
    <div class="sec-head">
      <div><h2 class="h2">Hizmetler</h2><p>İşletmelere verdiğim hizmetler. Kapsam, süreç ve sık sorulan sorular her birinin kendi sayfasında.</p></div>
      <a class="more" href="/hizmetler/">Tüm hizmetler${ICONS.ok}</a>
    </div>
    ${rows(serviceRows(services))}
  </div>
</section>`,
  });
}

function projectsIndex() {
  const items = [['Ana sayfa', '/'], ['Projeler', '/projeler/']];
  return layout({
    path: '/projeler/',
    title: `Projeler | ${SHORT}`,
    description: `Nurettin Ensar Ocakçı'nın çalıştığı sektörler ve kendi projeleri. Müşteri işlerinin kataloğu hazırlanıyor.`,
    ld: [{
      '@type': 'CollectionPage', url: SITE + '/projeler/', name: 'Projeler', isPartOf: { '@id': SITE_ID }, inLanguage: 'tr-TR',
      mainEntity: { '@type': 'ItemList', itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE + p.path, name: p.baslik })) },
    }, crumbsLd(items)],
    body: `<section class="page-head">
  <div class="wrap">
    ${crumbs(items)}
    <h1>Projeler</h1>
    <p class="lead">Bugüne kadar farklı sektörlerden işletmeler için web siteleri, mobil uygulamalar ve arayüzler yaptım. İşlerin kataloğu hazırlanıyor; yayına girene kadar burada çalıştığım sektörler ve kendi projelerim var.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="sec-head"><div><h2 class="h2">Çalıştığım sektörler</h2><p>Her sektörün kendi ihtiyacı var; aşağıda her birinde neye odaklanıldığı yazılı.</p></div></div>
    ${tiles()}
    ${KATALOG}
  </div>
</section>
${projects.length ? `<section class="section alt">
  <div class="wrap">
    <div class="sec-head"><div><h2 class="h2">Kendi projelerim</h2><p>Ne için yapıldığı, nasıl çalıştığı ve alınan kararlarla birlikte.</p></div></div>
    ${rows(projectRows(projects))}
  </div>
</section>` : ''}`,
  });
}

function projectPage(p) {
  const items = [['Ana sayfa', '/'], ['Projeler', '/projeler/'], [p.baslik, p.path]];
  const others = projects.filter(o => o !== p);
  return layout({
    path: p.path,
    title: `${p.seo || p.baslik} | ${SHORT}`,
    description: p.aciklama,
    ld: [
      { '@type': 'CreativeWork', '@id': SITE + p.path + '#proje', name: p.baslik, description: p.aciklama, url: SITE + p.path, author: { '@id': PERSON_ID }, dateCreated: p.tarih, dateModified: modified(p), inLanguage: 'tr-TR', keywords: p.etiket },
      { '@type': 'WebPage', url: SITE + p.path, name: p.baslik, isPartOf: { '@id': SITE_ID }, mainEntity: { '@id': SITE + p.path + '#proje' }, inLanguage: 'tr-TR' },
      crumbsLd(items), ...faqLd(p.faq),
    ],
    body: `<section class="page-head">
  <div class="wrap">
    ${crumbs(items)}
    <h1>${esc(p.baslik)}</h1>
    <p class="lead">${esc(p.aciklama)}</p>
    <div class="meta">${[p.etiket, p.durum, trDate(p.tarih)].filter(Boolean).map(m => `<span>${esc(m)}</span>`).join('')}</div>
  </div>
</section>
<div class="wrap article">
  <div class="prose">${p.html}</div>
  <aside class="side"><div class="side-in">${tocBox(p.toc)}${contactBox()}</div></aside>
</div>
${others.length ? `<section class="section alt">
  <div class="wrap">
    <div class="sec-head"><div><h2 class="h2">Diğer projeler</h2></div></div>
    ${rows(projectRows(others))}
  </div>
</section>` : ''}`,
  });
}

function servicesIndex() {
  const items = [['Ana sayfa', '/'], ['Hizmetler', '/hizmetler/']];
  return layout({
    path: '/hizmetler/',
    title: `Hizmetler: Web Tasarım, Yazılım, Mobil Uygulama, Yapay Zekâ | ${SHORT}`,
    description: `Nurettin Ensar Ocakçı'nın işletmelere verdiği hizmetler: web tasarım ve kurumsal web sitesi, işletmeye özel yazılım, iOS ve Android mobil uygulama, yapay zekâ uygulamaları.`,
    ld: [{ '@type': 'CollectionPage', url: SITE + '/hizmetler/', name: 'Hizmetler', isPartOf: { '@id': SITE_ID }, inLanguage: 'tr-TR' }, crumbsLd(items), ...faqLd(SERVICE_FAQ.map(([q, a]) => ({ q, a })))],
    body: `<section class="page-head">
  <div class="wrap">
    ${crumbs(items)}
    <h1>Hizmetler</h1>
    <p class="lead">İşletmelere verdiğim hizmetler. Her birinde neyin dahil olduğu, sürecin nasıl ilerlediği ve sık sorulan sorular kendi sayfasında yazılı.</p>
  </div>
</section>
<section class="section">
  <div class="wrap"><div class="grid g2">${services.map(serviceCard).join('')}</div></div>
</section>
<section class="section alt">
  <div class="wrap">
    <div class="sec-head"><div><h2 class="h2">Nasıl çalışıyorum</h2><p>Her iş aynı dört adımla ilerler; ne zaman ne olacağı baştan bellidir.</p></div></div>
    ${steps()}
  </div>
</section>
<section class="section">
  <div class="wrap split">
    <div><h2 class="h2">Sık sorulan sorular</h2></div>
    <div class="faq">${SERVICE_FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
  </div>
</section>`,
  });
}

function servicePage(s) {
  const items = [['Ana sayfa', '/'], ['Hizmetler', '/hizmetler/'], [s.baslik, s.path]];
  const others = services.filter(o => o !== s);
  return layout({
    path: s.path,
    title: `${s.seo || s.baslik} | ${SHORT}`,
    description: s.aciklama,
    ld: [
      { '@type': 'Service', '@id': SITE + s.path + '#hizmet', name: s.baslik, serviceType: s.baslik, description: s.aciklama, url: SITE + s.path, provider: { '@id': PERSON_ID }, areaServed: { '@type': 'Country', name: 'Türkiye' } },
      { '@type': 'WebPage', url: SITE + s.path, name: s.baslik, isPartOf: { '@id': SITE_ID }, mainEntity: { '@id': SITE + s.path + '#hizmet' }, inLanguage: 'tr-TR', dateModified: modified(s) },
      crumbsLd(items), ...faqLd(s.faq),
    ],
    body: `<section class="page-head">
  <div class="wrap head-grid">
    <div>
      ${crumbs(items)}
      <h1>${esc(s.baslik)}</h1>
      <p class="lead">${esc(s.aciklama)}</p>
    </div>
    <div class="head-art" aria-hidden="true">${SERVICE_ART[s.ikon] || ''}</div>
  </div>
</section>
<div class="wrap article">
  <div class="prose">${s.html}</div>
  <aside class="side"><div class="side-in">${tocBox(s.toc)}${contactBox()}</div></aside>
</div>
<section class="section alt">
  <div class="wrap">
    <div class="sec-head"><div><h2 class="h2">Diğer hizmetler</h2></div></div>
    <div class="grid g3">${others.map(serviceCard).join('')}</div>
  </div>
</section>`,
  });
}

function postsIndex() {
  const items = [['Ana sayfa', '/'], ['Yazılar', '/yazilar/']];
  return layout({
    path: '/yazilar/',
    title: `Yazılar: Tasarım, Yazılım ve Yapay Zekâ Üzerine Notlar | ${SHORT}`,
    description: `Nurettin Ensar Ocakçı'nın tasarım, yazılım, yapay zekâ ve çalışma hayatı üzerine yazıları.`,
    ld: [{
      '@type': 'Blog', url: SITE + '/yazilar/', name: 'Yazılar', inLanguage: 'tr-TR', isPartOf: { '@id': SITE_ID }, author: { '@id': PERSON_ID },
      blogPost: posts.map(p => ({ '@type': 'BlogPosting', headline: p.baslik, url: SITE + p.path, datePublished: p.tarih })),
    }, crumbsLd(items)],
    body: `<section class="page-head">
  <div class="wrap">
    ${crumbs(items)}
    <h1>Yazılar</h1>
    <p class="lead">Tasarım, yazılım, yapay zekâ ve çalışma hayatı üzerine notlar. Bir kısmı rehber, bir kısmı düşünce.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">${rows(postRows(posts))}</div>
</section>`,
  });
}

function postPage(p) {
  const items = [['Ana sayfa', '/'], ['Yazılar', '/yazilar/'], [p.baslik, p.path]];
  const others = posts.filter(o => o !== p).slice(0, 3);
  return layout({
    path: p.path,
    type: 'article',
    title: `${p.seo || p.baslik} | ${SHORT}`,
    description: p.aciklama,
    ld: [{
      '@type': 'BlogPosting', '@id': SITE + p.path + '#yazi', headline: p.baslik, description: p.aciklama, url: SITE + p.path,
      mainEntityOfPage: SITE + p.path, datePublished: p.tarih, dateModified: modified(p), inLanguage: 'tr-TR',
      image: SITE + '/og.jpg', author: { '@id': PERSON_ID }, publisher: { '@id': PERSON_ID }, isPartOf: { '@id': SITE_ID }, wordCount: p.minutes * 200,
    }, crumbsLd(items), ...faqLd(p.faq)],
    body: `<section class="page-head">
  <div class="wrap">
    ${crumbs(items)}
    <h1>${esc(p.baslik)}</h1>
    <p class="lead">${esc(p.aciklama)}</p>
    <div class="meta"><span>${NAME}</span><time datetime="${p.tarih}">${trDate(p.tarih)}</time><span>${p.minutes} dakikalık okuma</span></div>
  </div>
</section>
<div class="wrap article">
  <article class="prose">
    ${p.html}
    <div class="author">${MARK}<div><strong>${NAME}</strong><p>Tasarım, yazılım ve yapay zekâ üzerine çalışıyor; neo, kişisel sitesi. <a href="/hakkinda/">Hakkında</a></p></div></div>
  </article>
  <aside class="side"><div class="side-in">${tocBox(p.toc)}${contactBox()}</div></aside>
</div>
${others.length ? `<section class="section alt">
  <div class="wrap">
    <div class="sec-head"><div><h2 class="h2">Diğer yazılar</h2></div><a class="more" href="/yazilar/">Tüm yazılar${ICONS.ok}</a></div>
    ${rows(postRows(others))}
  </div>
</section>` : ''}`,
  });
}

function simplePage(p) {
  const items = [['Ana sayfa', '/'], [p.baslik, p.path]];
  return layout({
    path: p.path,
    type: p.name === 'hakkinda' ? 'profile' : 'website',
    title: `${p.seo || p.baslik} | ${SHORT}`,
    description: p.aciklama,
    ld: [{ '@type': p.name === 'hakkinda' ? 'ProfilePage' : 'WebPage', url: SITE + p.path, name: p.baslik, isPartOf: { '@id': SITE_ID }, mainEntity: { '@id': PERSON_ID }, inLanguage: 'tr-TR', dateModified: modified(p) }, crumbsLd(items)],
    body: `<section class="page-head">
  <div class="wrap">
    ${crumbs(items)}
    <h1>${esc(p.baslik)}</h1>
    ${p.giris ? `<p class="lead">${esc(p.giris)}</p>` : ''}
  </div>
</section>
<div class="wrap article">
  <div class="prose">${p.html}</div>
  <aside class="side"><div class="side-in">${contactBox()}</div></aside>
</div>`,
  });
}

function notFound() {
  return layout({
    path: '/404.html',
    noindex: true,
    title: `Sayfa bulunamadı | ${SHORT}`,
    description: 'Aradığınız sayfa bulunamadı.',
    body: `<section class="notfound"><div class="wrap">
  <h1>404</h1>
  <p>Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.</p>
  <a class="btn" href="/">Ana sayfaya dönün</a>
</div></section>`,
  });
}

function sitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([path, mod]) => `  <url><loc>${SITE}${path}</loc><lastmod>${mod}</lastmod></url>`).join('\n')}
</urlset>
`;
}

function feed() {
  const rfc = d => new Date(d + 'T09:00:00+03:00').toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${NAME} – Yazılar</title>
  <link>${SITE}/yazilar/</link>
  <atom:link href="${SITE}/yazilar/feed.xml" rel="self" type="application/rss+xml"/>
  <description>Tasarım, yazılım, yapay zekâ ve çalışma hayatı üzerine notlar.</description>
  <language>tr</language>
${posts.map(p => `  <item>
    <title>${esc(p.baslik)}</title>
    <link>${SITE}${p.path}</link>
    <guid>${SITE}${p.path}</guid>
    <pubDate>${rfc(p.tarih)}</pubDate>
    <description>${esc(p.aciklama)}</description>
  </item>`).join('\n')}
</channel>
</rss>
`;
}

// ---------- Yazdır ----------

rmSync(OUT, { recursive: true, force: true });
cpSync(join(ROOT, 'static'), OUT, { recursive: true });

const write = (path, html) => {
  const file = join(OUT, path.endsWith('/') ? path + 'index.html' : path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
};

write('/', home());
write('/projeler/', projectsIndex());
projects.forEach(p => write(p.path, projectPage(p)));
write('/hizmetler/', servicesIndex());
services.forEach(s => write(s.path, servicePage(s)));
write('/yazilar/', postsIndex());
posts.forEach(p => write(p.path, postPage(p)));
pages.forEach(p => write(p.path, simplePage(p)));
write('/404.html', notFound());
write('/yazilar/feed.xml', feed());
write('/sitemap.xml', sitemap([
  ['/', latest],
  ['/projeler/', projects.map(modified).sort().pop() || latest],
  ...projects.map(p => [p.path, modified(p)]),
  ['/hizmetler/', services.map(modified).sort().pop()],
  ...services.map(s => [s.path, modified(s)]),
  ['/yazilar/', posts.map(modified).sort().pop()],
  ...posts.map(p => [p.path, modified(p)]),
  ...pages.map(p => [p.path, modified(p)]),
]));

console.log(`dist/ hazır: ${projects.length} proje, ${posts.length} yazı, ${services.length} hizmet, ${pages.length} sayfa`);
