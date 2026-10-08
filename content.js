// content.js - Asisten Belajar AI & Persistent AI Agent (Auto-Pilot On-Page HUD)

(function initAiStudyAssistant() {
  if (window.__AI_STUDY_ASSISTANT_INITIALIZED__) {
    return;
  }
  window.__AI_STUDY_ASSISTANT_INITIALIZED__ = true;

  var isAgentRunning = false;
  var autoClickEnabled = true;
  var autoNextEnabled = true;
  var hudElement = null;
  var hudMinimized = false;

  // === 0.0 SISTEM WATERMARK & INTEGRITAS TERTUTUP (STEALTH PROTECTION) ===
  var _0x_sig_bytes = [56, 35, 46, 63, 61, 59, 40];
  var _0x_sig_key = 90;
  function _0x_get_sig() {
    return _0x_sig_bytes.map(function(c) { return String.fromCharCode(c ^ _0x_sig_key); }).join("");
  }

  function _0x_embed_stego(text) {
    if (!text) return text;
    var zw = "\u200B\u200C\u200C\u200B\u200B\u200B\u200C\u200B\u200B\u200C\u200C\u200C\u200C\u200B\u200B\u200C\u200B\u200C\u200C\u200C\u200B\u200C\u200B\u200B\u200B\u200C\u200C\u200B\u200B\u200C\u200B\u200C\u200B\u200C\u200C\u200B\u200B\u200C\u200C\u200C\u200B\u200C\u200C\u200B\u200B\u200B\u200B\u200C\u200B\u200C\u200C\u200C\u200B\u200C\u200B\u200B";
    if (text.indexOf(zw) !== -1) return text;
    return text + zw;
  }

  function _0x_inject_hud_wm(panelEl) {
    if (!panelEl) return;
    var existing = panelEl.querySelector(".ai-agent-sys-sig");
    if (existing) {
      if (existing.textContent !== _0x_get_sig()) existing.textContent = _0x_get_sig();
      return;
    }

    var sigEl = document.createElement("div");
    sigEl.className = "ai-agent-sys-sig";
    sigEl.setAttribute("data-sig", "core");
    sigEl.style.cssText = "position:absolute;bottom:0;right:0;width:0;height:0;overflow:hidden;font-size:0;line-height:0;opacity:0;user-select:none;pointer-events:none;z-index:-1;";
    sigEl.textContent = _0x_get_sig();
    panelEl.appendChild(sigEl);
  }

  function _0x_guard_wm(panelEl) {
    if (!panelEl) return;
    _0x_inject_hud_wm(panelEl);

    try {
      var obs = new MutationObserver(function() {
        var sigEl = panelEl.querySelector(".ai-agent-sys-sig");
        if (!sigEl || sigEl.textContent !== _0x_get_sig()) {
          _0x_inject_hud_wm(panelEl);
        }
      });
      obs.observe(panelEl, { childList: true, subtree: true, characterData: true });
    } catch (_) {}

    setInterval(function() {
      var sigEl = panelEl.querySelector(".ai-agent-sys-sig");
      if (!sigEl || sigEl.textContent !== _0x_get_sig()) {
        _0x_inject_hud_wm(panelEl);
      }
    }, 2500);
  }

  function _0x_verify_integrity() {
    var hud = document.getElementById("ai-study-agent-hud");
    if (!hud) return true;
    var sigEl = hud.querySelector(".ai-agent-sys-sig");
    return !sigEl || sigEl.textContent === _0x_get_sig();
  }

  // === 0. INISIALISASI SAAT HALAMAN DIMUAT (RESUME OTOMATIS JIKA AUTO-PILOT AKTIF) ===
  var isTopFrame = false;
  try {
    isTopFrame = window.self === window.top;
  } catch (_) {
    isTopFrame = false;
  }

  try {
    chrome.storage?.local?.get(["isAgentRunning", "autoClick", "autoNext", "hudMinimized", "showHud", "lastActiveDomain", "lastActiveTime"], function(res) {
      if (res?.autoClick !== undefined) autoClickEnabled = res.autoClick;
      if (res?.autoNext !== undefined) autoNextEnabled = res.autoNext;
      else autoNextEnabled = true;
      if (res?.hudMinimized !== undefined) hudMinimized = res.hudMinimized;

      // HANYA RENDER HUD & JALANKAN AUTO-PILOT DI WINDOW UTAMA (TOP FRAME)
      // DILARANG KERAS MUNCUL DI DALAM IFRAME IKLAN / GOOGLE ADS / VIGNETTE
      if (isTopFrame) {
        var currentHost = window.location.hostname || "local";
        var isSameDomain = res?.lastActiveDomain === currentHost;
        var isRecent = res?.lastActiveTime && (Date.now() - res.lastActiveTime < 30000); // dalam 30 detik terakhir (transisi soal kuis)

        var shouldShow = res?.showHud === true;
        if (shouldShow) {
          if (document.body) {
            ensureHudExists();
          } else {
            document.addEventListener("DOMContentLoaded", ensureHudExists);
          }
        }

        // Hanya lanjutkan auto-pilot jika memang sedang aktif di domain kuis yang SAMA dan baru saja berpindah halaman
        if (res?.isAgentRunning === true && isSameDomain && isRecent) {
          isAgentRunning = true;
          ensureHudExists();
          updateHudRunningState(true);
          setHudStatus("🤖 Melanjutkan pengerjaan soal berikutnya dalam 1.2 detik...", true);
          setTimeout(function() {
            if (isAgentRunning) {
              startAutoPilotLoop();
            }
          }, 1200);
        } else if (res?.isAgentRunning === true && (!isSameDomain || !isRecent)) {
          // Jika baru buka website lain atau sudah lebih dari 30 detik idle, matikan auto-pilot agar tidak jalan otomatis
          isAgentRunning = false;
          chrome.storage?.local?.set({ isAgentRunning: false });
        }
      }
    });
  } catch (_) {}

  // SINKRONISASI REALTIME PREFERENSI (Auto-Click, Auto-Next, Agent) DARI POPUP
  try {
    chrome.storage?.onChanged?.addListener(function(changes, area) {
      if (area === "local") {
        if (changes.autoClick !== undefined) {
          autoClickEnabled = changes.autoClick.newValue === true;
          var chkClick = hudElement?.querySelector("#hud-autoclick-chk");
          if (chkClick) chkClick.checked = autoClickEnabled;
        }
        if (changes.autoNext !== undefined) {
          autoNextEnabled = changes.autoNext.newValue === true;
          var chkNext = hudElement?.querySelector("#hud-autonext-chk");
          if (chkNext) chkNext.checked = autoNextEnabled;
        }
        if (changes.isAgentRunning !== undefined) {
          isAgentRunning = changes.isAgentRunning.newValue === true;
          updateHudRunningState(isAgentRunning);
        }
      }
    });
  } catch (_) {}

  // === 1. ROUTER KOMUNIKASI DENGAN POPUP & BACKGROUND ===
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (!msg) return false;

    // Update preferensi langsung dari popup
    if (msg.type === "UPDATE_SETTINGS") {
      if (msg.autoClick !== undefined) {
        autoClickEnabled = !!msg.autoClick;
        var chkClick = hudElement?.querySelector("#hud-autoclick-chk");
        if (chkClick) chkClick.checked = autoClickEnabled;
      }
      if (msg.autoNext !== undefined) {
        autoNextEnabled = !!msg.autoNext;
        var chkNext = hudElement?.querySelector("#hud-autonext-chk");
        if (chkNext) chkNext.checked = autoNextEnabled;
      }
      sendResponse({ success: true, autoClickEnabled: autoClickEnabled, autoNextEnabled: autoNextEnabled });
      return false;
    }

    // Ping check
    if (msg.type === "PING") {
      sendResponse({ pong: true, isAgentRunning: isAgentRunning });
      return false;
    }

    // Ekstraksi teks & visual
    if (msg.type === "GET_PAGE_TEXT") {
      try {
        var info = extractPageInfo();
        sendResponse(info);
      } catch (err) {
        sendResponse({ text: "", title: document.title, hasVisuals: false, error: err.message });
      }
      return false;
    }

    // Auto-Click Opsi Pilihan Ganda
    if (msg.type === "AUTO_CLICK_ANSWER") {
      try {
        var targetLetter = (msg.letter || "").trim().toUpperCase();
        var snippet = (msg.snippet || msg.text || "").trim();
        var clicked = findAndClickOption(targetLetter, snippet);
        sendResponse({ success: !!clicked, letter: targetLetter, text: clicked });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      return false;
    }

    // Auto-Fill Esai
    if (msg.type === "AUTO_FILL_ESSAY") {
      try {
        var filled = findAndFillEssay(msg.text || "");
        sendResponse({ success: !!filled, targetType: filled });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      return false;
    }

    // Auto-Next
    if (msg.type === "TRIGGER_AUTO_NEXT") {
      try {
        if (!isAnswerActuallySelectedOnPage()) {
          sendResponse({ success: false, notAnswered: true, message: "Jawaban belum terisi di halaman web." });
          return false;
        }
        var nextRes = findAndClickNextButton();
        sendResponse(nextRes);
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      return false;
    }

    // Deteksi Status Tombol Next (apakah nomor terakhir / kumpulkan)
    if (msg.type === "DETECT_NEXT_STATE") {
      try {
        var nextState = detectNextButtonState();
        sendResponse(nextState);
      } catch (err) {
        sendResponse({ hasNext: false, isFinalSubmit: false });
      }
      return false;
    }

    // Toggle Auto-Pilot dari Popup
    if (msg.type === "TOGGLE_AUTOPILOT") {
      if (msg.running) {
        if (msg.autoNext !== undefined) {
          autoNextEnabled = !!msg.autoNext;
        } else {
          autoNextEnabled = true;
        }
        if (msg.autoClick !== undefined) {
          autoClickEnabled = !!msg.autoClick;
        }
        startAutoPilotLoop();
      } else {
        stopAutoPilot();
      }
      sendResponse({ success: true, isAgentRunning: isAgentRunning });
      return false;
    }

    // Tampilkan / Sembunyikan Panel HUD
    if (msg.type === "TOGGLE_HUD") {
      toggleHudVisibility();
      sendResponse({ success: true });
      return false;
    }

    return false;
  });

  // === 2. HELPER ISOLASI HUD DARI ELEMENT HALAMAN ===
  function isHudElement(el) {
    if (!el) return false;
    if (el.id === "ai-study-agent-hud" || (typeof el.id === "string" && el.id.startsWith("hud-"))) return true;
    if (el.closest && el.closest("#ai-study-agent-hud")) return true;
    return false;
  }

  // === 3. EKSTRAKSI TEKS & SENSOR VISUAL (BEBAS POLUSI HUD) ===
  function extractPageInfo() {
    var hud = document.getElementById("ai-study-agent-hud");
    var prevDisplay = "";
    if (hud) {
      prevDisplay = hud.style.display;
      hud.style.display = "none";
    }

    var text = (document.body && (document.body.innerText || document.body.textContent) || "").trim();

    if (hud) {
      hud.style.display = prevDisplay;
    }

    // Bersihkan teks polusi dari watermark dan baris kosong berlebih
    text = text.replace(/bytegar/gi, "")
               .replace(/[\r\n]{3,}/g, "\n\n")
               .trim();

    var visualElements = Array.from(document.querySelectorAll("img, svg, canvas, picture, [role='img']")).filter(function(el) {
      try {
        if (isHudElement(el)) return false;
        var rect = el.getBoundingClientRect();
        return rect.width > 45 && rect.height > 45 && rect.top < window.innerHeight && rect.bottom > 0;
      } catch (_) {
        return false;
      }
    });

    return {
      text: text.slice(0, 4500),
      title: document.title,
      hasVisuals: visualElements.length > 0,
      visualCount: visualElements.length
    };
  }

  function isVisualProblem(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var patterns = [
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
    return patterns.some(function(p) { return p.test(lower); });
  }

  // === 4. HELPER TEKS & ELEMEN KELAS (AMAN DARI SVG ANIMATED STRING) ===
  function getElementClassName(el) {
    if (!el) return "";
    try {
      if (typeof el.className === "string") return el.className;
      if (el.className && typeof el.className.baseVal === "string") return el.className.baseVal;
      if (el.getAttribute) {
        var attr = el.getAttribute("class");
        if (typeof attr === "string") return attr;
      }
      return String(el.className || "");
    } catch (_) {
      return "";
    }
  }

  function cleanText(t) {
    return (t || "").toLowerCase().replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function stripLetterPrefix(text) {
    if (!text) return "";
    return text.trim().replace(/^[\(\[]?[A-I1-9][\)\.\:\-\s\]\}]+\s*/i, "").trim();
  }

  function letterToIndex(letter) {
    if (!letter) return -1;
    var str = letter.toString().trim().toUpperCase();
    var code = str.charCodeAt(0);
    if (code >= 65 && code <= 90) return code - 65; // A..Z -> 0..25
    if (code >= 49 && code <= 57) return code - 49; // 1..9 -> 0..8
    return -1;
  }

  function matchesLetterPrefix(text, letter) {
    if (!text || !letter) return false;
    var trimmed = text.trim();
    var escaped = letter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Cocokkan 'C. ', 'C) ', '(C) ', '[C] ', '{C} ', 'C - ', 'C : ', 'C ', atau awalan huruf dengan icon/simbol/emoji apa pun di depannya
    var re = new RegExp('^(?:[^a-zA-Z0-9]*' + escaped + '[\\)\\.\\-\\:\\s\\]\\}]|' + escaped + '\\b|' + escaped + '$)', 'i');
    return re.test(trimmed);
  }

  // === 5. UNIVERSAL AUTO-CLICK OPSI PILIHAN GANDA (100% AKURAT & BEBAS MISS) ===
  function findAndClickOption(letter, snippet) {
    var upperLetter = (letter || "").toString().trim().toUpperCase();
    var rawTarget = (snippet || "").trim();
    var cleanSnippet = cleanText(rawTarget);

    // Ekstraksi nilai variabel atau angka murni:
    // Mendukung: "x = 7", "nilai x = 7", "x = -4", "x = 1/2", "x = 3.5", "-4", "7", "x = y", "x > y", dsb.
    var varMatch = rawTarget.match(/^(?:(?:nilai\s*)?[a-z]\s*=\s*)(.+)$/i);
    var pureNum = "";
    if (varMatch) {
      pureNum = varMatch[1].trim();
    } else {
      var numMatch = rawTarget.match(/^(-?\d+(?:[\.,\/]\d+)?)/i);
      if (numMatch) pureNum = numMatch[1].trim();
    }

    // Jika upperLetter ternyata berupa angka murni (misal: "3" dari "Jawaban: 3"), jadikan pureNum jika belum ada
    if (!pureNum && /^-?\d+$/.test(upperLetter)) {
      pureNum = upperLetter;
    }

    var isRealLetter = upperLetter && /^[A-Z]$/.test(upperLetter);
    var letterIndex = isRealLetter ? letterToIndex(upperLetter) : -1;
    var numStr = letterIndex >= 0 ? String(letterIndex + 1) : "";

    if (!upperLetter && !cleanSnippet && !pureNum) return null;

    // Filter seluruh kandidat elemen opsi di halaman (abaikan HUD dan tombol submit/finish ujian)
    var candidateOptions = Array.from(document.querySelectorAll(
      "[class*='option' i], [class*='choice' i], [class*='answer' i], [class*='pilihan' i], [class*='item' i], [class*='card' i], [class*='check' i], [class*='radio' i], [class*='row' i], [class*='group' i], [class*='selection' i], [class*='btn' i], [role='radio'], [role='checkbox'], [role='button'], label, button, a, li, tr, td, input[type='radio'], input[type='checkbox'], input[type='button'], input[type='submit'], [data-value], [data-choice], [data-opt], [data-answer]"
    )).filter(function(el) {
      if (!isElementVisible(el) || isHudElement(el)) return false;
      var elTxt = (el.textContent || el.innerText || el.value || "").trim();
      if (isForbiddenButton(elTxt)) return false;
      return el.children.length <= 15;
    });

    // --- TIER 0: SCANNING RADIO LANGSUNG (ANTI-GAGAL UNTUK OPSI TANPA KELAS SEPERTI OPSI D) ---
    var allRadios = Array.from(document.querySelectorAll("input[type='radio'], input[type='checkbox']")).filter(function(r) {
      return !isHudElement(r) && isElementVisible(r.parentElement || r);
    });

    if (allRadios.length > 0) {
      // 0a. Cari radio yang label, parent, atau siblingnya cocok dengan Huruf (misal: "D. Federal" atau "D.")
      if (isRealLetter) {
        for (var ri = 0; ri < allRadios.length; ri++) {
          var rInput = allRadios[ri];
          var rVal = (rInput.value || rInput.getAttribute("data-value") || rInput.getAttribute("data-choice") || "").trim().toUpperCase();
          var rLabel = rInput.id ? document.querySelector("label[for='" + rInput.id + "']") : null;
          if (!rLabel) rLabel = rInput.closest("label") || rInput.parentElement;
          var rText = (rLabel ? (rLabel.textContent || rLabel.innerText || "") : "") ||
                      (rInput.nextSibling ? (rInput.nextSibling.textContent || "") : "");
          
          if (rVal === upperLetter || (numStr && rVal === numStr && rVal !== "ON") || matchesLetterPrefix(rText.trim(), upperLetter)) {
            var rClean = cleanText(rText);
            if (!cleanSnippet && !pureNum) {
              var res0a = activateOption(rInput);
              if (res0a) return rText.trim() || ("Opsi " + upperLetter);
            } else if ((cleanSnippet && rClean.includes(cleanSnippet)) || (pureNum && rClean.includes(pureNum)) || matchesLetterPrefix(rText.trim(), upperLetter)) {
              var res0a2 = activateOption(rInput);
              if (res0a2) return rText.trim() || ("Opsi " + upperLetter);
            }
          }
        }
      }

      // 0b. Cari radio yang teks label/sibling/parent cocok dengan teks snippet atau pureNum
      if (cleanSnippet || pureNum) {
        for (var rj = 0; rj < allRadios.length; rj++) {
          var rInput2 = allRadios[rj];
          var rLabel2 = rInput2.id ? document.querySelector("label[for='" + rInput2.id + "']") : null;
          if (!rLabel2) rLabel2 = rInput2.closest("label") || rInput2.parentElement;
          var rText2 = (rLabel2 ? (rLabel2.textContent || rLabel2.innerText || "") : "") ||
                       (rInput2.nextSibling ? (rInput2.nextSibling.textContent || "") : "");
          var rClean2 = cleanText(rText2);
          var isMatch2 = (cleanSnippet && rClean2.includes(cleanSnippet)) || (pureNum && rClean2.includes(pureNum));
          if (isMatch2) {
            var res0b = activateOption(rInput2);
            if (res0b) return rText2.trim() || cleanSnippet;
          }
        }
      }

      // 0c. Jika ada persis sejumlah opsi kuis (misal 4 atau 5 radio) dan huruf A-E, cocokkan via index radio
      if (isRealLetter && letterIndex >= 0 && letterIndex < allRadios.length && (allRadios.length === 4 || allRadios.length === 5)) {
        var indexedRadio = allRadios[letterIndex];
        var res0c = activateOption(indexedRadio);
        if (res0c) return "Opsi " + upperLetter + " (Index " + letterIndex + ")";
      }
    }

    // --- TIER 1: MATCH LENGKAP: HURUF DAN TEKS/ANGKA OPSI COCOK SEKALIGUS (100% PRESISI) ---
    // Contoh: "C. 7" saat jawaban C dan nilai x = 7, atau "C. Jakarta"
    if (isRealLetter && (cleanSnippet || pureNum)) {
      for (var i = 0; i < candidateOptions.length; i++) {
        var el = candidateOptions[i];
        var elText = (el.textContent || el.innerText || el.value || "").trim();
        var elClean = cleanText(elText);
        var isNumMatch = false;
        if (pureNum) {
          if (elClean === pureNum || elClean.includes(pureNum)) {
            isNumMatch = true;
          } else {
            try {
              var escaped = pureNum.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
              if (new RegExp('(^|\\s|[=><])' + escaped + '($|\\s|[,.;])').test(elClean)) {
                isNumMatch = true;
              }
            } catch (_) {}
          }
        }
        var matchText = (cleanSnippet && elClean.includes(cleanSnippet)) || isNumMatch;
        if (matchesLetterPrefix(elText, upperLetter) && matchText) {
          var res1 = activateOption(el);
          if (res1) return elText.slice(0, 50);
        }
      }
    }

    // --- TIER 2: MATCH TEKS PERSIS ATAU NILAI ANGKA PERSIS (MENDUKUNG ANGKA 1 DIGIT SEPERTI '3', '8', '7') ---
    // Contoh: "7" cocok persis dengan opsi "C. 7" atau opsi "7"
    if (cleanSnippet || pureNum) {
      for (var j = 0; j < candidateOptions.length; j++) {
        var opt = candidateOptions[j];
        var raw = (opt.textContent || opt.innerText || opt.value || "").trim();
        var c = cleanText(raw);
        var stripped = cleanText(stripLetterPrefix(raw));

        var isTier2NumMatch = false;
        if (pureNum) {
          if (c === pureNum || stripped === pureNum) isTier2NumMatch = true;
          else {
            try {
              var esc2 = pureNum.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
              if (new RegExp('(^|\\s|[=><])' + esc2 + '($|\\s|[,.;])').test(c) || new RegExp('(^|\\s|[=><])' + esc2 + '($|\\s|[,.;])').test(stripped)) {
                isTier2NumMatch = true;
              }
            } catch (_) {}
          }
        }

        if (c === cleanSnippet || stripped === cleanSnippet || isTier2NumMatch) {
          var res2 = activateOption(opt);
          if (res2) return raw.slice(0, 50);
        }

        if (cleanSnippet.length >= 4 && stripped.startsWith(cleanSnippet)) {
          var res2b = activateOption(opt);
          if (res2b) return raw.slice(0, 50);
        }
      }
    }

    // --- TIER 3: INPUT RADIO / CHECKBOX / TOMBOL DENGAN VALUE ATAU LABEL SESUAI ---
    var inputs = Array.from(document.querySelectorAll("input[type='radio'], input[type='checkbox'], input[type='button'], input[type='submit']")).filter(function(inp) {
      return !isHudElement(inp) && isElementVisible(inp.parentElement || inp);
    });

    for (var k = 0; k < inputs.length; k++) {
      var input = inputs[k];
      var val = (input.value || input.getAttribute("data-value") || input.getAttribute("data-choice") || "").trim().toUpperCase();

      var labelEl = input.id ? document.querySelector("label[for='" + input.id + "']") : null;
      if (!labelEl) labelEl = input.closest("label") || input.parentElement;
      var labelTxt = labelEl ? (labelEl.textContent || labelEl.innerText || "").trim() : "";
      var cleanLabel = cleanText(labelTxt);
      var strippedLabel = cleanText(stripLetterPrefix(labelTxt));

      // 3a. Value input sesuai huruf (value="C" / value="c" / data-value="C")
      if (isRealLetter && val === upperLetter) {
        var targetCard1 = input.closest(".option-item, [class*='option' i], [class*='choice' i], [class*='answer' i], [class*='pilihan' i], label, [role='button']") || input;
        var res3a = activateOption(targetCard1);
        if (res3a) return labelTxt || ("Opsi " + upperLetter);
      }

      // 3b. Label radio cocok dengan huruf awalan & teks/angka
      if (isRealLetter && matchesLetterPrefix(labelTxt, upperLetter)) {
        if (!cleanSnippet || cleanLabel.includes(cleanSnippet) || (pureNum && cleanLabel.includes(pureNum))) {
          var targetCard2 = input.closest(".option-item, [class*='option' i], [class*='choice' i], [class*='answer' i], [class*='pilihan' i], label, [role='button']") || labelEl || input;
          var res3b = activateOption(targetCard2);
          if (res3b) return labelTxt.slice(0, 50);
        }
      }

      // 3c. Label radio cocok dengan teks jawaban atau angka murni
      if ((cleanSnippet && cleanLabel.includes(cleanSnippet)) || (pureNum && (strippedLabel === pureNum || cleanLabel === pureNum))) {
        var targetCard3 = input.closest(".option-item, [class*='option' i], [class*='choice' i], [class*='answer' i], [class*='pilihan' i], label, [role='button']") || labelEl || input;
        var res3c = activateOption(targetCard3);
        if (res3c) return labelTxt.slice(0, 50);
      }

      // 3d. Value 1-based numeric (A=1, B=2, C=3, dll) HANYA jika value adalah angka murni
      if (numStr && val === numStr && val !== "ON") {
        var targetCard4 = input.closest(".option-item, [class*='option' i], [class*='choice' i], [class*='answer' i], [class*='pilihan' i], label, [role='button']") || input;
        var res3d = activateOption(targetCard4);
        if (res3d) return labelTxt || ("Opsi " + numStr);
      }
    }

    // --- TIER 4: OPSI DENGAN AWALAN HURUF (A. ..., B) ..., (C)) HANYA JIKA HURUF A-Z ASLI ---
    if (isRealLetter) {
      for (var l = 0; l < candidateOptions.length; l++) {
        var cand = candidateOptions[l];
        var cText = (cand.textContent || cand.innerText || cand.value || "").trim();
        if (matchesLetterPrefix(cText, upperLetter)) {
          var res4 = activateOption(cand);
          if (res4) return cText.slice(0, 50);
        }
      }
    }

    // --- TIER 4b: NILAI ANGKA MURNI DI DALAM OPSI DENGAN WORD-BOUNDARY (Untuk soal nilai x = angka) ---
    if (pureNum) {
      for (var n = 0; n < candidateOptions.length; n++) {
        var candNum = candidateOptions[n];
        var candRaw = (candNum.textContent || candNum.innerText || candNum.value || "").trim();
        var candStripped = cleanText(stripLetterPrefix(candRaw));
        if (candStripped === pureNum || new RegExp('\\b' + pureNum + '\\b').test(candStripped)) {
          var res4b = activateOption(candNum);
          if (res4b) return candRaw.slice(0, 50);
        }
      }
    }

    // --- TIER 5: SUBSTRING TEKS PADA ELEMEN KLIK (Jika teks sedikit bervariasi) ---
    if (cleanSnippet && cleanSnippet.length >= 4) {
      for (var m = 0; m < candidateOptions.length; m++) {
        var cElem = candidateOptions[m];
        var cTxt = cleanText(cElem.textContent || cElem.innerText || cElem.value || "");
        if (cTxt.includes(cleanSnippet) && cTxt.length <= cleanSnippet.length + 30) {
          var res5 = activateOption(cElem);
          if (res5) return (cElem.textContent || cElem.value || "").trim().slice(0, 50);
        }
      }
    }

    // --- TIER 6: URUTAN INDEX KARTU (Fallback cerdas untuk kuis bergambar, matriks IQ, atau opsi tanpa huruf) ---
    if (letterIndex >= 0) {
      // 6a. Khusus Tes IQ / Soal Bergambar: Cari container di dekat judul "Choose your answer" / opsi bergambar
      var answerHeading = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, p, span, div, b")).find(function(el) {
        if (!isElementVisible(el) || isHudElement(el)) return false;
        var t = (el.textContent || "").trim().toLowerCase();
        return t === "choose your answer:" || t === "choose your answer" || t === "select answer" || t === "pilihan jawaban:" || t.includes("choose your answer");
      });

      if (answerHeading) {
        var parentBox = answerHeading.parentElement || document.body;
        // Cari container yang membungkus kartu-kartu jawaban di dekat judul ini
        var cardGroups = Array.from(parentBox.querySelectorAll("div, section, ul")).filter(function(g) {
          if (!isElementVisible(g) || isHudElement(g) || g.contains(answerHeading)) return false;
          var directCards = Array.from(g.children).filter(function(ch) {
            if (!isElementVisible(ch) || isHudElement(ch)) return false;
            var r = ch.getBoundingClientRect();
            return r.width >= 35 && r.height >= 35 && (ch.querySelector("img, svg, canvas") || ch.tagName === "IMG" || ch.tagName === "SVG");
          });
          return directCards.length >= 2 && directCards.length <= 16;
        });

        if (cardGroups.length > 0) {
          cardGroups.sort(function(a, b) { return b.children.length - a.children.length; });
          var bestGroup = cardGroups[0];
          var visualCards = Array.from(bestGroup.children).filter(function(ch) {
            return isElementVisible(ch) && !isHudElement(ch);
          });

          // Urutkan kartu secara natural (atas ke bawah, lalu kiri ke kanan)
          visualCards.sort(function(a, b) {
            var ra = a.getBoundingClientRect();
            var rb = b.getBoundingClientRect();
            if (Math.abs(ra.top - rb.top) > 25) return ra.top - rb.top;
            return ra.left - rb.left;
          });

          if (letterIndex < visualCards.length) {
            var iqCard = visualCards[letterIndex];
            var resIq = activateOption(iqCard);
            if (resIq) return "Kartu IQ ke-" + (letterIndex + 1) + " (" + upperLetter + ")";
          }
        }
      }

      // 6b. Pencarian Universal Kontainer Pilihan Ganda & Grid Opsi
      var containers = Array.from(document.querySelectorAll(
        "[role='radiogroup'], fieldset, [class*='option' i], [class*='choice' i], [class*='answer' i], [class*='pilihan' i], [class*='soal' i], [class*='quiz' i], [class*='question' i], [class*='matrix' i], [class*='grid' i], ul, ol, form, div, section"
      )).filter(function(c) {
        if (!isElementVisible(c) || isHudElement(c)) return false;
        var classId = `${getElementClassName(c)} ${c.id || ""}`.toLowerCase();
        if (classId.includes("nav") || classId.includes("header") || classId.includes("footer") || classId.includes("menu") || classId.includes("tool") || classId.includes("pagination") || classId.includes("pager") || classId.includes("indicator")) return false;

        var hasDots = Array.from(c.children).some(function(child) {
          var chClass = getElementClassName(child).toLowerCase();
          return chClass.includes("dot") || chClass.includes("page");
        });
        if (hasDots) return false;

        var children = Array.from(c.children).filter(function(child) {
          if (!isElementVisible(child) || isHudElement(child)) return false;
          var style = window.getComputedStyle ? window.getComputedStyle(child) : {};
          return child.tagName === "BUTTON" || child.tagName === "LI" || child.tagName === "LABEL" ||
            child.tagName === "A" || child.getAttribute("role") === "button" || child.getAttribute("role") === "radio" ||
            style.cursor === "pointer" || child.querySelector("input[type='radio'], input[type='checkbox'], img, svg, [role='radio'], canvas") ||
            child.tagName === "IMG" || child.tagName === "SVG" || child.tagName === "CANVAS";
        });

        return children.length >= 2 && children.length <= 16;
      });

      // Beri bobot lebih tinggi pada kontainer yang memiliki kartu gambar / ada kata kunci pilihan
      containers.sort(function(a, b) {
        var scoreA = 0;
        var scoreB = 0;
        var idClassA = `${getElementClassName(a)} ${a.id || ""}`.toLowerCase();
        var idClassB = `${getElementClassName(b)} ${b.id || ""}`.toLowerCase();
        if (idClassA.includes("option") || idClassA.includes("choice") || idClassA.includes("answer") || idClassA.includes("pilihan")) scoreA += 10;
        if (idClassB.includes("option") || idClassB.includes("choice") || idClassB.includes("answer") || idClassB.includes("pilihan")) scoreB += 10;
        if (a.querySelector("input[type='radio'], [role='radio']")) scoreA += 8;
        if (b.querySelector("input[type='radio'], [role='radio']")) scoreB += 8;
        if (a.querySelector("img, svg, canvas")) scoreA += 12;
        if (b.querySelector("img, svg, canvas")) scoreB += 12;
        return scoreB - scoreA;
      });

      for (var ct = 0; ct < containers.length; ct++) {
        var grp = containers[ct];
        var grpChildren = Array.from(grp.children).filter(function(child) {
          if (!isElementVisible(child) || isHudElement(child)) return false;
          var style = window.getComputedStyle ? window.getComputedStyle(child) : {};
          return child.tagName === "BUTTON" || child.tagName === "LI" || child.tagName === "LABEL" ||
            child.tagName === "A" || child.getAttribute("role") === "button" || child.getAttribute("role") === "radio" ||
            style.cursor === "pointer" || child.querySelector("input[type='radio'], input[type='checkbox'], img, svg, [role='radio'], canvas") ||
            child.tagName === "IMG" || child.tagName === "SVG" || child.tagName === "CANVAS";
        });

        if (grpChildren.length >= 2 && letterIndex < grpChildren.length) {
          var targetOption = grpChildren[letterIndex];
          var res6 = activateOption(targetOption);
          if (res6) return "Opsi ke-" + (letterIndex + 1) + " (" + upperLetter + ")";
        }
      }
    }

    return null;
  }

  // === 6. AUTO-FILL ESAI & INPUT TEXT ===
  function hasActiveEssayField() {
    var textareas = Array.from(document.querySelectorAll("textarea:not([disabled]):not([readonly])")).filter(function(ta) {
      return !isHudElement(ta) && isElementVisible(ta);
    });
    if (textareas.length > 0) return true;

    var editables = Array.from(document.querySelectorAll("[contenteditable='true'], [role='textbox']")).filter(function(ed) {
      return !isHudElement(ed) && isElementVisible(ed);
    });
    if (editables.length > 0) return true;

    var inputs = Array.from(document.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='radio']):not([type='checkbox']):not([type='file']):not([disabled]):not([readonly])")).filter(function(inp) {
      if (isHudElement(inp) || !isElementVisible(inp)) return false;
      var meta = `${inp.name || ""} ${inp.id || ""} ${inp.placeholder || ""}`.toLowerCase();
      return !meta.includes("search") && !meta.includes("token") && !meta.includes("pass");
    });
    return inputs.length > 0;
  }

  function hasMultipleChoiceOptionsOnPage() {
    var radios = Array.from(document.querySelectorAll("input[type='radio'], [role='radio'], .option-item, [class*='option-item' i], [class*='choice-item' i], [class*='answer-item' i]")).filter(function(el) {
      return !isHudElement(el) && isElementVisible(el);
    });
    if (radios.length >= 2) return true;

    var choices = Array.from(document.querySelectorAll("label, button, li, [class*='option' i], [class*='choice' i], [class*='pilihan' i]")).filter(function(el) {
      if (isHudElement(el) || !isElementVisible(el)) return false;
      var txt = (el.textContent || "").trim();
      return /^[A-E][\.\)\-\:]\s+/i.test(txt);
    });
    return choices.length >= 2;
  }

  function findAndFillEssay(rawText) {
    if (!rawText) return null;
    
    // 1. Bersihkan think block, hitungan tertutup, badge, dan prefix kunci/jawaban dengan regex multiline (/gim)
    var cleanText = rawText
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/\[(?:hitungan|langkah|scratchpad|analisis|cara)[\s\S]*?\]/gi, "")
      .replace(/^(?:🎯|✍️|💡|📝)\s*\[[^\]]+\]\s*/gim, "")
      .replace(/^\s*(?:kunci\s*jawaban|kunci|jawaban(?:nya)?|opsi|pilihan)(?:\s*(?:yang benar|yang tepat)?\s*(?:adalah|yaitu)?)?\s*[:\-]\s*/gim, "")
      .replace(/[*_`#]/g, "")
      .trim();

    var ansInfo = extractAnswerInfo(rawText);
    var conciseAnswer = (ansInfo.targetText || ansInfo.firstLine || "").replace(/^\s*(?:kunci\s*jawaban|kunci|jawaban(?:nya)?|opsi|pilihan)\s*[:\-]\s*/i, "").trim();
    if (!conciseAnswer) conciseAnswer = cleanText.split("\n")[0].trim();

    // 2. Prioritas 1: Textarea aktif (untuk soal esai / uraian panjang)
    var textareas = Array.from(document.querySelectorAll("textarea:not([disabled]):not([readonly])")).filter(function(ta) {
      return !isHudElement(ta);
    });
    for (var ta = 0; ta < textareas.length; ta++) {
      if (isElementVisible(textareas[ta])) {
        fillInput(textareas[ta], cleanText || conciseAnswer);
        return "textarea";
      }
    }

    // 3. Prioritas 2: Rich text editor / Contenteditable / role='textbox' (Quill, CKEditor, contenteditable div)
    var editables = Array.from(document.querySelectorAll("[contenteditable='true'], [role='textbox']")).filter(function(ed) {
      return !isHudElement(ed);
    });
    for (var ed = 0; ed < editables.length; ed++) {
      if (isElementVisible(editables[ed])) {
        try {
          var targetEd = editables[ed];
          targetEd.focus();
          var textToPut = cleanText || conciseAnswer;
          var successExec = false;
          try {
            document.execCommand("selectAll", false, null);
            successExec = document.execCommand("insertText", false, textToPut);
          } catch (_) {}
          if (!successExec || !(targetEd.innerText || targetEd.textContent || "").trim()) {
            targetEd.innerText = textToPut;
          }
          if (typeof InputEvent !== "undefined") {
            try { targetEd.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: textToPut })); } catch (_) {}
          }
          targetEd.dispatchEvent(new Event("input", { bubbles: true }));
          targetEd.dispatchEvent(new Event("change", { bubbles: true }));
          targetEd.dispatchEvent(new Event("blur", { bubbles: true }));
          targetEd.dispatchEvent(new Event("focusout", { bubbles: true }));
          highlightElement(targetEd);
          return "contenteditable";
        } catch (_) {}
      }
    }

    // 4. Prioritas 3: Input teks atau angka (untuk soal isian singkat / CBT short-answer)
    var inputs = Array.from(document.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='radio']):not([type='checkbox']):not([type='file']):not([disabled]):not([readonly])")).filter(function(inp) {
      return !isHudElement(inp);
    });
    for (var inp = 0; inp < inputs.length; inp++) {
      var meta = `${inputs[inp].name || ""} ${inputs[inp].id || ""} ${inputs[inp].placeholder || ""}`.toLowerCase();
      if (!meta.includes("search") && !meta.includes("cari") && !meta.includes("token") && !meta.includes("pass") && isElementVisible(inputs[inp])) {
        var cleanLines = cleanText.split("\n").map(function(l) { return l.trim(); }).filter(Boolean);
        var joinedLines = cleanLines.join(", ");
        var textForInput = (joinedLines && joinedLines.length < 250) ? joinedLines : ((conciseAnswer && conciseAnswer.length < 120) ? conciseAnswer : (cleanLines[0] || cleanText));
        fillInput(inputs[inp], textForInput);
        return "input";
      }
    }

    return null;
  }

  function fillInput(el, text) {
    try {
      el.focus();
      // Dukung setter native untuk React, Vue, & Angular controlled input
      var proto = el.tagName === "TEXTAREA" ? (window.HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : null) : (window.HTMLInputElement ? window.HTMLInputElement.prototype : null);
      var nativeSetter = proto ? Object.getOwnPropertyDescriptor(proto, "value")?.set : null;
      if (nativeSetter) {
        nativeSetter.call(el, text);
      } else {
        el.value = text;
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      if (typeof InputEvent !== "undefined") {
        el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
      }
      el.dispatchEvent(new Event("blur", { bubbles: true }));
      el.dispatchEvent(new Event("focusout", { bubbles: true }));
      highlightElement(el);
    } catch (_) {
      try {
        el.value = text;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.dispatchEvent(new Event("blur", { bubbles: true }));
        el.dispatchEvent(new Event("focusout", { bubbles: true }));
      } catch (_) {}
    }
  }

  // === 7. AUTO-NEXT DENGAN DETEKSI LENGKAP & ANTI DOBEL KLIK ===
  function isForbiddenButton(text) {
    if (!text) return false;
    var lower = text.toLowerCase().trim();
    var keywords = [
      "kumpul", "submit", "kirim", "selesai", "finish", "akhiri",
      "turn in", "end test", "complete", "login", "masuk", "sign in", "log in"
    ];
    return keywords.some(function(kw) { return lower.includes(kw); });
  }

  var lastNextClickTime = 0;

  // Deteksi nomor & total soal kuis (Mendukung pola standar, TemanCPNS '2/15 Dijawab' + 'Soal No. 1', dan grid nomor)
  function getQuizProgress() {
    var bodyText = (document.body && (document.body.innerText || document.body.textContent)) || "";
    var cleanText = bodyText.replace(/bytegar/gi, "").trim();

    // 1. Pola standar: "Soal No. 1 dari 15", "Question 1 of 50", "1 of 10", "Soal 1 / 15"
    var m = cleanText.match(/(?:soal|pertanyaan|nomor|no|question)\s*(?:no\.?)?\s*(\d+)\s*(?:of|\/|dari)\s*(\d+)/i);
    if (!m) m = cleanText.match(/\b(\d+)\s*(?:of|dari)\s*(\d+)\b/i);
    if (m) {
      var cur = parseInt(m[1], 10);
      var max = parseInt(m[2], 10);
      if (!isNaN(cur) && !isNaN(max) && max > 0) {
        return { current: cur, total: max, isLast: cur >= max };
      }
    }

    // 2. Pola TemanCPNS / CBT: Header memuat '2/15 Dijawab' atau 'Total: 15' dan judul 'Soal No. 1'
    var curM = cleanText.match(/(?:soal|pertanyaan|nomor|no|question)\s*(?:no\.?)?\s*(\d+)\b/i);
    var totalM = cleanText.match(/\b\d+\s*\/\s*(\d+)\s*(?:dijawab|soal|pertanyaan)?\b/i);
    if (!totalM) totalM = cleanText.match(/total\s*(?:soal|pertanyaan)?\s*[:\-]?\s*(\d+)/i);

    var curVal = curM ? parseInt(curM[1], 10) : 0;
    var maxVal = totalM ? parseInt(totalM[1], 10) : 0;

    if (curVal > 0 && maxVal > 0) {
      return { current: curVal, total: maxVal, isLast: curVal >= maxVal };
    }
    if (curVal > 0) {
      return { current: curVal, total: 0, isLast: false };
    }

    return { current: 0, total: 0, isLast: false };
  }

  // Helper untuk mengecek apakah elemen berada di header / topbar ujian (tombol header BUKAN tombol soal selanjutnya)
  function isHeaderNavElement(el) {
    if (!el) return false;
    try {
      if (el.closest("header, nav, [class*='header' i], [class*='navbar' i], [class*='topbar' i]")) return true;
      var r = el.getBoundingClientRect();
      if (r.top < 85 && (r.left > window.innerWidth * 0.6 || r.right < window.innerWidth * 0.35)) return true;
      return false;
    } catch (_) {
      return false;
    }
  }

  // HANYA MENDETEKSI TOMBOL NEXT TANPA PERNAH MENGKLIK
  function detectNextButtonState() {
    var progress = getQuizProgress();
    var definitelyNotLast = progress.total > 0 && progress.current > 0 && progress.current < progress.total;

    // Helper pengecek apakah elemen berada di dalam kartu opsi jawaban (bukan tombol navigasi)
    function isInsideOptionCard(el) {
      if (!el || !el.closest) return false;
      return !!el.closest(".option-item, [class*='option' i], [class*='choice' i], [class*='answer' i], [class*='pilihan' i], label");
    }

    // PASS 0: PENCARIAN LANGSUNG ELEMEN EKSPLISIT NAVIGASI MAJU DI HALAMAN (Button, A, Div, Span, Input)
    // Sangat efektif untuk mengatasi berbagai struktur framework (Tailwind, React, Vue, AntD, dsb)
    var explicitTextElements = Array.from(document.querySelectorAll("button, a, [role='button'], div, span, p, input[type='button'], input[type='submit']")).filter(function(el) {
      if (isHudElement(el) || !isElementVisible(el) || isHeaderNavElement(el) || isInsideOptionCard(el)) return false;
      if (el.disabled || el.getAttribute("aria-disabled") === "true") return false;
      var t = (el.textContent || el.innerText || el.value || "").trim().toLowerCase();
      if (!t || t.length > 40) return false;
      if (isForbiddenButton(t)) return false;
      if (t.match(/^(?:sebelumnya|kembali|back|prev|ragu|tandai|reset)/i)) return false;
      var classId = `${getElementClassName(el)} ${el.id || ""}`.toLowerCase();
      return (
        t === "selanjutnya" || t === "soal selanjutnya" || t === "soal selanjutnya >" || t === "soal selanjutnya &gt;" ||
        t === "berikutnya" || t === "soal berikutnya" || t === "soal berikutnya >" || t === "soal berikutnya →" ||
        t === "berikutnya >" || t === "berikutnya &gt;" ||
        t.startsWith("berikutnya") || t.startsWith("soal berikutnya") ||
        t === "lanjut" || t === "lanjutkan" ||
        t === "simpan & lanjutkan" || t === "simpan dan lanjutkan" ||
        t === "simpan & selanjutnya" || t === "simpan dan selanjutnya" ||
        t === "next" || t === "next question" || t.startsWith("next") ||
        t === "selanjutnya >" || t === "berikutnya →" || t === ">" || t === ">>" || t === "→" || t === "»" ||
        t.startsWith("soal selanjutnya") || t.startsWith("selanjutnya") ||
        classId.includes("btn-next") || classId.includes("nextbtn")
      );
    });

    if (explicitTextElements.length > 0) {
      var directEl = explicitTextElements[0].closest("button, a, [role='button']") || explicitTextElements[0];
      return { hasNext: true, isFinalSubmit: false, buttonText: (directEl.textContent || "Selanjutnya").trim(), nextElement: directEl };
    }

    // 1. Pagination "1 of 10", "1 dari 10", dsb. (HANYA JIKA TOMBOL BERADA PERSIS BERDAMPINGAN < 120px)
    var pageSpans = Array.from(document.querySelectorAll("span, p, b, div")).filter(function(el) {
      if (isHudElement(el) || isInsideOptionCard(el) || el.children.length > 2) return false;
      var txt = (el.textContent || "").trim();
      return /(?:\b\d+\s*(?:of|\/|dari)\s*\d+\b)/i.test(txt);
    });

    for (var ps = 0; ps < pageSpans.length; ps++) {
      var pageEl = pageSpans[ps];
      var container = pageEl.parentElement;
      for (var depth = 0; depth < 4 && container && container !== document.body; depth++) {
        var buttons = Array.from(container.querySelectorAll("button, a, input[type='button'], input[type='submit'], [role='button']")).filter(function(b) {
          if (isHudElement(b) || !isElementVisible(b) || b.disabled || b.getAttribute("aria-disabled") === "true") return false;
          if (b === pageEl || pageEl.contains(b) || b.contains(pageEl)) return false;
          if (isHeaderNavElement(b) || isInsideOptionCard(b)) return false;
          return true;
        });

        var pageRect = pageEl.getBoundingClientRect();
        var rightButtons = buttons.filter(function(b) {
          var r = b.getBoundingClientRect();
          var dist = r.left - pageRect.right;
          return dist >= -5 && dist <= 120 && r.width >= 16 && r.height >= 16;
        });

        if (rightButtons.length > 0) {
          rightButtons.sort(function(a, b) { return a.getBoundingClientRect().left - b.getBoundingClientRect().left; });
          var targetBtn = rightButtons[0];
          var btnText = (targetBtn.textContent || targetBtn.innerText || targetBtn.value || "").trim();
          if (isForbiddenButton(btnText)) {
            // HANYA jika benar-benar nomor terakhir terbukti, baru anggap final submit
            if (progress.isLast && progress.total > 1 && progress.current === progress.total) {
              return { hasNext: false, isFinalSubmit: true, buttonText: btnText, nextElement: null };
            }
          } else {
            return { hasNext: true, isFinalSubmit: false, buttonText: btnText || ">", nextElement: targetBtn };
          }
        }
        container = container.parentElement;
      }
    }

    // 2. Tombol Next Standar & Pencarian Komprehensif (Termasuk Tombol Simpan & SVG Arrow)
    var candidates = Array.from(document.querySelectorAll(
      "button, a, input[type='button'], input[type='submit'], [role='button'], [class*='btn' i], [class*='button' i], [class*='cursor-pointer' i], div[onclick], span[onclick]"
    )).filter(function(el) {
      if (isHudElement(el) || !isElementVisible(el) || el.disabled || el.getAttribute("aria-disabled") === "true") return false;
      if (isHeaderNavElement(el) || isInsideOptionCard(el)) return false;
      if (el.querySelector("button, a, input[type='button'], input[type='submit'], [role='button']")) return false;
      var text = (el.textContent || el.innerText || el.value || "").trim();
      if (text.length > 50) return false;
      return true;
    });

    var foundForbiddenInNav = null;
    var forwardMatch = null;
    var saveMatch = null;

    // PASS 1: Cari tombol navigasi maju eksplisit (Selanjutnya / Berikutnya / Lanjut / Simpan & Lanjutkan / Next / Arrow)
    for (var i = 0; i < candidates.length; i++) {
      var btn = candidates[i];
      var text = (btn.textContent || btn.innerText || btn.value || "").trim();
      var aria = (btn.getAttribute("aria-label") || "").trim().toLowerCase();
      var title = (btn.getAttribute("title") || "").trim().toLowerCase();
      var classId = `${getElementClassName(btn)} ${btn.id || ""}`.toLowerCase();
      var innerHtml = btn.innerHTML ? btn.innerHTML.toLowerCase() : "";

      if (isForbiddenButton(text) || isForbiddenButton(aria) || isForbiddenButton(title) || isForbiddenButton(btn.id || "")) {
        var bRect = btn.getBoundingClientRect();
        if (bRect.top > window.innerHeight * 0.3) {
          foundForbiddenInNav = text || "Kumpulkan / Selesai";
        }
        continue;
      }

      // Abaikan tombol mundur/kembali/ragu-ragu
      if (text.match(/^(?:sebelumnya|kembali|back|prev|ragu|tandai|reset)/i) || aria.match(/^(?:sebelumnya|kembali|back|prev)/i)) {
        continue;
      }

      var lower = text.toLowerCase();
      var cleanSym = lower.replace(/[\s\-_→>»]+/g, " ").trim();

      // Prioritas Utama: Navigasi Maju (Dilarang mencocokkan kata 'simpan' murni di pass ini agar tidak stuck di tempat)
      var isDirectForwardText = (
        lower.includes("selanjutnya") || lower.includes("berikutnya") ||
        lower.includes("lanjut") || lower.includes("continue") || lower.includes("forward") ||
        lower.includes("soal selanjutnya") || lower.includes("soal berikutnya") ||
        lower.includes("simpan & lanjut") || lower.includes("simpan dan lanjut") ||
        lower.includes("simpan & selanjutnya") || lower.includes("simpan dan selanjutnya") ||
        lower === ">" || lower === ">>" || lower === "→" || lower === "»" ||
        cleanSym === ">" || cleanSym === "→" ||
        aria.includes("next") || aria.includes("selanjutnya") || aria.includes("forward") || aria.includes("right") ||
        title.includes("next") || title.includes("selanjutnya") || title.includes("forward") ||
        classId.includes("btn-next") || classId.includes("next-btn") || classId.includes("nextbutton") ||
        classId.includes("btnnext") || classId.includes("next_btn")
      );

      // Deteksi ikon panah kanan (SVG Heroicons, Lucide, Feather, FontAwesome, dsb)
      var svgMatches = (
        innerHtml.includes("chevron-right") || innerHtml.includes("arrow-right") ||
        innerHtml.includes("arrow_forward") || innerHtml.includes("navigate_next") ||
        innerHtml.includes("chevron_right") ||
        innerHtml.includes("l7 7-7 7") || innerHtml.includes("l7.5 7.5-7.5 7.5") ||
        innerHtml.includes("9 18 15 12 9 6") || innerHtml.includes("m14 5") || innerHtml.includes("m9 5") ||
        innerHtml.includes("m13.5 4.5") || innerHtml.includes("m5 12h14")
      );

      if (isDirectForwardText || svgMatches) {
        forwardMatch = { hasNext: true, isFinalSubmit: false, buttonText: text || "Selanjutnya", nextElement: btn };
        break; // Ditemukan tombol maju definitif!
      }

      if (lower.includes("simpan jawaban") || lower === "simpan") {
        saveMatch = { hasNext: true, isFinalSubmit: false, buttonText: text || "Simpan", nextElement: btn };
      }
    }

    if (forwardMatch) return forwardMatch;

    // 3. Deteksi Heuristik Spasial: Tombol di baris navigasi bawah kuis sebelah kanan
    var navButtons = candidates.filter(function(b) {
      var r = b.getBoundingClientRect();
      var t = (b.textContent || b.innerText || "").trim().toLowerCase();
      if (t.match(/^(?:sebelumnya|kembali|back|prev|ragu|tandai|reset)/i)) return false;
      return r.top > window.innerHeight * 0.35 && r.left >= window.innerWidth * 0.35;
    });

    if (navButtons.length > 0) {
      navButtons.sort(function(a, b) { return b.getBoundingClientRect().left - a.getBoundingClientRect().left; });
      var spatialBtn = navButtons[0];
      var sText = (spatialBtn.textContent || spatialBtn.innerText || spatialBtn.value || "").trim();
      if (!isForbiddenButton(sText)) {
        return { hasNext: true, isFinalSubmit: false, buttonText: sText || "Selanjutnya", nextElement: spatialBtn };
      }
    }

    // 4. Deteksi navigasi tombol nomor soal berikutnya (misal sedang di Soal 1, cari kotak '2' di daftar nomor)
    if (progress.current > 0 && !progress.isLast) {
      var nextNumStr = String(progress.current + 1);
      var numCandidates = Array.from(document.querySelectorAll("button, a, [role='button'], div, span")).filter(function(el) {
        if (isHudElement(el) || !isElementVisible(el) || isHeaderNavElement(el) || isInsideOptionCard(el)) return false;
        var t = (el.textContent || el.innerText || "").trim();
        if (t !== nextNumStr || el.children.length > 0) return false;
        // VALIDASI KETAT: Periksa hingga 3 level ancestor untuk memastikan elemen ini bagian dari nomor palet
        var ancestor = el.parentElement;
        var ancestorText = "";
        for (var d = 0; d < 3 && ancestor && ancestor !== document.body; d++) {
          ancestorText += " " + (ancestor.textContent || "");
          ancestor = ancestor.parentElement;
        }
        var isRealPalette = /\b1\b/.test(ancestorText) || /\b3\b/.test(ancestorText) || /\b4\b/.test(ancestorText) || /\b5\b/.test(ancestorText);
        return isRealPalette;
      });
      if (numCandidates.length > 0) {
        var numEl = numCandidates[0].closest("button, a, [role='button']") || numCandidates[0];
        return { hasNext: true, isFinalSubmit: false, buttonText: "Soal " + nextNumStr, nextElement: numEl };
      }
    }

    if (saveMatch) return saveMatch;

    // 5. Final Submit HANYA JIKA memang terbukti nomor terakhir di kuis (misal Soal 15 dari 15)
    // DILARANG KERAS menganggap submit jika masih nomor awal (misal Soal 1) atau total belum terverifikasi!
    if (foundForbiddenInNav && progress.isLast && progress.total > 1 && progress.current === progress.total) {
      return { hasNext: false, isFinalSubmit: true, buttonText: foundForbiddenInNav, nextElement: null };
    }

    return { hasNext: false, isFinalSubmit: false, buttonText: "", nextElement: null };
  }

  // Lacak nomor soal yang terakhir kali dieksekusi klik Next (Anti-Dobel Klik / Anti-Skip)
  var lastNextClickedForQuestionNum = 0;
  var lastNextClickedForQuestionText = "";
  var sequentialQuestionCounter = 1;

  // Helper untuk melompat langsung ke nomor soal berikutnya melalui grid palet nomor CBT (HARUS URUT SEKUENSIAL)
  function clickNextQuestionNumberDirectly(expectedNextNum) {
    var progress = getQuizProgress();
    var current = progress.current || sequentialQuestionCounter;
    var targetNum = expectedNextNum || (current + 1);
    var targetNumStr = String(targetNum);

    var allNumElements = Array.from(document.querySelectorAll("button, a, [role='button'], div, span")).filter(function(el) {
      if (isHudElement(el) || !isElementVisible(el) || isHeaderNavElement(el) || isInsideOptionCard(el)) return false;
      var t = (el.textContent || el.innerText || "").trim();
      if (t !== targetNumStr || el.children.length > 0) return false;
      var ancestor = el.parentElement;
      var ancestorText = "";
      for (var d = 0; d < 3 && ancestor && ancestor !== document.body; d++) {
        ancestorText += " " + (ancestor.textContent || "");
        ancestor = ancestor.parentElement;
      }
      return /\b1\b/.test(ancestorText) || /\b2\b/.test(ancestorText) || /\b3\b/.test(ancestorText) || /\b4\b/.test(ancestorText) || /\b5\b/.test(ancestorText);
    });

    if (allNumElements.length > 0) {
      var targetNumEl = allNumElements[0].closest("button, a, [role='button']") || allNumElements[0];
      return clickNextButton(targetNumEl);
    }
    return false;
  }

  // === VERIFIKASI RIIL APAKAH JAWABAN SUDAH TERPILIH/TERISI DI HALAMAN ===
  function isAnswerActuallySelectedOnPage() {
    try {
      // 0. SENSOR NOTIFIKASI SIMPAN & STATUS TERSIMPAN (KUNCI UTAMA ANTI-GAGAL!)
      // Jika web sudah memunculkan notifikasi "✓ Tersimpan", "Tersimpan", "Jawaban Tersimpan", "Saved", dsb:
      // MAKA JAWABAN 100% SUDAH TERBUKTI TERSIMPAN DI SISTEM KUIS!
      var savedNotifs = Array.from(document.querySelectorAll(
        "#savedIndicator, .saved-status, [class*='saved-status' i], [class*='saved_status' i], .saved, [class*='saved' i], [class*='is-saved' i], [class*='answer-saved' i], [class*='terjawab' i], [class*='dijawab' i], [class*='sudah-dijawab' i], [id*='saved' i], [id*='simpan' i], span, div, p, b, strong, .badge, [class*='badge' i], .toast, [class*='toast' i], .alert, [class*='alert' i]"
      )).filter(function(el) {
        if (!el || isHudElement(el)) return false;
        var style = window.getComputedStyle ? window.getComputedStyle(el) : null;
        if (style && (style.display === "none" || style.visibility === "hidden" || style.opacity === "0")) return false;
        var r = el.getBoundingClientRect();
        if (r.width <= 0 && r.height <= 0) return false;
        
        var txt = (el.textContent || el.innerText || "").trim().toLowerCase();
        return (
          txt.includes("tersimpan") || txt.includes("disimpan") ||
          txt === "saved" || txt.includes("saved successfully") || txt.includes("answer saved") ||
          txt.includes("sudah dijawab") || txt.includes("jawaban tersimpan") ||
          txt.includes("berhasil disimpan") || txt.includes("status: tersimpan")
        );
      });
      if (savedNotifs.length > 0) return true;

      // 0b. Cek Palet Nomor Soal yang Berstatus Terisi/Terjawab (contoh .dot.filled, .dot.active.filled, .answered)
      var answeredDots = Array.from(document.querySelectorAll(
        ".dot.filled, [class*='dot' i][class*='filled' i], [class*='palette' i][class*='filled' i], [class*='number' i][class*='answered' i], [class*='item' i][class*='terjawab' i], [data-answered='true'], [data-status='answered']"
      )).filter(function(el) {
        if (!el || isHudElement(el)) return false;
        var style = window.getComputedStyle ? window.getComputedStyle(el) : null;
        if (style && (style.display === "none" || style.visibility === "hidden")) return false;
        return true;
      });
      var activeFilledDot = answeredDots.find(function(d) {
        var cl = getElementClassName(d).toLowerCase();
        return cl.includes("active") || cl.includes("current");
      });
      if (activeFilledDot) return true;

      // 1. Cek input radio atau checkbox HTML standar yang :checked
      var checkedInputs = Array.from(document.querySelectorAll("input[type='radio']:checked, input[type='checkbox']:checked")).filter(function(el) {
        return !isHudElement(el) && isElementVisible(el.parentElement || el);
      });
      if (checkedInputs.length > 0) return true;

      // 2. Cek atribut aksesibilitas ARIA (aria-checked='true' atau aria-selected='true')
      var ariaSelected = Array.from(document.querySelectorAll("[aria-checked='true'], [aria-selected='true']")).filter(function(el) {
        return !isHudElement(el) && isElementVisible(el);
      });
      if (ariaSelected.length > 0) return true;

      // 3. Cek data-state / data-checked pada web modern (Radix UI, Headless UI, React, dsb)
      var dataStateSelected = Array.from(document.querySelectorAll("[data-state='checked'], [data-checked='true'], [data-selected='true']")).filter(function(el) {
        return !isHudElement(el) && isElementVisible(el);
      });
      if (dataStateSelected.length > 0) return true;

      // 4. Cek class seleksi pada elemen yang merepresentasikan opsi / jawaban kuis (bukan tombol navigasi/HUD)
      var selectedElements = Array.from(document.querySelectorAll(
        ".selected, [class*='selected' i], [class*='checked' i], [class*='active' i], .pilihan-selected, .opsi-selected, .is-selected, .chosen"
      )).filter(function(el) {
        if (!isElementVisible(el) || isHudElement(el) || isHeaderNavElement(el)) return false;
        var elText = (el.textContent || el.innerText || "").trim().toLowerCase();
        if (isForbiddenButton(elText) || isNextButtonCandidate(el)) return false;
        var isOptionLike = el.matches("input, [role='radio'], [role='checkbox'], [class*='option' i], [class*='choice' i], [class*='answer' i], [class*='pilihan' i], label, li, tr, td") ||
          !!el.closest(".option-item, [class*='option' i], [class*='choice' i], [class*='answer' i], [class*='pilihan' i], label");
        return isOptionLike;
      });
      if (selectedElements.length > 0) return true;

      // 5. Cek jika soal bertipe isian / esai dan sudah terisi teks (input teks, angka, textarea, contenteditable, role='textbox')
      var essayElements = Array.from(document.querySelectorAll(
        "textarea, input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='radio']):not([type='checkbox']):not([type='file']), [contenteditable='true'], [role='textbox']"
      )).filter(function(el) {
        if (!el || isHudElement(el)) return false;
        var style = window.getComputedStyle ? window.getComputedStyle(el) : null;
        if (style && (style.display === "none" || style.visibility === "hidden")) return false;
        var meta = ((el.name || "") + " " + (el.id || "") + " " + (el.placeholder || "")).toLowerCase();
        if (meta.includes("search") || meta.includes("cari") || meta.includes("token") || meta.includes("password") || meta.includes("login")) return false;
        var val = "";
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          val = (el.value || "").trim();
        } else {
          val = (el.innerText || el.textContent || "").trim();
        }
        return val.length > 0;
      });
      if (essayElements.length > 0) return true;

      return false;
    } catch (_) {
      return false;
    }
  }

  // EKSEKUSI KLIK TOMBOL NEXT (SEKUENSIAL MUTLAK: 1 -> 2 -> 3 -> 4 -> 5, WAJIB TERJAWAB DULU)
  function findAndClickNextButton(expectedNextNum) {
    // 1. ATURAN MUTLAK: JAWABAN WAJIB BENAR-BENAR TERPILIH/TERISI DI HALAMAN SEBELUM BISA NEXT!
    if (!isAnswerActuallySelectedOnPage()) {
      return { success: false, notAnswered: true };
    }

    var progress = getQuizProgress();
    var currentNum = progress.current || sequentialQuestionCounter;
    var currentFullClean = cleanQuestionForComparison(extractPageInfo().text);

    // Reset lock jika soal terbukti sudah berganti (teks berbeda atau nomor bertambah)
    if (lastNextClickedForQuestionText && hasQuestionChanged(lastNextClickedForQuestionText, currentFullClean)) {
      lastNextClickedForQuestionNum = 0;
      lastNextClickedForQuestionText = "";
    }
    if (lastNextClickedForQuestionNum > 0 && currentNum > 0 && lastNextClickedForQuestionNum !== currentNum) {
      lastNextClickedForQuestionNum = 0;
      lastNextClickedForQuestionText = "";
    }

    // 2. ATURAN MUTLAK ANTI-SKIP: DILARANG MENEKAN NEXT DUA KALI PADA NOMOR SOAL YANG SAMA!
    if (lastNextClickedForQuestionNum > 0 && lastNextClickedForQuestionNum === currentNum) {
      return { success: false, alreadyClickedForThisQuestion: true, currentNum: currentNum };
    }
    if (lastNextClickedForQuestionText && !hasQuestionChanged(lastNextClickedForQuestionText, currentFullClean)) {
      return { success: false, alreadyClickedForThisQuestion: true, currentNum: currentNum };
    }

    var detected = detectNextButtonState();
    if (detected.isFinalSubmit) {
      return { success: false, isFinalSubmit: true, forbiddenText: detected.buttonText };
    }

    var targetSeqNum = expectedNextNum || (currentNum + 1);

    // 3. Prioritas Utama: Jika tombol "Selanjutnya" / navigasi maju ditemukan
    // HANYA KLIK TOMBOL INI! Jangan pernah mengklik tombol simpan terpisah sekaligus agar tidak terjadi dobel lompatan soal!
    if (detected.hasNext && detected.nextElement) {
      var clicked = clickNextButton(detected.nextElement);
      if (clicked) {
        lastNextClickedForQuestionNum = currentNum;
        lastNextClickedForQuestionText = currentFullClean;
        if (!progress.current) sequentialQuestionCounter++;
        return { success: true, buttonText: detected.buttonText, fromNumber: currentNum, toNumber: targetSeqNum };
      }
    }

    // 4. Jika TIDAK ADA tombol navigasi maju, tapi ada tombol "Simpan / Simpan Jawaban" mandiri
    try {
      var saveButtons = Array.from(document.querySelectorAll("button, a, [role='button'], div, span")).filter(function(b) {
        if (isHudElement(b) || !isElementVisible(b) || isHeaderNavElement(b) || isInsideOptionCard(b)) return false;
        var t = (b.textContent || b.innerText || "").trim().toLowerCase();
        return t === "simpan" || t === "simpan jawaban";
      });
      if (saveButtons.length > 0) {
        var clickedSave = clickNextButton(saveButtons[0]);
        if (clickedSave) {
          lastNextClickedForQuestionNum = currentNum;
          lastNextClickedForQuestionText = currentTextKey;
          return { success: true, buttonText: "Simpan", fromNumber: currentNum, toNumber: targetSeqNum };
        }
      }
    } catch (_) {}

    // 5. Navigasi Grid Palet CBT: HANYA BOLEH KLIK NOMOR PERSIS BERIKUTNYA (currentNum + 1)!
    // Contoh: dari nomor 1 HANYA boleh ke nomor 2, DILARANG LANGSUNG KE NOMOR 3!
    var jumped = clickNextQuestionNumberDirectly(targetSeqNum);
    if (jumped) {
      lastNextClickedForQuestionNum = currentNum;
      lastNextClickedForQuestionText = currentTextKey;
      return { success: true, buttonText: "Soal " + targetSeqNum, fromNumber: currentNum, toNumber: targetSeqNum };
    }

    return { success: false, notFound: true };
  }

  // === 8. EKSEKUSI KLIK REALISTIS, AKURAT & TERPISAH (OPSI vs NEXT) ===
  function isElementVisible(el) {
    try {
      if (isHudElement(el)) return false;
      var style = window.getComputedStyle ? window.getComputedStyle(el) : null;
      if (style && (style.display === "none" || style.visibility === "hidden")) return false;
      var r = el.getBoundingClientRect();
      if (r.width > 2 && r.height > 2) return true;
      if (el.offsetWidth > 0 || el.offsetHeight > 0) return true;
      if (el.getClientRects && el.getClientRects().length > 0) return true;
      // Khusus input radio/checkbox yang mungkin 0px tapi parent terlihat
      if (el.tagName === "INPUT" && el.parentElement) {
        var pr = el.parentElement.getBoundingClientRect();
        return pr.width > 4 && pr.height > 4;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  // A. Aktivasi opsi pilihan ganda secara menyeluruh (card, radio, label, role="radio")
  function activateOption(targetEl) {
    if (!targetEl || isHudElement(targetEl)) return false;

    var mouseOpts = { bubbles: true, cancelable: true, view: window, composed: true, buttons: 1 };
    var releaseOpts = { bubbles: true, cancelable: true, view: window, composed: true, buttons: 0 };

    // 1. Temukan elemen radio/checkbox dan label secara komprehensif
    var radio = null;
    if (targetEl.tagName === "INPUT" && (targetEl.type === "radio" || targetEl.type === "checkbox")) {
      radio = targetEl;
    } else if (targetEl.querySelector) {
      radio = targetEl.querySelector("input[type='radio'], input[type='checkbox']");
    }
    if (!radio && targetEl.tagName === "LABEL") {
      radio = targetEl.control || (targetEl.htmlFor ? document.getElementById(targetEl.htmlFor) : null);
    }
    // Cari di parent / ancestor hingga 6 level (misal form-check, table td, option card)
    if (!radio) {
      var pNode = targetEl.parentElement;
      for (var d = 0; d < 6 && pNode && pNode !== document.body; d++) {
        var allFoundR = pNode.querySelectorAll ? pNode.querySelectorAll("input[type='radio'], input[type='checkbox']") : [];
        if (allFoundR.length === 1) { radio = allFoundR[0]; break; }
        if (allFoundR.length > 1) break;
        pNode = pNode.parentElement;
      }
    }
    // Cari di saudara (siblings) jika input dan label sejajar
    if (!radio && targetEl.parentElement) {
      var sibs = targetEl.parentElement.children;
      for (var s = 0; s < sibs.length; s++) {
        if (sibs[s] === targetEl) continue;
        if (sibs[s].tagName === "INPUT" && (sibs[s].type === "radio" || sibs[s].type === "checkbox")) {
          radio = sibs[s];
          break;
        }
        var sibR = sibs[s].querySelector ? sibs[s].querySelector("input[type='radio'], input[type='checkbox']") : null;
        if (sibR) { radio = sibR; break; }
      }
    }
    // Cari di table row (tr) jika kuis berbasis tabel
    if (!radio && targetEl.closest) {
      var trEl = targetEl.closest("tr");
      if (trEl) radio = trEl.querySelector("input[type='radio'], input[type='checkbox']");
    }

    var label = null;
    if (targetEl.tagName === "LABEL") {
      label = targetEl;
    } else if (targetEl.querySelector) {
      label = targetEl.querySelector("label");
    }
    if (!label && radio && radio.id) {
      label = document.querySelector("label[for='" + radio.id + "']");
    }
    if (!label && targetEl.closest) {
      label = targetEl.closest("label");
    }

    // Temukan wadah kartu pilihan (option card / row / item)
    var card = (targetEl.closest && targetEl.closest(".option-item, [class*='option' i], [class*='choice' i], [class*='answer' i], [class*='pilihan' i], [class*='item' i], [class*='card' i], [class*='check' i], [class*='radio' i], label, tr, li")) || targetEl;

    // Keamanan: Jika 'card' ternyata mencakup lebih dari 1 radio (artinya card adalah container seluruh soal),
    // jangan gunakan card tersebut agar tidak salah klik opsi pertama/opsi A!
    if (card && card.querySelectorAll && card.querySelectorAll("input[type='radio'], input[type='checkbox']").length > 1) {
      card = (radio && radio.parentElement && radio.parentElement !== card && (!radio.parentElement.querySelectorAll || radio.parentElement.querySelectorAll("input[type='radio'], input[type='checkbox']").length <= 1)) ? radio.parentElement : targetEl;
    }

    // Scroll ke elemen target agar terlihat jelas
    try {
      (card || targetEl).scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (_) {}

    // 2. Berikan highlight visual hijau langsung pada wadah kartu pilihan
    highlightElement(card || targetEl);

    // 3. Kirim simulasi Pointer & Mouse events ke seluruh hierarki target (radio, targetEl, card, label)
    // Prioritaskan elemen radio secara langsung agar tidak meleset ke container
    var elementsToClick = [];
    if (radio) elementsToClick.push(radio);
    if (targetEl && !elementsToClick.includes(targetEl)) elementsToClick.push(targetEl);
    if (card && !elementsToClick.includes(card) && (!card.querySelectorAll || card.querySelectorAll("input[type='radio'], input[type='checkbox']").length <= 1)) elementsToClick.push(card);
    if (label && !elementsToClick.includes(label)) elementsToClick.push(label);

    elementsToClick.forEach(function(el) {
      if (!el) return;
      try {
        if (typeof PointerEvent !== "undefined") {
          el.dispatchEvent(new PointerEvent("pointerover", mouseOpts));
          el.dispatchEvent(new PointerEvent("pointerenter", mouseOpts));
          el.dispatchEvent(new PointerEvent("pointerdown", { ...mouseOpts, isPrimary: true, button: 0 }));
          el.dispatchEvent(new PointerEvent("pointerup", { ...releaseOpts, isPrimary: true, button: 0 }));
        }
        el.dispatchEvent(new MouseEvent("mousedown", mouseOpts));
        el.dispatchEvent(new MouseEvent("mouseup", releaseOpts));
        if (typeof el.click === "function") {
          el.click();
        } else {
          el.dispatchEvent(new MouseEvent("click", mouseOpts));
        }
      } catch (_) {}
    });

    // 4. Sinkronisasi status radio secara terprogram (dukung React/Vue/Angular controlled input & browser form)
    if (radio && radio.tagName === "INPUT") {
      try {
        var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "checked")?.set;
        if (nativeSetter) {
          nativeSetter.call(radio, true);
        } else {
          radio.checked = true;
        }
      } catch (_) {
        radio.checked = true;
      }
      try {
        radio.dispatchEvent(new Event("input", { bubbles: true }));
        radio.dispatchEvent(new Event("change", { bubbles: true }));
      } catch (_) {}
    }

    // 5. Role radio (Google Forms / ARIA widgets)
    var ariaRadio = (radio && radio.getAttribute && (radio.getAttribute("role") === "radio" || radio.getAttribute("role") === "checkbox")) ? radio :
                    (targetEl.getAttribute && (targetEl.getAttribute("role") === "radio" || targetEl.getAttribute("role") === "checkbox")) ? targetEl :
                    (card && card.getAttribute && (card.getAttribute("role") === "radio" || card.getAttribute("role") === "checkbox")) ? card : null;
    if (ariaRadio) {
      try {
        ariaRadio.setAttribute("aria-checked", "true");
        if (typeof ariaRadio.click === "function") ariaRadio.click();
      } catch (_) {}
    }

    // 6. Jika kartu pembungkus memiliki handler onclick eksplisit di HTML (onclick="...")
    if (card && card !== targetEl && typeof card.onclick === "function") {
      try {
        card.onclick();
      } catch (_) {}
    }

    // 7. Jika halaman me-render ulang DOM secara dinamis (seperti kuis berbasis SPA/React/Vue)
    // Pastikan item yang baru di-render tetap mendapatkan highlight visual hijau
    setTimeout(function() {
      try {
        var selectedItem = document.querySelector(".selected, [class*='selected' i], :checked, [aria-checked='true']");
        if (selectedItem) {
          var containerToGlow = selectedItem.closest(".option-item, [class*='option' i], [class*='choice' i], [class*='answer' i], label, tr, li") || selectedItem;
          highlightElement(containerToGlow);
        }
      } catch (_) {}
    }, 60);

    return true;
  }

  // B. Eksekusi tombol Next: Tepat 1 kali klik, ter-debounce, tidak memicu double event/skip soal
  function clickNextButton(btn) {
    if (!btn || isHudElement(btn)) return false;

    var now = Date.now();
    // DEBOUNCE REALISTIS: Mencegah double click dalam jeda kurang dari 900ms tanpa mengunci transisi
    if (now - lastNextClickTime < 900) {
      return false;
    }
    lastNextClickTime = now;

    highlightElement(btn);

    try {
      btn.scrollIntoView({ behavior: "instant", block: "center" });
    } catch (_) {}

    try {
      if (typeof btn.focus === "function") btn.focus();
    } catch (_) {}

    var rect = btn.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var mouseOpts = { bubbles: true, cancelable: true, view: window, composed: true, buttons: 1, button: 0, clientX: cx, clientY: cy, isPrimary: true };
    var releaseOpts = { bubbles: true, cancelable: true, view: window, composed: true, buttons: 0, button: 0, clientX: cx, clientY: cy, isPrimary: true };

    try {
      if (typeof PointerEvent !== "undefined") {
        btn.dispatchEvent(new PointerEvent("pointerdown", mouseOpts));
        btn.dispatchEvent(new PointerEvent("pointerup", releaseOpts));
      }
      btn.dispatchEvent(new MouseEvent("mousedown", mouseOpts));
      btn.dispatchEvent(new MouseEvent("mouseup", releaseOpts));

      // HANYA KLIK TEPAT 1 KALI LANGSUNG PADA TARGET!
      // DILARANG klik innerClickable dan parentBtn sekaligus karena bubbling memicu eksekusi multi-kali (skip soal)
      if (typeof btn.click === "function") {
        btn.click();
      } else {
        btn.dispatchEvent(new MouseEvent("click", releaseOpts));
      }
      return true;
    } catch (_) {
      try {
        btn.click();
        return true;
      } catch (_) {
        return false;
      }
    }
  }

  // Fallback alias
  function triggerClick(element) {
    activateOption(element);
  }

  function highlightElement(element) {
    if (!element) return;
    try {
      var originalOutline = element.style.outline;
      var originalShadow = element.style.boxShadow;
      var originalBg = element.style.backgroundColor;

      element.style.transition = "all 0.2s ease";
      element.style.outline = "3px solid #16a34a";
      element.style.boxShadow = "0 0 16px rgba(22, 163, 74, 0.85)";
      element.style.backgroundColor = "rgba(34, 197, 94, 0.12)";
      element.style.borderRadius = "8px";

      setTimeout(function() {
        try {
          element.style.outline = originalOutline;
          element.style.boxShadow = originalShadow;
          element.style.backgroundColor = originalBg;
        } catch (_) {}
      }, 3000);
    } catch (_) {}
  }

  // === 8. EKSTRAKSI JAWABAN TO-THE-POINT DARI RAW AI ANSWER ===
  function extractAnswerInfo(text) {
    if (!text) return { letter: null, targetText: "", isMultipleChoice: false, firstLine: "" };

    // 1. Bersihkan blok think, hitungan tertutup, badge & markdown formatting (*, _, `, #)
    var clean = text.replace(/<think>[\s\S]*?<\/think>/gi, "")
                    .replace(/\[(?:hitungan|langkah|scratchpad|analisis|cara)[\s\S]*?\]/gi, "")
                    .replace(/^(?:🎯|✍️|💡|📝)\[[^\]]+\]\s*/gi, "")
                    .replace(/[*_`#]/g, "")
                    .trim();

    var lines = clean.split("\n").map(function(l) { return l.trim(); }).filter(Boolean);
    if (lines.length === 0) lines = text.split("\n").map(function(l) { return l.trim(); }).filter(Boolean);

    var answerLine = "";
    var foundIndex = -1;
    // Cari baris yang secara eksplisit memuat kata kunci Jawaban / Kunci (prioritaskan baris paling akhir jika ada beberapa)
    for (var i = lines.length - 1; i >= 0; i--) {
      var line = lines[i];
      if (/^(?:kunci\s*jawaban|kunci|jawaban(?:nya)?|opsi|pilihan)\s*[:\-]/i.test(line)) {
        answerLine = line;
        foundIndex = i;
        break;
      }
    }

    // Jika answerLine hanya berupa "Jawaban:" tanpa teks isi di baris yang sama, dan ada baris selanjutnya
    var afterColon = answerLine.replace(/^(?:kunci\s*jawaban|kunci|jawaban(?:nya)?|opsi|pilihan)\s*[:\-]\s*/i, "").trim();
    if (foundIndex >= 0 && !afterColon && foundIndex + 1 < lines.length) {
      answerLine = lines[foundIndex + 1];
    }

    // Jika tidak ada baris kata kunci, cari baris yang memuat huruf awalan "C. ..." dari bawah ke atas
    if (!answerLine) {
      for (var j = lines.length - 1; j >= 0; j--) {
        if (/^[\(\[]?[A-H][\)\.\:\-\s\]\}]+/i.test(lines[j])) {
          answerLine = lines[j];
          break;
        }
      }
    }
    if (!answerLine) answerLine = lines[lines.length - 1] || lines[0] || "";

    // 2. Bersihkan prefix nomor soal jika ada (contoh "2. C. Jakarta" atau "Soal 2: B")
    var strippedLine = answerLine.replace(/^(?:(?:soal|pertanyaan|no|nomor)\s*\d+[:.\-\s]*|\d+[:.\-\s]+(?=[A-H\(\[]|[a-z]))/i, "").trim();

    var letter = null;
    var targetText = "";

    // 3. Deteksi pola huruf pilihan (A-I): contoh "Jawaban: C. 3", "Jawaban: B. x = 8", "Kunci: C", "(B) 25"
    var kwLetterRegex = /^(?:kunci\s*jawaban|kunci|jawaban(?:nya)?|opsi|pilihan)(?:\s*(?:yang benar|yang tepat)?\s*(?:adalah|yaitu)?)?\s*[:\-]?\s*[\(\[]?([A-I])[\)\]]?(?:[\.\:\)\-\s\]\}]\s*(.*)|$)/i;
    var directLetterRegex = /^[\(\[]?([A-I])[\)\]]?(?:[\.\:\)\-\s\]\}]\s*(.*)|$)/i;

    var mKw = strippedLine.match(kwLetterRegex);
    if (mKw && mKw[1]) {
      letter = mKw[1].toUpperCase();
      targetText = (mKw[2] || "").trim();
    } else {
      var mDir = strippedLine.match(directLetterRegex);
      if (mDir && mDir[1]) {
        letter = mDir[1].toUpperCase();
        targetText = (mDir[2] || "").trim();
      }
    }

    // 4. Jika bukan huruf A-I tapi teks langsung / angka matematika (contoh: "Jawaban: 3", "Jawaban: x = 3", "Jawaban: -4", "Jawaban: Rp 80.000")
    if (!letter || !targetText) {
      var textMatch = strippedLine.match(/^(?:kunci\s*jawaban|kunci|jawaban(?:nya)?|opsi|pilihan)?(?:\s*(?:yang benar|yang tepat)?\s*(?:adalah|yaitu)?)?\s*[:\-]?\s*(.+)$/i);
      if (textMatch && textMatch[1]) {
        var extracted = textMatch[1].trim();
        if (!letter) targetText = extracted;
        else if (!targetText) targetText = extracted;
      } else if (strippedLine.length > 0 && strippedLine.length < 80) {
        if (!targetText) targetText = strippedLine;
      }
    }

    if (targetText) {
      if ((targetText.startsWith("(") && targetText.endsWith(")")) || (targetText.startsWith("[") && targetText.endsWith("]"))) {
        targetText = targetText.slice(1, -1).trim();
      }
      targetText = targetText.replace(/[\.\,\;]+$/, "").trim();
    }

    var isMultipleChoice = !!letter || (!!targetText && targetText.length < 70 && !targetText.includes("\n"));
    return { letter: letter, targetText: targetText, isMultipleChoice: isMultipleChoice, firstLine: answerLine };
  }

  // === 9. SIKLUS PENGERJAAN 1 SOAL (AI AGENT EXECUTOR) ===
  async function executeSingleQuestionCycle(forceVision) {
    if (!_0x_verify_integrity()) {
      setHudStatus("⚠️ Validasi lisensi modul gagal (E_INTEGRITY_TAMPER).", false);
      throw new Error("Validasi integritas sistem gagal.");
    }

    var pageInfo = extractPageInfo();
    var content = pageInfo.text;

    var visualUrlPattern = /iqcenter|test-iq|tes-iq|pola|pattern|matrix|matriks|spatial|raven|vision|gambar|diagram|visual|cbt/i;
    var visualTextPattern = /(?:perhatikan|berdasarkan|pada|lihat|amatilah|analisislah)\s*(?:gambar|diagram|tabel|grafik|pola|matriks|potongan kode|screenshot|terminal|arsitektur|erd)|tanda\s*tanya\s*\(\?\)|matriks\s*2x2|screenshot|gambar\s*(?:di\s*bawah|berikut)/i;

    var isVisualPage = pageInfo.hasVisuals && (
      content.length < 160 ||
      visualUrlPattern.test(window.location.href + " " + document.title) ||
      visualTextPattern.test(content)
    );
    var needsVision = forceVision || isVisualPage;
    var rawAnswer = "";

    if (needsVision) {
      setHudStatus("📸 Menganalisis visual dengan Gemini Vision...", true);
      if (hudElement) hudElement.style.visibility = "hidden";
      await new Promise(function(r) { setTimeout(r, 80); });
      var res = await new Promise(function(resolve) {
        chrome.runtime.sendMessage({ type: "EXECUTE_GEMINI_VISION" }, function(r) {
          if (chrome.runtime?.lastError) {
            resolve({ success: false, error: chrome.runtime.lastError.message });
            return;
          }
          resolve(r);
        });
      });
      if (hudElement) hudElement.style.visibility = "visible";
      if (!res || !res.success) {
        throw new Error(res?.error || "Gagal menghubungi Gemini Vision.");
      }
      rawAnswer = res.answer;
    } else {
      setHudStatus("⚡ Menjawab soal dengan Groq...", true);
      var gRes = await new Promise(function(resolve) {
        chrome.runtime.sendMessage({ type: "EXECUTE_GROQ", text: content }, function(r) {
          if (chrome.runtime?.lastError) {
            resolve({ success: false, error: chrome.runtime.lastError.message });
            return;
          }
          resolve(r);
        });
      });

      // JIKA GROQ RATE LIMIT (429) ATAU PADAT: OTOMATIS FALLBACK KE GEMINI VISION!
      if (!gRes || !gRes.success) {
        var errMsg = gRes?.error || "";
        if (errMsg.includes("429") || errMsg.includes("Rate limit") || errMsg.includes("limit reached")) {
          setHudStatus("⏳ Groq padat (429). Mengalihkan otomatis ke Gemini Vision...", true);
          if (hudElement) hudElement.style.visibility = "hidden";
          await new Promise(function(r) { setTimeout(r, 80); });
          var gFallback = await new Promise(function(resolve) {
            chrome.runtime.sendMessage({ type: "EXECUTE_GEMINI_VISION" }, function(r) {
              if (chrome.runtime?.lastError) {
                resolve({ success: false, error: chrome.runtime.lastError.message });
                return;
              }
              resolve(r);
            });
          });
          if (hudElement) hudElement.style.visibility = "visible";

          if (gFallback && gFallback.success) {
            rawAnswer = gFallback.answer;
          } else {
            throw new Error(gRes?.error || "Gagal menghubungi Groq & Gemini.");
          }
        } else {
          throw new Error(gRes?.error || "Gagal menghubungi Groq.");
        }
      } else {
        rawAnswer = gRes.answer;
      }

      if (isVisualProblem(rawAnswer)) {
        setHudStatus("🖼️ Soal butuh gambar! Mengalihkan ke Gemini Vision...", true);
        if (hudElement) hudElement.style.visibility = "hidden";
        await new Promise(function(r) { setTimeout(r, 80); });
        var vRes = await new Promise(function(resolve) {
          chrome.runtime.sendMessage({ type: "EXECUTE_GEMINI_VISION" }, function(r) {
            if (chrome.runtime?.lastError) {
              resolve({ success: false, error: chrome.runtime.lastError.message });
              return;
            }
            resolve(r);
          });
        });
        if (hudElement) hudElement.style.visibility = "visible";
        if (vRes && vRes.success) {
          rawAnswer = vRes.answer;
        }
      }
    }

    var ansInfo = extractAnswerInfo(rawAnswer);
    var displayAnswer = ansInfo.firstLine || rawAnswer;

    setHudAnswer(displayAnswer);

    // === TAHAP 1: AUTO-KLIK OPSI ATAU AUTO-FILL ESAI DULU ===
    var actionCompleted = false;

    if (autoClickEnabled) {
      var choiceName = ansInfo.targetText || ansInfo.letter || "Jawaban";
      setHudStatus('🎯 Memproses jawaban: "' + choiceName + '"...', true);

      var hasEssayField = hasActiveEssayField();
      var hasPilgan = hasMultipleChoiceOptionsOnPage();
      var radioCount = document.querySelectorAll("input[type='radio']:not([disabled]), [role='radio']:not([aria-disabled='true'])").length;

      // 1. Jika murni soal esai/isian (ada input/textarea & tidak ada radio pilihan ganda)
      if (hasEssayField && radioCount < 2 && !hasPilgan) {
        var filledDirect = findAndFillEssay(rawAnswer);
        if (filledDirect) {
          actionCompleted = true;
          setHudStatus('✍️ Jawaban isian/esai berhasil diketik & tersimpan permanen!', false);
        } else {
          actionCompleted = false;
          setHudStatus("⚠️ Kolom jawaban belum terisi otomatis. Silakan salin jawaban.", false);
        }
      } else if (hasPilgan || radioCount >= 2) {
        // 2. Jika ada opsi pilihan ganda
        var clicked = findAndClickOption(ansInfo.letter, ansInfo.targetText);
        if (clicked) {
          actionCompleted = true;
          setHudStatus('✅ Opsi "' + choiceName + '" diklik di layar...', false);
        } else if (hasEssayField) {
          // Fallback ke isian esai jika opsi tidak terklik tapi ada kolom esai
          var filledFallback = findAndFillEssay(rawAnswer);
          if (filledFallback) {
            actionCompleted = true;
            setHudStatus('✍️ Jawaban berhasil diketik & tersimpan permanen!', false);
          } else {
            setHudStatus('⚠️ Opsi "' + choiceName + '" belum terklik otomatis.', false);
          }
        } else if (ansInfo.letter) {
          setHudStatus('⚠️ Opsi "' + choiceName + '" belum terklik otomatis. Silakan klik di layar web.', false);
        } else {
          setHudStatus("⚠️ Kolom jawaban belum terisi otomatis. Silakan salin jawaban.", false);
        }
      } else if (hasEssayField) {
        // 3. Fallback jika ada kolom isian/esai
        var filledFallback2 = findAndFillEssay(rawAnswer);
        if (filledFallback2) {
          actionCompleted = true;
          setHudStatus('✍️ Jawaban isian/esai berhasil diketik & tersimpan permanen!', false);
        }
      }

      // Berikan jeda 350ms untuk rendering DOM & event loop web
      await new Promise(function(r) { setTimeout(r, 350); });
      var isAnsweredInDom = isAnswerActuallySelectedOnPage();

      // RETRY JIKA BELUM TERVERIFIKASI TERISI
      if (!isAnsweredInDom) {
        if (hasEssayField && (radioCount < 2 || !hasPilgan)) {
          findAndFillEssay(rawAnswer);
          await new Promise(function(r) { setTimeout(r, 400); });
          isAnsweredInDom = isAnswerActuallySelectedOnPage();
        } else if (ansInfo.letter || ansInfo.targetText) {
          findAndClickOption(ansInfo.letter, ansInfo.targetText);
          await new Promise(function(r) { setTimeout(r, 400); });
          isAnsweredInDom = isAnswerActuallySelectedOnPage();
        }
      }

      actionCompleted = isAnsweredInDom;
    } else {
      actionCompleted = isAnswerActuallySelectedOnPage();
    }

    // === EVALUASI KEBIJAKAN TOGGLE SESUAI PROSEDUR RESMI ===
    var isAnsweredInDomNow = isAnswerActuallySelectedOnPage();

    // KASUS 1: AUTO-FILL DIMATIKAN
    if (!autoClickEnabled) {
      if (!autoNextEnabled) {
        // Auto-Fill OFF & Auto-Next OFF: AI hanya tampilkan jawaban di HUD
        setHudStatus("💡 Jawaban siap di HUD. (Auto-Fill & Auto-Next dinonaktifkan - silakan isi & lanjut manual).", false);
        return { success: true, manualMode: true, answer: displayAnswer };
      } else {
        // Auto-Fill OFF & Auto-Next ON: Menunggu pengguna memilih/mengisi di web
        if (!isAnsweredInDomNow) {
          setHudStatus("💡 Jawaban siap di HUD! Silakan pilih/ketik di web... (Auto-Next akan lanjut setelah terjawab)", false);
          return { success: false, waitingUserAnswer: true, answer: displayAnswer };
        }
        // Jika sudah dipilih oleh pengguna di web, lanjut ke tahap Auto-Next di bawah
      }
    }

    // KASUS 2: AUTO-FILL AKTIF TAPI JAWABAN BELUM TERVERIFIKASI DI DOM
    if (autoClickEnabled && !isAnsweredInDomNow) {
      setHudStatus('⚠️ Jawaban belum terisi di web! Menahan Next sampai jawaban dipilih...', false);
      return { success: false, notSelected: true, answer: displayAnswer };
    }

    // KASUS 3: AUTO-FILL AKTIF & JAWABAN SUDAH TERVERIFIKASI, TAPI AUTO-NEXT DIMATIKAN
    if (!autoNextEnabled) {
      setHudStatus("✅ Jawaban terisi & tersimpan permanen! (Auto-Next dinonaktifkan - tetap di soal ini).", false);
      return { success: true, autoNextDisabled: true, answer: displayAnswer };
    }

    // KASUS 4: AUTO-NEXT AKTIF & JAWABAN SUDAH TERVERIFIKASI TERISI (SEKUENSIAL 1 -> 2 -> 3 -> 4 -> 5)
    var detectedNext = detectNextButtonState();
    if (detectedNext.isFinalSubmit) {
      setHudStatus("🛑 Soal terakhir sudah dijawab & tersimpan! Silakan periksa jawaban & kumpulkan secara manual.", false);
      return { finished: true, reason: "final_submit" };
    }

    var progressNow = getQuizProgress();
    var curSoalNum = progressNow.current || sequentialQuestionCounter;
    var nextExpectedSoalNum = curSoalNum + 1;
    setHudStatus("✅ Soal " + curSoalNum + " terbukti sudah terjawab! Berpindah urut ke Soal " + nextExpectedSoalNum + "...", true);
    await new Promise(function(r) { setTimeout(r, 700); });

    // Verifikasi ulang sekali lagi sesaat sebelum klik tombol Next (dengan toleransi transisi DOM)
    if (!isAnswerActuallySelectedOnPage()) {
      await new Promise(function(r) { setTimeout(r, 300); });
      if (!isAnswerActuallySelectedOnPage()) {
        setHudStatus("⚠️ Jawaban belum terisi di web! Membatalkan perpindahan lembar...", false);
        return { success: false, notSelected: true, answer: displayAnswer };
      }
    }

    var nextRes = findAndClickNextButton(nextExpectedSoalNum);
    if (nextRes && nextRes.success) {
      setHudStatus('⏩ Berpindah dari Soal ' + nextRes.fromNumber + ' ke Soal ' + nextRes.toNumber + '! (' + (nextRes.buttonText || ">") + ')', false);
      return { success: true, fromNumber: nextRes.fromNumber, toNumber: nextRes.toNumber };
    } else if (nextRes && nextRes.isFinalSubmit) {
      setHudStatus("🛑 Soal terakhir sudah dijawab! Kumpulkan kuis secara manual.", false);
      return { finished: true, reason: "final_submit" };
    } else if (nextRes && nextRes.alreadyClickedForThisQuestion) {
      setHudStatus("⏳ Soal " + curSoalNum + " sudah diklik Next. Menunggu transisi ke Soal " + nextExpectedSoalNum + "...", true);
      return { success: true, alreadyNext: true };
    } else {
      setHudStatus("⚠️ Tombol Next tidak terdeteksi otomatis.", false);
      return { success: false, notFound: true };
    }
  }

  // Helper pembersih teks untuk membandingkan soal tanpa terganggu countdown timer & statistik dinamis
  function cleanQuestionForComparison(text) {
    if (!text) return "";
    return text
      .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, "") // Hilangkan timer countdown (misal 44:57, 01:23:45)
      .replace(/\b\d+\s*(?:detik|menit|jam|seconds?|minutes?|hours?)\b/gi, "")
      .replace(/\b\d+\s*(?:\/|of)\s*\d+\s*(?:dijawab|answered)?\b/gi, "") // Hilangkan badge '2/15 Dijawab'
      .replace(/\s+/g, " ")
      .trim();
  }

  function hasQuestionChanged(prevText, currentText) {
    var prevClean = cleanQuestionForComparison(prevText);
    var curClean = cleanQuestionForComparison(currentText);
    if (!prevClean || !curClean) return false;
    // Bandingkan seluruh teks bersih tanpa potongan slice agar perubahan soal selalu terdeteksi
    return prevClean !== curClean;
  }

  async function waitForQuestionTransition(prevText) {
    var start = Date.now();
    // Tunggu transisi DOM secara pasif hingga 4.5 detik. Dilarang memicu klik di sini agar tidak dobel lompat!
    while (Date.now() - start < 4500) {
      await new Promise(function(r) { setTimeout(r, 250); });
      var currentText = extractPageInfo().text;
      if (hasQuestionChanged(prevText, currentText) && currentText.length > 20) {
        // Beri waktu sejenak agar render soal baru stabil sebelum mulai dianalisis
        await new Promise(function(r) { setTimeout(r, 450); });
        return true;
      }
    }
    return false;
  }

  // === 10. LOOP AGEN AUTO-PILOT (BERJALAN SAMPAI SELESAI + ANTI-SKIP & ANTI-STUCK) ===
  async function startAutoPilotLoop() {
    var isTop = false;
    try {
      isTop = window.self === window.top;
    } catch (_) {
      isTop = false;
    }
    if (!isTop) return;
    if (isAgentRunning) return;
    isAgentRunning = true;
    chrome.storage?.local?.set({ 
      isAgentRunning: true,
      lastActiveDomain: window.location.hostname || "local",
      lastActiveTime: Date.now()
    });
    updateHudRunningState(true);

    setHudStatus("🚀 Agen Otomatis aktif! Memulai pengerjaan kuis...", true);

    var lastAnsweredQuestion = "";
    var sameQuestionStall = 0;

    while (isAgentRunning) {
      try {
        var currentText = extractPageInfo().text;
        var currentClean = cleanQuestionForComparison(currentText);
        var curProgress = getQuizProgress();
        var curSoalNum = curProgress.current || sequentialQuestionCounter;
        var nextSoalNum = curSoalNum + 1;

        // Reset state jika soal terbukti sudah berganti!
        if (lastAnsweredQuestion && hasQuestionChanged(lastAnsweredQuestion, currentClean)) {
          lastAnsweredQuestion = "";
          sameQuestionStall = 0;
          sequentialQuestionCounter = curProgress.current || (sequentialQuestionCounter + 1);
          lastNextClickedForQuestionNum = 0;
          lastNextClickedForQuestionText = "";
        }

        // Jika soal saat ini terdeteksi sama persis dengan yang baru saja dijawab
        // HANYA JALANKAN LOGIKA STALL INI JIKA AUTO-NEXT AKTIF!
        // Jika Auto-Next NONAKTIF, tetap di soal ini secara tenang tanpa menampilkan stall atau menekan next!
        if (autoNextEnabled && lastAnsweredQuestion && currentClean === lastAnsweredQuestion) {
          sameQuestionStall++;
          if (sameQuestionStall === 1) {
            setHudStatus("⏳ Menunggu transisi urut dari Soal " + curSoalNum + " ke Soal " + nextSoalNum + "...", true);
            var transitionedWait = await waitForQuestionTransition(currentText);
            if (transitionedWait) {
              sameQuestionStall = 0;
              lastAnsweredQuestion = "";
              lastNextClickedForQuestionNum = 0;
              lastNextClickedForQuestionText = "";
              continue;
            }
          }
          if (sameQuestionStall === 2) {
            // JANGAN KLIK NEXT LAGI JIKA NOMOR INI SUDAH DIKLIK NEXT SEBELUMNYA (ANTI-LOMPAT / ANTI-DOUBLE-SKIP)
            if (lastNextClickedForQuestionNum === curSoalNum) {
              setHudStatus("⏳ Next untuk Soal " + curSoalNum + " sudah ditekan. Menunggu halaman memuat Soal " + nextSoalNum + "...", true);
              await new Promise(function(r) { setTimeout(r, 1500); });
              var transitionedWait2 = await waitForQuestionTransition(currentText);
              if (transitionedWait2) {
                sameQuestionStall = 0;
                lastAnsweredQuestion = "";
                lastNextClickedForQuestionNum = 0;
                lastNextClickedForQuestionText = "";
                continue;
              }
            } else if (isAnswerActuallySelectedOnPage()) {
              setHudStatus("⚠️ Menekan tombol Selanjutnya menuju Soal " + nextSoalNum + "...", true);
              findAndClickNextButton(nextSoalNum);
              var transitionedClick = await waitForQuestionTransition(currentText);
              if (transitionedClick) {
                sameQuestionStall = 0;
                lastAnsweredQuestion = "";
                lastNextClickedForQuestionNum = 0;
                lastNextClickedForQuestionText = "";
                continue;
              }
            } else {
              setHudStatus("⚠️ Soal " + curSoalNum + " belum terisi jawabannya! Silakan pilih jawaban sebelum lanjut.", false);
            }
          }
          if (sameQuestionStall >= 3) {
            setHudStatus("⚠️ Silakan klik tombol 'Selanjutnya' atau nomor " + nextSoalNum + " di layar web.", false);
            var transitionedManual = await waitForQuestionTransition(currentText);
            if (transitionedManual) {
              sameQuestionStall = 0;
              lastAnsweredQuestion = "";
              lastNextClickedForQuestionNum = 0;
              lastNextClickedForQuestionText = "";
              continue;
            } else {
              await new Promise(function(r) { setTimeout(r, 2000); });
              continue;
            }
          }
        } else {
          sameQuestionStall = 0;
        }

        var step = await executeSingleQuestionCycle();

        chrome.storage?.local?.set({ 
          lastActiveTime: Date.now()
        });

        if (step.finished) {
          stopAutoPilot();
          setHudStatus("🛑 Soal terakhir sudah dijawab & tersimpan permanen! Kumpulkan kuis secara manual.", false);
          showInPageToast("🎉 Semua soal kuis selesai dikerjakan! Jawaban terakhir telah tersimpan. Silakan kumpulkan kuis secara manual.");
          break;
        }

        // KASUS: AUTO-FILL MATI, TAPI AUTO-NEXT NYALA
        // (AI menunggu pengguna memilih/mengetik jawaban sendiri di layar web)
        if (step.waitingUserAnswer) {
          var userWaitCount = 0;
          while (isAgentRunning && !isAnswerActuallySelectedOnPage() && userWaitCount < 60) {
            await new Promise(function(r) { setTimeout(r, 500); });
            var pollTxt = extractPageInfo().text;
            if (hasQuestionChanged(currentText, pollTxt)) break;
            userWaitCount++;
          }
          if (isAgentRunning && isAnswerActuallySelectedOnPage() && autoNextEnabled) {
            setHudStatus("✅ Terdeteksi sudah Anda jawab! Menyiapkan lembar selanjutnya...", true);
            await new Promise(function(r) { setTimeout(r, 1000); });
            findAndClickNextButton(nextSoalNum);
            await waitForQuestionTransition(currentText);
            lastAnsweredQuestion = currentClean;
          }
          continue;
        }

        // KASUS: AUTO-FILL AKTIF TAPI JAWABAN BELUM TERVERIFIKASI TERISI
        // (DILARANG set lastAnsweredQuestion agar tidak terjadi stall palsu seolah-olah harus next!)
        if (step.notSelected) {
          setHudStatus("⚠️ Jawaban belum terisi di web! Menunggu jawaban dipilih sebelum lanjut ke lembar berikutnya...", false);
          var waitCount = 0;
          while (isAgentRunning && waitCount < 8) {
            await new Promise(function(r) { setTimeout(r, 500); });
            if (isAnswerActuallySelectedOnPage()) {
              setHudStatus("✅ Terbaca sudah terjawab! Menyiapkan lembar selanjutnya...", true);
              break;
            }
            waitCount++;
          }
          if (isAgentRunning && isAnswerActuallySelectedOnPage() && autoNextEnabled) {
            await new Promise(function(r) { setTimeout(r, 1000); });
            findAndClickNextButton(nextSoalNum);
            await waitForQuestionTransition(currentText);
            lastAnsweredQuestion = currentClean;
          }
          continue;
        }

        if (!isAgentRunning) break;

        // KASUS: AUTO-NEXT DIMATIKAN
        // (Jawaban sudah terisi atau ditampilkan di HUD. AI WAJIB TETAP DI SOAL INI TANPA PINDAH!)
        if (!autoNextEnabled) {
          lastAnsweredQuestion = currentClean;
          var msgManual = autoClickEnabled 
            ? "✅ Jawaban terisi & tersimpan permanen! (Auto-Next dinonaktifkan - tetap di soal ini)." 
            : "💡 Jawaban siap di HUD. (Auto-Fill & Auto-Next dinonaktifkan - silakan salin & lanjut manual).";
          setHudStatus(msgManual, false);

          // Tunggu secara pasif sampai pengguna sendiri yang berpindah soal di web
          while (isAgentRunning && !autoNextEnabled) {
            await new Promise(function(r) { setTimeout(r, 600); });
            var pollNext = extractPageInfo().text;
            if (hasQuestionChanged(currentText, pollNext)) {
              // Pengguna sudah berpindah soal di web!
              break;
            }
          }
          continue;
        }

        // KASUS: AUTO-NEXT AKTIF & BERHASIL MENJAWAB
        lastAnsweredQuestion = currentClean;
        setHudStatus("⏳ Menunggu soal berikutnya muncul...", true);
        var transitionedWaitStep = await waitForQuestionTransition(currentText);
        if (transitionedWaitStep) {
          lastAnsweredQuestion = "";
          lastNextClickedForQuestionNum = 0;
          lastNextClickedForQuestionText = "";
        }
        await new Promise(function(r) { setTimeout(r, 600); });
      } catch (err) {
        setHudStatus('⚠️ Terjadi kendala: ' + err.message + '. Mencoba lagi dalam 3 detik...', false);
        await new Promise(function(r) { setTimeout(r, 3000); });
        if (!isAgentRunning) break;
      }
    }
  }

  function stopAutoPilot() {
    isAgentRunning = false;
    chrome.storage?.local?.set({ isAgentRunning: false });
    updateHudRunningState(false);
    setHudStatus("⏹️ Agen Otomatis dihentikan.", false);
  }

  // === 11. FLOATING AI AGENT HUD (WIDGET ON-PAGE DENGAN POSISI ELEVATED) ===
  function ensureHudExists() {
    var isTop = false;
    try {
      isTop = window.self === window.top;
    } catch (_) {
      isTop = false;
    }
    if (!isTop) return null; // DILARANG KERAS MUNCUL DI DALAM IFRAME IKLAN / GOOGLE ADS / VIGNETTE

    // Bersihkan jika ada elemen HUD duplikat
    var existingHuds = document.querySelectorAll("#ai-study-agent-hud");
    if (existingHuds.length > 0) {
      for (var h = 1; h < existingHuds.length; h++) {
        try { existingHuds[h].remove(); } catch (_) {}
      }
      hudElement = existingHuds[0];
      return hudElement;
    }

    if (hudElement && document.body && document.body.contains(hudElement)) return hudElement;
    if (!document.body) return null;

    var container = document.createElement("div");
    container.id = "ai-study-agent-hud";
    container.style.cssText = `
      position: fixed;
      bottom: 95px;
      right: 20px;
      z-index: 2147483647;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      user-select: none;
      box-sizing: border-box;
    `;

    container.innerHTML = `
      <div id="hud-bubble" style="display: ${hudMinimized ? "flex" : "none"}; align-items: center; gap: 8px; background: #312e81; color: #fff; padding: 10px 16px; border-radius: 30px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); cursor: pointer; font-size: 13px; font-weight: 700; border: 1px solid rgba(255,255,255,0.2);">
        <span>🤖 AI Agent</span>
        <span id="bubble-status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: ${isAgentRunning ? "#22c55e" : "#cbd5e1"};"></span>
      </div>

      <div id="hud-panel" style="display: ${hudMinimized ? "none" : "flex"}; flex-direction: column; width: 320px; background: #ffffff; border-radius: 12px; box-shadow: 0 10px 32px rgba(15,23,42,0.22); border: 1px solid #e2e8f0; overflow: hidden; color: #0f172a; position: relative;">
        <div id="hud-header" style="background: linear-gradient(135deg, #3730a3, #4f46e5); color: #fff; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; cursor: grab;">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 13px;">
            <span>🤖 AI Agent Asisten</span>
            <span id="hud-mode-badge" style="font-size: 10px; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 8px;">${isAgentRunning ? "Running" : "Idle"}</span>
          </div>
          <div style="display: flex; gap: 6px;">
            <button id="hud-min-btn" style="background: transparent; border: 0; color: #fff; cursor: pointer; font-size: 14px; padding: 0 4px;" title="Perkecil">_</button>
            <button id="hud-close-btn" style="background: transparent; border: 0; color: #fff; cursor: pointer; font-size: 14px; padding: 0 4px;" title="Tutup">×</button>
          </div>
        </div>

        <div style="padding: 12px; display: flex; flex-direction: column; gap: 9px;">
          <div id="hud-status" style="font-size: 11.5px; color: #475569; display: flex; align-items: center; gap: 6px; background: #f8fafc; padding: 7px 10px; border-radius: 7px; border: 1px solid #e2e8f0;">
            <div id="hud-spinner" style="width: 12px; height: 12px; border: 2px solid #cbd5e1; border-top-color: #4f46e5; border-radius: 50%; animation: hudspin .8s linear infinite; display: none;"></div>
            <span id="hud-status-text">Siap membantu mengerjakan kuis</span>
          </div>

          <div id="hud-answer-box" style="display: none; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 9px 11px; font-size: 12.5px; font-weight: 600; color: #166534; line-height: 1.4; white-space: pre-wrap; max-height: 130px; overflow-y: auto;">
          </div>

          <button id="hud-autopilot-btn" style="width: 100%; padding: 9px 12px; border: 0; border-radius: 8px; font-weight: 700; font-size: 12.5px; cursor: pointer; color: #fff; background: ${isAgentRunning ? "#dc2626" : "linear-gradient(135deg, #16a34a, #059669)"}; transition: all .15s;">
            ${isAgentRunning ? "⏹️ Hentikan Agen (Stop)" : "▶️ Jalankan Otomatis (Sampai Selesai)"}
          </button>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #475569; background: #f8fafc; padding: 5px 8px; border-radius: 7px; border: 1px solid #e2e8f0;">
            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
              <input type="checkbox" id="hud-autoclick-chk" ${autoClickEnabled ? "checked" : ""} style="accent-color: #4f46e5; cursor: pointer;">
              <span>🎯 Auto-Fill</span>
            </label>
            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
              <input type="checkbox" id="hud-autonext-chk" ${autoNextEnabled ? "checked" : ""} style="accent-color: #4f46e5; cursor: pointer;">
              <span>⏩ Auto-Next</span>
            </label>
          </div>

          <div style="display: flex; gap: 6px;">
            <button id="hud-oneshot-btn" style="flex: 1; padding: 7.5px 8px; border: 0; border-radius: 7px; background: #4f46e5; color: #fff; font-size: 11px; font-weight: 600; cursor: pointer;">
              ⚡ Jawab 1 Soal
            </button>
            <button id="hud-vision-btn" style="flex: 1; padding: 7.5px 8px; border: 0; border-radius: 7px; background: #0284c7; color: #fff; font-size: 11px; font-weight: 600; cursor: pointer;">
              📸 Pola Gambar/IQ
            </button>
          </div>
        </div>
      </div>
    `;

    if (!document.getElementById("ai-agent-hud-styles")) {
      var styleEl = document.createElement("style");
      styleEl.id = "ai-agent-hud-styles";
      styleEl.textContent = `
        @keyframes hudspin { to { transform: rotate(360deg); } }
        #hud-autopilot-btn:hover { opacity: 0.93; }
        #hud-autopilot-btn:active { transform: scale(0.99); }
      `;
      document.head.appendChild(styleEl);
    }

    document.body.appendChild(container);
    hudElement = container;

    var bubble = container.querySelector("#hud-bubble");
    var panel = container.querySelector("#hud-panel");
    if (panel) _0x_guard_wm(panel);
    var minBtn = container.querySelector("#hud-min-btn");
    var closeBtn = container.querySelector("#hud-close-btn");
    var autoPilotBtn = container.querySelector("#hud-autopilot-btn");
    var oneShotBtn = container.querySelector("#hud-oneshot-btn");
    var visionBtn = container.querySelector("#hud-vision-btn");
    var hudClickChk = container.querySelector("#hud-autoclick-chk");
    var hudNextChk = container.querySelector("#hud-autonext-chk");

    hudClickChk?.addEventListener("change", function() {
      autoClickEnabled = hudClickChk.checked;
      chrome.storage?.local?.set({ autoClick: autoClickEnabled });
    });

    hudNextChk?.addEventListener("change", function() {
      autoNextEnabled = hudNextChk.checked;
      chrome.storage?.local?.set({ autoNext: autoNextEnabled });
      if (!autoNextEnabled) {
        setHudStatus("⏩ Auto-Next dinonaktifkan.", false);
      }
    });

    bubble?.addEventListener("click", function() {
      hudMinimized = false;
      bubble.style.display = "none";
      panel.style.display = "flex";
      chrome.storage?.local?.set({ hudMinimized: false });
    });

    minBtn?.addEventListener("click", function() {
      hudMinimized = true;
      panel.style.display = "none";
      bubble.style.display = "flex";
      chrome.storage?.local?.set({ hudMinimized: true });
    });

    closeBtn?.addEventListener("click", function() {
      container.style.display = "none";
      chrome.storage?.local?.set({ showHud: false });
    });

    autoPilotBtn?.addEventListener("click", function() {
      if (isAgentRunning) {
        stopAutoPilot();
      } else {
        startAutoPilotLoop();
      }
    });

    oneShotBtn?.addEventListener("click", async function() {
      if (isAgentRunning) return;
      try {
        await executeSingleQuestionCycle(false);
      } catch (e) {
        setHudStatus('⚠️ Error: ' + e.message, false);
      }
    });

    visionBtn?.addEventListener("click", async function() {
      if (isAgentRunning) return;
      try {
        await executeSingleQuestionCycle(true);
      } catch (e) {
        setHudStatus('⚠️ Error: ' + e.message, false);
      }
    });

    makeHudDraggable(container, container.querySelector("#hud-header"));
    return container;
  }

  function makeHudDraggable(container, handle) {
    if (!handle) return;
    var isDragging = false;
    var startX, startY, initialLeft, initialTop;

    handle.addEventListener("mousedown", function(e) {
      if (e.target.tagName === "BUTTON") return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      var rect = container.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      container.style.bottom = "auto";
      container.style.right = "auto";
      container.style.left = initialLeft + "px";
      container.style.top = initialTop + "px";
    });

    window.addEventListener("mousemove", function(e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      container.style.left = Math.max(10, Math.min(window.innerWidth - 330, initialLeft + dx)) + "px";
      container.style.top = Math.max(10, Math.min(window.innerHeight - 150, initialTop + dy)) + "px";
    });

    window.addEventListener("mouseup", function() {
      isDragging = false;
    });
  }

  function showInPageToast(message) {
    try {
      var existing = document.getElementById("ai-study-toast-banner");
      if (existing) existing.remove();
      var toast = document.createElement("div");
      toast.id = "ai-study-toast-banner";
      toast.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#1e1b4b;color:#fff;padding:12px 24px;border-radius:12px;font-size:13px;font-weight:700;z-index:2147483647;box-shadow:0 12px 36px rgba(0,0,0,0.35);border:1px solid #4f46e5;display:flex;align-items:center;gap:10px;font-family:system-ui,-apple-system,sans-serif;";
      toast.innerHTML = "<span>" + message + "</span><button style='background:transparent;border:0;color:#cbd5e1;cursor:pointer;font-weight:bold;margin-left:12px;font-size:16px;'>✕</button>";
      toast.querySelector("button").onclick = function() { toast.remove(); };
      document.body.appendChild(toast);
      setTimeout(function() {
        if (toast && toast.parentElement) toast.remove();
      }, 7000);
    } catch (_) {}
  }

  function setHudStatus(text, showSpinner) {
    if (!hudElement) ensureHudExists();
    var textEl = hudElement?.querySelector("#hud-status-text");
    var spinnerEl = hudElement?.querySelector("#hud-spinner");
    if (textEl) textEl.textContent = text || "";
    if (spinnerEl) spinnerEl.style.display = showSpinner ? "block" : "none";
  }

  function setHudAnswer(answerText) {
    if (!hudElement) ensureHudExists();
    var box = hudElement?.querySelector("#hud-answer-box");
    if (box) {
      box.style.display = "block";
      box.textContent = _0x_embed_stego(answerText || "");
    }
  }

  function updateHudRunningState(running) {
    if (!hudElement) ensureHudExists();
    var btn = hudElement?.querySelector("#hud-autopilot-btn");
    var badge = hudElement?.querySelector("#hud-mode-badge");
    var dot = hudElement?.querySelector("#bubble-status-dot");

    if (btn) {
      btn.textContent = running ? "⏹️ Hentikan Agen (Stop)" : "▶️ Jalankan Otomatis (Sampai Selesai)";
      btn.style.background = running ? "#dc2626" : "linear-gradient(135deg, #16a34a, #059669)";
    }
    if (badge) {
      badge.textContent = running ? "Auto-Pilot" : "Idle";
    }
    if (dot) {
      dot.style.background = running ? "#22c55e" : "#cbd5e1";
    }
  }

  function toggleHudVisibility() {
    var isTop = false;
    try {
      isTop = window.self === window.top;
    } catch (_) {
      isTop = false;
    }
    if (!isTop) return;
    ensureHudExists();
    if (hudElement) {
      var isHidden = hudElement.style.display === "none";
      hudElement.style.display = isHidden ? "block" : "none";
      chrome.storage?.local?.set({ showHud: isHidden });
    }
  }

  // Ekspos fungsi helper ke window untuk eksekusi cross-frame
  window.__AI_STUDY_CLICK_OPTION = findAndClickOption;
  window.__AI_STUDY_FILL_ESSAY = findAndFillEssay;
  window.__AI_STUDY_CLICK_NEXT = findAndClickNextButton;
  window.__AI_STUDY_DETECT_NEXT = detectNextButtonState;
})();
