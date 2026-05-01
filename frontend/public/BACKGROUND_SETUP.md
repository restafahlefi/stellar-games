# 🎨 Setup Background Anime GIF

## 📁 Cara Menambahkan Background GIF

### Langkah 1: Simpan GIF
1. Simpan file GIF anime yang kamu punya
2. Rename file menjadi: `anime-bg.gif`
3. Letakkan di folder: `stellar_games/frontend/public/`

### Langkah 2: Selesai!
Background akan otomatis muncul dengan efek:
- ✅ Opacity 15% (subtle, tidak mengganggu UI)
- ✅ Blur 2px (soft effect)
- ✅ Brightness 70% (darker untuk kontras)
- ✅ Layer di belakang semua konten

## 🎛️ Customisasi (Optional)

Jika ingin mengubah efek background, edit file:
`stellar_games/frontend/src/index.css`

Cari bagian `.anime-bg` dan ubah:

```css
.anime-bg {
  opacity: 0.15;        /* Transparansi: 0.1 - 0.3 */
  filter: blur(2px) brightness(0.7);  /* Blur & Brightness */
}
```

### Rekomendasi Setting:

**Subtle (Default):**
```css
opacity: 0.15;
filter: blur(2px) brightness(0.7);
```

**Medium:**
```css
opacity: 0.25;
filter: blur(1px) brightness(0.8);
```

**Strong (Lebih terlihat):**
```css
opacity: 0.35;
filter: blur(0px) brightness(0.9);
```

## 🖼️ Format GIF yang Disarankan

- **Resolusi**: 1920x1080 atau lebih tinggi
- **File Size**: < 5MB (untuk loading cepat)
- **FPS**: 15-30 fps
- **Loop**: Infinite loop
- **Tema**: Dark/Night scene (agar kontras dengan UI)

## 🔄 Fallback

Jika file `anime-bg.gif` tidak ada, sistem akan otomatis menggunakan:
- Gradient background (dark blue/purple)
- Aurora effect
- Neon grid scanner

Jadi platform tetap terlihat bagus meskipun tanpa GIF!

## 📝 Notes

- Background GIF hanya muncul di homepage dan game pages
- Loading screen menggunakan background terpisah (solid dark)
- Performance optimized dengan `will-change` dan `transform: translateZ(0)`
