# HybridApp — Open Claw Architecture

Struktur ini memisahkan alur aplikasi menjadi modul yang mudah dirawat:

- `collectors/` ambil data dari CEX/DEX
- `core/` state + util + penyimpanan
- `services/` engine & orkestrasi scan
- `ui/` tampilan & interaksi pengguna

Entry UI: `index.html`

Urutan load script sudah diatur pada `index.html`.

Catatan: file legacy `app.js` sudah dihapus karena tidak lagi dipakai.
