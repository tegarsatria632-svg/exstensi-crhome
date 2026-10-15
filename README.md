# 📚 Asisten Belajar AI & Auto-Pilot Agent (Chrome Extension)

Ekstensi Google Chrome modern (**Manifest V3**) yang dirancang untuk asisten belajar cerdas, pengerjaan kuis otomatis (*Auto-Pilot*), pemecah soal ujian berbasis teks maupun gambar/diagram (*Gemini Vision*), serta simulasi tes IQ dan psikotes visual (*Raven's Progressive Matrices*).

---

## ✨ Fitur Unggulan

1. **⚡ Fast Question Solver (Groq AI)**
   - Menjawab soal pilihan ganda maupun isian secara instan dan super *to-the-point*.
   - Otomatis mendeteksi opsi jawaban (A/B/C/D/E) tanpa bias urutan huruf.
   - Dilengkapi *auto-fallback* jika kuota model Groq mencapai batas harian (*Rate Limit 429*).

2. **📸 Visual & IQ Matrix Solver (Google Gemini Vision)**
   - Menganalisis soal bergambar, grafik, tabel, geometri, dan matriks tes IQ (*Raven's Matrices / IQ Center*).
   - Dilengkapi logika deduksi visual: deteksi arah garis (tegak lurus vs diagonal), kerapatan grid (*grid spacing*), serta kontinuitas potongan yang hilang (*missing piece*).
   - Pemetaan otomatis kartu opsi gambar tanpa huruf (Opsi 1–6 / A–F).

3. **🤖 Mode Auto-Pilot Agent (Otomatis Penuh)**
   - Membaca soal, memilih jawaban yang tepat, mengunci opsi, dan melanjutkan ke nomor berikutnya secara berurutan.
   - **Fitur Anti-Skip & Verifikasi Mutlak**: Memastikan jawaban benar-benar terisi di halaman web sebelum menekan tombol *Next*.
   - **Keamanan Soal Terakhir**: Otomatis berhenti di nomor terakhir agar pengguna dapat meninjau jawaban sebelum mengumpulkan kuis secara manual.

4. **🎯 Auto-Click & Auto-Fill Independen**
   - **Pilihan Ganda**: Mengaktifkan input radio dan memberikan penanda visual (*highlight* hijau). Mendukung opsi tanpa styling kelas kartu (seperti Opsi D unstyled).
   - **Esai / Isian Singkat**: Mengetik teks jawaban secara permanen (memicu event `input`, `change`, `blur` agar tersimpan di sistem ujian).
   - **Toggle Auto-Next**: Dapat dimatikan jika hanya ingin fitur *Auto-Click* murni tanpa berpindah nomor otomatis.

5. **📌 On-Page Floating HUD Widget**
   - Panel kontrol mengambang yang elegan di layar web untuk memantau status pengerjaan secara *real-time* tanpa perlu membuka popup ekstensi.

6. **🎙️ Rekam Suara Mikrofon & Tab Web (Groq Whisper & Gemini Audio)**
   - **🎙️ Mikrofon Anda**: Merekam suara Anda secara jernih untuk mendikte soal, bertanya ke AI, atau latihan lisan.
   - **🌐 Suara Tab Web**: Merekam audio pembicara/dosen langsung dari tab browser yang sedang dibuka (seperti Zoom Web di `app.zoom.us`, Google Meet, YouTube, video perkuliahan) tanpa mematikan speaker Anda.
   - **🛡️ Filter Suara Jernih & Noise Reduction**: Dilengkapi Web Audio DSP Filter real-time (*High-Pass Low-Cut Filter 85Hz*, *Low-Pass Filter 8.2kHz*, *Vocal Presence Clarity EQ 2.5kHz*, *Dynamics Compressor*, dan *Intelligent Noise Gate*) untuk melenyapkan desis, dengung kipas/AC, dan kebisingan sekitar sehingga vokal percakapan terdengar kristal dan akurat untuk AI.
   - **💾 Anti-Refresh & State Persistence**: Ketika Anda menutup popup dan membukanya kembali, menu aktif, hasil jawaban AI, rekaman audio, teks ketikan, dan pengaturan Anda **tetap tersimpan utuh dan tidak ter-reset/refresh**.
   - **📌 Panel Samping (Side Panel) & 🗗 Popout**: Panel dapat dipin di bilah samping Chrome atau dibuka sebagai jendela mandiri agar tetap muncul saat Anda multitasking.
   - **Transkripsi Kilat & Solusi Cerdas**: Ditenagai Groq Whisper (`whisper-large-v3-turbo`) dengan fallback Gemini Audio. Tombol instan: **🎯 Jawab Pertanyaan dari Suara** atau **📝 Rangkum Pembicaraan**.

7. **✍️ Ketik Teks / Soal Manual**
   - Area pengetikan soal bebas (bisa *paste* soal kuis, kode program, atau topik diskusi dari clipboard).
   - Eksekusi fleksibel dengan pilihan model: **Groq Solver**, **Qwen 72B Tutor**, atau **DeepSeek Logic Analyzer**.

8. **📁 Kirim & Unggah File Serbaguna (Drag & Drop)**
   - **Gambar (PNG, JPG, WEBP)**: Dianalisis langsung via Gemini Vision.
   - **Dokumen PDF & Teks**: Dibaca langsung oleh multimodal AI untuk pemecahan soal atau rangkuman.
   - **File Audio (MP3, WAV, M4A)**: Ditranskripsi otomatis dan dianalisis oleh AI tanpa saling lempar model.

---

## 🚀 Panduan Instalasi Pertama Kali

Ikuti langkah-langkah mudah berikut untuk memasang ekstensi di Google Chrome:

### Langkah 1: Unduh / Clone Repositori
Buka terminal atau Git Bash di komputer Anda, lalu jalankan:
```bash
git clone https://github.com/tegarsatria632-svg/exstensi-crhome.git
```
*(Atau unduh file ZIP melalui tombol **Code > Download ZIP** di GitHub, lalu ekstrak ke folder pilihan Anda).*

---

### Langkah 2: Konfigurasi API Key (`config.js`)
Ekstensi memerlukan kunci API agar dapat berkomunikasi dengan model kecerdasan buatan (Groq dan Google Gemini):

1. Masuk ke folder ekstensi (`exstensi-crhome`).
2. Duplikat/salin file `config.example.js` lalu ubah namanya menjadi `config.js`.
   - **Pengguna Windows**: Klik kanan `config.example.js` > **Copy**, lalu **Paste**, kemudian ubah namanya menjadi `config.js`.
   - **Pengguna Terminal**:
     ```bash
     cp config.example.js config.js
     ```
3. Buka file `config.js` menggunakan text editor (Notepad, VS Code, atau Notepad++).
4. Masukkan API Key Anda di dalam tanda kutip:
   ```javascript
   const CONFIG = {
     GROQ_API_KEY: "gsk_...",        // Dapatkan gratis di: https://console.groq.com/keys
     OPENROUTER_API_KEY: "sk-or-...", // Opsional: https://openrouter.ai/keys
     GEMINI_API_KEY: "AIza..."       // Dapatkan gratis di: https://aistudio.google.com/app/apikey
   };
   ```
5. Simpan file (`Ctrl + S`).
> 🔒 **Keamanan:** File `config.js` sudah didaftarkan di `.gitignore` sehingga API Key pribadi Anda tidak akan pernah terunggah ke internet/GitHub.

---

### Langkah 3: Pasang Ekstensi di Google Chrome
1. Buka browser **Google Chrome**.
2. Ketik pada bilah alamat URL:
   ```text
   chrome://extensions/
   ```
   lalu tekan **Enter**.
3. Di pojok kanan atas layar, aktifkan sakelar **Developer mode** (Mode pengembang).
4. Klik tombol **Load unpacked** (Muat yang belum dibongkar) di pojok kiri atas.
5. Arahkan dan pilih folder repositori ekstensi ini (`exstensi-crhome`).
6. Ekstensi **Asisten Belajar AI** akan langsung terpasang dan siap digunakan! 🎉

---

## 🔄 Cara Memperbarui (Update) Ekstensi ke Versi Terbaru

Jika ada perbaikan kode atau fitur baru di GitHub, Anda tidak perlu memasang ulang dari awal. Cukup ikuti salah satu metode praktis berikut:

### Metode 1: Menggunakan File `update.bat` (Paling Praktis untuk Windows)
1. Buka folder ekstensi di File Explorer.
2. Cari file bernama **`update.bat`**.
3. Klik dua kali (**Double-click**) pada file `update.bat`.
4. File batch akan otomatis mengunduh seluruh pembaruan dari GitHub via `git pull origin main`.
5. Setelah muncul pesan `[SUKSES] Ekstensi berhasil diperbarui!`, lanjutkan ke langkah **Reload Ekstensi** di bawah.

---

### Metode 2: Menggunakan Terminal / Git Bash
Buka terminal di dalam folder ekstensi, lalu ketik perintah:
```bash
git pull origin main
```

---

### ⚠️ LANGKAH WAJIB SETELAH UPDATE: Reload Ekstensi di Chrome!
Setiap kali Anda selesai memperbarui file melalui Git atau `update.bat`, Google Chrome perlu memuat ulang file yang baru:
1. Buka kembali halaman `chrome://extensions/`.
2. Temukan kartu ekstensi **Asisten Belajar AI**.
3. Klik ikon **Reload / Muat Ulang** 🔄 (lingkaran panah putar) pada kartu ekstensi tersebut.
4. Selesai! Ekstensi di browser Anda kini sudah menjalankan versi paling mutakhir.

---

## 💡 Tips & Panduan Pemakaian

- **Mengerjakan Kuis Teks:** Cukup buka halaman kuis Anda. Ekstensi akan otomatis mendeteksi soal melalui Floating HUD di kanan bawah layar.
- **Mengerjakan Tes IQ Bergambar:** Klik tombol kamera 📸 atau ikon Gemini Vision untuk menganalisis gambar soal secara langsung.
- **Mengontrol Auto-Pilot:** Tekan tombol **Play / Stop** pada floating HUD untuk menyalakan atau menjeda pengerjaan otomatis kapan saja.
- **Jika Menemui Konflik Git saat Update:** Jika `update.bat` gagal karena ada file yang terubah, jalankan `git restore .` di terminal untuk mereset file lokal, lalu jalankan kembali `update.bat`.

---

## 🛡️ Lisensi & Hak Cipta
Dibuat untuk keperluan edukasi, riset, dan efisiensi belajar mandiri.
