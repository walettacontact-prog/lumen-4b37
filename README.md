# Statik site

Bağımlılık yok. `node build.mjs`, `content/` ve `static/` klasörlerinden siteyi `dist/`
klasörüne üretir. `main` dalına yapılan her push GitHub Actions ile derlenip GitHub
Pages'e çıkar.

- `content/hizmetler/` – hizmet sayfaları
- `content/yazilar/` – blog yazıları
- `content/sayfalar/` – diğer sayfalar
- `static/` – yazı tipleri, simgeler ve doğrulama dosyaları (olduğu gibi kopyalanır)
- `site.css` – tüm sayfalara gömülen stil

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

Site haritası, RSS, yazı listesi ve ana sayfa kendiliğinden güncellenir.

## Yerelde çalıştırma

```bash
node build.mjs && python3 -m http.server 4321 --directory dist
```

Ardından http://localhost:4321 adresini açın.
