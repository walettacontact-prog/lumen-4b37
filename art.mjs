// Ana sayfadaki arayüz çizimleri. Gerçek müşteri işi değil; hizmetleri anlatan temsili ekranlar.
// Renkler site.css içindeki .art sınıflarından gelir.

const svg = (box, body) => `<svg class="art" viewBox="${box}" aria-hidden="true">${body}</svg>`;

// Hizmet bölümündeki çizimler
export const SERVICE_ART = {
  web: svg('0 0 480 300', `
<rect class="w st" x="14" y="14" width="340" height="220" rx="14"/><path class="stl" d="M14 42h340"/>
<circle class="l" cx="32" cy="28" r="4"/><circle class="l" cx="46" cy="28" r="4"/><circle class="l" cx="60" cy="28" r="4"/>
<rect class="s" x="120" y="21" width="130" height="14" rx="7"/>
<rect class="k" x="38" y="64" width="150" height="14" rx="4"/><rect class="k" x="38" y="84" width="118" height="14" rx="4"/>
<rect class="l" x="38" y="110" width="140" height="6" rx="3"/><rect class="l" x="38" y="122" width="110" height="6" rx="3"/>
<rect class="a" x="38" y="140" width="64" height="20" rx="10"/>
<rect class="s" x="206" y="58" width="124" height="100" rx="10"/><circle class="al" cx="268" cy="100" r="22"/>
<rect class="s" x="38" y="176" width="92" height="40" rx="8"/><rect class="s" x="138" y="176" width="92" height="40" rx="8"/><rect class="s" x="238" y="176" width="92" height="40" rx="8"/>
<rect class="k" x="290" y="96" width="124" height="190" rx="14"/><rect class="w" x="297" y="103" width="110" height="176" rx="9"/>
<rect class="k" x="307" y="118" width="60" height="9" rx="3"/><rect class="k" x="307" y="132" width="46" height="9" rx="3"/>
<rect class="l" x="307" y="148" width="80" height="5" rx="2.5"/><rect class="a" x="307" y="160" width="40" height="14" rx="7"/>
<rect class="s" x="307" y="184" width="90" height="80" rx="7"/>
<rect class="k" x="398" y="160" width="68" height="134" rx="14"/><rect class="w" x="403" y="165" width="58" height="124" rx="10"/>
<rect class="k" x="410" y="180" width="34" height="7" rx="3"/><rect class="l" x="410" y="192" width="40" height="4" rx="2"/>
<rect class="a" x="410" y="204" width="28" height="11" rx="5.5"/><rect class="s" x="410" y="224" width="44" height="56" rx="6"/>`),

  kod: svg('0 0 480 300', `
<rect class="w" x="14" y="14" width="452" height="272" rx="14"/>
<path class="s" d="M28 14h80v272H28a14 14 0 0 1-14-14V28a14 14 0 0 1 14-14z"/>
<rect class="stn" x="14" y="14" width="452" height="272" rx="14"/>
<rect class="k" x="30" y="32" width="22" height="22" rx="7"/><rect class="a" x="38" y="40" width="6" height="6" rx="3"/>
<text class="tm" x="30" y="90" font-size="10.5">Panel</text>
<rect class="w" x="24" y="100" width="76" height="24" rx="7"/><text class="t" x="30" y="116" font-size="10.5">Randevular</text>
<text class="tm" x="30" y="142" font-size="10.5">Müşteriler</text><text class="tm" x="30" y="166" font-size="10.5">Raporlar</text>
${[['Randevu', '128'], ['Yeni müşteri', '24'], ['Doluluk', '%86']].map(([l, v], i) => `<rect class="w st" x="${122 + i * 114}" y="30" width="100" height="62" rx="10"/><text class="tm" x="${136 + i * 114}" y="52" font-size="10">${l}</text><text class="t" x="${136 + i * 114}" y="78" font-size="19" letter-spacing="-.5">${v}</text>`).join('')}
<rect class="w st" x="122" y="106" width="214" height="110" rx="10"/><text class="tm" x="136" y="126" font-size="10">Haftalık randevu</text>
${[34, 48, 40, 62, 54, 70, 44].map((h, i) => `<rect class="${i === 5 ? 'a' : 'l'}" x="${138 + i * 28}" y="${204 - h}" width="16" height="${h}" rx="4"/>`).join('')}
<rect class="w st" x="350" y="106" width="100" height="110" rx="10"/><text class="tm" x="362" y="126" font-size="10">Sıradakiler</text>
${[0, 1, 2].map(i => `<circle class="${i ? 'l' : 'k'}" cx="368" cy="${148 + i * 24}" r="7"/><rect class="l" x="382" y="${145 + i * 24}" width="54" height="6" rx="3"/>`).join('')}
<rect class="w st" x="122" y="230" width="328" height="42" rx="10"/>
<circle class="al" cx="142" cy="251" r="9"/><rect class="k" x="160" y="247" width="74" height="8" rx="4"/><rect class="l" x="256" y="248" width="60" height="6" rx="3"/>
<rect class="al" x="370" y="241" width="66" height="20" rx="10"/><text class="ta" x="403" y="255" font-size="9.5" text-anchor="middle">Onaylandı</text>`),

  mobil: svg('0 0 480 300', `
<rect class="k" x="120" y="10" width="130" height="270" rx="26"/><rect class="w" x="127" y="17" width="116" height="256" rx="20"/>
<rect class="k" x="163" y="24" width="44" height="11" rx="5.5"/>
<text class="tm" x="139" y="60" font-size="9.5">Merhaba</text><text class="t" x="139" y="78" font-size="14" letter-spacing="-.3">Siparişleriniz</text>
${[0, 1, 2].map(i => `<rect class="s" x="139" y="${92 + i * 46}" width="92" height="38" rx="10"/><rect class="al" x="147" y="${100 + i * 46}" width="22" height="22" rx="6"/><rect class="k" x="176" y="${103 + i * 46}" width="44" height="6" rx="3"/><rect class="l" x="176" y="${114 + i * 46}" width="30" height="5" rx="2.5"/>`).join('')}
<rect class="a" x="139" y="234" width="92" height="28" rx="14"/><text class="tw" x="185" y="252" font-size="10.5" text-anchor="middle">Sipariş ver</text>
<rect class="w st" x="26" y="196" width="150" height="48" rx="14"/><rect class="a" x="38" y="211" width="18" height="18" rx="5"/>
<text class="t" x="64" y="217" font-size="10.5">Siparişiniz yolda</text><text class="tm" x="64" y="232" font-size="9">2 dk önce</text>
<rect class="k" x="268" y="24" width="130" height="270" rx="26"/><rect class="w" x="275" y="31" width="116" height="256" rx="20"/>
<rect class="k" x="311" y="38" width="44" height="11" rx="5.5"/>
<rect class="s" x="287" y="60" width="92" height="88" rx="12"/><circle class="al" cx="333" cy="104" r="24"/>
<text class="t" x="287" y="172" font-size="13" letter-spacing="-.3">Filtre kahve</text><text class="tm" x="287" y="188" font-size="9">250 g · Taze kavrulmuş</text>
${[0, 1, 2, 3, 4].map(i => `<circle class="${i < 4 ? 'a' : 'l'}" cx="${291 + i * 11}" cy="202" r="3.5"/>`).join('')}
<text class="t" x="287" y="230" font-size="15" letter-spacing="-.3">₺240</text>
<rect class="k" x="287" y="244" width="92" height="28" rx="14"/><text class="tw" x="333" y="262" font-size="10.5" text-anchor="middle">Sepete ekle</text>`),

  yz: svg('0 0 480 300', `
<rect class="s st" x="36" y="36" width="150" height="200" rx="10"/>
<rect class="w st" x="24" y="24" width="150" height="200" rx="10"/>
<text class="t" x="40" y="52" font-size="12">Fatura</text>
<rect class="l" x="40" y="66" width="110" height="5" rx="2.5"/><rect class="l" x="40" y="78" width="86" height="5" rx="2.5"/>
${[0, 1, 2, 3].map(i => `<rect class="l" x="40" y="${104 + i * 14}" width="70" height="5" rx="2.5"/><rect class="l" x="128" y="${104 + i * 14}" width="30" height="5" rx="2.5"/>`).join('')}
<rect class="al" x="40" y="172" width="118" height="32" rx="7"/><text class="t" x="50" y="192" font-size="10">Toplam</text><text class="t" x="150" y="192" font-size="10.5" text-anchor="end">₺3.450</text>
<path class="dash" d="M184 124h80"/><path class="arw" d="M256 117l7 7-7 7"/>
<circle class="a" cx="222" cy="124" r="20"/>
<path class="wl" d="M215 117l14 14M229 117l-14 14"/><circle class="w" cx="222" cy="124" r="4.5"/>
<rect class="w" x="272" y="34" width="184" height="180" rx="10"/>
<path class="s" d="M282 34h164a10 10 0 0 1 10 10v20H272V44a10 10 0 0 1 10-10z"/>
<text class="tm" x="284" y="53" font-size="9.5">Tarih</text><text class="tm" x="336" y="53" font-size="9.5">Firma</text><text class="tm" x="444" y="53" font-size="9.5" text-anchor="end">Tutar</text>
<rect class="al" x="273" y="154" width="182" height="30"/>
${[0, 1, 2, 3, 4].map(i => `${i ? `<path class="stl" d="M272 ${64 + i * 30}h184"/>` : ''}<rect class="${i === 3 ? 'a' : 'l'}" x="284" y="${76 + i * 30}" width="36" height="6" rx="3"/><rect class="${i === 3 ? 'a' : 'k'}" x="336" y="${76 + i * 30}" width="56" height="6" rx="3"/><rect class="${i === 3 ? 'a' : 'l'}" x="414" y="${76 + i * 30}" width="30" height="6" rx="3"/>`).join('')}
<rect class="stn" x="272" y="34" width="184" height="180" rx="10"/>
<rect class="k" x="272" y="230" width="184" height="44" rx="14"/><circle class="a" cx="294" cy="252" r="7"/>
<text class="tw" x="310" y="256" font-size="10.5">Fatura tabloya eklendi.</text>`),
};

// ---------- Projeler: sektör parçaları ----------
// Parçalar 160x100 düzleminde çizilir; hem küçük sektör kutularında hem büyük vitrinde (taşınıp ölçeklenerek) kullanılır.

const P = {
  sofa: '<rect class="w st" x="30" y="26" width="54" height="28" rx="8"/><rect class="w st" x="20" y="44" width="74" height="30" rx="8"/><path class="stl" d="M20 60h74"/><path class="stk" d="M28 74v8M86 74v8"/>',
  lamba: '<path class="stk" d="M126 80V42"/><path class="k" d="M110 42h32l-7-18h-18z"/><rect class="l" x="114" y="80" width="24" height="4" rx="2"/>',
  zemin: '<rect class="l" x="14" y="88" width="132" height="4" rx="2"/>',
  camasir: '<rect class="w st" x="20" y="20" width="58" height="66" rx="6"/><rect class="l" x="27" y="27" width="22" height="5" rx="2.5"/><circle class="k" cx="68" cy="29.5" r="3"/><circle class="stn" cx="49" cy="58" r="17"/><circle class="s" cx="49" cy="58" r="10"/>',
  buzdolabi: '<rect class="w st" x="96" y="12" width="44" height="74" rx="6"/><path class="stl" d="M96 40h44"/><rect class="k" x="104" y="22" width="3" height="10" rx="1.5"/><rect class="k" x="104" y="48" width="3" height="16" rx="1.5"/>',
  aski: '<path class="stk" d="M60 14a5 5 0 1 1 5 5v5"/>',
  gomlek: '<path class="w st" d="M44 36l16-10h10l16 10 8 14-12 6v30H48V56l-12-6z"/><path class="stl" d="M58 26a7 7 0 0 0 14 0"/>',
  kumas: '<rect class="w st" x="104" y="40" width="40" height="12" rx="3"/><rect class="w st" x="100" y="52" width="48" height="12" rx="3"/><rect class="w st" x="96" y="64" width="56" height="12" rx="3"/><rect class="k" x="112" y="30" width="24" height="6" rx="3"/>',
  urunKarti: '<rect class="w st" x="20" y="12" width="72" height="76" rx="8"/><rect class="s" x="28" y="20" width="56" height="36" rx="5"/><circle class="l" cx="56" cy="38" r="9"/><rect class="k" x="28" y="63" width="34" height="5" rx="2.5"/><rect class="l" x="28" y="73" width="22" height="4" rx="2"/><rect class="k" x="70" y="64" width="14" height="14" rx="4"/><path class="wl" d="M74 71h6M77 68v6"/>',
  sepet: '<path class="stk" d="M104 28h8l6 30h22l5-20h-31"/><circle class="k" cx="122" cy="68" r="3"/><circle class="k" cx="136" cy="68" r="3"/><circle class="k" cx="142" cy="26" r="8"/><text class="tw" x="142" y="29.5" font-size="9" text-anchor="middle">2</text>',
  qrTelefon: '<rect class="k" x="24" y="8" width="46" height="84" rx="9"/><rect class="w" x="28" y="12" width="38" height="76" rx="6"/><rect class="k" x="35" y="22" width="9" height="9"/><rect class="w" x="38" y="25" width="3" height="3"/><rect class="k" x="50" y="22" width="9" height="9"/><rect class="w" x="53" y="25" width="3" height="3"/><rect class="k" x="35" y="37" width="9" height="9"/><rect class="w" x="38" y="40" width="3" height="3"/><rect class="k" x="50" y="38" width="3" height="3"/><rect class="k" x="56" y="38" width="3" height="3"/><rect class="k" x="53" y="43" width="3" height="3"/><rect class="l" x="35" y="54" width="24" height="4" rx="2"/><rect class="l" x="35" y="62" width="16" height="4" rx="2"/><rect class="k" x="35" y="72" width="24" height="8" rx="4"/>',
  tabak: '<circle class="w st" cx="110" cy="60" r="22"/><circle class="stn" cx="110" cy="60" r="13"/><rect class="w st" x="132" y="24" width="16" height="16" rx="3"/><path class="stk" d="M148 28h3a4 4 0 0 1 0 8h-3"/>',
  klima: '<rect class="w st" x="16" y="22" width="92" height="34" rx="8"/><path class="stl" d="M16 44h92"/><rect class="l" x="24" y="29" width="40" height="5" rx="2.5"/><circle class="k" cx="98" cy="32" r="3"/>',
  hava: '<path class="stk" d="M36 64c5 6 5 10 0 16M58 64c5 6 5 10 0 16M80 64c5 6 5 10 0 16"/>',
  anahtar: '<path class="k" d="M146 26a13 13 0 0 1-16 15l-18 18-7-7 18-18a13 13 0 0 1 15-16l-7 7 2 8 8 2z"/>',
  makas: '<circle class="stn" cx="30" cy="30" r="7"/><circle class="stn" cx="30" cy="56" r="7"/><path class="stk" d="M36 34l36 20M36 52l36-20"/>',
  tarak: '<rect class="k" x="84" y="22" width="6" height="56" rx="3"/><path class="stk" d="M90 30h8M90 38h8M90 46h8M90 54h8M90 62h8M90 70h8"/>',
  randevu: '<rect class="w st" x="110" y="28" width="40" height="46" rx="6"/><rect class="l" x="116" y="36" width="18" height="4" rx="2"/><rect class="k" x="116" y="46" width="28" height="9" rx="3"/><rect class="l" x="116" y="61" width="28" height="4" rx="2"/>',
  takvim: '<rect class="w st" x="18" y="22" width="62" height="60" rx="8"/><path class="stl" d="M18 38h62"/><rect class="k" x="30" y="14" width="4" height="12" rx="2"/><rect class="k" x="64" y="14" width="4" height="12" rx="2"/><circle class="l" cx="32" cy="50" r="3"/><circle class="l" cx="49" cy="50" r="3"/><circle class="l" cx="66" cy="50" r="3"/><circle class="l" cx="32" cy="66" r="3"/><circle class="k" cx="49" cy="66" r="6"/><circle class="l" cx="66" cy="66" r="3"/>',
  onay: '<circle class="w st" cx="120" cy="54" r="24"/><circle class="s" cx="120" cy="54" r="14"/><path class="stk" d="M112 54l6 6 11-13"/>',
  pencere: '<rect class="w st" x="16" y="14" width="128" height="76" rx="8"/><path class="stl" d="M16 32h128"/><circle class="l" cx="28" cy="23" r="3"/><circle class="l" cx="38" cy="23" r="3"/><circle class="l" cx="48" cy="23" r="3"/><rect class="s" x="70" y="19" width="40" height="8" rx="4"/><rect class="k" x="28" y="44" width="44" height="7" rx="3.5"/><rect class="l" x="28" y="56" width="36" height="4" rx="2"/><rect class="k" x="28" y="68" width="28" height="10" rx="5"/><rect class="s" x="88" y="42" width="44" height="36" rx="6"/><circle class="l" cx="110" cy="58" r="8"/>',
  panel: '<rect class="w st" x="16" y="16" width="128" height="72" rx="8"/><path class="stl" d="M50 16v72"/><rect class="k" x="24" y="28" width="18" height="5" rx="2.5"/><rect class="l" x="24" y="40" width="18" height="4" rx="2"/><rect class="l" x="24" y="50" width="18" height="4" rx="2"/><rect class="s" x="60" y="26" width="34" height="22" rx="5"/><rect class="s" x="100" y="26" width="34" height="22" rx="5"/><rect class="l" x="62" y="60" width="8" height="18" rx="2"/><rect class="l" x="74" y="54" width="8" height="24" rx="2"/><rect class="k" x="86" y="48" width="8" height="30" rx="2"/><rect class="l" x="98" y="58" width="8" height="20" rx="2"/><rect class="l" x="110" y="52" width="8" height="26" rx="2"/>',
  yz: '<rect class="w st" x="22" y="22" width="92" height="40" rx="12"/><circle class="k" cx="42" cy="42" r="4"/><circle class="k" cx="58" cy="42" r="4"/><circle class="l" cx="74" cy="42" r="4"/><rect class="k" x="56" y="62" width="82" height="26" rx="13"/><rect class="w" x="68" y="73" width="44" height="4" rx="2"/><path class="stk" d="M124 16l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z"/>',
  telefon: '<rect class="k" x="60" y="6" width="48" height="88" rx="10"/><rect class="w" x="64" y="10" width="40" height="80" rx="7"/><rect class="k" x="76" y="14" width="16" height="4" rx="2"/><rect class="s" x="70" y="26" width="28" height="22" rx="5"/><rect class="k" x="70" y="54" width="20" height="4" rx="2"/><rect class="l" x="70" y="62" width="26" height="3" rx="1.5"/><rect class="k" x="70" y="74" width="28" height="9" rx="4.5"/><rect class="w st" x="14" y="40" width="44" height="24" rx="6"/><circle class="k" cx="25" cy="52" r="4"/><rect class="l" x="34" y="48" width="18" height="3" rx="1.5"/><rect class="l" x="34" y="54" width="12" height="3" rx="1.5"/>',
};

const SECTOR_BODY = {
  mobilya: P.sofa + P.lamba + P.zemin,
  beyaz: P.camasir + P.buzdolabi + P.zemin,
  tekstil: P.aski + P.gomlek + P.kumas + P.zemin,
  eticaret: P.urunKarti + P.sepet,
  restoran: P.qrTelefon + P.tabak,
  servis: P.klima + P.hava + P.anahtar,
  kuafor: P.makas + P.tarak + P.randevu,
  saglik: P.takvim + P.onay,
  web: P.pencere,
  mobil: P.telefon,
  kod: P.panel,
  yz: P.yz,
};
export const SECTOR_ART = Object.fromEntries(Object.entries(SECTOR_BODY).map(([k, b]) => [k, svg('0 0 160 100', b)]));

// ---------- Projeler vitrini ----------
// Bir mağaza sitesi, bir sipariş uygulaması, bir yönetim paneli ve sektör kartları tek sahnede.

const T = (x, y, str, size, cls = 't', extra = '') => `<text class="${cls}" x="${x}" y="${y}" font-size="${size}"${extra}>${str}</text>`;
const bar = (x, y, w, h = 6, cls = 'l') => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"/>`;
const pill = (x, y, w, h, label, dark = true, fs = 11) =>
  `<rect class="${dark ? 'k' : 's'}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"/>${T(x + w / 2, y + h / 2 + fs * .36, label, fs, dark ? 'tw' : 't', ' text-anchor="middle"')}`;
// Parçayı (ox,oy) köşesi (X,Y)'ye gelecek şekilde s oranında yerleştirir
const put = (body, X, Y, s, ox, oy) => `<g transform="translate(${(X - ox * s).toFixed(1)} ${(Y - oy * s).toFixed(1)}) scale(${s})">${body}</g>`;

const product = (x, y, name, price, thumb) => `<rect class="w st" x="${x}" y="${y}" width="184" height="180" rx="10"/><rect class="s" x="${x + 10}" y="${y + 10}" width="164" height="100" rx="8"/>${thumb}
${T(x + 10, y + 134, name, 12)}${T(x + 174, y + 134, price, 12, 't', ' text-anchor="end"')}${bar(x + 10, y + 144, 70, 5)}${pill(x + 10, y + 154, 84, 20, 'Sepete ekle', true, 10)}`;

const menuItem = (y, name, price) => `<rect class="s" x="786" y="${y}" width="40" height="40" rx="10"/>${T(836, y + 16, name, 12)}${bar(836, y + 23, 60, 4)}${T(836, y + 37, price, 11, 'tn')}<circle class="k" cx="940" cy="${y + 20}" r="11"/><path class="wl" d="M935 ${y + 20}h10M940 ${y + 15}v10"/>`;

const orderRow = (y, no, w, status, dark) => `${T(898, y + 4, no, 10, 'tn')}${bar(940, y - 1, w, 6)}${pill(1064, y - 9, 88, 20, status, dark, 9)}`;

export const SHOWCASE = svg('0 0 1200 640', `
<rect class="w st" x="60" y="50" width="640" height="450" rx="14"/><path class="stl" d="M60 86h640"/>
<circle class="l" cx="82" cy="68" r="4"/><circle class="l" cx="98" cy="68" r="4"/><circle class="l" cx="114" cy="68" r="4"/>
<rect class="s" x="300" y="59" width="160" height="18" rx="9"/>${T(380, 72, 'magaza.com', 10, 'tm', ' text-anchor="middle"')}
<rect class="k" x="88" y="106" width="22" height="22" rx="6"/>${T(118, 122, 'Mağaza', 13)}
${T(380, 121, 'Ürünler', 11, 'tm')}${T(440, 121, 'Koleksiyon', 11, 'tm')}${T(518, 121, 'İletişim', 11, 'tm')}${pill(596, 104, 80, 26, 'Sepet · 2', true, 11)}
<rect class="s" x="88" y="146" width="584" height="130" rx="10"/>
${T(112, 188, 'Yeni sezon', 22)}${T(112, 214, 'oturma grupları', 22)}${bar(112, 228, 150)}${bar(112, 240, 110)}${pill(112, 254, 70, 22, 'İncele', true, 10)}
${put(P.sofa + P.lamba, 480, 162, 1.05, 20, 26)}
${product(88, 296, 'Üçlü koltuk', '₺18.900', put(P.sofa, 146, 331, .9, 20, 26))}
${product(288, 296, 'Keten gömlek', '₺1.250', put(P.gomlek, 354, 329, .9, 36, 26))}
${product(488, 296, 'Çamaşır makinesi', '₺24.500', put(P.camasir, 554, 326, .9, 20, 20))}

<rect class="k" x="760" y="30" width="220" height="400" rx="30"/><rect class="w" x="768" y="38" width="204" height="384" rx="23"/><rect class="k" x="840" y="48" width="60" height="14" rx="7"/>
${T(786, 96, 'Masa 12', 10, 'tm')}${T(786, 118, 'Menü', 20)}
<rect class="s" x="786" y="130" width="168" height="26" rx="13"/>${T(800, 147, 'Ara', 10, 'tm')}
${pill(786, 166, 54, 22, 'Kahve', true, 10)}${pill(846, 166, 48, 22, 'Tatlı', false, 10)}${pill(900, 166, 54, 22, 'Sandviç', false, 10)}
${menuItem(200, 'Filtre kahve', '₺120')}${menuItem(252, 'Cheesecake', '₺180')}${menuItem(304, 'Soğuk latte', '₺150')}
${pill(786, 366, 168, 36, 'Sipariş ver · ₺450', true, 12)}

<rect class="w st" x="880" y="412" width="290" height="218" rx="12"/>
${T(898, 440, 'Siparişler', 15)}${T(1152, 440, 'Bugün · 24', 11, 'tm', ' text-anchor="end"')}
${T(898, 462, 'NO', 9, 'tm')}${T(940, 462, 'MÜŞTERİ', 9, 'tm')}${T(1068, 462, 'DURUM', 9, 'tm')}<path class="stl" d="M898 470h254"/>
${orderRow(488, '#1042', 96, 'Hazırlanıyor', false)}${orderRow(514, '#1041', 72, 'Kargoda', true)}${orderRow(540, '#1040', 100, 'Teslim edildi', false)}${orderRow(566, '#1039', 84, 'Kargoda', true)}
${[12, 18, 10, 22, 16, 26, 20, 14, 24, 20].map((h, i) => `<rect class="${i === 5 ? 'k' : 'l'}" x="${898 + i * 26}" y="${612 - h}" width="14" height="${h}" rx="3"/>`).join('')}

<rect class="w st" x="40" y="525" width="260" height="80" rx="12"/>${put(P.makas, 58, 548, .55, 23, 23)}
${T(100, 552, 'Cuma 14:30', 11, 'tm')}${T(100, 572, 'Saç kesimi', 13)}${pill(204, 553, 80, 24, 'Onaylandı', true, 10)}
<rect class="w st" x="330" y="540" width="270" height="72" rx="12"/>${put(P.klima + P.hava, 346, 552, .42, 16, 22)}
${T(400, 564, 'Servis talebi', 11, 'tm')}${T(400, 584, 'Klima bakımı', 13)}${pill(532, 562, 52, 26, 'Ara', true, 11)}
<rect class="w st" x="620" y="530" width="220" height="84" rx="12"/>${put(P.takvim, 636, 552, .55, 18, 14)}
${T(684, 556, 'Diyetisyen', 11, 'tm')}${T(684, 576, 'Kontrol randevusu', 13)}${T(684, 594, 'Yarın 10:00', 11, 'tm')}`);

// ---------- Giriş çizimi ----------
// Koyu kart üstünde beyaz çizgilerle: site, telefon ve asistan balonu. Metin yok.
export const HERO_ART = `<svg class="cover-art" viewBox="0 0 420 262" aria-hidden="true"><g fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<rect x="16" y="46" width="252" height="170" rx="14"/><path d="M16 78h252"/>
<circle cx="36" cy="62" r="3" fill="#fff" stroke="none" opacity=".5"/><circle cx="48" cy="62" r="3" fill="#fff" stroke="none" opacity=".5"/><circle cx="60" cy="62" r="3" fill="#fff" stroke="none" opacity=".5"/>
<rect x="40" y="100" width="92" height="12" rx="6" fill="#fff" stroke="none" opacity=".9"/><rect x="40" y="122" width="62" height="8" rx="4" fill="#fff" stroke="none" opacity=".35"/><rect x="40" y="138" width="76" height="8" rx="4" fill="#fff" stroke="none" opacity=".35"/>
<rect x="40" y="164" width="66" height="24" rx="12" fill="#fff" stroke="none"/>
<rect x="150" y="98" width="98" height="92" rx="10" fill="#fff" stroke="none" opacity=".12"/><circle cx="199" cy="144" r="19" fill="#fff" stroke="none" opacity=".22"/>
<rect x="250" y="72" width="114" height="190" rx="22" fill="#111112"/>
<rect x="291" y="82" width="32" height="6" rx="3" fill="#fff" stroke="none" opacity=".55"/>
<rect x="266" y="106" width="82" height="50" rx="8" fill="#fff" stroke="none" opacity=".12"/>
<rect x="266" y="166" width="54" height="8" rx="4" fill="#fff" stroke="none" opacity=".9"/><rect x="266" y="182" width="72" height="6" rx="3" fill="#fff" stroke="none" opacity=".35"/>
<rect x="266" y="210" width="82" height="26" rx="13" fill="#fff" stroke="none"/>
<path d="M310 14h82a12 12 0 0 1 12 12v22a12 12 0 0 1-12 12h-50l-16 12v-12h-16a12 12 0 0 1-12-12V26a12 12 0 0 1 12-12z" fill="#111112"/>
<circle cx="334" cy="37" r="3.5" fill="#fff" stroke="none"/><circle cx="351" cy="37" r="3.5" fill="#fff" stroke="none" opacity=".6"/><circle cx="368" cy="37" r="3.5" fill="#fff" stroke="none" opacity=".3"/>
</g></svg>`;
