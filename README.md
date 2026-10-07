# 📚 Asisten Belajar AI & Auto-Pilot Agent (Chrome Extension)

Ekstensi Google Chrome (Manifest V3) yang dirancang untuk membantu belajar, menganalisis soal ujian, kuis, latihan psikotes/tes IQ visual, dan mengerjakan soal secara cepat, akurat, dan otomatis (*Auto-Pilot & Auto-Fill*).

---

## ✨ Fitur Utama

1. **⚡ Fast Question Solver (Groq - Llama/Qwen)**
   - Menjawab soal pilihan ganda maupun isian secara instan dan *to-the-point*.
   - Otomatis mendeteksi huruf kunci jawaban (A/B/C/D/E) atau teks opsi yang tepat.

2. **📸 Visual & Pattern Solver (Google Gemini Vision)**
   - Mendeteksi dan memecahkan soal berbasis gambar, grafik, diagram, matriks psikotes, dan tes IQ visual langsung dari tangkapan layar.

3. **🤖 Mode Auto-Pilot Agent (Pengerjaan Otomatis Berkelanjutan)**
   - Membaca soal, memilih opsi yang benar, mengunci jawaban, dan berpindah soal secara berurutan tanpa henti hingga nomor kuis selesai.
   - **Fitur Keamanan Nomor Terakhir**: Otomatis berhenti di soal terakhir agar pengguna dapat meninjau jawaban sebelum mengumpulkan kuis secara manual.

4. **🎯 Auto-Click & Auto-Fill Independen**:
   - Pilihan ganda: Memilih opsi dengan penanda visual (*highlight* hijau).
   - Esai: Mengetik jawaban secara permanen (memicu event `input`, `change`, `blur` agar tersimpan di backend/database ujian).
   - **Toggle Auto-Next**: Dapat dimatikan jika hanya ingin fungsi *Auto-Fill* murni tanpa berpindah nomor otomatis.

5. **📌 On-Page Floating HUD Widget**:
   - Panel kontrol mengambang langsung di halaman kuis untuk memudahkan pengerjaan tanpa perlu membuka popup ekstensi.

---

## 🚀 Cara Instalasi di Google Chrome

1. **Clone repositori ini**:
   ```bash
   git clone https://github.com/tegarsatria632-svg/exstensi-crhome.git
   ```
2. **Buka Google Chrome**:
   - Masuk ke URL `chrome://extensions/`
   - Aktifkan **Developer mode** (Mode pengembang) di pojok kanan atas.
   - Klik **Load unpacked** (Muat yang belum dibongkar).
   - Pilih folder repositori ini.

---

## 🔑 Pengaturan API Key

Ekstensi ini memerlukan API Key untuk berkomunikasi dengan model AI:

1. Salin file template `config.example.js` menjadi `config.js`:
   ```bash
   cp config.example.js config.js
   ```
2. Buka file `config.js` dan masukkan API Key Anda:
   ```javascript
   const CONFIG = {
     GROQ_API_KEY: "gsk_...",        // https://console.groq.com/keys
     OPENROUTER_API_KEY: "sk-or-...", // https://openrouter.ai/keys (opsional)
     GEMINI_API_KEY: "AIza..."       // https://aistudio.google.com/app/apikey
   };
   ```
3. File `config.js` sudah otomatis diabaikan oleh `.gitignore` sehingga aman dan tidak akan terunggah ke repositori publik.
4. Muat ulang (*Reload*) ekstensi di `chrome://extensions/`.

---

## 🛡️ Lisensi & Hak Cipta
Dibuat untuk keperluan edukasi dan efisiensi belajar mandiri.
