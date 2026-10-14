# Statik site

Derleme adımı yok; `public/` klasörü olduğu gibi yayınlanır. `main` dalına yapılan
her push GitHub Actions ile otomatik olarak GitHub Pages'e çıkar.

## Yerelde çalıştırma

```bash
python3 -m http.server 4321 --directory public
```

Ardından http://localhost:4321 adresini aç.
