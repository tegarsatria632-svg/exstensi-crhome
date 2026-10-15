// permission.js - Request Permanent Microphone Permission for Extension Origin

const btnGrant = document.getElementById("btnGrant");
const statusBox = document.getElementById("statusBox");

async function requestMicrophone() {
  try {
    statusBox.className = "status-msg";
    statusBox.style.display = "none";
    btnGrant.disabled = true;
    btnGrant.textContent = "⏳ Meminta izin mikrofon...";

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    // Hentikan stream seketika setelah izin didapat
    stream.getTracks().forEach((track) => track.stop());

    try {
      chrome.storage?.local?.set({ micPermissionGranted: true });
    } catch (_) {}

    statusBox.textContent = "✅ Izin mikrofon berhasil diaktifkan! Menutup tab ini dalam 2 detik...";
    statusBox.className = "status-msg success";
    btnGrant.textContent = "✅ Izin Berhasil Diberikan";

    setTimeout(() => {
      window.close();
    }, 1800);

  } catch (err) {
    btnGrant.disabled = false;
    btnGrant.textContent = "🔄 Coba Lagi";
    statusBox.textContent = `⚠️ Akses mikrofon ditolak atau dibatalkan (${err.message}). Pastikan memilih 'Allow / Izinkan' pada popup browser atau periksa ikon gembok di sebelah kiri URL.`;
    statusBox.className = "status-msg error";
  }
}

btnGrant.addEventListener("click", requestMicrophone);

// Otomatis minta izin saat halaman dibuka
window.addEventListener("DOMContentLoaded", () => {
  requestMicrophone();
});
