---
baslik: ensarocakci.com
seo: ensarocakci.com: Bağımlılıksız, 100 KB'lik kişisel site
aciklama: Bu sitenin kendisi. Harici bağımlılığı olmayan küçük bir üreteçle Markdown dosyalarından derleniyor; ana sayfası yaklaşık 100 KB, çerezi ve takip kodu yok.
etiket: Web · Statik site
durum: Yayında
sira: 1
tarih: 2026-10-17
---
Kişisel bir site için hazır bir sistem kurmak kolay yol. Ama çoğu sistem birkaç yüz kilobaytlık bir sayfa için megabaytlarca kod yükler, eklentiler güncelleme ister ve bir gün bir şey kırılır. Bu site tersinden yapıldı: elle sayılabilecek kadar dosya, sıfır bağımlılık ve tek bir derleme adımı.

## Nasıl çalışıyor

- Yazılar, projeler ve hizmet sayfaları birer Markdown dosyası. Her dosyanın başında başlık, açıklama ve tarih gibi birkaç alan var.
- Tek bir derleme betiği bu dosyaları okuyup HTML sayfalara çeviriyor; site haritasını, RSS beslemesini ve arama motorları için yapılandırılmış veriyi de aynı anda üretiyor.
- Yeni bir yazı eklemek, klasöre bir dosya bırakmaktan ibaret. Menüler, listeler ve ana sayfadaki sayılar kendiliğinden güncelleniyor.
- Her değişiklik otomatik olarak derlenip yayına çıkıyor; elle yükleme yok.

## Sayılar

- Ana sayfa, yazı tipleri dahil yaklaşık 100 KB.
- Harici istek yok: yazı tipleri sitenin kendi adresinden geliyor, dışarıdan betik yüklenmiyor.
- Çerez ve takip kodu yok. Ana sayfadaki canlı ölçüm şeridi, sayfanın o cihazda kaç saniyede yüklendiğini tarayıcının kendi ölçümünden okuyor ve hiçbir yere göndermiyor.
- Derleme süresi bir saniyenin altında.

## Tasarım kararları

- **Siyah-beyaz.** Vurgu rengi yok; hiyerarşi boyut, kalınlık ve boşlukla kuruluyor.
- **Tek yazı tipi.** Geist; işaretten gövde metnine kadar aynı aile.
- **"neo." işareti.** Nurettin Ensar Ocakçı'nın baş harfleri. Ayrı bir çizim değil, yazı tipiyle yazılıyor; bu yüzden her boyutta aynı görünüyor.
- **Sayfa başına tek iş.** Her sayfa tek bir şeyi anlatıyor; gerisini iç bağlantılar ve yan sütun taşıyor.

## Neden burada

Bir web sitesi yaptırmayı düşünen biri için "hızlı" ve "sade" soyut sözler. Bu sayfa, aynı ilkelerle yapılmış gerçek bir örnek: kaynağına bakabilir, hızını ölçebilir, telefonda açabilirsiniz.
