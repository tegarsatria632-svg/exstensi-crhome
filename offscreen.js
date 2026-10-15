// offscreen.js - Audio Recording Engine (Tab Zoom & Microphone) dengan Filter Suara Jernih & Noise Reduction

let mediaRecorder = null;
let recordedChunks = [];
let activeStreams = [];
let activeAudioContext = null;
let noiseGateInterval = null;
let isRecording = false;
let recordingStartTime = 0;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.target !== "offscreen") return false;

  if (msg.type === "START_OFFSCREEN_RECORDING") {
    startRecording(msg.source || "tab", msg.streamId, msg.enableFilter !== false)
      .then(() => sendResponse({ success: true, startTime: recordingStartTime }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // async response
  }

  if (msg.type === "STOP_OFFSCREEN_RECORDING") {
    stopRecording()
      .then((data) => sendResponse({ success: true, audioDataUrl: data.audioDataUrl, mimeType: data.mimeType }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // async response
  }

  if (msg.type === "GET_OFFSCREEN_STATUS") {
    sendResponse({ isRecording, startTime: recordingStartTime });
    return false;
  }

  return false;
});

// Helper akuisisi stream dengan fallback otomatis antara constraint 'desktop' dan 'tab'
// Mencegah error 'Error starting tab capture' pada Chromium di berbagai kondisi
async function acquireStream(streamId, preferredSource = "desktop") {
  const sources = preferredSource === "tab" ? ["tab", "desktop"] : ["desktop", "tab"];
  let lastErr = null;

  for (const src of sources) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: src,
            chromeMediaSourceId: streamId
          }
        },
        video: {
          mandatory: {
            chromeMediaSource: src,
            chromeMediaSourceId: streamId
          }
        }
      });
      return stream;
    } catch (err) {
      lastErr = err;
      if (err.message?.includes("tab capture") || err.name === "AbortError" || err.name === "InvalidStateError" || err.name === "NotSupportedError") {
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

// === FILTER SUARA JERNIH & NOISE CANCELLATION DSP PIPELINE ===
// Memotong desis/dengung kipas/AC, menonjolkan kejelasan vokal manusia,
// dan meredam suara berisik latar belakang (Noise Gate)
function applyVoiceEnhancementFilter(audioCtx, sourceNode, isTabAudio = false) {
  // 1. High-Pass Filter (Low-Cut):
  // Menghapus suara gemuruh frekuensi rendah (< 85Hz), getaran meja, hembusan nafas dekat mic, dan dengung kipas/AC
  const highpass = audioCtx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.setValueAtTime(85, audioCtx.currentTime);
  highpass.Q.setValueAtTime(0.707, audioCtx.currentTime);

  // 2. Low-Pass Filter (High-Cut):
  // Menghapus desis listrik frekuensi tinggi (> 8200Hz), coil whine, dan suara gesekan statis
  const lowpass = audioCtx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(8200, audioCtx.currentTime);
  lowpass.Q.setValueAtTime(0.707, audioCtx.currentTime);

  // 3. Peaking Filter (Vocal Presence & Clarity Boost):
  // Meningkatkan kejelasan artikulasi pita suara manusia di frekuensi 2.5 kHz (+4.0 dB)
  // Menjadikan konsonan dan intonasi kata terdengar sangat jelas dan tajam bagi AI dan pendengar
  const vocalClarity = audioCtx.createBiquadFilter();
  vocalClarity.type = "peaking";
  vocalClarity.frequency.setValueAtTime(2500, audioCtx.currentTime);
  vocalClarity.Q.setValueAtTime(1.1, audioCtx.currentTime);
  vocalClarity.gain.setValueAtTime(4.0, audioCtx.currentTime);

  // 4. Dynamics Compressor (Volume Leveler & Peak Limiter):
  // Meratakan volume suara: mengangkat suara pelan/berbisik dan mencegah suara keras/teriakan menjadi pecah/distorsi
  const compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
  compressor.knee.setValueAtTime(10, audioCtx.currentTime);
  compressor.ratio.setValueAtTime(4.5, audioCtx.currentTime);
  compressor.attack.setValueAtTime(0.003, audioCtx.currentTime); // 3ms respon kilat
  compressor.release.setValueAtTime(0.20, audioCtx.currentTime); // 200ms pelepas halus

  // 5. Intelligent Noise Gate (Voice Activity Detection Soft Gate):
  // Mengurangi volume keheningan secara dinamis saat tidak ada yang berbicara agar kebisingan latar belakang lenyap
  const gateGain = audioCtx.createGain();
  gateGain.gain.setValueAtTime(1.0, audioCtx.currentTime);

  // Analyser node untuk memantau energi suara secara real-time
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  const timeData = new Float32Array(analyser.fftSize);

  // Sambungkan rantai pemrosesan sinyal suara:
  // sourceNode -> highpass -> lowpass -> vocalClarity -> compressor -> gateGain -> output
  sourceNode.connect(highpass);
  highpass.connect(lowpass);
  lowpass.connect(vocalClarity);
  vocalClarity.connect(compressor);
  compressor.connect(gateGain);
  compressor.connect(analyser);

  const noiseThreshold = isTabAudio ? 0.007 : 0.012;

  if (noiseGateInterval) {
    clearInterval(noiseGateInterval);
    noiseGateInterval = null;
  }

  noiseGateInterval = setInterval(() => {
    if (!audioCtx || audioCtx.state === "closed") {
      if (noiseGateInterval) {
        clearInterval(noiseGateInterval);
        noiseGateInterval = null;
      }
      return;
    }
    analyser.getFloatTimeDomainData(timeData);
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      sum += timeData[i] * timeData[i];
    }
    const rms = Math.sqrt(sum / timeData.length);
    const now = audioCtx.currentTime;

    if (rms < noiseThreshold) {
      // Suara di bawah ambang kebisingan: redam hingga 6% (-24 dB) secara halus
      gateGain.gain.setTargetAtTime(0.06, now, 0.04);
    } else {
      // Suara manusia terdeteksi: buka 100% secara instan
      gateGain.gain.setTargetAtTime(1.0, now, 0.008);
    }
  }, 30);

  return gateGain;
}

async function startRecording(sourceType, streamId, enableFilter = true) {
  try {
    cleanup();
    recordedChunks = [];
    activeStreams = [];

    let finalStream = null;

    if (sourceType === "tab") {
      // 1. TANGKAP AUDIO TAB WEB (Zoom Web, YouTube, Google Meet, Materi Kuliah)
      if (!streamId) {
        throw new Error("ID Audio Tab (streamId) tidak ditemukan.");
      }
      const tabStream = await acquireStream(streamId, "tab");
      activeStreams.push(tabStream);

      const audioTracks = tabStream.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0) {
        throw new Error("Audio tab tidak terdeteksi pada tab ini.");
      }
      const audioOnlyStream = new MediaStream(audioTracks);

      activeAudioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (activeAudioContext.state === "suspended") {
        await activeAudioContext.resume();
      }

      const tabSource = activeAudioContext.createMediaStreamSource(audioOnlyStream);
      // Teruskan suara asli tab ke speaker pengguna (loopback) agar pengguna tetap bisa mendengar materi
      tabSource.connect(activeAudioContext.destination);

      const dest = activeAudioContext.createMediaStreamDestination();
      if (enableFilter) {
        const filteredOutput = applyVoiceEnhancementFilter(activeAudioContext, tabSource, true);
        filteredOutput.connect(dest);
      } else {
        tabSource.connect(dest);
      }
      finalStream = dest.stream;

    } else if (sourceType === "mic") {
      // 2. TANGKAP SUARA MIKROFON (Hardware Noise Suppression + Real-Time DSP Filter)
      let micStream;
      const idealMicConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
          sampleSize: 16
        }
      };

      try {
        micStream = await navigator.mediaDevices.getUserMedia(idealMicConstraints);
      } catch (err1) {
        try {
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true
            }
          });
        } catch (err2) {
          try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch (mErr) {
            if (mErr.name === "NotAllowedError" || mErr.message?.includes("dismissed") || mErr.message?.includes("Permission")) {
              throw new Error("MIC_PERMISSION_NEEDED: " + mErr.message);
            }
            throw mErr;
          }
        }
      }

      activeStreams.push(micStream);

      if (enableFilter) {
        activeAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (activeAudioContext.state === "suspended") {
          await activeAudioContext.resume();
        }
        const micSource = activeAudioContext.createMediaStreamSource(micStream);
        const filteredOutput = applyVoiceEnhancementFilter(activeAudioContext, micSource, false);
        const dest = activeAudioContext.createMediaStreamDestination();
        filteredOutput.connect(dest);
        finalStream = dest.stream;
      } else {
        finalStream = micStream;
      }

    } else {
      throw new Error("Sumber suara tidak dikenali. Pilih Mikrofon atau Tab Web.");
    }

    let mimeType = "audio/webm;codecs=opus";
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
    }

    mediaRecorder = new MediaRecorder(finalStream, mimeType ? { mimeType } : {});
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.start(250);
    isRecording = true;
    recordingStartTime = Date.now();
    return true;

  } catch (err) {
    cleanup();
    throw err;
  }
}

function stopRecording() {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      cleanup();
      return reject(new Error("Tidak ada perekaman yang sedang berlangsung."));
    }

    mediaRecorder.onstop = async () => {
      try {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(recordedChunks, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const audioDataUrl = reader.result;
          cleanup();
          resolve({ audioDataUrl, mimeType });
        };
        reader.onerror = (e) => {
          cleanup();
          reject(new Error("Gagal membaca rekaman audio: " + e));
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    try {
      mediaRecorder.stop();
    } catch (e) {
      cleanup();
      reject(e);
    }
    isRecording = false;
  });
}

function cleanup() {
  isRecording = false;
  recordingStartTime = 0;
  if (noiseGateInterval) {
    clearInterval(noiseGateInterval);
    noiseGateInterval = null;
  }
  activeStreams.forEach((s) => {
    try {
      s.getTracks().forEach((t) => t.stop());
    } catch (_) {}
  });
  activeStreams = [];

  if (activeAudioContext && activeAudioContext.state !== "closed") {
    try {
      activeAudioContext.close();
    } catch (_) {}
  }
  activeAudioContext = null;
}
