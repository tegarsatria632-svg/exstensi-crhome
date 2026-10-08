@echo off
title Update Ekstensi Chrome
echo ===================================================
echo     MEMPERBARUI EKSTENSI CHROME DARI GITHUB
echo ===================================================
echo.

git pull origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [PERINGATAN] Gagal melakukan update otomatis lewat Git.
    echo Pastikan komputer terhubung ke internet.
) else (
    echo.
    echo [SUKSES] Ekstensi berhasil diperbarui ke versi terbaru!
    echo.
    echo LANGKAH TERAKHIR:
    echo 1. Buka Google Chrome dan ketik: chrome://extensions
    echo 2. Klik tombol Reload / Muat Ulang (ikon panah melingkar) pada ekstensi ini.
)

echo.
pause
