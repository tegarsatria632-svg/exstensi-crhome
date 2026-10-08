// background.js - Background Service Worker Asisten Belajar AI (Multi-Model & AI Agent Auto-Pilot)

// Impor konfigurasi API key lokal jika tersedia (file config.js diabaikan oleh git)
try {
  importScripts("config.js");
} catch (_) { }

function getApiKey(name, fallback = "") {
  if (typeof CONFIG !== "undefined" && CONFIG && CONFIG[name] && !CONFIG[name].startsWith("YOUR_")) {
    return CONFIG[name];
  }
  return fallback;
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "qwen/qwen3.8-27b";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "deepseek/deepseek-chat";

const TUTOR_MODEL_OPENROUTER = "qwen/qwen-2.5-72b-instruct";
const TUTOR_MODEL_GROQ = "openai/gpt-oss-120b";

// Prioritaskan gemini-3.5-flash-lite (aktif & kuota penuh)
const GEMINI_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-2.5-flash"];

// 1. GROQ: Solver Cerdas Soal Ujian, Kuis, & Esai Akademik (Adaptif Sesuai Kebutuhan Soal)
function getGroqPrompt() {
  return `Kamu adalah AI pemecah soal ujian, kuis, tes akademik, matematika, dan esai ilmiah tingkat ahli dengan akurasi 100%, cerdas, dan adaptif sesuai jenis soal.
TUGAS UTAMA:
Pecahkan soal yang diberikan dan sajikan jawaban yang paling tepat, berbobot, dan akurat sesuai kebutuhan soal:
- Untuk soal pilihan ganda / kuis: to-the-point langsung pada opsi yang benar (1 baris tanpa basa-basi).
- Untuk soal esai, uraian, analisis, atau pertanyaan terbuka: sajikan jawaban yang komprehensif, terstruktur, mendalam, dan tuntas mencakup semua aspek yang diminta soal.

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

3. ATURAN SOAL ESAI, ANALISIS 5W1H (APA, BAGAIMANA, KENAPA/MENGAPA, DIMANA, KAPAN), KELEBIHAN/KEKURANGAN, & PENDAPAT:
   - Pola Pertanyaan 5W1H (Wajib Menjawab Sesuai Esensi Pertanyaan):
     * APA (Definisi & Esensi Konsep): Uraikan hakikat definisi baku, esensi konseptual, fungsi utama, dan ruang lingkup secara komprehensif.
     * BAGAIMANA (Mekanisme, Alur, & Langkah Kerja): Uraikan proses bertahap, cara kerja, prosedur teknis, atau alur protokol secara runtut, kronologis, dan sistematis.
     * KENAPA / MENGAPA (Sebab-Akibat & Rationale Ilmiah/Teknis): Paparkan dasar kausalitas, latar belakang masalah, alasan ilmiah/teknis, serta dampak positif/negatif secara mendalam.
     * DIMANA (Lokasi, Penempatan Arsitektur, & Layer): Tentukan secara presisi letak memori (stack/heap), layer arsitektur (OSI layer/TCP-IP), lingkungan eksekusi, atau lokasi sistem.
     * KAPAN (Kondisi Penerapan, Pemicu/Triggers, & Kriteria Skenario): Jelaskan kondisi/skenario spesifik kapan suatu metode/arsitektur tepat digunakan, pemicu peristiwa, dan trade-off dibanding alternatif.
   - Soal Kelebihan & Kekurangan (Pros & Cons): Wajib menguraikan kelebihan dan kekurangan secara berimbang dan terstruktur (Kelebihan: 1, 2... Kekurangan: 1, 2...) disertai alasan teknis/ilmiah yang kuat.
   - Soal Berikan Pendapat / Analisis Kritis / Solusi Kasus: Berikan pandangan yang logis, objektif, berbasis teori ilmiah/data, serta sertakan solusi atau rekomendasi konkret yang aplikatif.
   - Soal Dampak / Pengaruh / Fungsi / Tahapan: Uraikan secara runtut, mendalam, dan terstruktur.
   - Soal Permintaan Jumlah N Poin / Contoh: Sebutkan dan jelaskan SELURUH N poin/contoh tanpa ada yang terlewat atau dikurangi.
   - Soal Perbandingan & Contoh DBMS/Kategori: Jelaskan perbedaan konsep dan sebutkan contoh masing-masing secara eksplisit.
   - Soal Isian Singkat 1 Istilah/Angka: Tuliskan istilah atau angka tersebut secara presisi.
   - Format jawaban esai/uraian:
     Tuliskan analisis/langkah di [HITUNGAN: ...] jika memerlukan perhitungan.
     Lalu tuliskan jawaban lengkap di bawah Jawaban:
     Jawaban:
     [Uraian berbobot, lengkap, dan terstruktur sesuai seluruh kriteria yang diminta soal]

4. ATURAN FORMAT (SANGAT KETAT):
   - DILARANG menggunakan karakter bintang (*) atau cetak tebal (**) sama sekali.
   - DILARANG menggunakan tanda pagar (#).
   - DILARANG menggunakan icon bulet (•, ●) atau simbol strip (-). Gunakan penomoran angka (1., 2., 3.) atau huruf (a., b.) untuk daftar poin.
   - Tanpa salam pembuka, tanpa basa-basi, dan tanpa penutup.`;
}

// 2. GEMINI VISION: Penjawab Soal Bergambar, Tes IQ Visual, Grafik & Analisis Visual
function getGeminiVisionPrompt() {
  return `Kamu adalah AI pemecah soal bergambar, grafik, tabel, matematika visual, tes IQ, dan analisis visual tingkat ahli dengan akurasi 100%, adaptif, dan tepat sasaran.
TUGAS UTAMA:
Periksa gambar ini (soal ujian bergambar, diagram, tabel, matriks tes IQ, matematika/geometri, atau kuis visual). LANGSUNG PECAHKAN DAN BERIKAN JAWABAN YANG PALING TEPAT!

PANDUAN MEMBACA TEKS SOAL DALAM GAMBAR (OCR & ANALISIS VISUAL):
1. PEMBACAAN TEKS & OCR DARI GAMBAR SECARA AKURAT:
   - Bacalah seluruh isi teks pertanyaan, instruksi, dan opsi jawaban (A, B, C, D, E) yang tertera langsung di dalam gambar atau tangkapan layar.
   - Jika soal berbasis teks yang disajikan sebagai gambar (misalnya ujian CBT yang mengunci seleksi teks dengan merender teks ke dalam gambar/canvas): bacalah teks pertanyaan tersebut kata demi kata secara teliti.
   - Jika gambar memuat diagram arsitektur, flowchart, tabel data, grafik statistik, rumus matematika/fisika, atau potongan kode: baca dan analisis setiap label teks, nilai angka, dan hubungan antar-elemen di dalamnya.

2. LOGIKA TES IQ VISUAL, FIGURAL & MATRIKS POLA (RAVEN'S / MENSA / IQ CENTER):
   - Pola Terbalik / Pencerminan / Rotasi: Amati pembalikan sumbu vertikal/horizontal, perputaran sudut jarum jam (45°, 90°, 180°), dan inversi warna (hitam/putih).
   - Pola Sambungan & Potongan Matriks '?': Periksa kontinuitas garis (seamless fit), sudut kemiringan (tegak vs miring), dan kerapatan kisi-kisi (grid density) agar identik dengan matriks utama.
   - Operasi Bentuk: Evaluasi superposisi XOR, penggabungan AND, atau pergeseran langkah.

3. ATURAN PENOMORAN OPSI JAWABAN VISUAL (KARTU GAMBAR TANPA HURUF):
   - Jika opsi disusun dalam kolom/baris kartu gambar:
     * Baris 1: Kotak 1 (Kiri Atas), Kotak 2 (Kanan Atas)
     * Baris 2: Kotak 3 (Kiri Tengah), Kotak 4 (Kanan Tengah)
     * Baris 3: Kotak 5 (Kiri Bawah), Kotak 6 (Kanan Bawah)
   - Tuliskan nomor urut kotak atau hurufnya: Jawaban: 1 (atau Jawaban: A).

4. ATURAN SOAL PILIHAN GANDA & KUIS BERGAMBAR:
   - Baris jawaban akhir WAJIB berupa 1 baris jelas:
     Jawaban: B. [Teks pilihan] (atau Jawaban: B)
   - DILARANG menuliskan penjelasan atau teori di luar blok [HITUNGAN: ...] untuk pilihan ganda.

5. ATURAN SOAL ESAI BERGAMBAR, ANALISIS 5W1H (APA, BAGAIMANA, KENAPA, DIMANA, KAPAN), KELEBIHAN/KEKURANGAN, & PENDAPAT:
   - Jika soal di dalam gambar menanyakan pertanyaan konseptual 5W1H (apa esensinya, bagaimana alurnya, kenapa terjadi, dimana posisinya, kapan digunakannya), kelebihan/kekurangan, opini/pendapat ilmiah, analisis grafik/diagram, atau sejumlah N contoh: baca pertanyaan di dalam gambar secara detail dan sajikan jawaban lengkap, terstruktur, dan berbobot di bawah "Jawaban:".

ATURAN FORMAT (SANGAT KETAT):
- DILARANG menggunakan karakter bintang (*) atau tanda tebal ganda (**) sama sekali.
- DILARANG menggunakan tanda pagar (#).
- DILARANG menggunakan icon bulet (•, ●) atau simbol strip (-). Gunakan penomoran angka (1., 2., 3.) jika membuat daftar poin.
- Tanpa salam pembuka, tanpa kata pengantar apa pun, dan tanpa penutup.`;
}

const GROQ_MODELS = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"];

// Eksekusi Panggilan Groq (Dengan Auto-Fallback Antar-Model jika 429)
async function handleCallGroq(questionText) {
  const activeGroqKey = getApiKey("GROQ_API_KEY");
  if (!activeGroqKey) {
    throw new Error("API Key Groq belum dikonfigurasi. Silakan salin config.example.js menjadi config.js dan masukkan API Key Anda.");
  }

  let lastError = null;
  for (const model of GROQ_MODELS) {
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
            { role: "user", content: questionText }
          ]
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 429 && model !== GROQ_MODELS[GROQ_MODELS.length - 1]) {
          continue; // Beralih ke model Groq berikutnya jika kena kuota
        }
        throw new Error(`Groq API Error (${res.status}): ${errText.slice(0, 150)}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (e) {
      lastError = e;
      if (model === GROQ_MODELS[GROQ_MODELS.length - 1]) {
        break;
      }
    }
  }

  // Jika seluruh model Groq terkena rate limit (429) atau gagal, otomatis alihkan ke Gemini Flash!
  const activeGeminiKey = getApiKey("GEMINI_API_KEY");
  if (activeGeminiKey) {
    try {
      const geminiAnswer = await handleCallGeminiText(questionText);
      if (geminiAnswer) return geminiAnswer;
    } catch (_) { }
  }

  throw lastError || new Error("Gagal memanggil model AI (Groq & Gemini).");
}

// Eksekusi Panggilan Teks Gemini Flash (Cadangan Tangguh jika Groq limit 429)
async function handleCallGeminiText(questionText) {
  const activeGeminiKey = getApiKey("GEMINI_API_KEY");
  if (!activeGeminiKey) return "";
  for (const model of ["gemini-2.5-flash", "gemini-2.0-flash"]) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeGeminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${getGroqPrompt()}\n\nSOAL:\n${questionText}` }]
          }],
          generationConfig: {
            temperature: 0.0,
            maxOutputTokens: 1500
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    } catch (_) { }
  }
  return "";
}

// Eksekusi Panggilan Gemini Vision
async function handleCallGeminiVision(windowId = null) {
  const activeGeminiKey = getApiKey("GEMINI_API_KEY");
  if (!activeGeminiKey) {
    throw new Error("API Key Gemini belum dikonfigurasi. Silakan salin config.example.js menjadi config.js dan masukkan API Key Anda.");
  }

  let dataUrl = null;
  try {
    dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: "jpeg", quality: 65 });
  } catch (e) {
    throw new Error("Gagal mengambil screenshot halaman: " + e.message);
  }

  const base64Data = dataUrl.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

  const parts = [
    { text: getGeminiVisionPrompt() },
    {
      inline_data: {
        mime_type: "image/jpeg",
        data: base64Data
      }
    }
  ];

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeGeminiKey}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            maxOutputTokens: 1500,
            temperature: 0.0
          }
        })
      });

      if (res.status === 503 || res.status === 429) {
        lastError = `Gemini ${model} sedang padat (${res.status}). Mencoba model lain...`;
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini error ${res.status}: ${errText.slice(0, 150)}`);
      }

      const data = await res.json();
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (answer) return answer;
    } catch (err) {
      lastError = err.message;
      if (err.message.includes("503") || err.message.includes("429")) {
        continue;
      }
      throw err;
    }
  }

  throw new Error(lastError || "Semua model Gemini sedang sibuk. Silakan coba sesaat lagi.");
}

// Router Pesan Ekstensi
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg) return false;

  if (msg.type === "PING_BACKGROUND") {
    sendResponse({ pong: true });
    return false;
  }

  // Panggilan Groq dari content script atau popup
  if (msg.type === "EXECUTE_GROQ") {
    handleCallGroq(msg.text || "")
      .then(answer => sendResponse({ success: true, answer }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // asynchronous response
  }

  // Panggilan Gemini Vision dari content script atau popup
  if (msg.type === "EXECUTE_GEMINI_VISION") {
    const windowId = sender.tab ? sender.tab.windowId : null;
    handleCallGeminiVision(windowId)
      .then(answer => sendResponse({ success: true, answer }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // asynchronous response
  }

  return false;
});
