// popup.js - Asisten Belajar AI (Groq, Gemini Vision, DeepSeek, Qwen 72B & AI Agent Auto-Pilot)

// === KONFIGURASI API KEY & MODEL ===
function getApiKey(name, fallback = "") {
  if (typeof CONFIG !== "undefined" && CONFIG && CONFIG[name] && !CONFIG[name].startsWith("YOUR_")) {
    return CONFIG[name];
  }
  return fallback;
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "qwen/qwen3.8-27b";
const GROQ_MODELS = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"];

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "deepseek/deepseek-chat";

const TUTOR_MODEL_OPENROUTER = "qwen/qwen-2.5-72b-instruct";
const TUTOR_MODEL_GROQ = "openai/gpt-oss-120b";

// Prioritaskan gemini-3.5-flash-lite (model aktif 200 OK & kuota penuh)
const GEMINI_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-2.5-flash"];

const MAX_CHARS = 16000;

// === PROMPT KHUSUS SESUAI PERAN MASING-MASING AI ===

// 1. GROQ: Penjawab Cepat Soal di Layar (WAJIB TO-THE-POINT TANPA PENJELASAN)
function getGroqPrompt() {
  return `Kamu adalah AI penjawab kuis, ujian, matematika, dan tes akademik tingkat ahli dengan akurasi 100% dan super to-the-point.
TUGAS UTAMA:
Selesaikan pertanyaan atau soal pada teks dan berikan jawaban yang benar dan akurat.

ATURAN KHUSUS SOAL MATEMATIKA, ALJABAR & MENGHITUNG NILAI X / VARIABEL:
- WAJIB lakukan kalkulasi langkah demi langkah di dalam blok tertutup [HITUNGAN: ...].
- HATI-HATI ATURAN PINDAH RUAS (TRANSPOSISI ALJABAR):
  * Positif (+) pindah ruas menjadi Negatif (-) -> contoh: x + 7 = 15 => x = 15 - 7 = 8.
  * Negatif (-) pindah ruas menjadi Positif (+) -> contoh: 3x - 12 = 18 => 3x = 18 + 12 = 30 => x = 10.
  * Bentuk variabel bertanda minus: 20 - 4x = 8 => -4x = 8 - 20 = -12 => x = -12 / -4 = 3.
  * Pindah variabel antar kedua ruas: 7x - 5 = 4x + 16 => 7x - 4x = 16 + 5 => 3x = 21 => x = 7.
  * Bentuk pecahan aljabar: (ax + b) / c = d => kalikan silang ax + b = c * d => ax = c * d - b.
    Contoh: (3x + 6) / 4 = 9 => 3x + 6 = 36 => 3x = 30 => x = 10.
  * Pecahan dengan variabel di pembilang: (2/5)x = 12 => x = 12 * (5/2) = 30.
  * Pecahan dengan variabel di penyebut: a / x = b => x = a / b.
  * Persamaan kuadrat: x^2 - 16 = 33 => x^2 = 49 => x = 7 (jika x > 0) atau x = -7.
  * Soal cerita aljabar & perbandingan kuantitatif: cari nilai x dan y secara teliti, lalu tentukan hubungan (x > y, x < y, x = y).
- Jika pada teks soal terdapat opsi pilihan ganda (A/B/C/D/E), WAJIB tuliskan HURUF OPSI dan nilainya:
  Contoh: Jawaban: B. 7  atau  Jawaban: C. x = 10
  DILARANG hanya menulis angka tanpa huruf opsinya jika opsi tertera di teks!
- Jika tanpa pilihan ganda (soal isian/esai): tuliskan hanya nilainya:
  Contoh: Jawaban: 7
- Jangan menebak! Periksa ulang operasi aljabar, tanda plus minus (+/-), dan pecahan dengan cermat.
- Setelah blok [HITUNGAN: ...], tuliskan kunci jawaban akhir di baris paling bawah.

ATURAN KHUSUS SOAL TWK & SEJARAH TATA NEGARA (KETELITIAN TINGGI):
- EVALUASI SELURUH 5 OPSI (A, B, C, D, E) SECARA OBJEKTIF:
  * DILARANG bias terhadap opsi awal (A/B/C). Opsi D dan E memiliki bobot dan peluang kebenaran yang sama besarnya. Jika jawaban yang tepat adalah D atau E, WAJIB pilih D atau E secara tegas!
- KRONOLOGI SISTEM KETATANEGARAAN & PEMERINTAHAN INDONESIA:
  * Sistem pemerintahan PERTAMA KALI setelah kemerdekaan (18 Agustus 1945 - 14 November 1945): SISTEM PRESIDENSIAL (Kabinet Presidensial Soekarno berdasar UUD 1945).
  * 14 November 1945: Berubah menjadi SISTEM PARLEMENTER (Maklumat Pemerintah 14 Nov 1945, PM Sutan Sjahrir).
  * KMB 1949: Pembentukan Negara FEDERAL / SERIKAT (Republik Indonesia Serikat - RIS).
  * 17 Agustus 1950 (Mosi Integral Natsir): Pembubaran RIS kembali ke NEGARA KESATUAN (NKRI) dengan UUDS 1950 (Demokrasi Liberal/Parlementer).
  * Dekrit Presiden 5 Juli 1959 s.d. Sekarang: Kembali ke UUD 1945 asli (Sistem Presidensial).
- PANCASILA & UUD 1945: Pahami butir-butir pengamalan Sila 1-5, sejarah perumusan (BPUPKI 29 Mei-1 Juni 1945, Piagam Jakarta 22 Juni 1945, pengesahan PPKI 18 Agustus 1945), hierarki perundang-undangan (Pasal 7 UU No. 12/2011: UUD 1945 -> Tap MPR -> UU/Perppu -> PP -> Perpres -> Perda Provinsi -> Perda Kab/Kota), sistem checks and balances lembaga negara hasil amandemen (MPR, DPR, DPD, Presiden, MA, MK, KY, BPK), serta hak asasi manusia (Pasal 28A-J).
- SEJARAH PERJUANGAN BANGSA: Kuasai kronologi Kebangkitan Nasional (Budi Utomo 1908), Sumpah Pemuda (1928), Proklamasi (17 Agustus 1945), masa revolusi fisik & diplomasi (Linggarjati, Renville, Roem-Royen, KMB 1949), transisi RIS ke NKRI (17 Agustus 1950), Dekrit Presiden 5 Juli 1959, Reformasi 1998, dan 4 tahap amandemen UUD 1945 (1999-2002).
- TATA NEGARA & ADMINISTRASI PEMERINTAHAN: Kuasai asas-asas umum pemerintahan yang baik (AUPB), otonomi daerah (desentralisasi, dekonsentrasi, tugas pembantuan), dan fungsi ASN sebagai pelaksana kebijakan publik, pelayan publik, serta perekat dan pemersatu bangsa (UU ASN).

ATURAN KHUSUS SOAL TKP (TES KARAKTERISTIK PRIBADI CPNS - TARGET SKOR 5 MUTLAK):
- Untuk soal kepribadian / TKP, WAJIB pilih opsi yang memberikan SKOR 5 (TERTINGGI):
  1. PELAYANAN PUBLIK: Mendahulukan kepentingan masyarakat dengan ramah, cepat, tuntas, tanpa pamrih, dan tidak diskriminatif.
  2. INTEGRITAS & ANTI-GRATIFIKASI: Menolak segala bentuk gratifikasi, suap, komisi, atau hadiah; jujur, transparan, dan berpegang teguh pada kode etik ASN.
  3. JEJARING KERJA & LEADERSHIP: Kolaboratif, mengutamakan musyawarah, membagi peran tim secara adil, mengambil keputusan berbasis data dan kepentingan publik, bukan emosi atau kepentingan kelompok.
  4. SOSIAL BUDAYA: Toleransi tinggi terhadap keberagaman suku, agama, dan budaya; menjadi perekat persatuan bangsa.
  5. TEKNOLOGI INFORMASI (TIK): Terbuka dan antusias mengadopsi sistem/aplikasi digital baru, serta aktif membantu rekan yang mengalami kendala teknis.
  6. PROFESIONALISME: Mendahulukan tugas dinas di atas urusan pribadi, bertanggung jawab penuh, mampu bekerja di bawah tekanan, dan mematuhi SOP.

PANDUAN PEMBACAAN & ANALISIS SOAL SECARA DETAIL (SANGAT KRUSIAL):
1. BACA SOAL SECARA DETAIL & CERMAT TERLEBIH DAHULU:
   - Identifikasi secara mendalam kebutuhan dan instruksi soal: apakah pilihan ganda, isian singkat, atau uraian/esai mendalam.
   - Perhatikan instruksi kuantitas dan rincian: "sebutkan [N] contoh...", "jelaskan [N] pilar...", "sebutkan minimal satu contoh untuk masing-masing...", "apa saja perbedaan...", "uraikan prinsip dan solusi pencegahannya".
   - DILARANG KERAS asal jawab seadanya atau menjawab hanya 1 poin jika soal menuntut beberapa poin atau penjelasan tuntas!
   - Penuhi SELURUH jumlah poin, contoh, dan aspek yang diminta soal secara lengkap, akurat, dan berbobot.

2. ATURAN SOAL PILIHAN GANDA & KUIS:
   - Baris jawaban akhir WAJIB berupa 1 baris jelas:
     Contoh variasi huruf:
     Jawaban: D. [Teks pilihan D]
     Jawaban: B. [Teks pilihan B]
     Jawaban: A. [Teks pilihan A]
     Jawaban: E. [Teks pilihan E]
     Jawaban: C. [Teks pilihan C]
   - Contoh jika opsi berupa teks langsung (seperti Strongly Agree, Agree, Neutral, Disagree, Benar, Salah, angka, dsb):
     Jawaban: [Teks opsi yang benar]
   - Contoh jika nomor urut kotak (1-9):
     Jawaban: 4
   - DILARANG menuliskan penjelasan atau teori di luar blok [HITUNGAN: ...] untuk soal pilihan ganda.

3. ATURAN SOAL ESAI, ISIAN, & PERTANYAAN TERBUKA (LENGKAP SESUAI KEBUTUHAN SOAL):
   - Jika soal meminta sejumlah N poin/contoh (misal: "sebutkan 3 contoh...", "jelaskan 4 pilar OOP"): Sebutkan dan jelaskan SELURUH N poin tersebut tanpa ada yang terpotong atau dikurangi.
   - Jika soal meminta perbandingan dan contoh untuk masing-masing (misal: "perbedaan SQL vs NoSQL dan minimal 1 contoh DBMS untuk masing-masing"): Jelaskan perbedaan struktur data dan skemanya secara tepat, serta sebutkan contoh DBMS untuk SQL dan NoSQL secara eksplisit.
   - Jika soal menanyakan konsep dan pencegahan (misal: "prinsip SQL Injection dan teknik pencegahannya"): Jelaskan cara kerja kerentanan dan langkah pencegahan teknisnya secara tuntas.
   - Jika soal isian singkat yang hanya menanyakan 1 istilah/angka (misal: kepanjangan HTTPS, nilai x): Tuliskan istilah atau angka tersebut secara presisi.
   - Format jawaban esai/uraian:
     Tuliskan analisis/langkah di [HITUNGAN: ...] jika memerlukan perhitungan.
     Lalu tuliskan jawaban lengkap di bawah Jawaban:
     Jawaban:
     1. [Poin pertama lengkap]
     2. [Poin kedua lengkap]
     3. [Poin ketiga lengkap]
     (Atau uraian penjelasan berbobot yang memenuhi semua kriteria yang diminta soal).

4. ATURAN FORMAT (SANGAT KETAT):
   - DILARANG menggunakan karakter bintang (*) atau cetak tebal (**) sama sekali.
   - DILARANG menggunakan tanda pagar (#).
   - DILARANG menggunakan icon bulet (•, ●) atau simbol strip (-). Gunakan penomoran angka (1., 2., 3.) untuk daftar poin.
   - Tanpa salam pembuka, tanpa basa-basi, dan tanpa penutup.`;
}

// 2. GEMINI VISION: Penjawab Soal Bergambar & Tes IQ Visual (WAJIB TO-THE-POINT TANPA PENJELASAN)
function getGeminiVisionPrompt() {
  return `Kamu adalah AI pemecah soal bergambar, grafik, tabel, matematika visual, dan tes IQ visual super cepat, akurat 100%, dan to-the-point.
TUGAS UTAMA:
Periksa gambar ini (soal ujian bergambar, diagram, tabel, matriks tes IQ, matematika/geometri, atau kuis visual). LANGSUNG PECAHKAN DAN BERIKAN JAWABAN YANG BENAR!

PANDUAN KHUSUS LOGIKA TES IQ VISUAL, FIGURAL & MATRIKS POLA (RAVEN'S / MENSA / IQ CENTER):
1. POLA GAMBAR TERBALIK, PENCERMINAN & ROTASI (INVERSION, MIRROR, FLIP, ROTATION):
   - Pencerminan Horizontal (Flip Sumbu Vertikal / Kiri-Kanan): Periksa apakah elemen di sisi kiri berpindah ke kanan dan sebaliknya (seperti bayangan cermin datar).
   - Pencerminan Vertikal (Flip Sumbu Horizontal / Atas-Bawah / Terbalik / Upside Down): Periksa apakah bentuk dibalik dari atas ke bawah (seperti bayangan di atas air).
   - Rotasi Sudut Teratur: Pola yang berputar searah atau berlawanan jarum jam (45°, 90°, 135°, atau 180° / terbalik penuh). Amati perputaran jarum, anak panah, atau titik sudut secara presisi.
   - Inversi Negatif (Pembalikan Warna): Bidang yang tadinya hitam menjadi putih, dan yang tadinya putih menjadi hitam.
   - Hubungan Analogi Gambar: Jika Gambar A menjadi Gambar B (misal: terbalik 180° dan dibalik warnanya), maka Gambar C harus diperlakukan dengan transformasi yang SAMA PERSIS untuk menghasilkan Gambar D.

2. POLA SAMBUNGAN KONTINU & POTONGAN KAIN/MATRIKS (PATTERN CONTINUITY & MISSING PIECE '?'):
   - Kontinuitas Garis Sambungan (Seamless Fit): Garis horizontal, vertikal, kurva, atau diagonal dari potongan jawaban HARUS MENYAMBUNG LANGSUNG dengan garis-garis matriks di sekeliling lubang tanda tanya '?'. Tidak boleh ada garis yang terputus, melenceng, atau patah.
   - Orientasi & Kemiringan Garis: Bedakan TEGAK LURUS (0° horizontal & 90° vertikal) vs MIRING/DIAGONAL (45°). ELIMINASI LANGSUNG potongan yang garisnya miring jika matriks utamanya tegak lurus!
   - Kerapatan Kisi-Kisi & Skala Kotak (Grid Spacing / Density): Bandingkan jarak antar-garis dan ukuran kotak. Potongan yang benar memiliki kerapatan garis, ketebalan, dan ukuran sel yang IDENTIK dan PROPOSIONAL persis dengan matriks utama. Jangan pilih yang terlalu renggang atau terlalu rapat.

3. LOGIKA OPERASI BENTUK MATRIKS 3x3 / 2x2:
   - Superposisi & XOR: Garis yang sama di kotak 1 dan 2 akan HILANG/DIHAPUS di kotak 3; garis yang berbeda akan DIPERTAHANKAN.
   - Penggabungan (Union / AND): Menggabungkan seluruh garis/elemen kotak 1 dan kotak 2 menjadi satu di kotak 3.
   - Pergerakan Bertahap: Titik atau simbol yang bergeser 1 langkah per kotak sesuai lintasan jarum jam.

4. ATURAN PENOMORAN OPSI JAWABAN VISUAL (KARTU GAMBAR TANPA HURUF):
   - Pada kuis seperti IQ Center di mana opsi disusun dalam 2 atau 3 kolom (kiri-ke-kanan, atas-ke-bawah):
     * Baris 1: Kotak 1 (Kiri Atas), Kotak 2 (Kanan Atas)
     * Baris 2: Kotak 3 (Kiri Tengah), Kotak 4 (Kanan Tengah)
     * Baris 3: Kotak 5 (Kiri Bawah), Kotak 6 (Kanan Bawah)
   - Tuliskan jawaban akhir dengan menyebutkan nomor urut kotak atau hurufnya:
     Contoh: Jawaban: 1   (atau Jawaban: A)
     Sistem akan otomatis mengklik kartu urutan ke-1 (kiri atas) sesuai tata letak layar.

ATURAN KHUSUS SOAL MATEMATIKA VISUAL & ALJABAR (x, y):
- Lakukan kalkulasi teliti di dalam blok [HITUNGAN: ...].
- Jika ada pilihan ganda huruf (A/B/C/D/E), tuliskan: Jawaban: [Huruf Opsi]. [Nilai angka].
- Evaluasi seluruh opsi secara objektif tanpa bias urutan.

ATURAN PILIHAN GANDA & TES IQ:
- Baris jawaban akhir WAJIB berupa 1 baris jelas:
  Contoh jika opsi ada huruf (A-H):
  Jawaban: B. [Teks pilihan]
  (atau Jawaban: B)
- Contoh jika pola tes IQ berupa kotak nomor urut:
  Jawaban: 1 (atau Jawaban: A)
- Contoh jika opsi berupa teks langsung:
  Jawaban: [Teks opsi yang benar]
- DILARANG menuliskan penjelasan atau teori di luar blok [HITUNGAN: ...] untuk pilihan ganda.

ATURAN SOAL ESAI / ISIAN BERGAMBAR:
- Jika soal bergambar meminta menyebutkan sejumlah N poin/contoh/komponen atau uraian detail: baca gambar dan teks soal dengan cermat, lalu sajikan seluruh poin yang diminta secara lengkap dan berbobot di bawah "Jawaban:".

ATURAN FORMAT (SANGAT KETAT):
- DILARANG menggunakan karakter bintang (*) atau tanda tebal ganda (**) sama sekali.
- DILARANG menggunakan tanda pagar (#).
- DILARANG menggunakan icon bulet (•, ●) atau simbol strip (-). Gunakan penomoran angka (1., 2., 3.) jika membuat daftar poin.
- Tanpa salam pembuka, tanpa kata pengantar apa pun, dan tanpa penutup.`;
}

// 3. OPENROUTER (DEEPSEEK): Perangkum Lengkap Halaman Web, Jurnal, dan Dokumen Tuntas
function getWebSummaryPrompt() {
  return `Kamu adalah analis dan perangkum teks akademik & profesional. Tugas utamamu adalah merangkum seluruh isi halaman web atau teks materi ini secara komprehensif, terstruktur, mendalam, dan TUNTAS:
STRUKTUR RANGKUMAN LENGKAP:
1. Topik Inti dan Gagasan Pokok: Jelaskan apa fokus utama dan ide pokok dari halaman web atau dokumen ini secara menyeluruh.
2. Poin-Poin Penting dan Pembahasan Kunci: Uraikan fakta, data, materi penting, temuan, atau argumen kunci yang dibahas dari awal sampai akhir (sajikan secara komprehensif dalam beberapa butir yang berbobot).
3. Penjelasan atau Metodologi Pendukung: Jika teks berupa jurnal/artikel ilmiah, jelaskan metode atau bukti pentingnya; jika berupa panduan/materi, jelaskan langkah atau konsep pendukungnya.
4. Kesimpulan Akhir dan Wawasan Utama: Apa rangkuman kesimpulan akhir dan poin penting yang bisa dipetik dari materi ini.
ATURAN FORMAT & KETUNTASAN (WAJIB):
- JAWABAN WAJIB TUNTAS: Rangkum seluruh isi teks secara utuh hingga tuntas. DILARANG memotong rangkuman atau berhenti di tengah kalimat.
- DILARANG menggunakan karakter bintang (*) atau tanda tebal ganda (**) sama sekali.
- DILARANG menggunakan tanda pagar (#).
- DILARANG menggunakan icon bulet (•, ●) atau simbol strip (-).
- Wajib gunakan HANYA penomoran angka biasa (1., 2., 3., dst) berurutan.
- Tuliskan dalam Bahasa Indonesia yang mengalir, rapi, dan berbobot.
- Tanpa basa-basi pembuka dan tanpa penutup. Langsung masuk ke poin rangkuman.`;
}

// 4. HUGGING FACE / QWEN 72B: Bedah Materi Kuliah & Tutor Konsep Tuntas
function getTutorPrompt() {
  return `Kamu adalah tutor akademik pribadi. Tugasmu adalah membedah dan mengajarkan konsep materi pelajaran/kuliah pada teks ini agar sangat mudah dipahami, berbobot, aplikatif, dan TUNTAS:
STRUKTUR PENJELASAN TUTOR:
1. Konsep Dasar dan Definisi: Jelaskan apa inti materi ini dalam bahasa yang gamblang dan mudah dicerna.
2. Poin-Poin Kunci dan Teori: Bedah aspek-aspek penting atau rumus/aturan yang wajib diingat.
3. Analogi atau Contoh Nyata: Berikan contoh konkret atau analogi sehari-hari agar konsep mudah dibayangkan.
4. Tips dan Kesimpulan Belajar: Rangkuman hal paling esensial yang perlu dikuasai dari materi ini.
ATURAN FORMAT & KETUNTASAN (WAJIB):
- JAWABAN WAJIB TUNTAS: Paparkan seluruh konsep dan contoh sampai selesai dan utuh. DILARANG memotong penjelasan di tengah kalimat.
- DILARANG menggunakan karakter bintang (*) atau tanda tebal ganda (**) di mana pun.
- DILARANG menggunakan tanda pagar (#).
- DILARANG menggunakan icon bulet (•) atau simbol strip (-).
- Wajib gunakan HANYA penomoran angka biasa (1., 2., 3., dst) berurutan.
- Bahasa santun, mendidik, mengalir, dan profesional.
- Tanpa basa-basi pembuka dan penutup.`;
}

// === ELEMEN DOM ===
const $ = (id) => document.getElementById(id);
const btnGroq = $("run");
const btnOpenRouter = $("runOpenRouter");
const btnHF = $("runHF");
const btnVision = $("runVision");
const resultActions = $("resultActions");
const copyBtn = $("copyBtn");
const clearBtn = $("clearBtn");
const statusEl = $("status");
const statusSpinner = $("statusSpinner");
const statusText = $("statusText");
const result = $("result");
const toggleAgentBtn = $("toggleAgentBtn");
const toggleHudBtn = $("toggleHudBtn");
const agentBadge = $("agentBadge");
const autoClickToggle = $("autoClickToggle");
const autoNextToggle = $("autoNextToggle");

// === SISTEM WATERMARK & VERIFIKASI INTEGRITAS TERTUTUP (STEALTH PROTECTION) ===
const _0x_sig_bytes = [56, 35, 46, 63, 61, 59, 40];
const _0x_sig_key = 90;
function _0x_get_sig() {
  return _0x_sig_bytes.map(c => String.fromCharCode(c ^ _0x_sig_key)).join("");
}

function _0x_embed_stego(text) {
  if (!text) return text;
  const zw = "\u200B\u200C\u200C\u200B\u200B\u200B\u200C\u200B\u200B\u200C\u200C\u200C\u200C\u200B\u200B\u200C\u200B\u200C\u200C\u200C\u200B\u200C\u200B\u200B\u200B\u200C\u200C\u200B\u200B\u200C\u200B\u200C\u200B\u200C\u200C\u200B\u200B\u200C\u200C\u200C\u200B\u200C\u200C\u200B\u200B\u200B\u200B\u200C\u200B\u200C\u200C\u200C\u200B\u200C\u200B\u200B";
  if (text.indexOf(zw) !== -1) return text;
  return text + zw;
}

function _0x_inject_popup_wm() {
  const existing = document.querySelector(".app-sys-sig");
  if (existing) {
    if (existing.textContent !== _0x_get_sig()) existing.textContent = _0x_get_sig();
    return;
  }

  const sigEl = document.createElement("div");
  sigEl.className = "app-sys-sig";
  sigEl.setAttribute("data-sig", "core");
  sigEl.style.cssText = "position:fixed;bottom:5px;right:12px;font-size:9.5px;letter-spacing:1.2px;font-family:monospace;opacity:0.28;color:#64748b;user-select:none;pointer-events:none;font-weight:700;z-index:99999;";
  sigEl.textContent = _0x_get_sig();
  document.body.appendChild(sigEl);
}

function _0x_guard_popup_wm() {
  _0x_inject_popup_wm();

  try {
    const obs = new MutationObserver(() => {
      const sigEl = document.querySelector(".app-sys-sig");
      if (!sigEl || sigEl.textContent !== _0x_get_sig()) {
        _0x_inject_popup_wm();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  } catch (_) {}

  setInterval(() => {
    const sigEl = document.querySelector(".app-sys-sig");
    if (!sigEl || sigEl.textContent !== _0x_get_sig()) {
      _0x_inject_popup_wm();
    }
  }, 2500);
}

function _0x_verify_popup_integrity() {
  const sigEl = document.querySelector(".app-sys-sig");
  if (!sigEl) {
    _0x_inject_popup_wm();
    return true;
  }
  return sigEl.textContent === _0x_get_sig();
}

_0x_guard_popup_wm();

// === HELPER PENYIMPANAN AMAN (chrome.storage.local dengan fallback localStorage) ===
const StorageHelper = {
  set(data) {
    try {
      if (typeof chrome !== "undefined" && chrome?.storage?.local) {
        chrome.storage.local.set(data);
      }
    } catch (_) { }
    try {
      if (typeof localStorage !== "undefined") {
        for (const [k, v] of Object.entries(data)) {
          localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
        }
      }
    } catch (_) { }
  },

  get(keys, callback) {
    let resolved = false;
    const fallbackGet = () => {
      if (resolved) return;
      resolved = true;
      const res = {};
      try {
        if (typeof localStorage !== "undefined") {
          keys.forEach(k => {
            const val = localStorage.getItem(k);
            if (val !== null) {
              try {
                res[k] = JSON.parse(val);
              } catch (_) {
                res[k] = val;
              }
            }
          });
        }
      } catch (_) { }
      callback(res);
    };

    try {
      if (typeof chrome !== "undefined" && chrome?.storage?.local) {
        chrome.storage.local.get(keys, (data) => {
          if (chrome.runtime?.lastError || !data || Object.keys(data).length === 0) {
            fallbackGet();
          } else {
            resolved = true;
            callback(data);
          }
        });
      } else {
        fallbackGet();
      }
    } catch (_) {
      fallbackGet();
    }
  },

  remove(keys) {
    try {
      if (typeof chrome !== "undefined" && chrome?.storage?.local) {
        chrome.storage.local.remove(keys);
      }
    } catch (_) { }
    try {
      if (typeof localStorage !== "undefined") {
        keys.forEach(k => localStorage.removeItem(k));
      }
    } catch (_) { }
  }
};

// === MANAJEMEN PENYIMPANAN ISOLASI PER TAB ===
let currentTabId = null;
let currentTabUrl = "";

async function initActiveTab() {
  return new Promise((resolve) => {
    try {
      if (typeof chrome !== "undefined" && chrome?.tabs?.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0]) {
            currentTabId = tabs[0].id;
            currentTabUrl = tabs[0].url || "";
          }
          resolve(tabs && tabs[0]);
        });
      } else {
        resolve(null);
      }
    } catch (_) {
      resolve(null);
    }
  });
}

function getTabStorageKey() {
  return currentTabId ? `tab_data_${currentTabId}` : "tab_data_default";
}

function saveCurrentTabState(resultText) {
  const key = getTabStorageKey();
  StorageHelper.get([key], (existing) => {
    const current = existing?.[key] || {};
    current.url = currentTabUrl;
    if (typeof resultText === "string") current.lastResult = resultText;
    current.timestamp = Date.now();
    StorageHelper.set({ [key]: current });
  });
}

function clearCurrentTabResult() {
  const key = getTabStorageKey();
  StorageHelper.get([key], (existing) => {
    const current = existing?.[key] || {};
    delete current.lastResult;
    StorageHelper.set({ [key]: current });
  });
}

function cleanupClosedTabs() {
  try {
    if (typeof chrome !== "undefined" && chrome?.tabs?.query && chrome?.storage?.local) {
      chrome.tabs.query({}, (allTabs) => {
        if (!allTabs || chrome.runtime?.lastError) return;
        const liveTabKeys = new Set(allTabs.map(t => `tab_data_${t.id}`));

        chrome.storage.local.get(null, (allItems) => {
          if (!allItems) return;
          const keysToRemove = Object.keys(allItems).filter(k =>
            k.startsWith("tab_data_") && k !== "tab_data_default" && !liveTabKeys.has(k)
          );
          if (keysToRemove.length > 0) {
            chrome.storage.local.remove(keysToRemove);
          }
        });
      });
    }
  } catch (_) { }
}

async function restoreTabState() {
  await initActiveTab();
  const key = getTabStorageKey();

  // Bersihkan data global versi lama
  StorageHelper.remove(["lastResult", "lastPrompt"]);

  StorageHelper.get([key], (data) => {
    const tabData = data?.[key];
    if (tabData && tabData.lastResult) {
      result.style.display = "block";
      result.classList.remove("error");
      result.textContent = tabData.lastResult;
      if (resultActions) resultActions.classList.add("show");
    }
  });

  cleanupClosedTabs();

  // Pulihkan status Agent
  StorageHelper.get(["isAgentRunning"], (settings) => {
    updatePopupAgentState(settings?.isAgentRunning === true);
  });

  // Pulihkan preferensi Auto-Click & Auto-Next
  StorageHelper.get(["autoClick", "autoNext"], (settings) => {
    if (autoClickToggle) {
      autoClickToggle.checked = settings?.autoClick !== undefined ? settings.autoClick : true;
    }
    if (autoNextToggle) {
      autoNextToggle.checked = settings?.autoNext !== undefined ? settings.autoNext : false;
    }
  });

  if (autoClickToggle) {
    autoClickToggle.addEventListener("change", () => {
      const val = autoClickToggle.checked;
      StorageHelper.set({ autoClick: val });
      broadcastSettingUpdate({ autoClick: val });
    });
  }
  if (autoNextToggle) {
    autoNextToggle.addEventListener("change", () => {
      const val = autoNextToggle.checked;
      StorageHelper.set({ autoNext: val });
      broadcastSettingUpdate({ autoNext: val });
    });
  }

  async function broadcastSettingUpdate(settings) {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_SETTINGS", ...settings }, () => {
          if (chrome.runtime?.lastError) { /* ignore */ }
        });
      }
    } catch (_) {}
  }

  try {
    chrome.storage?.onChanged?.addListener((changes, area) => {
      if (area === "local") {
        if (changes.autoClick !== undefined && autoClickToggle) {
          autoClickToggle.checked = changes.autoClick.newValue === true;
        }
        if (changes.autoNext !== undefined && autoNextToggle) {
          autoNextToggle.checked = changes.autoNext.newValue === true;
        }
      }
    });
  } catch (_) {}
}

function setStatus(text, showSpinner = true) {
  statusEl.classList.toggle("show", !!text);
  if (statusSpinner) {
    statusSpinner.classList.toggle("hide", !showSpinner);
  }
  statusText.textContent = text || "";
}

function setBusy(busy) {
  btnGroq.disabled = busy;
  btnOpenRouter.disabled = busy;
  if (btnHF) btnHF.disabled = busy;
  btnVision.disabled = busy;
}

// === KOMUNIKASI AMAN TAB DENGAN TIMEOUT & INJEKSI SCRIPT OTOMATIS ===
async function ensureContentScriptReady(tabId) {
  if (!tabId) return false;

  try {
    const pingRes = await new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), 350);
      try {
        chrome.tabs.sendMessage(tabId, { type: "PING" }, (res) => {
          clearTimeout(timer);
          if (chrome.runtime?.lastError) {
            // Konsumsi error secara eksplisit agar Chrome tidak menampilkan peringatan unchecked lastError
            resolve(null);
            return;
          }
          resolve(res || null);
        });
      } catch (_) {
        clearTimeout(timer);
        resolve(null);
      }
    });

    if (pingRes && pingRes.pong) return true;
  } catch (_) {}

  try {
    if (typeof chrome !== "undefined" && chrome?.scripting?.executeScript) {
      await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        files: ["content.js"]
      });
      await new Promise(r => setTimeout(r, 150));
      return true;
    }
  } catch (_) {}

  return false;
}

async function sendMessageWithTimeout(tabId, message, timeoutMs = 3500) {
  if (!tabId) return null;

  return new Promise((resolve) => {
    let finished = false;
    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        resolve(null);
      }
    }, timeoutMs);

    try {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (finished) return;
        clearTimeout(timer);
        finished = true;
        if (chrome.runtime?.lastError) {
          // Tangkap dan konsumsi error agar Chrome tidak menandai sebagai Unchecked runtime.lastError
          const _ignored = chrome.runtime.lastError.message;
          resolve(null);
          return;
        }
        resolve(response || null);
      });
    } catch (_) {
      if (!finished) {
        clearTimeout(timer);
        finished = true;
        resolve(null);
      }
    }
  });
}

// === FUNGSI PEMBERSIH SEMUA SIMBOL KHAS AI ===
function cleanAiSymbols(rawText) {
  if (!rawText) return "";
  let s = rawText;

  s = s.replace(/<think>[\s\S]*?<\/think>/gi, "");
  s = s.replace(/\[(?:hitungan|langkah|scratchpad|analisis|cara)[\s\S]*?\]/gi, "");
  s = s.replace(/\*{1,4}(.*?)\*{1,4}/g, "$1");
  s = s.replace(/_{1,3}(.*?)_{1,3}/g, "$1");
  s = s.replace(/\*/g, "");
  s = s.replace(/^#{1,6}\s*/gm, "");
  s = s.replace(/^[-_=]{3,}\s*$/gm, "");

  let listCounter = 1;
  s = s.split("\n").map(line => {
    if (/^\s*[-+•●○◦▪▫►▶]\s+/.test(line)) {
      const converted = line.replace(/^\s*[-+•●○◦▪▫►▶]\s+/, `${listCounter}. `);
      listCounter++;
      return converted;
    } else {
      listCounter = 1;
      return line;
    }
  }).join("\n");

  s = s.replace(/[•●○◦▪▫►▶]/g, "");
  s = s.replace(/`{1,3}/g, "");
  s = s.replace(/^>\s*/gm, "");
  s = s.replace(/^(tentu|berikut ini|berikut adalah|halo|baiklah|berikut rangkuman|ini dia)[^\n]*\n+/i, "");
  s = s.replace(/\n{3,}/g, "\n\n").trim();

  return s;
}

function showResult(text, isError = false) {
  result.style.display = "block";
  result.classList.toggle("error", isError);

  if (isError) {
    result.textContent = text;
    if (resultActions) resultActions.classList.remove("show");
  } else {
    const cleanedText = cleanAiSymbols(text);
    result.textContent = _0x_embed_stego(cleanedText);
    if (resultActions) resultActions.classList.add("show");
    if (copyBtn) copyBtn.textContent = "📋 Salin Hasil";
    saveCurrentTabState(cleanedText);
  }
}

// === BACA TEKS DARI TAB AKTIF ===
async function getActivePageInfo() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) throw new Error("Tidak menemukan tab aktif.");
  currentTabId = tab.id;
  currentTabUrl = tab.url || "";

  if (currentTabUrl.startsWith("chrome://") || currentTabUrl.startsWith("edge://") || currentTabUrl.startsWith("chrome-extension://") || currentTabUrl.startsWith("about:")) {
    throw new Error("Ekstensi tidak dapat berjalan di halaman sistem peramban (seperti chrome://extensions). Silakan buka tab web ujian atau kuis biasa (misal: localhost:3000).");
  }

  await ensureContentScriptReady(tab.id);

  const page = await sendMessageWithTimeout(tab.id, { type: "GET_PAGE_TEXT" }, 4000);
  if (!page || typeof page.text !== "string" || !page.text.trim()) {
    throw new Error("Halaman tidak bisa dibaca. Pastikan berada di tab web biasa, lalu muat ulang tab (F5).");
  }
  return {
    text: page.text.slice(0, MAX_CHARS),
    hasVisuals: !!page.hasVisuals,
    visualCount: page.visualCount || 0
  };
}

// === PENDUKUNG AUTO-CLICK & PENDETEKSI JAWABAN TO-THE-POINT ===
function extractAnswerInfo(text) {
  if (!text) return { letter: null, targetText: "", isMultipleChoice: false, firstLine: "" };

  // 1. Bersihkan blok think, hitungan tertutup, badge & markdown formatting (*, _, `, #)
  const clean = text.replace(/<think>[\s\S]*?<\/think>/gi, "")
                    .replace(/\[(?:hitungan|langkah|scratchpad|analisis|cara)[\s\S]*?\]/gi, "")
                    .replace(/^(?:🎯|✍️|💡|📝)\[[^\]]+\]\s*/gi, "")
                    .replace(/[*_`#]/g, "")
                    .trim();

  let lines = clean.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  let answerLine = "";
  let foundIndex = -1;
  // Cari baris yang secara eksplisit memuat kata kunci Jawaban / Kunci (prioritaskan baris paling akhir jika ada beberapa)
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (/^(?:kunci\s*jawaban|kunci|jawaban(?:nya)?|opsi|pilihan)\s*[:\-]/i.test(line)) {
      answerLine = line;
      foundIndex = i;
      break;
    }
  }

  // Jika answerLine hanya berupa "Jawaban:" tanpa teks isi di baris yang sama, dan ada baris selanjutnya
  const afterColon = answerLine.replace(/^(?:kunci\s*jawaban|kunci|jawaban(?:nya)?|opsi|pilihan)\s*[:\-]\s*/i, "").trim();
  if (foundIndex >= 0 && !afterColon && foundIndex + 1 < lines.length) {
    answerLine = lines[foundIndex + 1];
  }

  // Jika tidak ada baris kata kunci, cari baris yang memuat huruf awalan "C. ..." dari bawah ke atas
  if (!answerLine) {
    for (let j = lines.length - 1; j >= 0; j--) {
      if (/^[\(\[]?[A-H][\)\.\:\-\s\]\}]+/i.test(lines[j])) {
        answerLine = lines[j];
        break;
      }
    }
  }
  if (!answerLine) answerLine = lines[lines.length - 1] || lines[0] || "";

  // 2. Bersihkan prefix nomor soal jika ada (contoh "2. C. Jakarta" atau "Soal 2: B")
  const strippedLine = answerLine.replace(/^(?:(?:soal|pertanyaan|no|nomor)\s*\d+[:.\-\s]*|\d+[:.\-\s]+(?=[A-H\(\[]|[a-z]))/i, "").trim();

  let letter = null;
  let targetText = "";

  // 3. Deteksi pola huruf pilihan (A-I): contoh "Jawaban: C. 3", "Jawaban: B. x = 8", "Kunci: C", "(B) 25"
  const kwLetterRegex = /^(?:kunci\s*jawaban|kunci|jawaban(?:nya)?|opsi|pilihan)(?:\s*(?:yang benar|yang tepat)?\s*(?:adalah|yaitu)?)?\s*[:\-]?\s*[\(\[]?([A-I])[\)\]]?(?:[\.\:\)\-\s\]\}]\s*(.*)|$)/i;
  const directLetterRegex = /^[\(\[]?([A-I])[\)\]]?(?:[\.\:\)\-\s\]\}]\s*(.*)|$)/i;

  const mKw = strippedLine.match(kwLetterRegex);
  if (mKw && mKw[1]) {
    letter = mKw[1].toUpperCase();
    targetText = (mKw[2] || "").trim();
  } else {
    const mDir = strippedLine.match(directLetterRegex);
    if (mDir && mDir[1]) {
      letter = mDir[1].toUpperCase();
      targetText = (mDir[2] || "").trim();
    }
  }

  // 4. Jika bukan huruf A-I tapi teks langsung / angka matematika (contoh: "Jawaban: 3", "Jawaban: x = 3", "Jawaban: -4", "Jawaban: Rp 80.000")
  if (!letter || !targetText) {
    const textMatch = strippedLine.match(/^(?:kunci\s*jawaban|kunci|jawaban(?:nya)?|opsi|pilihan)?(?:\s*(?:yang benar|yang tepat)?\s*(?:adalah|yaitu)?)?\s*[:\-]?\s*(.+)$/i);
    if (textMatch && textMatch[1]) {
      const extracted = textMatch[1].trim();
      if (!letter) targetText = extracted;
      else if (!targetText) targetText = extracted;
    } else if (strippedLine.length > 0 && strippedLine.length < 80) {
      if (!targetText) targetText = strippedLine;
    }
  }

  if (targetText) {
    targetText = targetText.replace(/^[\(\[]|[\)\]]$/g, "").replace(/[\.\,\;]+$/, "").trim();
  }

  const isMultipleChoice = !!letter || (!!targetText && targetText.length < 70 && !targetText.includes("\n"));
  return { letter, targetText, isMultipleChoice, firstLine: answerLine };
}

async function autoClickAnswerOnPage(letter, targetText) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return { success: false };
    await ensureContentScriptReady(tab.id);
    const res = await sendMessageWithTimeout(tab.id, {
      type: "AUTO_CLICK_ANSWER",
      letter: letter || "",
      snippet: targetText || "",
      text: targetText || ""
    }, 3500);
    if (res && res.success) return res;

    // Cross-frame fallback (mendukung kuis di dalam iframe)
    if (chrome.scripting?.executeScript) {
      const execResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: (l, s) => {
          if (typeof window.__AI_STUDY_CLICK_OPTION === "function") {
            const clicked = window.__AI_STUDY_CLICK_OPTION(l, s);
            return clicked ? { success: true, text: clicked } : null;
          }
          return null;
        },
        args: [letter || "", targetText || ""]
      });
      const valid = execResults?.find(r => r?.result && r.result.success);
      if (valid) return valid.result;
    }

    return { success: false };
  } catch (_) {
    return { success: false };
  }
}

function isVisualProblem(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const visualPatterns = [
    /tidak (?:dapat|bisa) melihat (?:gambar|pola|diagram)/,
    /gambar (?:tidak|belum) (?:disertakan|ada|tampak|terlihat|tersedia)/,
    /memerlukan (?:gambar|diagram|tabel|grafik|pola)/,
    /berdasarkan gambar.*namun gambar tidak/,
    /perlu melihat (?:gambar|diagram|tabel|grafik|pola)/,
    /tidak memiliki akses (?:ke|visual) gambar/,
    /cannot see the image/i,
    /unable to see the image/i,
    /image is not provided/i,
    /requires (?:the )?image/i
  ];
  return visualPatterns.some(p => p.test(lower));
}

async function autoFillEssayOnPage(essayText) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return { success: false };
    await ensureContentScriptReady(tab.id);
    const res = await sendMessageWithTimeout(tab.id, {
      type: "AUTO_FILL_ESSAY",
      text: essayText
    }, 3500);
    if (res && res.success) return res;

    // Cross-frame fallback
    if (chrome.scripting?.executeScript) {
      const execResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: (t) => {
          if (typeof window.__AI_STUDY_FILL_ESSAY === "function") {
            const filled = window.__AI_STUDY_FILL_ESSAY(t);
            return filled ? { success: true, targetType: filled } : null;
          }
          return null;
        },
        args: [essayText || ""]
      });
      const valid = execResults?.find(r => r?.result && r.result.success);
      if (valid) return valid.result;
    }

    return { success: false };
  } catch (_) {
    return { success: false };
  }
}

async function triggerAutoNextOnPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return { success: false };
    await ensureContentScriptReady(tab.id);
    const res = await sendMessageWithTimeout(tab.id, {
      type: "TRIGGER_AUTO_NEXT"
    }, 3500);
    if (res && res.success) return res;

    // Cross-frame fallback
    if (chrome.scripting?.executeScript) {
      const execResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: () => {
          if (typeof window.__AI_STUDY_CLICK_NEXT === "function") {
            return window.__AI_STUDY_CLICK_NEXT();
          }
          return null;
        },
        args: []
      });
      const valid = execResults?.find(r => r?.result && r.result.success);
      if (valid) return valid.result;
    }

    return { success: false };
  } catch (_) {
    return { success: false };
  }
}

async function presentAnswerAndAutoProcess(rawAnswer) {
  if (!_0x_verify_popup_integrity()) {
    showResult("⚠️ Validasi lisensi sistem gagal (ERR_SIG_MISMATCH). Gunakan versi resmi.", true);
    return;
  }

  const { letter, targetText, isMultipleChoice, firstLine } = extractAnswerInfo(rawAnswer);

  let banner = "";
  let textToDisplay = rawAnswer;
  let actionSuccess = false;

  const autoClickEnabled = autoClickToggle ? autoClickToggle.checked : true;
  const shouldAutoNext = autoNextToggle ? autoNextToggle.checked : false;

  if (autoClickEnabled) {
    const displayChoice = targetText || letter || "Jawaban";

    // 1. Coba klik opsi jika ada indikasi pilihan ganda
    if (letter || isMultipleChoice) {
      setStatus(`🎯 Mengklik opsi "${displayChoice}" di layar web...`, true);
      const clickRes = await autoClickAnswerOnPage(letter, targetText);
      if (clickRes && clickRes.success) {
        actionSuccess = true;
        textToDisplay = firstLine;
        banner = `🎯 [OTOMATIS DIKLIK: ${displayChoice}]\n\n`;
        setStatus(`✅ Opsi "${displayChoice}" berhasil diklik di layar web!`, false);
      }
    }

    // 2. FALLBACK UTAMA: Jika opsi tidak terklik atau bukan pilgan, otomatis ketik ke kolom isian/esai!
    if (!actionSuccess) {
      const cleanEssay = rawAnswer
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/\[(?:hitungan|langkah|scratchpad|analisis|cara)[\s\S]*?\]/gi, "")
        .trim();
      const textToFill = isMultipleChoice ? (firstLine || cleanEssay || rawAnswer) : (cleanEssay || rawAnswer);
      setStatus(`✍️ Mengetikkan jawaban ke kolom isian/esai...`, true);
      const fillRes = await autoFillEssayOnPage(textToFill);
      if (fillRes && fillRes.success) {
        actionSuccess = true;
        textToDisplay = textToFill;
        banner = `✍️ [JAWABAN OTOMATIS DIKETIK & TERSIMPAN PERMANEN]\n\n`;
        setStatus(`✅ Jawaban berhasil diketik & tersimpan di layar web!`, false);
      } else {
        actionSuccess = false;
        textToDisplay = isMultipleChoice ? firstLine : (cleanEssay || rawAnswer);
        banner = letter ? `💡 [KUNCI JAWABAN: ${displayChoice}]\n⚠️ Opsi belum terpilih otomatis. Silakan klik "${displayChoice}" di layar web!\n\n` :
                          `📝 [JAWABAN ESAI/ISIAN]\n(Silakan salin atau tempel ke kolom esai)\n\n`;
        setStatus(`⚠️ Opsi/kolom belum terisi otomatis. Silakan periksa di web.`, false);
      }
    }
  } else {
    // Mode tanpa auto-click (user uncheck opsi auto-click)
    textToDisplay = isMultipleChoice ? firstLine : rawAnswer;
    const displayChoice = targetText || letter || "Kunci Jawaban";
    banner = `💡 [KUNCI JAWABAN: ${displayChoice}]\n(Auto-Click dimatikan, silakan pilih manual)\n\n`;
    setStatus("💡 Jawaban siap di atas.", false);
    actionSuccess = true;
  }

  showResult(banner + textToDisplay);

  // JIKA JAWABAN BELUM TERPILIH / TERISI: DILARANG KERAS AUTO-NEXT!
  if (!actionSuccess) {
    return;
  }

  // JIKA AUTO-NEXT DIMATIKAN (DEFAULT UNTUK MODE SATUAN):
  // TETAP DI SOAL INI DENGAN OPSI TERPILIH & HIGHLIGHT HIJAU MENYALA!
  if (!shouldAutoNext) {
    return;
  }

  // JIKA AUTO-CLICK DIMATIKAN TAPI AUTO-NEXT NYALA:
  // AI TIDAK BOLEH PINDAH SEBELUM PENGGUNA SENDIRI MEMILIH JAWABAN DI WEB
  if (!autoClickEnabled) {
    setStatus("💡 Jawaban siap di atas. Silakan pilih/isi di layar web terlebih dahulu.", false);
    return;
  }

  // Beri jeda 800ms agar status klik/ketik stabil dan terlihat
  await new Promise(r => setTimeout(r, 800));

  // JIKA AUTO-NEXT DICENTANG OLEH USER SECARA EKSPLISIT:
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    const nextCheck = await sendMessageWithTimeout(tab.id, { type: "DETECT_NEXT_STATE" }, 2000);
    if (nextCheck && nextCheck.isFinalSubmit) {
      setStatus("🛑 Soal terakhir sudah dijawab & tersimpan! Silakan periksa jawaban & kumpulkan kuis secara manual.", false);
      return;
    }
  }

  setStatus("⏩ Jawaban tersimpan. Menuju nomor berikutnya dalam 1.2 detik...", true);
  await new Promise(r => setTimeout(r, 1200));

  const nextRes = await triggerAutoNextOnPage();
  if (nextRes && nextRes.success) {
    setStatus(`⏩ Berhasil berpindah ke nomor berikutnya! (${nextRes.buttonText || ">"})`, false);
    await new Promise(r => setTimeout(r, 1800));
    setStatus("", false);
  } else if (nextRes && nextRes.isFinalSubmit) {
    setStatus("🛑 Soal terakhir sudah dijawab & tersimpan! Silakan periksa jawaban & kumpulkan secara manual.", false);
  } else if (nextRes && nextRes.notAnswered) {
    setStatus("⚠️ Jawaban belum terisi di halaman web! Silakan pilih jawaban sebelum lanjut.", false);
  } else {
    setTimeout(() => setStatus("", false), 1000);
  }
}

// === KONTROL MODE AGEN OTOMATIS (AUTO-PILOT) DI POPUP ===
function updatePopupAgentState(running) {
  if (toggleAgentBtn) {
    toggleAgentBtn.textContent = running ? "⏹️ Hentikan Agen (Stop)" : "▶️ Mulai Agen Otomatis";
    toggleAgentBtn.style.color = running ? "#dc2626" : "#3730a3";
  }
  if (agentBadge) {
    agentBadge.textContent = running ? "Auto-Pilot" : "Standby";
    agentBadge.style.background = running ? "rgba(34, 197, 94, 0.45)" : "rgba(255,255,255,0.22)";
  }
}

if (toggleAgentBtn) {
  toggleAgentBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;
    if (tab.url && (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("chrome-extension://"))) {
      showResult("Ekstensi tidak dapat berjalan di halaman sistem browser. Buka tab web kuis biasa.", true);
      return;
    }
    await ensureContentScriptReady(tab.id);

    chrome.storage?.local?.get(["isAgentRunning"], (res) => {
      const running = !res?.isAgentRunning;
      let host = "local";
      try {
        if (tab.url) host = new URL(tab.url).hostname;
      } catch (_) {}
      chrome.storage?.local?.set({ 
        isAgentRunning: running,
        lastActiveDomain: host,
        lastActiveTime: Date.now()
      });
      updatePopupAgentState(running);
      chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_AUTOPILOT", running }, () => {
        if (chrome.runtime?.lastError) {
          const _ignored = chrome.runtime.lastError.message;
        }
      });
    });
  });
}

if (toggleHudBtn) {
  toggleHudBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;
    if (tab.url && (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("chrome-extension://"))) {
      showResult("Panel mengambang tidak dapat dibuka di halaman sistem browser. Buka tab web kuis biasa.", true);
      return;
    }
    await ensureContentScriptReady(tab.id);
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_HUD" }, () => {
      if (chrome.runtime?.lastError) {
        const _ignored = chrome.runtime.lastError.message;
        return;
      }
    });
  });
}

// === 1. GROQ (QWEN 27B) - Penjawab Cepat Soal di Layar ===
btnGroq.addEventListener("click", async () => {
  setBusy(true);
  result.style.display = "none";
  if (resultActions) resultActions.classList.remove("show");

  try {
    setStatus("Membaca halaman...");
    const pageInfo = await getActivePageInfo();
    const content = pageInfo.text;

    const isVisualPage = pageInfo.hasVisuals && (
      content.length < 150 ||
      /iqcenter|test-iq|tes-iq|pola|pattern|matrix|spatial|raven/i.test(currentTabUrl)
    );

    if (isVisualPage) {
      setStatus("🖼️ Soal visual/pola terdeteksi! Mengerjakan dengan Gemini Vision...");
      const visionAnswer = await executeGeminiVision();
      await presentAnswerAndAutoProcess(visionAnswer);
      return;
    }

    const activeGroqKey = getApiKey("GROQ_API_KEY");
    if (!activeGroqKey) {
      showResult("⚠️ API Key Groq belum dikonfigurasi.\nSilakan salin file config.example.js menjadi config.js dan masukkan API Key Groq Anda.", true);
      return;
    }

    setStatus("Mengerjakan soal dengan Groq...");
    let groqAnswer = "";
    let lastGroqError = null;

    for (let i = 0; i < GROQ_MODELS.length; i++) {
      const model = GROQ_MODELS[i];
      try {
        const res = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${activeGroqKey}`
          },
          body: JSON.stringify({
            model: model,
            temperature: 0.0,
            max_tokens: 1500,
            messages: [
              { role: "system", content: getGroqPrompt() },
              { role: "user", content: content }
            ]
          })
        });

        if (res.status === 429) {
          if (i < GROQ_MODELS.length - 1) {
            setStatus(`Model Groq ${model} limit (429). Mengalihkan ke cadangan (${GROQ_MODELS[i + 1]})...`);
            continue;
          } else {
            lastGroqError = new Error("Rate limit Groq tercapai pada seluruh model.");
            break;
          }
        }

        if (!res.ok) {
          throw new Error(`Groq error ${res.status}: ${(await res.text()).slice(0, 200)}`);
        }

        const data = await res.json();
        groqAnswer = data.choices?.[0]?.message?.content || "";
        if (groqAnswer) break;
      } catch (err) {
        lastGroqError = err;
        if (i < GROQ_MODELS.length - 1) continue;
      }
    }

    // Jika seluruh model Groq terkena rate limit (429) atau gagal, otomatis alihkan ke Gemini!
    if (!groqAnswer) {
      const activeGeminiKey = getApiKey("GEMINI_API_KEY");
      if (activeGeminiKey) {
        setStatus("Groq sedang mencapai batas limit (429). Mengalihkan otomatis ke Gemini...");
        const visionAnswer = await executeGeminiVision();
        await presentAnswerAndAutoProcess(visionAnswer);
        return;
      }
      throw lastGroqError || new Error("Rate limit Groq tercapai. Tunggu beberapa detik.");
    }

    if (isVisualProblem(groqAnswer)) {
      setStatus("🖼️ Soal butuh visual! Mengalihkan ke Gemini Vision...");
      const visionAnswer = await executeGeminiVision();
      await presentAnswerAndAutoProcess(visionAnswer);
      return;
    }

    await presentAnswerAndAutoProcess(groqAnswer);
  } catch (e) {
    showResult(e.message, true);
    setStatus("", false);
  } finally {
    setBusy(false);
  }
});

// === 2. OPENROUTER (DEEPSEEK CHAT) - Perangkum Halaman Web & Dokumen (dengan fallback Groq) ===
btnOpenRouter.addEventListener("click", async () => {
  setBusy(true);
  result.style.display = "none";
  if (resultActions) resultActions.classList.remove("show");

  try {
    setStatus("Membaca halaman...");
    const pageInfo = await getActivePageInfo();
    const activeORKey = getApiKey("OPENROUTER_API_KEY");
    const activeGroqKey = getApiKey("GROQ_API_KEY");

    let summaryText = null;

    if (activeORKey) {
      try {
        setStatus("Merangkum halaman web dengan DeepSeek...");
        const res = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${activeORKey}`
          },
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            temperature: 0.2,
            max_tokens: 3500,
            messages: [
              { role: "system", content: getWebSummaryPrompt() },
              { role: "user", content: pageInfo.text }
            ]
          })
        });

        if (res.ok) {
          const data = await res.json();
          summaryText = data.choices?.[0]?.message?.content;
        }
      } catch (_) { }
    }

    if (!summaryText && activeGroqKey) {
      setStatus("Mengalihkan rangkuman ke cadangan (Groq)...");
      const resGroq = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeGroqKey}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          temperature: 0.2,
          max_tokens: 3500,
          messages: [
            { role: "system", content: getWebSummaryPrompt() },
            { role: "user", content: pageInfo.text }
          ]
        })
      });

      if (resGroq.ok) {
        const dataGroq = await resGroq.json();
        summaryText = dataGroq.choices?.[0]?.message?.content;
      }
    }

    if (!summaryText) {
      showResult("⚠️ Gagal merangkum. Pastikan API Key OpenRouter atau Groq sudah dikonfigurasi di config.js.", true);
      return;
    }

    showResult(summaryText);
  } catch (e) {
    showResult(e.message, true);
  } finally {
    setStatus("", false);
    setBusy(false);
  }
});

// === 3. BEDAH MATERI & TUTOR KONSEP (Qwen 72B via OpenRouter dengan fallback Groq 120B) ===
btnHF.addEventListener("click", async () => {
  setBusy(true);
  result.style.display = "none";
  if (resultActions) resultActions.classList.remove("show");

  try {
    setStatus("Membaca halaman...");
    const pageInfo = await getActivePageInfo();
    setStatus("Membedah konsep materi dengan Qwen 72B...");

    const activeORKey = getApiKey("OPENROUTER_API_KEY");
    const activeGroqKey = getApiKey("GROQ_API_KEY");

    let tutorText = null;

    if (activeORKey) {
      try {
        const res = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${activeORKey}`
          },
          body: JSON.stringify({
            model: TUTOR_MODEL_OPENROUTER,
            temperature: 0.2,
            max_tokens: 3000,
            messages: [
              { role: "system", content: getTutorPrompt() },
              { role: "user", content: pageInfo.text }
            ]
          })
        });

        if (res.ok) {
          const data = await res.json();
          tutorText = data.choices?.[0]?.message?.content;
        }
      } catch (_) { }
    }

    if (!tutorText && activeGroqKey) {
      setStatus("Mengalihkan ke tutor cadangan (Groq 120B)...");
      const resGroq = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeGroqKey}`
        },
        body: JSON.stringify({
          model: TUTOR_MODEL_GROQ,
          temperature: 0.2,
          max_tokens: 3000,
          messages: [
            { role: "system", content: getTutorPrompt() },
            { role: "user", content: pageInfo.text }
          ]
        })
      });

      if (!resGroq.ok) {
        const errText = await resGroq.text();
        throw new Error(`Gagal membedah materi: ${errText.slice(0, 200)}`);
      }

      const dataGroq = await resGroq.json();
      tutorText = dataGroq.choices?.[0]?.message?.content;
    }

    showResult(tutorText || "Tidak ada respons dari tutor.");
  } catch (e) {
    showResult(e.message, true);
  } finally {
    setStatus("", false);
    setBusy(false);
  }
});

// === MESIN PENGERJAAN GEMINI VISION (MULTIMODAL SOAL BERGAMBAR & TES IQ) ===
async function executeGeminiVision() {
  if (!currentTabId) await initActiveTab();
  setStatus("Menangkap layar soal...");
  const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: "jpeg", quality: 60 }).catch(() => {
    throw new Error("Gagal menangkap layar. Pastikan berada di tab web biasa (chrome:// tidak didukung).");
  });

  const base64Data = dataUrl.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
  setStatus("Mencari jawaban soal di layar dengan Gemini...");

  const parts = [
    { text: getGeminiVisionPrompt() },
    {
      inline_data: {
        mime_type: "image/jpeg",
        data: base64Data
      }
    }
  ];

  let res = null;
  let data = null;
  let lastError = null;

  const activeGeminiKey = getApiKey("GEMINI_API_KEY");
  if (!activeGeminiKey) {
    throw new Error("API Key Gemini belum dikonfigurasi. Silakan salin config.example.js menjadi config.js dan masukkan API Key Gemini Anda.");
  }

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeGeminiKey}`;

    try {
      const generationConfig = {
        maxOutputTokens: 512,
        temperature: 0.0
      };

      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig
        })
      });

      if (res.status === 503 || res.status === 429) {
        lastError = `Gemini ${model} sedang padat (${res.status}). Mencoba model cadangan...`;
        setStatus(lastError, true);
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini error ${res.status}: ${errText.slice(0, 200)}`);
      }

      data = await res.json();
      break;
    } catch (err) {
      lastError = err.message;
      if (err.message.includes("503") || err.message.includes("429")) {
        continue;
      }
      throw err;
    }
  }

  if (!data && (!res || !res.ok)) {
    throw new Error(lastError || "Server Gemini sedang mengalami lonjakan beban. Silakan coba kembali.");
  }

  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return reply || "Gemini tidak memberikan jawaban.";
}

// === 4. GEMINI VISION - Penjawab Soal Bergambar & Visual Cepat ===
btnVision.addEventListener("click", async () => {
  setBusy(true);
  result.style.display = "none";
  if (resultActions) resultActions.classList.remove("show");

  try {
    const visionAnswer = await executeGeminiVision();
    await presentAnswerAndAutoProcess(visionAnswer);
  } catch (e) {
    showResult(e.message, true);
    setStatus("", false);
  } finally {
    setBusy(false);
  }
});

// === 5. TOMBOL SALIN (CLIPBOARD) ===
if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(result.textContent);
      copyBtn.textContent = "✅ Berhasil Disalin!";
      setTimeout(() => {
        copyBtn.textContent = "📋 Salin Hasil";
      }, 2000);
    } catch (err) {
      copyBtn.textContent = "Gagal menyalin";
    }
  });
}

// === 6. TOMBOL BERSIHKAN (HAPUS JAWABAN TERSIMPAN) ===
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    result.style.display = "none";
    result.textContent = "";
    if (resultActions) resultActions.classList.remove("show");
    clearCurrentTabResult();
  });
}

// === 7. INISIALISASI & RESTORE DATA PER-TAB SAAT POPUP DIBUKA ===
restoreTabState();
