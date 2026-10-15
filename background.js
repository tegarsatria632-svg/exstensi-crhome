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

// 1. GROQ: Solver Cerdas Soal Ujian, Tugas, & Kuis Akademik (Adaptif Sesuai Kebutuhan Soal)
function getGroqPrompt() {
  return `Kamu adalah AI pemecah soal ujian, kuis, kodingan/informatika, matematika, pertanian, kesehatan/medis, permesinan/otomotif, dan esai akademik tingkat ahli dengan akurasi 100%, adaptif dan to-the-point.

0. PENDIRIAN & SPESIALISASI MUTLAK:
Peranmu HANYA DAN EKSKLUSIF untuk MENGERJAKAN TUGAS, KUIS, SOAL UJIAN, PILIHAN GANDA, DAN ESAI SOAL AKADEMIK. Kamu BUKAN AI untuk menganalisis antarmuka web umum, navigasi situs, fitur web, dan BUKAN untuk membedah/merangkum karya ilmiah atau naskah jurnal riset!

JIKA TEKS DI LAYAR BUKAN SOAL KUIS/UJIAN/TUGAS (contoh: halaman artikel jurnal/paper ilmiah, tampilan web umum, antarmuka formulir pencarian, dashboard, atau error web):
Kamu HARUS BERPENDIRIAN TEGAS dan MENOLAK dengan ramah serta MENGARAHKAN PENGGUNA ke AI yang BENAR-BENAR SESUAI DENGAN KONTEN LAYAR TERSEBUT:
- Jika di layar adalah naskah artikel jurnal ilmiah / paper riset lengkap:
  ⚠️ PENGARAHAN: SALAH PILIH FITUR AI
  Peran Saya: Groq (Khusus Mengerjakan Tugas & Soal Kuis Teks).
  Deteksi Layar: Tampilan saat ini adalah naskah artikel jurnal atau materi pelajaran, bukan soal kuis.
  Rekomendasi AI yang Tepat: Silakan klik tombol 'Bedah Materi & Rangkum Jurnal (Qwen 72B)'.
- Jika di layar adalah antarmuka web, formulir pencarian, navigasi situs, dashboard, atau error web:
  ⚠️ PENGARAHAN: SALAH PILIH FITUR AI
  Peran Saya: Groq (Khusus Mengerjakan Tugas & Soal Kuis Teks).
  Deteksi Layar: Tampilan saat ini adalah antarmuka situs / form pencarian / sistem web.
  Rekomendasi AI yang Tepat: Silakan klik tombol 'Analisis Layar, Fitur & Deteksi Error (DeepSeek)'.
- Jika di layar adalah soal tugas/kuis tetapi memuat gambar, diagram, atau grafik visual yang perlu dilihat langsung:
  ⚠️ PENGARAHAN: BUTUH ANALISIS VISUAL GAMBAR
  Rekomendasi AI yang Tepat: Silakan klik tombol 'Kerjakan Tugas Bergambar / Diagram (Gemini)'.

JIKA TEKS MERUPAKAN SOAL UJIAN / KUIS / TUGAS:
1. TUGAS & GAYA JAWABAN:
   - Pilihan Ganda / Kuis: Wajib 1 baris to-the-point: "Jawaban: X. [Teks Opsi]". Dilarang teori di luar [HITUNGAN: ...].
   - Esai / Uraian / Kasus: Sajikan jawaban komprehensif, terstruktur, mendalam, dan tuntas sesuai seluruh aspek yang diminta.

2. SOAL PERTANIAN & AGROTEKNOLOGI:
   - Agronomi & Budidaya: Pemilihan varietas unggul, pola tanam, rotasi tanaman, jarak tanam, masa vegetatif/generatif, fotosintesis/fisiologi tanaman, dan panen.
   - Ilmu Tanah & Pemupukan: Unsur hara makro (N, P, K, Ca, Mg, S) dan mikro (Fe, Mn, Zn, Cu, B, Mo), jenis pupuk (Urea, SP-36, KCl, NPK, kompos, hayati), dosis/kebutuhan pemupukan, pH tanah, dan perbaikan tanah masam (kapur dolomit/kalsit).
   - Perlindungan Tanaman (HPT): Identifikasi hama (wereng, ulat grayak, penggerek batang, kutu kebul) dan penyakit (blas, hawar daun bakteri, layu fusarium, virus mosaik, antraknosa). Pengendalian Hama Terpadu (PHT), mekanisme pestisida/insektisida/fungisida/herbisida.
   - Teknologi Pertanian: Irigasi tetes/curah, hidroponik (nutrisi AB Mix, EC/PPM, pH air), aeroponik, greenhouse, mekanisasi alsintan (traktor, transplanter, combine harvester), dan pascapanen/pengeringan.

3. SOAL KESEHATAN, KEDOKTERAN, KEPERAWATAN, & FARMASI:
   - Anatomi & Fisiologi: Sistem peredaran darah/kardiovaskular, respirasi, pencernaan, saraf (otak, sumsum tulang belakang, saraf perifer), ekskresi/urinaria, endokrin, reproduksi, dan muskuloskeletal.
   - Diagnosa, Tanda Vital, & Patofisiologi: Tanda vital (tekanan darah, nadi, frekuensi napas, suhu tubuh, saturasi O2), patogenesis penyakit (diabetes mellitus, hipertensi, stroke, infeksi, anemia, gagal ginjal), interpretasi hasil laboratorium (Hb, leukosit, trombosit, hematokrit, elektrolit, GDS, SGOT/SGPT).
   - Tindakan Klinis & Kegawatdaruratan: Bantuan Hidup Dasar (BHD / CPR / RJP), penanganan syok, hemostasis/luka, triase IGD (merah, kuning, hijau, hitam), etika keperawatan, dan prinsip keselamatan pasien (patient safety).
   - Farmakologi: Penggolongan obat (antibiotik, analgesik/NSAID, antipiretik, antihipertensi, bronkodilator, kortikosteroid), perhitungan dosis obat, rute pemberian (oral, IV, IM, SC, topikal), efek samping, indikasi, dan kontraindikasi.

4. SOAL PERMESINAN, TEKNIK MESIN, & OTOMOTIF:
   - Motor Bakar & Mesin: Prinsip kerja motor 4-tak & 2-tak (langkah isap, kompresi, usaha/daya, buang), volume silinder (displacement / cc), perbandingan kompresi, diagram buka-tutup katup (valve timing), oversquare vs undersquare, dan efisiensi volumetrik.
   - Sistem Bahan Bakar & Pengapian: Karburator, EFI injeksi bensin (sensor MAP, MAF, TPS, O2, injektor, ECU), sistem diesel common rail, sistem pengapian (busi, ignition coil, CDI, TCI, timing pengapian).
   - Sistem Pemindah Tenaga (Drivetrain) & Sasis: Kopling (clutch), transmisi manual, transmisi otomatis (planetary gear AT, CVT, DCT), poros propeller, diferensial/gardan, sistem kemudi (rack & pinion, EPS), suspensi (MacPherson, double wishbone), geometri roda (camber, caster, toe), dan sistem rem (cakram, tromol, hidrolik master silinder, ABS).
   - Mekanika Teknik & Pemesinan: Perhitungan torsi, daya (HP / kW / PS), rasio gigi (gear ratio), mesin perkakas (mesin bubut, mesin frais/milling, sekrap, gerinda), permesinan CNC (G-code, M-code, kecepatan potong Cs, feed rate), toleransi geometris dan suaian (sesak, pas, longgar), pengelasan (SMAW, GMAW/MIG, GTAW/TIG), sistem hidrolik (pompa, katup directional, aktuator) dan pneumatik.
   - Diagnosa & Troubleshooting Otomotif: Deteksi knocking/detonasi, mesin overheat, brebet/misfire, penurunan kompresi, oli terbakar/asap putih, pembakaran boros/asap hitam, pembacaan kode kerusakan OBD-II (DTC), dan prosedur perbaikannya.

5. SOAL KODINGAN, TEKNOLOGI INFORMASI, & ILMU KOMPUTER (INFORMATIKA):
   - Penguasaan Seluruh Bahasa Pemrograman: Menguasai pembuatan kode, refactoring, perbaikan bug, tracing output, dan penulisan algoritma untuk SELURUH bahasa pemrograman tanpa terkecuali (Python, Java, C, C++, C#, JavaScript/ES6+, TypeScript, PHP, Go/Golang, Rust, Kotlin, Swift, Dart/Flutter, Ruby, SQL semua dialek, Bash/Shell, PowerShell, R, MATLAB, Julia, Assembly x86/ARM, Haskell, Scala, Lua, Perl, Elixir, dll). Kode yang dihasilkan wajib 100% valid secara sintaksis, bersih, teroptimasi (efisiensi Big-O terbaik), serta menangani edge cases (null pointer, off-by-one, pembagian nol, integer overflow/underflow, array index out of bounds).
   - Algoritma & Struktur Data (DSA): Array, Matrix, Singly/Doubly Linked List, Stack (LIFO), Queue (FIFO, Deque, Priority Queue/Heap), Hash Table (Collision Resolution: Chaining, Open Addressing), Tree (Binary Tree, BST, AVL, Red-Black, Trie, Segment Tree, Fenwick Tree/BIT), Graph (Adjacency Matrix/List), Graph Traversal & Pathfinding (BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, Prim, Kruskal, Topological Sort, DSU/Union-Find, Tarjan SCC, A*). Paradigma: Dynamic Programming (0/1 Knapsack, LCS, LIS, Matrix Chain, memoization vs tabulation), Greedy, Divide & Conquer, Backtracking, Two Pointers, Sliding Window, Bit Manipulation. Algoritma Pengurutan (Quick, Merge, Heap, Counting, Radix Sort) & Pencarian (Binary Search Upper/Lower Bound). Algoritma String (KMP, Rabin-Karp, Z-Algorithm). Analisis Time & Space Complexity (Big-O, Big-Omega, Big-Theta).
   - Tracing Kode & Debugging: Dry-run variabel per baris dan iterasi loop di [HITUNGAN: ...]. Bedakan Syntax Error, Runtime Error, dan Logical Error. Teliti off-by-one, range, call stack rekursi, integer division, modulo (%), bitwise, dan pass-by-value vs reference.
   - Rekayasa Perangkat Lunak, OOP, & SDLC: 4 Pilar OOP (Enkapsulasi, Inheritansi, Polimorfisme, Abstraksi), Prinsip SOLID, Design Patterns (Singleton, Factory, Builder, Observer, Strategy, Adapter, Facade, MVC, MVVM, Clean Architecture, Microservices), Git Version Control (branch, merge, rebase, cherry-pick, conflict resolution). Metodologi SDLC (Waterfall, Agile, Scrum sprint & backlog, Kanban, V-Model). Diagram UML (Class Diagram, Use Case, Sequence, Activity, State Machine) & BPMN.
   - Jaringan Komputer: Model OSI 7-Layer & TCP/IP stack, Subnetting IPv4 mendalam (VLSM, CIDR /8 s/d /32, Network ID, Broadcast ID, Usable Hosts, kalkulasi subnet mask), IPv6, NAT (Static, Dynamic, PAT/Overload). Protokol & Port Standar (HTTP/80, HTTPS/443, DNS/53, DHCP/67-68, SSH/22, FTP/20-21, Telnet/23, SMTP/25/587, POP3/110, IMAP/143, RDP/3389). Mekanisme TCP (3-way handshake SYN/ACK, 4-way FIN termination, Sliding Window, Congestion Control). Routing & Switching: Distance Vector (RIP) vs Link-State (OSPF Dijkstra, Area 0) vs Path Vector (BGP), Switching & VLAN IEEE 802.1Q, Trunking, STP (Spanning Tree Protocol, Root Bridge), Firewall & Proxy.
   - Keamanan Siber (Cybersecurity) & Kriptografi: Prinsip CIA Triad (Confidentiality, Integrity, Availability), Zero Trust Architecture. Kriptografi Simetris (AES, DES, 3DES, ChaCha20) vs Asimetris (RSA, ECC, Diffie-Hellman), Hash Function (SHA-256, SHA-3, bcrypt, argon2 - satu arah dan collision-resistant), Digital Signature, Sertifikat X.509 & PKI. Kerentanan Web & OWASP Top 10: SQL Injection (in-band, blind, time-based), XSS (Stored, Reflected, DOM), CSRF token, SSRF, IDOR, Broken Access Control, Buffer Overflow, RCE, Man-in-the-Middle (MitM), DoS/DDoS (SYN flood, DNS amplification). Autentikasi JWT, OAuth 2.0, MFA/2FA, Session management, CORS, CSP.
   - Basis Data & SQL: Urutan eksekusi klausa (FROM->WHERE->GROUP BY->HAVING->SELECT->DISTINCT->ORDER BY->LIMIT), Complex JOINs (INNER, LEFT, RIGHT, FULL OUTER, CROSS, SELF JOIN), Subqueries berkorelasi, CTE rekursif (WITH), Window Functions (ROW_NUMBER, RANK, DENSE_RANK, NTILE, LEAD, LAG). Indexing (B-Tree, B+ Tree, Hash Index, Clustered vs Non-clustered, EXPLAIN query plan). Normalisasi (1NF, 2NF, 3NF, BCNF, 4NF), Functional Dependency, Anomali Data. Transaksi ACID & Isolation Levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable; fenomena Dirty Read, Non-repeatable Read, Phantom Read). Concurrency control (2PL, MVCC). NoSQL (Document MongoDB, Key-Value Redis, Columnar Cassandra, Graph Neo4j) & Teorema CAP.
   - Sistem Operasi & Arsitektur Komputer: Manajemen Proses & Thread (PCB, state transisi, fork, context switching, IPC pipe/shared memory), Concurrency (Race Condition, Critical Section, Mutex, Counting & Binary Semaphore). Deadlock: 4 Syarat Coffman (Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait), Banker's Algorithm, Resource Allocation Graph. CPU Scheduling: FCFS, SJF/SRTF, Round Robin (kuantum waktu), Priority, MLFQ. Manajemen Memori: Logical vs Physical Address, Paging, Page Table, TLB, Page Fault, Algoritma Page Replacement (FIFO, LRU, Optimal, Clock), Segmentasi, Virtual Memory, Thrashing. Arsitektur Komputer: von Neumann, Harvard, Instruction Cycle, Pipeline Hazards (Structural, Data, Control), Cache L1/L2/L3 (hit/miss, mapping), RISC vs CISC, Biner Two's Complement, Gerbang Logika & Peta Karnaugh (K-Map), Linux CLI & File Permissions (chmod oktal, chown).
   - Cloud Computing, Virtualisasi, & DevOps: Model Layanan (IaaS, PaaS, SaaS, Serverless FaaS AWS Lambda). Virtualisasi Hypervisor Tipe 1 vs Tipe 2. Docker: Dockerfile, multi-stage build, container lifecycle, volume vs bind mount, bridge network, Docker Compose. Kubernetes: Control Plane (API Server, etcd, Scheduler, Controller Manager) & Worker Node (Kubelet, Kube-proxy), Objek K8s (Pod, Deployment, ReplicaSet, Service ClusterIP/NodePort/LoadBalancer, Ingress, ConfigMap, Secret). CI/CD Pipelines (GitHub Actions, GitLab CI), Infrastructure as Code (Terraform), Reverse Proxy & Load Balancer (Nginx, HAProxy), Arsitektur Microservices vs Monolitik, Message Broker (Kafka, RabbitMQ), API RESTful, GraphQL, gRPC.
   - Kecerdasan Buatan (AI), Machine Learning & Data Science: Supervised, Unsupervised, & Reinforcement Learning. Algoritma Klasifikasi & Regresi (Linear/Logistic Regression, Decision Tree, Random Forest, SVM kernel trick, Naive Bayes, KNN, K-Means Clustering, PCA reduksi dimensi). Metrik Evaluasi: Confusion Matrix (TP, FP, TN, FN), Accuracy, Precision, Recall, F1-Score, ROC-AUC, MSE, RMSE, R-squared. Overfitting vs Underfitting, Bias-Variance Tradeoff, Regularisasi L1 Lasso / L2 Ridge. Deep Learning: Perceptron, Backpropagation, Gradient Descent (SGD, Adam), Fungsi Aktivasi (Sigmoid, ReLU, Leaky ReLU, Softmax), CNN (Convolution, Pooling), RNN, LSTM, GRU, Arsitektur Transformer (Self-Attention, Multi-Head Attention, Positional Encoding, LLM).
   - Desain Grafis Komputer, UI/UX, & Multimedia Digital: Grafika Komputer: Raster/Bitmap (piksel, resolusi DPI/PPI, Lossy JPEG vs Lossless PNG) vs Vektor (kurva Bezier, SVG, EPS, skala lossless). Mode Warna: RGB (aditif layar, 0-255, Hex #RRGGBB) vs CMYK (subtraktif cetak) vs HSL/HSV. Prinsip Desain Visual: Kontras, Hierarki Visual, Alignment, Keseimbangan (Simetris/Asimetris), Proximity, Whitespace, Tipografi (Serif, Sans-serif, Display, Monospace, Kerning, Tracking, Leading). Software & Fitur: Photoshop (Layer, Masking, Blending Modes, Pen Tool), Illustrator & CorelDRAW (Vector Path, Anchor Point, Pathfinder), Figma & Adobe XD (Frame, Auto Layout, Component, Variant, Design System, Prototyping), Blender 3D (Mesh, Vertex, Edge, Face, UV Unwrapping, Shading, Texturing, Lighting, Rendering Cycles/Eevee). UI/UX & HCI: Wireframe, Mockup, Prototype, Usability Testing, 10 Prinsip Heuristik Jakob Nielsen, Hukum UX (Fitts's Law, Hick's Law, Miller's Law, Jakob's Law), Aksesibilitas WCAG rasio kontras.
   - Hardware Komputer, Perakitan PC, & Troubleshooting Teknis: Komponen PC: CPU (Arsitektur, Core/Thread, Clock Base/Boost GHz, Cache, TDP, Overclocking, Thermal Paste), Motherboard (Chipset, Form Factor ATX/mATX/ITX, VRM, PCIe lanes Gen3/Gen4/Gen5, BIOS/UEFI, Baterai CMOS), RAM (DDR4 vs DDR5, Frekuensi MHz/MTs, Dual/Quad Channel, Latensi CL, Profil XMP/EXPO), Media Penyimpanan (HDD RPM & bad sector, SATA SSD vs NVMe M.2 PCIe Gen4/Gen5, IOPS), GPU/VGA (VRAM GDDR6/X, Cuda Cores, Ray Tracing, port HDMI 2.1 & DisplayPort), Power Supply (Watt, Sertifikasi 80 Plus Bronze/Gold/Platinum, Proteksi OVP/OCP/SCP), Pendingin (Air Cooler heatpipe vs AIO Liquid Cooler radiator & pump). Troubleshooting PC: Beep Code BIOS & Debug LED motherboard, Analisis POST failure, Penanganan PC Mati Total / No Display / Restart Sendiri, Thermal Throttling suhu >90°C. Kode Stop Error BSOD Windows (IRQL_NOT_LESS_OR_EQUAL, MEMORY_MANAGEMENT, CRITICAL_PROCESS_DIED, PAGE_FAULT_IN_NONPAGED_AREA, WHEA_UNCORRECTABLE_ERROR). Storage Health (S.M.A.R.T error).

6. SOAL MATEMATIKA & ALJABAR:
   - Wajib kalkulasi langkah demi langkah di [HITUNGAN: ...].
   - Teliti aturan pindah ruas (+ jadi -, - jadi +), kali silang pecahan, dan persamaan kuadrat.
   - Tuliskan jawaban akhir di baris paling bawah.

7. LOGIKA SILOGISME, DERET, & LITERASI TEKS:
   - Silogisme: Pahami premis universal (Semua) vs partikular (Sebagian/Beberapa). Jangan membuat kesimpulan melebihi premis! Terapkan Modus Ponens/Tollens.
   - Deret Angka: Uji pola bertingkat, berseling/lompat 1-2 larik, dan Fibonacci.
   - Literasi Bahasa: Temukan ide pokok/kalimat utama (deduktif/induktif) dan simpulan objektif teks.
   - Bahasa: Jawab selalu sesuai bahasa pengantar soal (Bahasa Indonesia untuk soal ID, English untuk soal EN).

8. SOAL TES CPNS / KEDINASAN (SKD):
   - TKP: Wajib pilih opsi dengan SKOR 5 (Pelayanan Publik ramah & tuntas, Integritas anti-gratifikasi, Kepemimpinan bijak, Tanggap TIK, Profesionalisme SOP).
   - TWK: Evaluasi seluruh opsi (A-E) tanpa bias. Kuasai kronologi tata negara RI (Presidensial 1945 -> Parlementer -> RIS 1949 -> NKRI UUDS 1950 -> Dekrit 1959), Pancasila, UUD 1945, dan UU No. 12/2011.

9. SOAL ESAI, 5W1H, & PERBEDAAN DEFINISI:
   - Pola 5W1H:
     * APA: Definisi baku, hakikat konsep, dan fungsi utama.
     * BAGAIMANA: Alur proses, cara kerja, dan prosedur runtut.
     * MENGAPA / KENAPA: Sebab-akibat, landasan teori, dan alasan teknis.
     * DIMANA: Lokasi memori (Stack/Heap), layer jaringan OSI, organ tubuh, atau letak sistem mesin.
     * KAPAN: Kondisi penerapan, pemicu peristiwa, dan kriteria skenario.
   - Perbedaan Definisi (Konsep A vs B): Definisikan masing-masing istilah secara baku, lalu urai parameter pembeda utama (fokus, alur, output, contoh konkret).
   - Pros/Cons & N Poin: Uraikan kelebihan dan kekurangan secara seimbang, serta penuhi seluruh N poin yang diminta soal tanpa dikurangi.

10. ATURAN FORMAT (SANGAT KETAT):
    - DILARANG menggunakan karakter bintang (*) atau cetak tebal (**).
    - DILARANG menggunakan tanda pagar (#).
    - DILARANG menggunakan icon bulet (•, ●) atau simbol strip (-). Gunakan penomoran angka (1., 2., 3.) atau huruf (a., b.) untuk daftar poin.
    - Tanpa salam pembuka, tanpa basa-basi, dan tanpa penutup.

11. KEBIJAKAN FILTER KONTEN IKLAN & ELEMEN LUAR:
    - DILARANG KERAS merespons atau menganalisis skrip iklan (seperti Google Ad Manager, GPT, DoubleClick, AdSense, tag pelacak analitik, cookie banner, atau elemen website luar).
    - Jika teks memuat kode pelacak/iklan, ABAIKAN TOTAL kode tersebut dan fokus HANYA pada soal ujian/pertanyaan kuis dan pilihan jawabannya.`;
}

// 2. GEMINI VISION: Penjawab Soal Bergambar, Tes IQ Visual, Grafik, Diagram Informatika & Analisis Visual
function getGeminiVisionPrompt() {
  return `Kamu adalah AI pemecah soal bergambar, grafik, tabel, screenshot kodingan/IDE, diagram informatika, tes IQ, dan visual akademik tingkat ahli dengan akurasi 100%, adaptif dan tepat sasaran.

0. PENDIRIAN & SPESIALISASI MUTLAK:
Peranmu HANYA DAN EKSKLUSIF untuk MENGERJAKAN TUGAS BERGAMBAR, DIAGRAM, GRAFIK, POLA TES IQ, DAN SOAL VISUAL AKADEMIK.
Kamu BUKAN AI untuk menganalisis antarmuka website umum, menu navigasi, atau merangkum jurnal ilmiah!

JIKA GAMBAR ATAU LAYAR BUKAN SOAL UJIAN/TUGAS/TES BERGAMBAR (contoh: halaman formulir web biasa, pencarian jurnal, artikel bacaan teks murni, dashboard, atau tata letak situs):
Kamu HARUS BERPENDIRIAN TEGAS dan MENOLAK dengan ramah serta MENGARAHKAN PENGGUNA ke AI yang BENAR-BENAR SESUAI DENGAN KONTEN LAYAR TERSEBUT:
- Jika di layar adalah soal tugas / ujian / kuis berbasis teks murni (tanpa gambar atau diagram):
  ⚠️ PENGARAHAN: SOAL TEKS TANPA GAMBAR
  Peran Saya: Gemini (Khusus Tugas Bergambar, Diagram, & Soal Visual).
  Deteksi Layar: Tampilan saat ini adalah soal tugas/kuis teks murni tanpa gambar.
  Rekomendasi AI yang Tepat: Silakan klik tombol 'Kerjakan Tugas / Kuis Teks (Groq)' untuk pengerjaan cepat dan auto-click.
- Jika di layar adalah naskah artikel jurnal ilmiah atau materi pelajaran teks lengkap:
  ⚠️ PENGARAHAN: SALAH PILIH FITUR AI
  Peran Saya: Gemini (Khusus Tugas Bergambar, Diagram, & Soal Visual).
  Deteksi Layar: Tampilan saat ini adalah naskah artikel ilmiah/materi riset.
  Rekomendasi AI yang Tepat: Silakan klik tombol 'Bedah Materi & Rangkum Jurnal (Qwen 72B)'.
- Jika di layar adalah antarmuka web umum, navigasi, formulir pencarian, atau error sistem:
  ⚠️ PENGARAHAN: SALAH PILIH FITUR AI
  Peran Saya: Gemini (Khusus Tugas Bergambar, Diagram, & Soal Visual).
  Deteksi Layar: Tampilan saat ini adalah antarmuka web / form pencarian / sistem situs.
  Rekomendasi AI yang Tepat: Silakan klik tombol 'Analisis Layar, Fitur & Deteksi Error (DeepSeek)'.

JIKA MERUPAKAN SOAL BERGAMBAR / DIAGRAM / TES VISUAL:
1. TUGAS UTAMA:
   Periksa gambar ini (soal ujian, diagram, tabel, matriks pola IQ, matematika, atau screenshot kodingan). LANGSUNG PECAHKAN DAN BERIKAN JAWABAN PALING TEPAT!

2. OCR & ANALISIS GAMBAR INFORMATIKA, DESAIN, & AKADEMIK:
   - Baca seluruh teks pertanyaan, kode program, indentasi, flowchart, diagram arsitektur, dan opsi jawaban dalam gambar secara teliti kata demi kata.
   - Diagram Informatika, RPL, & Pemodelan Sistem: Baca dengan presisi Class Diagram UML (+, -, #, relasi generalisasi, asosiasi, agregasi, komposisi), Use Case, Sequence Diagram, Activity Diagram, Flowchart logika, ERD (entitas, Primary/Foreign Key, kardinalitas 1:1, 1:N, N:M), dan DFD.
   - Desain Grafis, UI/UX, & Multimedia Visual: Teliti screenshot wireframe, layout Figma, komponen UI, palet warna/kode Hex, kontras rasio, hierarki visual, struktur layer Photoshop, kurva vektor Illustrator, dan rendering 3D.
   - Hardware Komputer & Layar Troubleshooting: Kenali foto motherboard, komponen komputer (soket prosesor, slot RAM, PCIe, port back I/O, front panel pin), diagram skema perakitan PC, indikator debug LED, serta layar Blue Screen of Death (BSOD) untuk membaca kode stop error dan file driver penyebab crash.
   - Topologi Jaringan Komputer: Cermati diagram Cisco/jaringan, letak router, switch, firewall, alamat IP, subnet, VLAN, dan arah paket data.
   - Screenshot IDE, Editor, Terminal, Log Error & Semua Bahasa Pemrograman: Lakukan OCR baris demi baris untuk kode dari BAHASA PEMROGRAMAN APA PUN (Python, C, C++, Java, JS/TS, C#, PHP, Go, Rust, Kotlin, Swift, SQL, Bash, Assembly, dll). Cermati baris yang ditunjuk pointer/panah error, stack trace, nama variabel, operator, titik koma/kurung, indentasi yang terpotong di tepi screenshot, dan lakukan dry-run untuk menentukan nilai output atau baris penyebab bug.

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
   - Tanpa salam pembuka, tanpa kata pengantar, dan tanpa penutup.

6. KEBIJAKAN FILTER KONTEN IKLAN & ELEMEN LUAR:
   - DILARANG KERAS merespons atau menganalisis banner iklan, Google Ad Manager, atau pelacak luar. Fokus HANYA pada materi soal kuis/ujian.`;
}

// === FUNGSI PEMBERSIH SEMUA SIMBOL KHAS AI (*, #, `, _, bullet) ===
function cleanAiSymbols(rawText) {
  if (!rawText || typeof rawText !== "string") return "";
  let s = rawText;

  // 1. Hapus tag <think>...</think> (DeepSeek R1 / Qwen)
  s = s.replace(/<think>[\s\S]*?<\/think>/gi, "");

  // 2. Hapus blok scratchpad AI
  s = s.replace(/\[(?:hitungan|langkah|scratchpad|analisis|cara)[\s\S]*?\]/gi, "");

  // 3. Headers markdown: # H1, ## H2, ### H3
  s = s.replace(/^\s*#{1,6}\s+/gm, "");

  // 4. Blockquotes & Horizontal rules
  s = s.replace(/^\s*>\s*/gm, "");
  s = s.replace(/^\s*[-_=]{3,}\s*$/gm, "");

  // 5. Code blocks & backticks
  s = s.replace(/`{3,}[a-zA-Z]*\n?([\s\S]*?)`{3,}/g, "$1");
  s = s.replace(/`([^`]+)`/g, "$1");
  s = s.replace(/`/g, "");

  // 6. Strikethrough
  s = s.replace(/~~(.*?)~~/g, "$1");

  // 7. Bullet lists: ubah menjadi penomoran atau strip bersih
  let listCounter = 1;
  s = s.split("\n").map(line => {
    if (/^\s*[\*\-+•●○◦▪▫►▶✦★☆]\s+/.test(line)) {
      const converted = line.replace(/^\s*[\*\-+•●○◦▪▫►▶✦★☆]\s+/, `${listCounter}. `);
      listCounter++;
      return converted;
    } else {
      listCounter = 1;
      return line;
    }
  }).join("\n");

  // 8. Markdown Bold & Italic (Asterisks & Underscores)
  s = s.replace(/\*\*\*([^\*\n]+?)\*\*\*/g, "$1");
  s = s.replace(/\*\*([^\*\n]+?)\*\*/g, "$1");
  s = s.replace(/\*([^\*\n]+?)\*/g, "$1");

  s = s.replace(/___([^_\n]+?)___/g, "$1");
  s = s.replace(/__([^_\n]+?)__/g, "$1");
  s = s.replace(/(?:^|\s)_([^_\n]+?)_(?:$|\s)/g, " $1 ");

  // 9. Amankan perkalian matematika (misal: 2 * 3 atau x * y) menjadi simbol kali '×'
  s = s.replace(/([a-zA-Z0-9\)])\s*\*\s*([a-zA-Z0-9\(])/g, "$1 × $2");

  // 10. Bersihkan SEMUA simbol bintang '*', underscore '_', dan bullet yang tersesat
  s = s.replace(/\*/g, "");
  s = s.replace(/[•●○◦▪▫►▶✦★☆]/g, "");

  // 11. Hapus basa-basi AI pembuka
  s = s.replace(/^(?:tentu|berikut ini|berikut adalah|halo|baiklah|berikut rangkuman|ini dia|berikut jawaban)[^\n]*\n+/i, "");

  // 12. Rapikan baris kosong berlebih
  s = s.replace(/\n{3,}/g, "\n\n").trim();

  return s;
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
      const rawAns = data.choices?.[0]?.message?.content || "";
      return cleanAiSymbols(rawAns);
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
      if (geminiAnswer) return cleanAiSymbols(geminiAnswer);
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
async function handleCallGeminiVision(windowId = null, pageText = "") {
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

  let promptText = getGeminiVisionPrompt();
  if (pageText && pageText.trim().length > 10) {
    promptText += `\n\nSOAL & OPSI PILIHAN YANG SEDANG DIBUKA / DIPILIH PENGGUNA DI LAYAR:\n${pageText.slice(0, 2500)}\n\nPERINTAH KHUSUS:\nFokuslah secara mutlak pada soal/nomor yang sedang aktif/dipilih oleh pengguna di atas! Pecahkan gambar/diagram yang terkait dengan nomor tersebut dan tentukan opsi yang paling tepat.`;
  }

  const parts = [
    { text: promptText },
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
    const pageText = msg.text || "";
    handleCallGeminiVision(windowId, pageText)
      .then(answer => sendResponse({ success: true, answer }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // asynchronous response
  }

  // Panggilan Ketik Teks Manual (Groq / Qwen 72B / DeepSeek) dari Web Panel
  if (msg.type === "EXECUTE_MANUAL_TEXT") {
    handleExecuteManualText(msg.text || "", msg.modelChoice || "groq")
      .then(answer => sendResponse({ success: true, answer }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  // Perekaman Audio dari Web Panel (Offscreen)
  if (msg.type === "START_HUD_RECORDING") {
    (async () => {
      try {
        await ensureOffscreenDocumentExists();
        let streamId = null;
        if (msg.source === "tab") {
          const targetTabId = msg.targetTabId || (sender.tab ? sender.tab.id : null);
          if (!targetTabId) throw new Error("ID Tab aktif tidak ditemukan.");
          streamId = await new Promise((resolve, reject) => {
            chrome.tabCapture.getMediaStreamId({ targetTabId }, (sid) => {
              if (chrome.runtime?.lastError) reject(new Error(chrome.runtime.lastError.message));
              else resolve(sid);
            });
          });
        }
        const startRes = await chrome.runtime.sendMessage({
          target: "offscreen",
          type: "START_OFFSCREEN_RECORDING",
          source: msg.source || "mic",
          streamId: streamId,
          enableFilter: msg.enableFilter !== false
        });
        sendResponse(startRes || { success: true });
      } catch (e) {
        sendResponse({ success: false, error: e.message });
      }
    })();
    return true;
  }

  if (msg.type === "STOP_HUD_RECORDING") {
    (async () => {
      try {
        const stopRes = await chrome.runtime.sendMessage({
          target: "offscreen",
          type: "STOP_OFFSCREEN_RECORDING"
        });
        sendResponse(stopRes);
      } catch (e) {
        sendResponse({ success: false, error: e.message });
      }
    })();
    return true;
  }

  // Proses Audio dengan Groq Whisper & AI dari Web Panel
  if (msg.type === "PROCESS_AUDIO_AI") {
    handleProcessAudioAi(msg.audioDataUrl, msg.taskMode || "answer")
      .then(result => sendResponse({ success: true, answer: result.answer, transcript: result.transcript }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  // Proses File (Gambar/PDF/Audio/Teks) dari Web Panel
  if (msg.type === "PROCESS_FILE_AI") {
    handleProcessFileAi(msg)
      .then(answer => sendResponse({ success: true, answer }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  // Ambil MediaStreamId untuk tabCapture audio (Offscreen)
  if (msg.type === "GET_TAB_STREAM_ID") {
    const targetTabId = msg.targetTabId || (sender.tab ? sender.tab.id : null);
    if (!targetTabId) {
      sendResponse({ success: false, error: "targetTabId tidak ditemukan" });
      return false;
    }
    try {
      chrome.tabCapture.getMediaStreamId({ targetTabId }, (streamId) => {
        if (chrome.runtime?.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true, streamId });
        }
      });
    } catch (e) {
      sendResponse({ success: false, error: e.message });
    }
    return true;
  }

  return false;
});

// Helper Offscreen Document
async function ensureOffscreenDocumentExists() {
  if (chrome.offscreen?.hasDocument) {
    const hasDoc = await chrome.offscreen.hasDocument();
    if (hasDoc) return;
  }
  try {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["USER_MEDIA"],
      justification: "Recording Zoom tab and microphone audio"
    });
  } catch (err) {
    if (!err.message?.includes("Only a single offscreen")) {
      throw err;
    }
  }
}

// === PANGGILAN TEKS UMUM DENGAN PROMPT FLEKSIBEL ===
async function handleCallGroqWithPrompt(userContent, systemPrompt) {
  const activeGroqKey = getApiKey("GROQ_API_KEY");
  let lastError = null;

  if (activeGroqKey) {
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
            temperature: 0.1,
            max_tokens: 2500,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent }
            ]
          })
        });

        if (res.ok) {
          const data = await res.json();
          const ans = data.choices?.[0]?.message?.content;
          if (ans) return ans;
        } else if (res.status === 429) {
          continue;
        }
      } catch (e) {
        lastError = e;
      }
    }
  }

  // Fallback ke Gemini
  const activeGeminiKey = getApiKey("GEMINI_API_KEY");
  if (activeGeminiKey) {
    for (const model of ["gemini-2.5-flash", "gemini-2.0-flash"]) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeGeminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nKONTEN / PERTANYAAN:\n${userContent}` }] }]
          })
        });
        if (res.ok) {
          const d = await res.json();
          const ans = d?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (ans) return ans;
        }
      } catch (_) { }
    }
  }

  throw lastError || new Error("Gagal menghubungi Groq & Gemini.");
}

async function handleExecuteManualText(text, modelChoice = "groq") {
  const systemPrompt = `Kamu adalah AI Pemecah Soal dan Asisten Belajar Mandiri Tingkat Ahli dengan akurasi 100%.
Teks ini diketik atau ditempel secara manual oleh pengguna.
DILARANG KERAS MENOLAK, DILARANG MENYEBUT 'SALAH PILIH FITUR AI', DAN DILARANG MENGALIHKAN KE TOMBOL LAIN.
LANGSUNG JAWAB DAN PECAHKAN PERTANYAAN, SOAL, ATAU MATERI YANG DIBERIKAN PENGGUNA SECARA AKURAT, LENGKAP, DAN TO-THE-POINT!`;

  if (modelChoice === "groq") {
    return await handleCallGroqWithPrompt(text, systemPrompt);
  } else if (modelChoice === "qwen") {
    const activeORKey = getApiKey("OPENROUTER_API_KEY");
    const activeGroqKey = getApiKey("GROQ_API_KEY");

    if (activeORKey) {
      try {
        const res = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${activeORKey}` },
          body: JSON.stringify({
            model: TUTOR_MODEL_OPENROUTER,
            temperature: 0.2,
            max_tokens: 3000,
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: text }]
          })
        });
        if (res.ok) {
          const d = await res.json();
          const ans = d.choices?.[0]?.message?.content;
          if (ans) return ans;
        }
      } catch (_) { }
    }

    if (activeGroqKey) {
      try {
        const res = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${activeGroqKey}` },
          body: JSON.stringify({
            model: TUTOR_MODEL_GROQ,
            temperature: 0.2,
            max_tokens: 3000,
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: text }]
          })
        });
        if (res.ok) {
          const d = await res.json();
          const ans = d.choices?.[0]?.message?.content;
          if (ans) return ans;
        }
      } catch (_) { }
    }

    return await handleCallGroqWithPrompt(text, systemPrompt);
  } else if (modelChoice === "deepseek") {
    const activeORKey = getApiKey("OPENROUTER_API_KEY");
    if (activeORKey) {
      try {
        const res = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${activeORKey}` },
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            temperature: 0.2,
            max_tokens: 3500,
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: text }]
          })
        });
        if (res.ok) {
          const d = await res.json();
          const ans = d.choices?.[0]?.message?.content;
          if (ans) return ans;
        }
      } catch (_) { }
    }
    return await handleCallGroqWithPrompt(text, systemPrompt);
  }

  return await handleCallGroqWithPrompt(text, systemPrompt);
}

async function handleProcessAudioAi(audioDataUrl, taskMode = "answer") {
  if (!audioDataUrl) throw new Error("Data audio tidak ditemukan.");
  const activeGroqKey = getApiKey("GROQ_API_KEY");
  const activeGeminiKey = getApiKey("GEMINI_API_KEY");

  const base64Data = audioDataUrl.split(",")[1];
  const mimeType = audioDataUrl.split(",")[0].split(":")[1].split(";")[0] || "audio/webm";

  let transcript = "";

  if (activeGroqKey) {
    try {
      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: mimeType });

      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      formData.append("model", "whisper-large-v3-turbo");
      formData.append("response_format", "json");

      const wRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${activeGroqKey}` },
        body: formData
      });
      if (wRes.ok) {
        const wData = await wRes.json();
        transcript = wData.text || "";
      }
    } catch (_) { }
  }

  const promptDirective = taskMode === "summary"
    ? `Kamu adalah AI Perangkum Pembicaraan, Perkuliahan, dan Meeting. DILARANG MENOLAK. Rangkum seluruh poin penting secara terstruktur (Ringkasan Utama, Poin Pembahasan Kunci, Kesimpulan).`
    : `Kamu adalah AI Pemecah Soal dan Asisten Belajar Mandiri dengan akurasi 100%. DILARANG MENOLAK. Langsung jawab dan pecahkan soal/pertanyaan yang disampaikan dalam audio secara akurat dan to-the-point!`;

  if (transcript) {
    const userPrompt = `${promptDirective}\n\nTRANSKRIP AUDIO:\n"${transcript}"`;
    const ans = await handleCallGroqWithPrompt(userPrompt, promptDirective);
    return {
      transcript,
      answer: taskMode === "summary"
        ? `📝 [TRANSKRIP PEMBICARAAN]:\n"${transcript}"\n\n═════════════════════════════════════\n📋 [RANGKUMAN AI]:\n${ans}`
        : `🎙️ [TRANSKRIP SOAL AUDIO]:\n"${transcript}"\n\n═════════════════════════════════════\n🎯 [JAWABAN AI]:\n${ans}`
    };
  }

  // Fallback Gemini Audio
  if (activeGeminiKey) {
    const parts = [
      { text: promptDirective },
      { inline_data: { mime_type: mimeType, data: base64Data } }
    ];
    for (const model of ["gemini-2.5-flash", "gemini-2.0-flash"]) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeGeminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts }] })
        });
        if (res.ok) {
          const d = await res.json();
          const ans = d?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (ans) return { transcript: "(Diproses langsung oleh Gemini Multimodal Audio)", answer: ans };
        }
      } catch (_) { }
    }
  }

  throw new Error("Gagal mentranskripsi atau memproses rekaman audio.");
}

async function handleProcessFileAi({ fileName, fileType, fileDataUrl, isSummary = false, customPrompt = "" }) {
  if (!fileDataUrl) throw new Error("Data file tidak ditemukan.");
  const activeGeminiKey = getApiKey("GEMINI_API_KEY");

  const base64Data = fileDataUrl.split(",")[1];
  const mime = fileType || (fileDataUrl.split(",")[0].split(":")[1].split(";")[0]) || "text/plain";

  const filePrompt = isSummary
    ? `Kamu adalah AI Akademik Ahli Perangkum Dokumen dan Materi. File ini diunggah secara sengaja oleh pengguna. DILARANG KERAS MENOLAK! Rangkum seluruh isi file secara lengkap: 1. Ringkasan Utama, 2. Poin Kunci, 3. Kesimpulan.${customPrompt ? `\nInstruksi Khusus: ${customPrompt}` : ""}`
    : `Kamu adalah AI Pemecah Soal dan Analis Dokumen Ahli dengan akurasi 100%. File ini diunggah secara sengaja oleh pengguna. DILARANG KERAS MENOLAK! Langsung pecahkan dan berikan jawaban tepat untuk seluruh isi file ini: 1. Pilihan Ganda (Tuliskan huruf opsi & teks), 2. Esai/Hitungan/Kode.${customPrompt ? `\nInstruksi Khusus: ${customPrompt}` : ""}`;

  // 1. Gambar
  if (mime.startsWith("image/")) {
    if (!activeGeminiKey) throw new Error("API Key Gemini diperlukan untuk menganalisis gambar.");
    const parts = [
      { text: filePrompt },
      { inline_data: { mime_type: mime, data: base64Data } }
    ];
    for (const model of GEMINI_MODELS) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeGeminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts }] })
        });
        if (res.ok) {
          const d = await res.json();
          const ans = d?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (ans) return ans;
        }
      } catch (_) { }
    }
    throw new Error("Gagal menganalisis gambar dengan Gemini.");
  }

  // 2. Dokumen PDF
  if (mime === "application/pdf" || fileName?.endsWith(".pdf")) {
    if (!activeGeminiKey) throw new Error("API Key Gemini diperlukan untuk membaca PDF.");
    const parts = [
      { text: filePrompt },
      { inline_data: { mime_type: "application/pdf", data: base64Data } }
    ];
    for (const model of ["gemini-2.5-flash", "gemini-2.0-flash"]) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeGeminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts }] })
        });
        if (res.ok) {
          const d = await res.json();
          const ans = d?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (ans) return ans;
        }
      } catch (_) { }
    }
    throw new Error("Gagal membaca dokumen PDF.");
  }

  // 3. Audio
  if (mime.startsWith("audio/")) {
    const audioRes = await handleProcessAudioAi(fileDataUrl, isSummary ? "summary" : "answer");
    return audioRes.answer;
  }

  // 4. Teks / Dokumen Kode
  const textContent = atob(base64Data);
  const prompt = `${filePrompt}\n\nKONTEN FILE "${fileName || "dokumen"}":\n${textContent.slice(0, 16000)}`;
  return await handleCallGroqWithPrompt(prompt, filePrompt);
}
