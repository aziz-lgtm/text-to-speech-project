# Koe — Text-to-Speech (versi JavaScript)

Ketik teks Jepang/Turki, jadiin suara, download MP3.
Full JavaScript. Deploy ke **Netlify GRATIS, tanpa kartu**.

## Isi folder
- `public/index.html` — halaman web (yang lu liat & klik)
- `netlify/functions/synthesize.js` — backend (bikin audio-nya)
- `netlify.toml` + `package.json` — biar Netlify tau cara jalaninnya

---

## Deploy ke Netlify (4 langkah)

**1. Bikin akun GitHub** → github.com
- Klik "New repository"
- Klik "uploading an existing file"
- Drag semua file di folder ini ke situ

**2. Bikin akun Netlify** → netlify.com
- Bisa daftar langsung pakai akun GitHub. TANPA KARTU.

**3. Di Netlify:**
- Klik **Add new site → Import an existing project**
- Pilih GitHub, pilih repo lu
- Klik **Deploy**

**4. Tunggu ~2 menit.** Netlify kasih link `namaapp.netlify.app`. Kelar. ✅

Netlify otomatis baca `netlify.toml`, jadi lu nggak usah isi setting apa-apa.

---

## Jalanin di laptop dulu (buat nyoba, opsional)
```
npm install
npx netlify dev
```
Buka `localhost:8888`.
(Butuh Netlify CLI: `npm install -g netlify-cli` sekali aja.)

---

## Ganti suara
Buka `netlify/functions/synthesize.js`, cari bagian `VOICES`:
```js
const VOICES = {
  "ja-JP": "ja-JP-NanamiNeural",
  "tr-TR": "tr-TR-EmelNeural",
};
```
Suara cowok: `ja-JP-KeitaNeural`, `tr-TR-AhmetNeural`.

---

## Catatan
- Butuh internet (audio dibikin di server Microsoft).
- Netlify gratis: 125.000 request/bulan + 100 jam function. Lebih dari cukup.
