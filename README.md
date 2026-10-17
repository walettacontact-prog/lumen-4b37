# Statik site

Bağımlılık yok. `node build.mjs`, `content/` ve `static/` klasörlerinden siteyi `dist/`
klasörüne üretir. `main` dalına yapılan her push GitHub Actions ile derlenip GitHub
Pages'e çıkar.

- `content/projeler/` – projeler
- `content/yazilar/` – yazılar
- `content/hizmetler/` – hizmet sayfaları
- `content/sayfalar/` – diğer sayfalar
- `static/` – yazı tipleri, simgeler ve doğrulama dosyaları (olduğu gibi kopyalanır)
- `site.css` – tüm sayfalara gömülen stil
- `art.mjs` – hizmet sayfalarındaki çizimler

## Yeni yazı eklemek

`content/yazilar/` içine `adres-olacak-isim.md` adıyla bir dosya ekleyin:

```markdown
---
baslik: Yazının başlığı
aciklama: Arama sonuçlarında görünecek bir iki cümlelik özet.
tarih: 2026-10-17
---
Giriş paragrafı...

## Ara başlık

Metin, **kalın**, [bağlantı](https://ornek.com) ve listeler:

- madde
- madde
```

Projeler için aynı biçim `content/projeler/` altında kullanılır; ek olarak `etiket`
(örn. `Web · Statik site`) ve `durum` (örn. `Yayında`) alanları vardır.

Site haritası, RSS, listeler ve ana sayfadaki sayılar kendiliğinden güncellenir.

## Yerelde çalıştırma

```bash
node build.mjs && python3 -m http.server 4321 --directory dist
```

Ardından http://localhost:4321 adresini açın.
