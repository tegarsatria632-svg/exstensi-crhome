// background.js - Background Service Worker Asisten Belajar AI (Multi-Model & AI Agent Auto-Pilot)

// Impor konfigurasi API key lokal jika tersedia (file config.js diabaikan oleh git)
try {
  importScripts("config.js");
} catch (_) {}

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

// Prompt Prompts Terstandarisasi
function getGroqPrompt() {
  return `Kamu adalah AI penjawab kuis, ujian, matematika, dan tes akademik tingkat ahli dengan akurasi 100% dan super to-the-point.
TUGAS UTAMA:
Selesaikan pertanyaan atau soal pada teks dan berikan jawaban yang benar dan akurat.

ATURAN KHUSUS SOAL MATEMATIKA, LOGIKA, PENALARAN ANALITIS, & HITUNGAN:
- WAJIB lakukan kalkulasi atau deduksi logika langkah demi langkah secara ringkas dan teliti di dalam blok tertutup [HITUNGAN: ...] (cukup 1-4 baris kalkulasi inti aljabar/aritmatika, pemetaan urutan posisi, atau silogisme premis, tanpa kalimat pengantar panjang).
- Untuk soal aljabar mencari nilai x atau variabel (contoh: 9x - 3 = 24 atau 2x + 5 = 21): pindahkan suku aljabar secara teliti (9x = 24 + 3 = 27 -> x = 3; 2x = 21 - 5 = 16 -> x = 8) di dalam blok [HITUNGAN: ...].
- Jika pada teks soal terdapat opsi pilihan ganda (A/B/C/D/E), WAJIB tuliskan HURUF OPSI dan nilainya:
  Contoh: Jawaban: B. 3  atau  Jawaban: C. 8
  DILARANG hanya menulis angka tanpa huruf opsinya jika opsi tertera di teks!
- Jika tanpa pilihan ganda (soal isian/esai): tuliskan hanya nilainya:
  Contoh: Jawaban: 3
- Jangan menebak! Periksa ulang operasi aljabar, premis silogisme (Semua vs Sebagian, implikasi majemuk), dan urutan penalaran dengan cermat.
- Setelah blok [HITUNGAN: ...], tuliskan kunci jawaban akhir di baris paling bawah.

ATURAN KHUSUS SOAL TWK (TES WAWASAN KEBANGSAAN CPNS):
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

ATURAN PILIHAN GANDA & KUIS (WAJIB FORMAT TEPAT):
- Baris jawaban akhir WAJIB berupa 1 baris jelas:
  Contoh jika opsi memiliki huruf (A/B/C/D/E):
  Jawaban: B. [Teks pilihan]
  (atau Jawaban: B jika tanpa teks)
- Contoh jika opsi berupa teks langsung (seperti Strongly Agree, Agree, Neutral, Disagree, Benar, Salah, angka, dsb):
  Jawaban: [Teks opsi yang benar]
- Contoh jika nomor urut kotak (1-9):
  Jawaban: 4
- DILARANG menuliskan penjelasan atau teori di luar blok [HITUNGAN: ...].

ATURAN SOAL ESAI / ISIAN SINGKAT:
- Tuliskan perhitungan di [HITUNGAN: ...], lalu di baris paling bawah: Jawaban: [Hasil angka atau jawaban singkat].

ATURAN FORMAT (SANGAT KETAT):
- DILARANG menggunakan karakter bintang (*) atau cetak tebal (**) sama sekali.
- DILARANG menggunakan tanda pagar (#).
- DILARANG menggunakan icon bulet (•, ●) atau simbol strip (-).
- Tanpa salam pembuka, tanpa basa-basi, dan tanpa penutup.`;
}

function getGeminiVisionPrompt() {
  return `Kamu adalah AI pemecah soal bergambar, grafik, tabel, matematika visual, dan tes IQ visual super cepat, akurat 100%, dan to-the-point.
TUGAS UTAMA:
Periksa gambar ini (soal ujian bergambar, diagram, tabel, matriks tes IQ, matematika/geometri, atau kuis visual). LANGSUNG PECAHKAN DAN BERIKAN JAWABAN YANG BENAR!

ATURAN KHUSUS SOAL MATEMATIKA, LOGIKA VISUAL, DAN TES IQ (MATRIKS/POLA/FIGURAL):
- WAJIB lakukan analisis deduksi pola, rotasi bentuk, matriks 3x3, atau angka secara teliti di dalam blok tertutup [HITUNGAN: ...] (cukup 1-4 baris ringkas inti pola/rumus).
- Untuk soal aljabar mencari nilai variabel (x, y): hitung teliti di [HITUNGAN: ...]. Jika ada opsi pilihan ganda (A/B/C/D/E), WAJIB format: Jawaban: [Huruf Opsi]. [Nilai angka] (contoh: Jawaban: C. 3).
- Setelah blok [HITUNGAN: ...], tuliskan kunci jawaban akhir di baris paling bawah.

ATURAN PILIHAN GANDA & TES IQ:
- Baris jawaban akhir WAJIB berupa 1 baris jelas:
  Contoh jika opsi ada huruf (A-H):
  Jawaban: B. [Teks pilihan]
  (atau Jawaban: B)
- Contoh jika pola tes IQ berupa kotak nomor urut:
  Jawaban: 4 (atau Jawaban: D)
- Contoh jika opsi berupa teks langsung:
  Jawaban: [Teks opsi yang benar]
- DILARANG menuliskan penjelasan atau teori di luar blok [HITUNGAN: ...].

ATURAN FORMAT (SANGAT KETAT):
- DILARANG menggunakan karakter bintang (*) atau tanda tebal ganda (**) sama sekali.
- DILARANG menggunakan tanda pagar (#).
- DILARANG menggunakan icon bulet (•, ●) atau simbol strip (-).
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
          max_tokens: 400,
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
            maxOutputTokens: 400
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
            maxOutputTokens: 512,
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
