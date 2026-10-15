// stealth.js - Main World Stealth & Proctoring Bypass Engine
// Berjalan di Main World browser sebelum script ujian/CBT dimuat (run_at: document_start)

(function initStealthEngine() {
  if (window.__AI_STUDY_STEALTH_INITIALIZED__) return;
  window.__AI_STUDY_STEALTH_INITIALIZED__ = true;

  var stealthConfig = {
    copy: true,
    focus: true
  };

  // Baca konfigurasi dari sessionStorage / localStorage
  try {
    var stored = localStorage.getItem("__AI_STUDY_STEALTH_CONFIG__");
    if (stored) {
      var parsed = JSON.parse(stored);
      if (typeof parsed.copy === "boolean") stealthConfig.copy = parsed.copy;
      if (typeof parsed.focus === "boolean") stealthConfig.focus = parsed.focus;
    }
  } catch (_) {}

  // Dengarkan pesan sinkronisasi dari content.js
  window.addEventListener("message", function(event) {
    if (event.data && event.data.type === "__AI_STUDY_UPDATE_STEALTH__") {
      if (typeof event.data.copy === "boolean") stealthConfig.copy = event.data.copy;
      if (typeof event.data.focus === "boolean") stealthConfig.focus = event.data.focus;
      try {
        localStorage.setItem("__AI_STUDY_STEALTH_CONFIG__", JSON.stringify(stealthConfig));
      } catch (_) {}
    }
  });

  // === 1. BYPASS BLOKIR KLIK KANAN & SALIN TEKS (Moodle, CBT, Google Forms) ===
  var copyEvents = ["copy", "cut", "contextmenu", "selectstart", "dragstart"];
  copyEvents.forEach(function(evtName) {
    window.addEventListener(evtName, function(e) {
      if (stealthConfig.copy) {
        e.stopImmediatePropagation();
      }
    }, true);
    document.addEventListener(evtName, function(e) {
      if (stealthConfig.copy) {
        e.stopImmediatePropagation();
      }
    }, true);
  });

  // Hapus blokir inline handlers yang sering dipasang Moodle / CBT
  function clearInlineBlockers() {
    if (!stealthConfig.copy) return;
    try {
      document.oncontextmenu = null;
      document.oncopy = null;
      document.oncut = null;
      document.onselectstart = null;
      document.ondragstart = null;
      if (document.body) {
        document.body.oncontextmenu = null;
        document.body.oncopy = null;
        document.body.oncut = null;
        document.body.onselectstart = null;
        document.body.ondragstart = null;
      }
    } catch (_) {}
  }

  // === 2. ANTI-DETEKSI PINDAH TAB (FAKE FOCUS / ALWAYS ACTIVE TAB) ===
  var blurEvents = ["visibilitychange", "webkitvisibilitychange", "blur", "focusout", "pagehide"];
  blurEvents.forEach(function(evtName) {
    window.addEventListener(evtName, function(e) {
      if (stealthConfig.focus) {
        e.stopImmediatePropagation();
      }
    }, true);
    document.addEventListener(evtName, function(e) {
      if (stealthConfig.focus) {
        e.stopImmediatePropagation();
      }
    }, true);
  });

  // Modifikasi properti document agar selalu tampak aktif (Visible & Focused)
  try {
    Object.defineProperty(document, "visibilityState", {
      get: function() {
        return stealthConfig.focus ? "visible" : "hidden";
      },
      configurable: true
    });
    Object.defineProperty(document, "hidden", {
      get: function() {
        return stealthConfig.focus ? false : true;
      },
      configurable: true
    });
    var origHasFocus = document.hasFocus;
    document.hasFocus = function() {
      return stealthConfig.focus ? true : (origHasFocus ? origHasFocus.call(document) : true);
    };
  } catch (_) {}

  // Intercept addEventListener agar website tidak dapat mendaftarkan pencegah blur yang licik
  try {
    var origAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      var lowerType = (type || "").toLowerCase();
      if (stealthConfig.focus && (lowerType === "visibilitychange" || lowerType === "webkitvisibilitychange" || lowerType === "blur" || lowerType === "pagehide")) {
        var wrappedListener = function(e) {
          if (!stealthConfig.focus) {
            if (typeof listener === "function") return listener.apply(this, arguments);
            if (listener && typeof listener.handleEvent === "function") return listener.handleEvent.apply(listener, arguments);
          }
          // Jika focus bypass aktif, matikan event agar web ujian tidak tahu
          e.stopImmediatePropagation();
        };
        return origAddEventListener.call(this, type, wrappedListener, options);
      }
      return origAddEventListener.apply(this, arguments);
    };
  } catch (_) {}

  // Jalankan pembersihan berkala saat DOM siap
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", clearInlineBlockers);
  } else {
    clearInlineBlockers();
  }
  setInterval(clearInlineBlockers, 3000);
})();
