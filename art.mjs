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

// Projeler bölümündeki sektör çizimleri (160x100). Müşteri işleri gösterilmez; sektörü temsil eder.
export const SECTOR_ART = {
  mobilya: svg('0 0 160 100', `
<rect class="w st" x="30" y="26" width="54" height="28" rx="8"/>
<rect class="w st" x="20" y="44" width="74" height="30" rx="8"/><path class="stl" d="M20 60h74"/>
<path class="stk" d="M28 74v8M86 74v8"/>
<path class="stk" d="M126 80V42"/><path class="k" d="M110 42h32l-7-18h-18z"/><rect class="l" x="114" y="80" width="24" height="4" rx="2"/>
<rect class="l" x="14" y="88" width="132" height="4" rx="2"/>`),

  beyaz: svg('0 0 160 100', `
<rect class="w st" x="20" y="20" width="58" height="66" rx="6"/>
<rect class="l" x="27" y="27" width="22" height="5" rx="2.5"/><circle class="k" cx="68" cy="29.5" r="3"/>
<circle class="stn" cx="49" cy="58" r="17"/><circle class="s" cx="49" cy="58" r="10"/>
<rect class="w st" x="96" y="12" width="44" height="74" rx="6"/><path class="stl" d="M96 40h44"/>
<rect class="k" x="104" y="22" width="3" height="10" rx="1.5"/><rect class="k" x="104" y="48" width="3" height="16" rx="1.5"/>
<rect class="l" x="14" y="88" width="132" height="4" rx="2"/>`),

  tekstil: svg('0 0 160 100', `
<path class="stk" d="M60 14a5 5 0 1 1 5 5v5"/>
<path class="w st" d="M44 36l16-10h10l16 10 8 14-12 6v30H48V56l-12-6z"/><path class="stl" d="M58 26a7 7 0 0 0 14 0"/>
<rect class="w st" x="104" y="40" width="40" height="12" rx="3"/><rect class="w st" x="100" y="52" width="48" height="12" rx="3"/><rect class="w st" x="96" y="64" width="56" height="12" rx="3"/>
<rect class="k" x="112" y="30" width="24" height="6" rx="3"/>
<rect class="l" x="14" y="88" width="132" height="4" rx="2"/>`),

  eticaret: svg('0 0 160 100', `
<rect class="w st" x="20" y="12" width="72" height="76" rx="8"/><rect class="s" x="28" y="20" width="56" height="36" rx="5"/><circle class="l" cx="56" cy="38" r="9"/>
<rect class="k" x="28" y="63" width="34" height="5" rx="2.5"/><rect class="l" x="28" y="73" width="22" height="4" rx="2"/>
<rect class="k" x="70" y="64" width="14" height="14" rx="4"/><path class="wl" d="M74 71h6M77 68v6"/>
<path class="stk" d="M104 28h8l6 30h22l5-20h-31"/><circle class="k" cx="122" cy="68" r="3"/><circle class="k" cx="136" cy="68" r="3"/>
<circle class="k" cx="142" cy="26" r="8"/><text class="tw" x="142" y="29.5" font-size="9" text-anchor="middle">2</text>`),

  restoran: svg('0 0 160 100', `
<rect class="k" x="24" y="8" width="46" height="84" rx="9"/><rect class="w" x="28" y="12" width="38" height="76" rx="6"/>
<rect class="k" x="35" y="22" width="9" height="9"/><rect class="w" x="38" y="25" width="3" height="3"/>
<rect class="k" x="50" y="22" width="9" height="9"/><rect class="w" x="53" y="25" width="3" height="3"/>
<rect class="k" x="35" y="37" width="9" height="9"/><rect class="w" x="38" y="40" width="3" height="3"/>
<rect class="k" x="50" y="38" width="3" height="3"/><rect class="k" x="56" y="38" width="3" height="3"/><rect class="k" x="53" y="43" width="3" height="3"/>
<rect class="l" x="35" y="54" width="24" height="4" rx="2"/><rect class="l" x="35" y="62" width="16" height="4" rx="2"/><rect class="k" x="35" y="72" width="24" height="8" rx="4"/>
<circle class="w st" cx="110" cy="60" r="22"/><circle class="stn" cx="110" cy="60" r="13"/>
<rect class="w st" x="132" y="24" width="16" height="16" rx="3"/><path class="stk" d="M148 28h3a4 4 0 0 1 0 8h-3"/>`),

  servis: svg('0 0 160 100', `
<rect class="w st" x="16" y="22" width="92" height="34" rx="8"/><path class="stl" d="M16 44h92"/><rect class="l" x="24" y="29" width="40" height="5" rx="2.5"/><circle class="k" cx="98" cy="32" r="3"/>
<path class="stk" d="M36 64c5 6 5 10 0 16M58 64c5 6 5 10 0 16M80 64c5 6 5 10 0 16"/>
<path class="k" d="M146 26a13 13 0 0 1-16 15l-18 18-7-7 18-18a13 13 0 0 1 15-16l-7 7 2 8 8 2z"/>`),

  kuafor: svg('0 0 160 100', `
<circle class="stn" cx="30" cy="30" r="7"/><circle class="stn" cx="30" cy="56" r="7"/><path class="stk" d="M36 34l36 20M36 52l36-20"/>
<rect class="k" x="84" y="22" width="6" height="56" rx="3"/><path class="stk" d="M90 30h8M90 38h8M90 46h8M90 54h8M90 62h8M90 70h8"/>
<rect class="w st" x="110" y="28" width="40" height="46" rx="6"/><rect class="l" x="116" y="36" width="18" height="4" rx="2"/><rect class="k" x="116" y="46" width="28" height="9" rx="3"/><rect class="l" x="116" y="61" width="28" height="4" rx="2"/>`),

  saglik: svg('0 0 160 100', `
<rect class="w st" x="18" y="22" width="62" height="60" rx="8"/><path class="stl" d="M18 38h62"/><rect class="k" x="30" y="14" width="4" height="12" rx="2"/><rect class="k" x="64" y="14" width="4" height="12" rx="2"/>
<circle class="l" cx="32" cy="50" r="3"/><circle class="l" cx="49" cy="50" r="3"/><circle class="l" cx="66" cy="50" r="3"/><circle class="l" cx="32" cy="66" r="3"/><circle class="k" cx="49" cy="66" r="6"/><circle class="l" cx="66" cy="66" r="3"/>
<circle class="w st" cx="120" cy="54" r="24"/><circle class="s" cx="120" cy="54" r="14"/><path class="stk" d="M112 54l6 6 11-13"/>`),
};
