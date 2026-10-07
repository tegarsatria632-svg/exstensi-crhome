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
  return `Kamu adalah AI penjawab kuis, ujian, dan tes super cepat, akurat, dan to-the-point.
TUGAS UTAMA:
Baca pertanyaan atau soal pada teks dan LANGSUNG berikan jawaban yang benar.

ATURAN PILIHAN GANDA & KUIS (SANGAT KETAT - WAJIB HANYA 1 BARIS):
- TULISKAN HANYA KUNCI JAWABANNYA LANGSUNG PADA 1 BARIS SAJA!
- DILARANG MENULISKAN ALASAN, DILARANG MENULISKAN PENJELASAN, DILARANG MENULISKAN TEORI APA PUN!
- Contoh jika opsi memiliki huruf (A/B/C/D/E):
  Jawaban: B. [Teks pilihan]
  (atau Jawaban: B)
- Contoh jika opsi berupa teks langsung (seperti Strongly Agree, Agree, Neutral, Disagree, Benar, Salah, angka, dsb):
  Jawaban: [Teks opsi yang benar]
  (Contoh: Jawaban: Strongly Agree)
- Contoh jika nomor urut kotak (1-8):
  Jawaban: 4

ATURAN FORMAT (SANGAT KETAT):
- DILARANG menggunakan karakter bintang (*) atau cetak tebal (**) sama sekali.
- DILARANG menggunakan tanda pagar (#).
- DILARANG menggunakan icon bulet (•, ●) atau simbol strip (-).
- Tanpa salam pembuka, tanpa basa-basi, dan tanpa penutup.`;
}

function getGeminiVisionPrompt() {
  return `Kamu adalah AI pemecah soal bergambar, grafik, tabel, dan tes IQ/kuis visual super cepat dan to-the-point.
TUGAS UTAMA:
Periksa gambar ini (soal ujian bergambar, diagram, tabel, matriks tes IQ, kuis skala psikometri/IQ, atau lembar tugas). LANGSUNG PECAHKAN DAN BERIKAN JAWABAN YANG BENAR!

ATURAN PILIHAN GANDA & TES IQ (SANGAT KETAT - WAJIB HANYA 1 BARIS):
- TULISKAN HANYA KUNCI JAWABANNYA LANGSUNG PADA 1 BARIS SAJA!
- DILARANG MENULISKAN ALASAN, DILARANG MENULISKAN PENJELASAN, DILARANG MENULISKAN RANGKUMAN ATAU TEORI!
- Contoh jika opsi ada huruf (A-H):
  Jawaban: B. [Teks pilihan]
  (atau Jawaban: B)
- Contoh jika opsi berupa teks langsung (seperti Strongly Agree, Agree, Neutral, Disagree, Benar, Salah, dsb):
  Jawaban: [Teks opsi yang benar]
  (Contoh: Jawaban: Strongly Agree)
- Contoh jika pola tes IQ berupa kotak nomor urut:
  Jawaban: [Nomor Kotak atau Huruf Opsi]
  (Contoh: Jawaban: 4 atau Jawaban: D)

ATURAN FORMAT (SANGAT KETAT):
- DILARANG menggunakan karakter bintang (*) atau tanda tebal ganda (**) sama sekali.
- DILARANG menggunakan tanda pagar (#).
- DILARANG menggunakan icon bulet (•, ●) atau simbol strip (-).
- Tanpa salam pembuka, tanpa kata pengantar apa pun, dan tanpa penutup.`;
}

// Eksekusi Panggilan Groq
async function handleCallGroq(questionText) {
  const activeGroqKey = getApiKey("GROQ_API_KEY");
  if (!activeGroqKey) {
    throw new Error("API Key Groq belum dikonfigurasi. Silakan salin config.example.js menjadi config.js dan masukkan API Key Anda.");
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${activeGroqKey}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.1,
      max_tokens: 300,
      messages: [
        { role: "system", content: getGroqPrompt() },
        { role: "user", content: questionText }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API Error (${res.status}): ${errText.slice(0, 150)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
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
            temperature: 0.1
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
