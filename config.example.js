// config.example.js - Template Konfigurasi API Key Asisten Belajar AI
// Petunjuk Penggunaan:
// 1. Salin file ini menjadi 'config.js' (di direktori yang sama)
// 2. Isi nilai API Key Anda masing-masing di bawah ini
// 3. Muat ulang (Reload) ekstensi di chrome://extensions/

const CONFIG = {
  // Groq API Key (wajib untuk jawab cepat 1 soal & Auto-Pilot)
  // Dapatkan gratis di: https://console.groq.com/keys
  GROQ_API_KEY: "YOUR_GROQ_API_KEY_HERE",

  // OpenRouter API Key (opsional untuk DeepSeek Web Summary & Qwen 72B Concept Tutor)
  // Dapatkan di: https://openrouter.ai/keys
  OPENROUTER_API_KEY: "YOUR_OPENROUTER_API_KEY_HERE",

  // Gemini API Key (wajib untuk soal bergambar / diagram / tes visual IQ)
  // Dapatkan gratis di: https://aistudio.google.com/app/apikey
  GEMINI_API_KEY: "YOUR_GEMINI_API_KEY_HERE"
};
