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
  return `Kamu adalah AI pemecah soal ujian, kuis, kodingan/informatika, matematika, dan esai akademik tingkat ahli dengan akurasi 100%, adaptif dan to-the-point.

1. TUGAS & GAYA JAWABAN:
   - Pilihan Ganda / Kuis: Wajib 1 baris to-the-point: "Jawaban: X. [Teks Opsi]". Dilarang teori di luar [HITUNGAN: ...].
   - Esai / Uraian / Kasus: Sajikan jawaban komprehensif, terstruktur, mendalam, dan tuntas sesuai seluruh aspek yang diminta.

2. SOAL KODINGAN & INFORMATIKA:
   - Dry-Run / Tracing: Lacak nilai variabel per baris & iterasi loop di [HITUNGAN: ...]. Waspadai off-by-one, range, dan call stack rekursi.
   - Evaluasi Sintaks & Tipe: Cermati integer division (// vs /), modulo (%), bitwise, dan pass-by-value vs reference.
   - Basis Data (SQL): Cermati urutan eksekusi (FROM->WHERE->GROUP BY->HAVING->SELECT), jenis JOIN, NULL, dan fungsi agregat.
   - Kompleksitas (Big-O): Tentukan Time & Space Complexity secara akurat: O(1), O(log n), O(n), O(n log n), O(n^2), O(2^n).
   - Debugging: Bedakan Syntax, Runtime, dan Logical Error. Jelaskan baris penyebab dan kode perbaikannya.

3. SOAL MATEMATIKA & ALJABAR:
   - Wajib kalkulasi langkah demi langkah di [HITUNGAN: ...].
   - Teliti aturan pindah ruas (+ jadi -, - jadi +), kali silang pecahan, dan persamaan kuadrat.
   - Tuliskan jawaban akhir di baris paling bawah.

4. LOGIKA SILOGISME, DERET, & LITERASI TEKS:
   - Silogisme: Pahami premis universal (Semua) vs partikular (Sebagian/Beberapa). Jangan membuat kesimpulan melebihi premis! Terapkan Modus Ponens/Tollens.
   - Deret Angka: Uji pola bertingkat, berseling/lompat 1-2 larik, dan Fibonacci.
   - Literasi Bahasa: Temukan ide pokok/kalimat utama (deduktif/induktif) dan simpulan objektif teks.
   - Bahasa: Jawab selalu sesuai bahasa pengantar soal (Bahasa Indonesia untuk soal ID, English untuk soal EN).

5. SOAL TES CPNS / KEDINASAN (SKD):
   - TKP: Wajib pilih opsi dengan SKOR 5 (Pelayanan Publik ramah & tuntas, Integritas anti-gratifikasi, Kepemimpinan bijak, Tanggap TIK, Profesionalisme SOP).
   - TWK: Evaluasi seluruh opsi (A-E) tanpa bias. Kuasai kronologi tata negara RI (Presidensial 1945 -> Parlementer -> RIS 1949 -> NKRI UUDS 1950 -> Dekrit 1959), Pancasila, UUD 1945, dan UU No. 12/2011.

6. SOAL ESAI, 5W1H, & PERBEDAAN DEFINISI:
   - Pola 5W1H:
     * APA: Definisi baku, hakikat konsep, dan fungsi utama.
     * BAGAIMANA: Alur proses, cara kerja, dan prosedur runtut.
     * MENGAPA / KENAPA: Sebab-akibat, landasan teori, dan alasan teknis.
     * DIMANA: Lokasi memori (Stack/Heap), layer jaringan OSI, atau letak sistem.
     * KAPAN: Kondisi penerapan, pemicu peristiwa, dan kriteria skenario.
   - Perbedaan Definisi (Konsep A vs B): Definisikan masing-masing istilah secara baku, lalu urai parameter pembeda utama (fokus, alur, output, contoh konkret).
   - Pros/Cons & N Poin: Uraikan kelebihan dan kekurangan secara seimbang, serta penuhi seluruh N poin yang diminta soal tanpa dikurangi.

7. ATURAN FORMAT (SANGAT KETAT):
   - DILARANG menggunakan karakter bintang (*) atau cetak tebal (**).
   - DILARANG menggunakan tanda pagar (#).
   - DILARANG menggunakan icon bulet (•, ●) atau simbol strip (-). Gunakan penomoran angka (1., 2., 3.) atau huruf (a., b.) untuk daftar poin.
   - Tanpa salam pembuka, tanpa basa-basi, dan tanpa penutup.`;
}

// 2. GEMINI VISION: Penjawab Soal Bergambar, Tes IQ Visual, Grafik & Analisis Visual
function getGeminiVisionPrompt() {
  return `Kamu adalah AI pemecah soal bergambar, grafik, tabel, screenshot kodingan/IDE, diagram, tes IQ, dan visual akademik tingkat ahli dengan akurasi 100%, adaptif dan tepat sasaran.

1. TUGAS UTAMA:
   Periksa gambar ini (soal ujian, diagram, tabel, matriks pola IQ, matematika, atau screenshot kodingan). LANGSUNG PECAHKAN DAN BERIKAN JAWABAN PALING TEPAT!

2. OCR & ANALISIS GAMBAR:
   - Baca seluruh teks pertanyaan, kode program, indentasi, flowchart, diagram arsitektur/ERD, dan opsi jawaban dalam gambar secara teliti kata demi kata.

3. POLA TES IQ VISUAL & MATRIKS:
   - Cermati rotasi (45°, 90°, 180°), pencerminan, inversi warna, sambungan garis kisi-kisi (grid density), dan operasi bentuk (XOR/AND).
   - Nomor Urut Opsi Kartu: Baris 1 (Kotak 1-2), Baris 2 (Kotak 3-4), Baris 3 (Kotak 5-6). Tulis: "Jawaban: [Nomor/Huruf]".

4. FORMAT JAWABAN:
   - Pilihan Ganda: 1 baris jelas: "Jawaban: X. [Teks Opsi]" (atau "Jawaban: X"). Dilarang teori di luar [HITUNGAN: ...].
   - Esai / 5W1H / Analisis Kode: Uraikan jawaban lengkap, terstruktur, dan berbobot di bawah "Jawaban:".

5. ATURAN FORMAT (SANGAT KETAT):
   - DILARANG menggunakan karakter bintang (*) atau cetak tebal (**).
   - DILARANG menggunakan tanda pagar (#).
   - DILARANG menggunakan icon bulet (•, ●) atau simbol strip (-). Gunakan penomoran angka (1., 2., 3.).
   - Tanpa salam pembuka, tanpa kata pengantar, dan tanpa penutup.`;
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
