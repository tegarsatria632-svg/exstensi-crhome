// stealth.js - Main World Stealth & Proctoring Bypass Engine
// Berjalan di Main World browser sebelum script ujian/CBT dimuat (run_at: document_start)

(function initStealthEngine() {
  if (window.__AI_STUDY_STEALTH_INITIALIZED__) return;
  window.__AI_STUDY_STEALTH_INITIALIZED__ = true;

  var stealthConfig = {
    copy: true,
    focus: true
  };

  // Baca konfigurasi dari localStorage / sessionStorage
  try {
    var stored = localStorage.getItem("__AI_STUDY_STEALTH_CONFIG__");
    if (stored) {
      var parsed = JSON.parse(stored);
      if (typeof parsed.copy === "boolean") stealthConfig.copy = parsed.copy;
      if (typeof parsed.focus === "boolean") stealthConfig.focus = parsed.focus;
    }
  } catch (_) {}

  // CSS Anti-Blokir Seleksi Teks & Highlight (Langsung disuntikkan sedini mungkin)
  var STEALTH_STYLE_ID = "__ai_study_stealth_css__";
  function injectStealthCSS() {
    if (!stealthConfig.copy) {
      var existing = document.getElementById(STEALTH_STYLE_ID);
      if (existing) existing.remove();
      return;
    }
    try {
      var existing = document.getElementById(STEALTH_STYLE_ID);
      if (!existing) {
        var st = document.createElement("style");
        st.id = STEALTH_STYLE_ID;
        st.textContent = [
          "*, *::before, *::after, html, body, div, p, span, h1, h2, h3, h4, h5, h6,",
          "table, tr, td, th, tbody, thead, tfoot, ul, ol, li, dl, dt, dd,",
          "blockquote, pre, code, form, label, input, textarea, button, select,",
          "article, section, header, footer, aside, main, nav {",
          "  -webkit-user-select: text !important;",
          "  -moz-user-select: text !important;",
          "  -ms-user-select: text !important;",
          "  user-select: text !important;",
          "  -webkit-touch-callout: default !important;",
          "  -webkit-user-drag: auto !important;",
          "}",
          "::selection {",
          "  background-color: #38bdf8 !important;",
          "  color: #0f172a !important;",
          "}",
          "::-moz-selection {",
          "  background-color: #38bdf8 !important;",
          "  color: #0f172a !important;",
          "}"
        ].join("\n");
        var targetParent = document.head || document.documentElement;
        if (targetParent) {
          targetParent.appendChild(st);
        }
      } else {
        // Jaga agar style tetap di akhir parent agar tidak ditimpa stylesheet ujian yang dimuat belakangan
        var parent = existing.parentNode;
        if (parent && parent.lastElementChild !== existing) {
          parent.appendChild(existing);
        }
      }
    } catch (_) {}
  }

  // Dengarkan pesan sinkronisasi dari content.js
  window.addEventListener("message", function(event) {
    if (event.data && event.data.type === "__AI_STUDY_UPDATE_STEALTH__") {
      if (typeof event.data.copy === "boolean") {
        stealthConfig.copy = event.data.copy;
        injectStealthCSS();
        if (stealthConfig.copy) clearInlineBlockers();
      }
      if (typeof event.data.focus === "boolean") stealthConfig.focus = event.data.focus;
      try {
        localStorage.setItem("__AI_STUDY_STEALTH_CONFIG__", JSON.stringify(stealthConfig));
      } catch (_) {}
    }
  });

  // Netralkan preventDefault pada sebuah event objek
  function neutralizePreventDefault(e) {
    try {
      e.preventDefault = function() {};
    } catch (_) {}
    try {
      Object.defineProperty(e, "returnValue", {
        get: function() { return true; },
        set: function() {},
        configurable: true
      });
    } catch (_) {}
    try {
      Object.defineProperty(e, "defaultPrevented", {
        get: function() { return false; },
        configurable: true
      });
    } catch (_) {}
  }

  // === 1. BYPASS BLOKIR KLIK KANAN, SALIN & TEMPEL (PASTE / CTRL+V / SELECTION) ===
  var copyEvents = ["copy", "cut", "paste", "beforecopy", "beforecut", "beforepaste", "contextmenu", "selectstart", "dragstart"];
  function handleCopyEventCapture(e) {
    if (stealthConfig.copy) {
      neutralizePreventDefault(e);
      e.stopImmediatePropagation();
    }
  }

  copyEvents.forEach(function(evtName) {
    window.addEventListener(evtName, handleCopyEventCapture, true);
    document.addEventListener(evtName, handleCopyEventCapture, true);
  });

  // Buka blokir shortcut keyboard: Ctrl+C (Copy), Ctrl+V (Paste), Ctrl+X (Cut), Ctrl+A (Select All), Ctrl+Insert, Shift+Insert
  function isCopyShortcutKey(e) {
    var key = (e.key || "").toLowerCase();
    var code = e.keyCode || e.which;
    var isCtrlOrMeta = e.ctrlKey || e.metaKey;
    var isShift = e.shiftKey;

    // Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A
    if (isCtrlOrMeta) {
      if (key === "c" || code === 67 || key === "v" || code === 86 || key === "x" || code === 88 || key === "a" || code === 65) {
        return true;
      }
      // Ctrl + Insert (Copy alternatif Windows/Linux)
      if (key === "insert" || code === 45) {
        return true;
      }
    }
    // Shift + Insert (Paste alternatif) atau Shift + Delete (Cut alternatif)
    if (isShift) {
      if (key === "insert" || code === 45 || key === "delete" || code === 46) {
        return true;
      }
    }
    return false;
  }

  function handleKeyboardShortcutCapture(e) {
    if (stealthConfig.copy && isCopyShortcutKey(e)) {
      neutralizePreventDefault(e);
      e.stopImmediatePropagation();
    }
  }

  ["keydown", "keypress", "keyup"].forEach(function(evtName) {
    window.addEventListener(evtName, handleKeyboardShortcutCapture, true);
    document.addEventListener(evtName, handleKeyboardShortcutCapture, true);
  });

  // Hapus blokir inline handlers & atribut unselectable yang dipasang script ujian
  function clearInlineBlockers() {
    if (!stealthConfig.copy) return;
    try {
      window.oncontextmenu = null;
      window.oncopy = null;
      window.oncut = null;
      window.onpaste = null;
      window.onselectstart = null;
      window.ondragstart = null;

      document.oncontextmenu = null;
      document.oncopy = null;
      document.oncut = null;
      document.onpaste = null;
      document.onbeforepaste = null;
      document.onselectstart = null;
      document.ondragstart = null;

      if (document.documentElement) {
        document.documentElement.oncontextmenu = null;
        document.documentElement.oncopy = null;
        document.documentElement.oncut = null;
        document.documentElement.onpaste = null;
        document.documentElement.onselectstart = null;
        document.documentElement.removeAttribute("oncopy");
        document.documentElement.removeAttribute("oncut");
        document.documentElement.removeAttribute("onpaste");
        document.documentElement.removeAttribute("oncontextmenu");
        document.documentElement.removeAttribute("onselectstart");
      }

      if (document.body) {
        document.body.oncontextmenu = null;
        document.body.oncopy = null;
        document.body.oncut = null;
        document.body.onpaste = null;
        document.body.onbeforepaste = null;
        document.body.onselectstart = null;
        document.body.ondragstart = null;
        document.body.removeAttribute("oncopy");
        document.body.removeAttribute("oncut");
        document.body.removeAttribute("onpaste");
        document.body.removeAttribute("oncontextmenu");
        document.body.removeAttribute("onselectstart");
      }

      var blockedEls = document.querySelectorAll("[unselectable], [oncopy], [oncut], [onpaste], [oncontextmenu], [onselectstart]");
      for (var i = 0; i < blockedEls.length; i++) {
        var el = blockedEls[i];
        el.removeAttribute("unselectable");
        el.removeAttribute("oncopy");
        el.removeAttribute("oncut");
        el.removeAttribute("onpaste");
        el.removeAttribute("oncontextmenu");
        el.removeAttribute("onselectstart");
        if (el.style) {
          if (el.style.userSelect === "none" || el.style.webkitUserSelect === "none") {
            el.style.userSelect = "text";
            el.style.webkitUserSelect = "text";
          }
        }
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

  // === 3. INTERCEPT addEventListener SECARA GLOBAL ===
  try {
    var origAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      var lowerType = (type || "").toLowerCase();

      // Tangkal pendaftaran listener pemblokir copy/cut/paste/contextmenu/selectstart di window, document, body
      if (copyEvents.indexOf(lowerType) !== -1) {
        var wrappedCopyListener = function(e) {
          if (stealthConfig.copy) {
            neutralizePreventDefault(e);
            // Blokir eksekusi handler ujian pada level window, document, atau body
            if (this === window || this === document || (document.body && this === document.body)) {
              return;
            }
          }
          if (typeof listener === "function") return listener.apply(this, arguments);
          if (listener && typeof listener.handleEvent === "function") return listener.handleEvent.apply(listener, arguments);
        };
        return origAddEventListener.call(this, type, wrappedCopyListener, options);
      }

      // Lindungi shortcut copy pada listener keydown/keyup yang didaftarkan website
      if (lowerType === "keydown" || lowerType === "keypress" || lowerType === "keyup") {
        var wrappedKeyListener = function(e) {
          if (stealthConfig.copy && isCopyShortcutKey(e)) {
            neutralizePreventDefault(e);
            // Jika ini shortcut copy/paste, jangan biarkan script ujian membatalkannya
            if (this === window || this === document || (document.body && this === document.body)) {
              return;
            }
          }
          if (typeof listener === "function") return listener.apply(this, arguments);
          if (listener && typeof listener.handleEvent === "function") return listener.handleEvent.apply(listener, arguments);
        };
        return origAddEventListener.call(this, type, wrappedKeyListener, options);
      }

      // Lindungi event focus/blur/visibility
      if (stealthConfig.focus && (lowerType === "visibilitychange" || lowerType === "webkitvisibilitychange" || lowerType === "blur" || lowerType === "pagehide")) {
        var wrappedFocusListener = function(e) {
          if (!stealthConfig.focus) {
            if (typeof listener === "function") return listener.apply(this, arguments);
            if (listener && typeof listener.handleEvent === "function") return listener.handleEvent.apply(listener, arguments);
          }
          e.stopImmediatePropagation();
        };
        return origAddEventListener.call(this, type, wrappedFocusListener, options);
      }

      return origAddEventListener.apply(this, arguments);
    };
  } catch (_) {}

  // Suntikkan CSS secepat mungkin
  injectStealthCSS();

  // Awasi perubahan DOM agar stylesheet & pembersihan inline blocker selalu aktif
  if (window.MutationObserver) {
    try {
      var domObserver = new MutationObserver(function() {
        injectStealthCSS();
        clearInlineBlockers();
      });
      domObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["unselectable", "oncopy", "oncut", "onpaste", "oncontextmenu", "onselectstart", "style"]
      });
    } catch (_) {}
  }

  // Jalankan pembersihan berkala saat DOM siap
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      injectStealthCSS();
      clearInlineBlockers();
    });
  } else {
    injectStealthCSS();
    clearInlineBlockers();
  }
  setInterval(function() {
    injectStealthCSS();
    clearInlineBlockers();
  }, 2500);
})();
