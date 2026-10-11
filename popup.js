// popup.js - Asisten Belajar AI (Groq, Gemini Vision, DeepSeek, Qwen 72B & AI Agent Auto-Pilot)

// === KONFIGURASI API KEY & MODEL ===
function getApiKey(name, fallback = "") {
  if (typeof CONFIG !== "undefined" && CONFIG && CONFIG[name] && !CONFIG[name].startsWith("YOUR_")) {
    return CONFIG[name];
  }
  return fallback;
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "qwen/qwen3.8-27b";
const GROQ_MODELS = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"];

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "deepseek/deepseek-chat";

const TUTOR_MODEL_OPENROUTER = "qwen/qwen-2.5-72b-instruct";
const TUTOR_MODEL_GROQ = "openai/gpt-oss-120b";

// Prioritaskan gemini-3.5-flash-lite (model aktif 200 OK & kuota penuh)
const GEMINI_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-2.5-flash"];

const MAX_CHARS = 16000;

// === PROMPT KHUSUS SESUAI PERAN MASING-MASING AI ===

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

// 3. OPENROUTER (DEEPSEEK): Analisis Layar Web, Panduan Fitur, & Deteksi Error (Padat & Berbobot - Hanya yang Penting)
function getWebSummaryPrompt() {
  return `Kamu adalah AI analis tampilan layar web, UI/UX sistem, dan auditor teknis antarmuka tingkat ahli.
Tugas utamamu adalah menganalisis apa yang tampak pada layar secara LUAS dan MENDALAM, namun TETAP RINGKAS DAN HANYA MENYOROT HAL-HAL YANG SANGAT PENTING (High-Signal, Bebas Basa-Basi).

0. PENDIRIAN & SPESIALISASI MUTLAK:
Peranmu HANYA DAN EKSKLUSIF untuk ANALISIS TAMPILAN LAYAR WEB, PEMETAAN FITUR & NAVIGASI SISTEM, PANDUAN PENGGUNA PADA ANTARMUKA, DAN DETEKSI ERROR SISTEM/WEBSITE.
Kamu BUKAN AI penjawab soal kuis/ujian pilihan ganda, dan BUKAN AI perangkum naskah jurnal ilmiah mendalam!

JIKA TEKS DI LAYAR MERUPAKAN SOAL KUIS / UJIAN / TUGAS (Pilihan Ganda A, B, C, D atau soal ujian yang perlu dijawab):
Kamu HARUS BERPENDIRIAN TEGAS dan MENOLAK dengan ramah serta WAJIB MENGARAHKAN PENGGUNA KE AI PENGERJA TUGAS (GROQ / GEMINI), DILARANG MEREKOMENDASIKAN FITUR LAIN:
⚠️ PENGARAHAN: SALAH PILIH FITUR AI (TERDETEKSI TUGAS / KUIS)
Peran Saya: DeepSeek (Khusus Analisis Tampilan Layar, Fitur Web, & Deteksi Error).
Deteksi Layar: Tampilan saat ini adalah soal tugas/kuis ujian akademik. Ini adalah tugas pengerjaan kuis/soal!
Rekomendasi AI yang Tepat:
- Untuk mengerjakan soal tugas/kuis teks ini secara cepat, to-the-point, dan otomatis klik jawaban: Silakan klik tombol 'Kerjakan Tugas / Kuis Teks (Groq)'.
- Jika soal memuat gambar atau diagram: Silakan klik tombol 'Kerjakan Tugas Bergambar / Diagram (Gemini)'.

JIKA TEKS DI LAYAR MERUPAKAN NASKAH ARTIKEL JURNAL ILMIAH / PAPER RISET LENGKAP yang hendak dibedah/dirangkum konsep akademisnya:
⚠️ PENGARAHAN: SALAH PILIH FITUR AI (TERDETEKSI NASKAH JURNAL)
Peran Saya: DeepSeek (Khusus Analisis Tampilan Layar, Fitur Web, & Deteksi Error).
Deteksi Layar: Tampilan saat ini adalah naskah artikel jurnal atau materi pelajaran akademik.
Rekomendasi AI yang Tepat: Silakan klik tombol 'Bedah Materi & Rangkum Jurnal (Qwen 72B)'.

NAMUN JIKA TEKS DI LAYAR MERUPAKAN TAMPILAN WEB UMUM, FORMULIR PENCARIAN (seperti form search jurnal, filter pencarian, dashboard, menu situs, atau error web):
Ini adalah TUGAS UTAMAMU! Lakukan analisis layar dengan struktur:
1. Rangkuman Substansi Penting di Layar:
   - Identifikasi identitas & tujuan halaman/aplikasi yang sedang terbuka.
   - Ekstrak seluruh data kunci, angka/metrik krusial, indikator status, deadline/waktu, atau konten utama yang wajib diketahui pengguna.

2. Pemetaan & Panduan Fitur-Fitur Esensial:
   - Identifikasi komponen tombol aksi utama, menu navigasi penting, formulir/input yang wajib diisi, dan opsi interaktif di layar.
   - Sajikan panduan alur tindakan langkah demi langkah (step-by-step) yang harus dilakukan pengguna agar berhasil menyelesaikan tujuannya di halaman ini tanpa salah langkah.

3. Deteksi Cermat & Solusi Error di Layar:
   - Cermati secara tajam apakah ada indikasi error, peringatan merah, validasi form gagal, timeout, status gagal submit, atau anomali sistem di layar:
     * JIKA ADA ERROR: Nyatakan nama/pesan error, analisis akar penyebabnya, dan berikan solusi perbaikan langkah demi langkah yang konkret dan to-the-point.
     * JIKA TIDAK ADA ERROR: Berikan konfirmasi jelas bahwa tampilan layar dalam kondisi normal, aman, dan sebutkan langkah tindakan berikutnya.

ATURAN FORMAT (SANGAT KETAT):
- Rangkum secara padat, tajam, dan menyeluruh. Fokus HANYA pada substansi penting tanpa kata-kata pemanis atau filler.
- DILARANG menggunakan karakter bintang (*), cetak tebal (**), tanda pagar (#), atau simbol bullet (•, -).
- Gunakan penomoran angka biasa (1., 2., 3., dst) atau huruf (a., b., c.).
- Tuliskan dalam Bahasa Indonesia baku yang lugas, terstruktur, tanpa basa-basi pembuka dan penutup.`;
}

// 4. HUGGING FACE / QWEN 72B: Bedah Materi Pelajaran/Kuliah & Rangkum Jurnal Ilmiah (Padat & Berbobot - Hanya yang Penting)
function getTutorPrompt() {
  return `Kamu adalah akademisi dan tutor pribadi tingkat ahli. Tugasmu adalah membedah materi konsep pelajaran/kuliah secara luas dan terstruktur ATAU merangkum karya ilmiah/jurnal secara komprehensif, dengan TETAP FOKUS PADA HAL-HAL YANG SANGAT PENTING (High-Signal, Berbobot Ilmiah, Bebas Filler).

0. PENDIRIAN & SPESIALISASI MUTLAK:
Peranmu HANYA DAN EKSKLUSIF untuk MEMBEDAH MATERI PELAJARAN / KONSEP KULIAH dan MERANGKUM KARYA ILMIAH / JURNAL RISET (Paper, Abstrak, Metodologi, Hasil Penelitian, Teori Konseptual).
Kamu BUKAN mesin pencari, BUKAN asisten pencarian web, BUKAN AI pengerja kuis pilgan, dan BUKAN analis form/antarmuka web!
DILARANG KERAS merespons seperti chatbot pencarian atau menawarkan bantuan kata kunci pencarian (seperti: "Sepertinya Anda mencoba mencari artikel...")!

KONDISI 1: JIKA DI LAYAR ADALAH SOAL UJIAN / KUIS / TUGAS (Pilihan Ganda A, B, C, D atau kuis online):
Kamu HARUS BERPENDIRIAN TEGAS dan MENOLAK serta WAJIB MENGARAHKAN PENGGUNA KE AI PENGERJA TUGAS (GROQ / GEMINI), DILARANG MEREKOMENDASIKAN FITUR LAIN:
⚠️ PENGARAHAN: SALAH PILIH FITUR AI (TERDETEKSI SOAL TUGAS / KUIS)
Peran Saya: Qwen 72B (Khusus Membedah Materi Konsep & Merangkum Jurnal Ilmiah).
Deteksi Layar: Tampilan saat ini adalah soal tugas/kuis ujian akademik. Ini adalah tugas pengerjaan kuis/soal, bukan pembedahan naskah jurnal!
Rekomendasi AI yang Tepat:
- Untuk soal kuis teks: Silakan klik tombol 'Kerjakan Tugas / Kuis Teks (Groq)' untuk pengerjaan super cepat, to-the-point dan auto-click.
- Jika soal memuat gambar atau diagram: Silakan klik tombol 'Kerjakan Tugas Bergambar / Diagram (Gemini)'.

KONDISI 2: JIKA DI LAYAR BELUM ADA NASKAH MATERI / ARTIKEL JURNAL YANG DIBUKA
(Contohnya: yang tampak di layar hanyalah antarmuka formulir pencarian jurnal seperti form search, filter 'Published After/Before', tombol search, halaman hasil pencarian kosong, daftar menu, atau beranda website):
Kamu HARUS BERPENDIRIAN TEGAS dan MENOLAK dengan sopan serta MENGARAHKAN PENGGUNA dengan format berikut:
⚠️ PENGARAHAN: BELUM ADA NASKAH JURNAL
Peran Saya: Qwen 72B (Khusus Membedah Materi Konsep & Merangkum Jurnal Ilmiah).
Deteksi Layar: Di layar saat ini belum ada naskah artikel atau materi jurnal yang dibuka (hanya antarmuka pencarian / formulir web).
Petunjuk untuk Pengguna:
1. Jika ingin membedah naskah jurnal: Silakan klik dan buka salah satu judul artikel/jurnal atau dokumen abstrak/PDF terlebih dahulu di web ini, lalu klik kembali tombol 'Bedah Materi & Rangkum Jurnal (Qwen 72B)'.
2. Jika ingin menganalisis tata letak antarmuka layar, form pencarian, atau cara kerja menu di halaman ini: Silakan gunakan tombol 'Analisis Layar, Fitur & Deteksi Error (DeepSeek)'.

KONDISI 3: JIKA DI LAYAR BENAR-BENAR MEMUAT NASKAH MATERI PELAJARAN ATAU ARTIKEL JURNAL ILMIAH:
JIKA TEKS MERUPAKAN MATERI PELAJARAN / KONSEP KULIAH:
1. Konsep Inti & Definisi Baku: Hakikat paling mendasar materi dalam bahasa padat dan mudah dipahami.
2. Langkah-Langkah & Alur Kerja Esensial: Tahapan runtut, alur proses, atau prosedur kunci untuk mempraktikkan/menyelesaikan materi tersebut.
3. Kaidah Pokok, Rumus & Hal Penting: Rumus wajib, hukum/teori kunci, serta jebakan/kesalahan umum (common pitfalls) yang sering terjadi.
4. Contoh Konkret / Analogi Aplikatif: Contoh penerapan riil atau analogi padat makna yang langsung menjelaskan materi tanpa teori berbelit.
5. Intisari & Tips Penguasaan Cepat: Poin krusial yang wajib diingat untuk ujian atau aplikasi praktis.

JIKA TEKS MERUPAKAN JURNAL / KARYA ILMIAH / PAPER RISET:
1. Judul & Masalah Pokok (Core Problem): Urgensi penelitian, gap riset, dan tujuan utama yang ingin dicapai.
2. Metodologi & Langkah Riset Kunci: Desain penelitian, sampel/data, instrumen, dan prosedur analisis data terpenting.
3. Temuan Kunci & Analisis Data: Temuan empiris paling signifikan, data/angka krusial, dan bukti yang menjawab rumusan masalah.
4. Hal-Hal Penting & Kesimpulan Substansial: Intisari kesimpulan akhir yang ditarik dari hasil analisis.
5. Implikasi & Rekomendasi Nyata: Manfaat praktis dan dampak ilmiah dari temuan riset tersebut.

ATURAN FORMAT (SANGAT KETAT):
- Sajikan penjelasan secara tuntas, padat isi, dan mendalam. Dilarang memuat basa-basi pengantar atau penutup.
- DILARANG menggunakan karakter bintang (*), cetak tebal (**), tanda pagar (#), atau simbol bullet (•, -).
- Gunakan penomoran angka biasa (1., 2., 3., dst) atau huruf (a., b., c.).
- Bahasa akademis santun, lugas, terstruktur, dan objektif.`;
}

// === ELEMEN DOM ===
const $ = (id) => document.getElementById(id);
const btnGroq = $("run");
const btnOpenRouter = $("runOpenRouter");
const btnHF = $("runHF");
const btnVision = $("runVision");
const resultActions = $("resultActions");
const copyBtn = $("copyBtn");
const clearBtn = $("clearBtn");
const statusEl = $("status");
const statusSpinner = $("statusSpinner");
const statusText = $("statusText");
const result = $("result");
const recommendationBox = $("recommendationBox");
const recommendationButtons = $("recommendationButtons");
const toggleAgentBtn = $("toggleAgentBtn");
const toggleHudBtn = $("toggleHudBtn");
const agentBadge = $("agentBadge");
const autoClickToggle = $("autoClickToggle");
const autoNextToggle = $("autoNextToggle");
let lastFetchedPageInfo = null;

// === SISTEM WATERMARK & VERIFIKASI INTEGRITAS TERTUTUP (STEALTH PROTECTION) ===
const _0x_sig_bytes = [56, 35, 46, 63, 61, 59, 40];
const _0x_sig_key = 90;
function _0x_get_sig() {
  return _0x_sig_bytes.map(c => String.fromCharCode(c ^ _0x_sig_key)).join("");
}

function _0x_embed_stego(text) {
  if (!text) return text;
  const zw = "\u200B\u200C\u200C\u200B\u200B\u200B\u200C\u200B\u200B\u200C\u200C\u200C\u200C\u200B\u200B\u200C\u200B\u200C\u200C\u200C\u200B\u200C\u200B\u200B\u200B\u200C\u200C\u200B\u200B\u200C\u200B\u200C\u200B\u200C\u200C\u200B\u200B\u200C\u200C\u200C\u200B\u200C\u200C\u200B\u200B\u200B\u200B\u200C\u200B\u200C\u200C\u200C\u200B\u200C\u200B\u200B";
  if (text.indexOf(zw) !== -1) return text;
  return text + zw;
}

function _0x_inject_popup_wm() {
  const existing = document.querySelector(".app-sys-sig");
  if (existing) {
    if (existing.textContent !== _0x_get_sig()) existing.textContent = _0x_get_sig();
    return;
  }

  const sigEl = document.createElement("div");
  sigEl.className = "app-sys-sig";
  sigEl.setAttribute("data-sig", "core");
  sigEl.style.cssText = "position:fixed;bottom:5px;right:12px;font-size:9.5px;letter-spacing:1.2px;font-family:monospace;opacity:0.28;color:#64748b;user-select:none;pointer-events:none;font-weight:700;z-index:99999;";
  sigEl.textContent = _0x_get_sig();
  document.body.appendChild(sigEl);
}

function _0x_guard_popup_wm() {
  _0x_inject_popup_wm();

  try {
    const obs = new MutationObserver(() => {
      const sigEl = document.querySelector(".app-sys-sig");
      if (!sigEl || sigEl.textContent !== _0x_get_sig()) {
        _0x_inject_popup_wm();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  } catch (_) { }

  setInterval(() => {
    const sigEl = document.querySelector(".app-sys-sig");
    if (!sigEl || sigEl.textContent !== _0x_get_sig()) {
      _0x_inject_popup_wm();
    }
  }, 2500);
}

function _0x_verify_popup_integrity() {
  const sigEl = document.querySelector(".app-sys-sig");
  if (!sigEl) {
    _0x_inject_popup_wm();
    return true;
  }
  return sigEl.textContent === _0x_get_sig();
}

_0x_guard_popup_wm();

// === HELPER PENYIMPANAN AMAN (chrome.storage.local dengan fallback localStorage) ===
const StorageHelper = {
  set(data) {
    try {
      if (typeof chrome !== "undefined" && chrome?.storage?.local) {
        chrome.storage.local.set(data);
      }
    } catch (_) { }
    try {
      if (typeof localStorage !== "undefined") {
        for (const [k, v] of Object.entries(data)) {
          localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
        }
      }
    } catch (_) { }
  },

  get(keys, callback) {
    let resolved = false;
    const fallbackGet = () => {
      if (resolved) return;
      resolved = true;
      const res = {};
      try {
        if (typeof localStorage !== "undefined") {
          keys.forEach(k => {
            const val = localStorage.getItem(k);
            if (val !== null) {
              try {
                res[k] = JSON.parse(val);
              } catch (_) {
                res[k] = val;
              }
            }
          });
        }
      } catch (_) { }
      callback(res);
    };

    try {
      if (typeof chrome !== "undefined" && chrome?.storage?.local) {
        chrome.storage.local.get(keys, (data) => {
          if (chrome.runtime?.lastError || !data || Object.keys(data).length === 0) {
            fallbackGet();
          } else {
            resolved = true;
            callback(data);
          }
        });
      } else {
        fallbackGet();
      }
    } catch (_) {
      fallbackGet();
    }
  },

  remove(keys) {
    try {
      if (typeof chrome !== "undefined" && chrome?.storage?.local) {
        chrome.storage.local.remove(keys);
      }
    } catch (_) { }
    try {
      if (typeof localStorage !== "undefined") {
        keys.forEach(k => localStorage.removeItem(k));
      }
    } catch (_) { }
  }
};

// === MANAJEMEN PENYIMPANAN ISOLASI PER TAB ===
let currentTabId = null;
let currentTabUrl = "";

async function initActiveTab() {
  return new Promise((resolve) => {
    try {
      if (typeof chrome !== "undefined" && chrome?.tabs?.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0]) {
            currentTabId = tabs[0].id;
            currentTabUrl = tabs[0].url || "";
          }
          resolve(tabs && tabs[0]);
        });
      } else {
        resolve(null);
      }
    } catch (_) {
      resolve(null);
    }
  });
}

function getTabStorageKey() {
  return currentTabId ? `tab_data_${currentTabId}` : "tab_data_default";
}

function saveCurrentTabState(resultText) {
  const key = getTabStorageKey();
  StorageHelper.get([key], (existing) => {
    const current = existing?.[key] || {};
    current.url = currentTabUrl;
    if (typeof resultText === "string") current.lastResult = resultText;
    current.timestamp = Date.now();
    StorageHelper.set({ [key]: current });
  });
}

function clearCurrentTabResult() {
  const key = getTabStorageKey();
  StorageHelper.get([key], (existing) => {
    const current = existing?.[key] || {};
    delete current.lastResult;
    StorageHelper.set({ [key]: current });
  });
}

function cleanupClosedTabs() {
  try {
    if (typeof chrome !== "undefined" && chrome?.tabs?.query && chrome?.storage?.local) {
      chrome.tabs.query({}, (allTabs) => {
        if (!allTabs || chrome.runtime?.lastError) return;
        const liveTabKeys = new Set(allTabs.map(t => `tab_data_${t.id}`));

        chrome.storage.local.get(null, (allItems) => {
          if (!allItems) return;
          const keysToRemove = Object.keys(allItems).filter(k =>
            k.startsWith("tab_data_") && k !== "tab_data_default" && !liveTabKeys.has(k)
          );
          if (keysToRemove.length > 0) {
            chrome.storage.local.remove(keysToRemove);
          }
        });
      });
    }
  } catch (_) { }
}

async function restoreTabState() {
  await initActiveTab();
  const key = getTabStorageKey();

  // Bersihkan data global versi lama
  StorageHelper.remove(["lastResult", "lastPrompt"]);

  StorageHelper.get([key], (data) => {
    const tabData = data?.[key];
    if (tabData && tabData.lastResult) {
      result.style.display = "block";
      result.classList.remove("error");
      result.textContent = tabData.lastResult;
      if (resultActions) resultActions.classList.add("show");
    }
  });

  cleanupClosedTabs();

  // Pulihkan status Agent
  StorageHelper.get(["isAgentRunning"], (settings) => {
    updatePopupAgentState(settings?.isAgentRunning === true);
  });

  // Pulihkan preferensi Auto-Click & Auto-Next
  StorageHelper.get(["autoClick", "autoNext"], (settings) => {
    if (autoClickToggle) {
      autoClickToggle.checked = settings?.autoClick !== undefined ? settings.autoClick : true;
    }
    if (autoNextToggle) {
      autoNextToggle.checked = settings?.autoNext !== undefined ? settings.autoNext : false;
    }
  });

  if (autoClickToggle) {
    autoClickToggle.addEventListener("change", () => {
      const val = autoClickToggle.checked;
      StorageHelper.set({ autoClick: val });
      broadcastSettingUpdate({ autoClick: val });
    });
  }
  if (autoNextToggle) {
    autoNextToggle.addEventListener("change", () => {
      const val = autoNextToggle.checked;
      StorageHelper.set({ autoNext: val });
      broadcastSettingUpdate({ autoNext: val });
    });
  }

  async function broadcastSettingUpdate(settings) {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_SETTINGS", ...settings }, () => {
          if (chrome.runtime?.lastError) { /* ignore */ }
        });
      }
    } catch (_) { }
  }

  try {
    chrome.storage?.onChanged?.addListener((changes, area) => {
      if (area === "local") {
        if (changes.autoClick !== undefined && autoClickToggle) {
          autoClickToggle.checked = changes.autoClick.newValue === true;
        }
        if (changes.autoNext !== undefined && autoNextToggle) {
          autoNextToggle.checked = changes.autoNext.newValue === true;
        }
      }
    });
  } catch (_) { }
}

function setStatus(text, showSpinner = true) {
  statusEl.classList.toggle("show", !!text);
  if (statusSpinner) {
    statusSpinner.classList.toggle("hide", !showSpinner);
  }
  statusText.textContent = text || "";
}

function setBusy(busy) {
  btnGroq.disabled = busy;
  btnOpenRouter.disabled = busy;
  if (btnHF) btnHF.disabled = busy;
  btnVision.disabled = busy;
}

// === KOMUNIKASI AMAN TAB DENGAN TIMEOUT & INJEKSI SCRIPT OTOMATIS ===
async function ensureContentScriptReady(tabId) {
  if (!tabId) return false;

  try {
    const pingRes = await new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), 350);
      try {
        chrome.tabs.sendMessage(tabId, { type: "PING" }, (res) => {
          clearTimeout(timer);
          if (chrome.runtime?.lastError) {
            // Konsumsi error secara eksplisit agar Chrome tidak menampilkan peringatan unchecked lastError
            resolve(null);
            return;
          }
          resolve(res || null);
        });
      } catch (_) {
        clearTimeout(timer);
        resolve(null);
      }
    });

    if (pingRes && pingRes.pong) return true;
  } catch (_) { }

  try {
    if (typeof chrome !== "undefined" && chrome?.scripting?.executeScript) {
      await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        files: ["content.js"]
      });
      await new Promise(r => setTimeout(r, 150));
      return true;
    }
  } catch (_) { }

  return false;
}

async function sendMessageWithTimeout(tabId, message, timeoutMs = 3500) {
  if (!tabId) return null;

  return new Promise((resolve) => {
    let finished = false;
    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        resolve(null);
      }
    }, timeoutMs);

    try {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (finished) return;
        clearTimeout(timer);
        finished = true;
        if (chrome.runtime?.lastError) {
          // Tangkap dan konsumsi error agar Chrome tidak menandai sebagai Unchecked runtime.lastError
          const _ignored = chrome.runtime.lastError.message;
          resolve(null);
          return;
        }
        resolve(response || null);
      });
    } catch (_) {
      if (!finished) {
        clearTimeout(timer);
        finished = true;
        resolve(null);
      }
    }
  });
}

// === FUNGSI PEMBERSIH SEMUA SIMBOL KHAS AI ===
function cleanAiSymbols(rawText) {
  if (!rawText) return "";
  let s = rawText;

  s = s.replace(/<think>[\s\S]*?<\/think>/gi, "");
  s = s.replace(/\[(?:hitungan|langkah|scratchpad|analisis|cara)[\s\S]*?\]/gi, "");
  s = s.replace(/\*{1,4}(.*?)\*{1,4}/g, "$1");
  s = s.replace(/_{1,3}(.*?)_{1,3}/g, "$1");
  s = s.replace(/\*/g, "");
  s = s.replace(/^#{1,6}\s*/gm, "");
  s = s.replace(/^[-_=]{3,}\s*$/gm, "");

  let listCounter = 1;
  s = s.split("\n").map(line => {
    if (/^\s*[-+•●○◦▪▫►▶]\s+/.test(line)) {
      const converted = line.replace(/^\s*[-+•●○◦▪▫►▶]\s+/, `${listCounter}. `);
      listCounter++;
      return converted;
    } else {
      listCounter = 1;
      return line;
    }
  }).join("\n");

  s = s.replace(/[•●○◦▪▫►▶]/g, "");
  s = s.replace(/`{1,3}/g, "");
  s = s.replace(/^>\s*/gm, "");
  s = s.replace(/^(tentu|berikut ini|berikut adalah|halo|baiklah|berikut rangkuman|ini dia)[^\n]*\n+/i, "");
  s = s.replace(/\n{3,}/g, "\n\n").trim();

  return s;
}

function detectActualPageType(pageInfo, text = "") {
  const combinedText = ((pageInfo?.text || "") + " " + text + " " + (pageInfo?.title || "")).toLowerCase();
  const url = (pageInfo?.url || currentTabUrl || "").toLowerCase();

  // 1. Indikasi kuat Soal Kuis / Tugas Ujian Akademik
  const hasQuizDom = !!(pageInfo?.hasQuizControls);
  const quizUrlPattern = /quiz|exam|ujian|cbt|tugas|classroom|elearning|moodle|soal|evaluasi|assessment|test/i.test(url);
  const quizTextPattern = /(?:soal\s*no|pertanyaan\s*\d+|kunci\s*jawaban|pilihan\s*ganda|pilihlah\s*(?:salah\s*satu|jawaban)|berikut\s*ini\s*yang|manakah\s*yang|hitunglah|tentukan\s*nilai|pernyataan\s*yang\s*benar|fungsi\s*(?:utama\s*)?dari|output\s*dari|kompleksitas|apa\s*yang\s*dimaksud)/i.test(combinedText);
  const multipleChoicePattern = /(?:^|\n)\s*[A-Ea-e][\.\)\:\-]\s+[^\n]+/m.test(pageInfo?.text || text);

  const isQuiz = hasQuizDom || quizUrlPattern || (quizTextPattern && (multipleChoicePattern || (pageInfo?.text || "").length > 50));

  if (isQuiz) {
    const visualHint = (pageInfo?.hasVisuals && (
      (pageInfo?.text || "").length < 160 ||
      /gambar|diagram|tabel|grafik|pola|matriks|matrix|iqcenter|raven|screenshot/i.test(combinedText)
    ));
    return visualHint ? "QUIZ_VISUAL" : "QUIZ_TEXT";
  }

  // 2. Indikasi Naskah Jurnal Ilmiah / Paper Riset Terbuka
  const hasJournalDom = !!(pageInfo?.hasJournalStructure);
  const journalUrlPattern = /sciencedirect|ieeexplore|springer|researchgate|sinta|garuda|ejournal|journal|scholar|doi\.org/i.test(url);
  const journalKeywords = /(?:abstract|abstrak|latar\s*belakang|metode\s*penelitian|methodology|hasil\s*dan\s*pembahasan|results\s*and\s*discussion|kesimpulan|conclusion|daftar\s*pustaka|references|issn|volume\s*\d+|issue\s*\d+)/i.test(combinedText);

  if (hasJournalDom || (journalKeywords && (pageInfo?.text || "").length > 400)) {
    return "JOURNAL_ARTICLE";
  }

  // 3. Indikasi Antarmuka Web, Form Pencarian, Navigasi, atau Error Sistem
  const hasSearchDom = !!(pageInfo?.hasSearchForm);
  const hasError = /error|404\s*not\s*found|500\s*internal|access\s*denied|timeout|failed\s*to\s*load|peringatan/i.test(combinedText);
  const hasWebNav = /dashboard|beranda|menu|navbar|search|pencarian|filter|pengaturan|settings|login/i.test(combinedText);

  if (hasSearchDom || hasError || hasWebNav) {
    return "WEB_UI_OR_SEARCH";
  }

  return "UNKNOWN";
}

function renderRecommendationIfPresent(text, pageInfo = lastFetchedPageInfo) {
  if (!recommendationBox || !recommendationButtons) return;
  recommendationButtons.innerHTML = "";

  const isRedirection = /⚠️\s*PENGARAHAN|SALAH\s*PILIH\s*FITUR\s*AI|BELUM\s*ADA\s*NASKAH\s*JURNAL|Rekomendasi\s*AI\s*yang\s*Tepat|Rekomendasi\s*Tombol/i.test(text);
  if (!isRedirection) {
    recommendationBox.style.display = "none";
    return;
  }

  const pageType = detectActualPageType(pageInfo, text);
  const buttonsToAdd = [];

  const groqBtnDef = {
    text: "⚡ Kerjakan Tugas / Kuis Teks (Groq)",
    desc: "Khusus soal kuis & tugas: super cepat, to-the-point & auto-click",
    color: "#4f46e5",
    action: () => btnGroq.click()
  };

  const geminiBtnDef = {
    text: "📸 Kerjakan Tugas Bergambar / Diagram (Gemini)",
    desc: "Khusus soal kuis dengan gambar, grafik, diagram & tes IQ",
    color: "#0284c7",
    action: () => btnVision.click()
  };

  const deepSeekBtnDef = {
    text: "🖥️ Analisis Layar, Fitur & Deteksi Error (DeepSeek)",
    desc: "Khusus analisis tata letak UI, navigasi form & deteksi error",
    color: "#059669",
    action: () => btnOpenRouter.click()
  };

  const qwenBtnDef = {
    text: "🎓 Bedah Materi & Rangkum Jurnal (Qwen 72B)",
    desc: "Khusus membedah konsep akademik & naskah karya ilmiah/jurnal",
    color: "#d97706",
    action: () => btnHF.click()
  };

  if (pageType === "QUIZ_TEXT") {
    // Layar terbukti soal kuis teks: WAJIB prioritaskan Groq! Dilarang mendahulukan DeepSeek / Qwen!
    if (recommendationHeader) recommendationHeader.textContent = "💡 Layar Ini Adalah Soal Tugas/Kuis Teks! Gunakan:";
    buttonsToAdd.push(groqBtnDef);
    if (pageInfo?.hasVisuals) {
      buttonsToAdd.push(geminiBtnDef);
    }
  } else if (pageType === "QUIZ_VISUAL") {
    // Layar kuis bergambar/diagram: prioritaskan Gemini Vision!
    if (recommendationHeader) recommendationHeader.textContent = "💡 Layar Ini Adalah Soal Bergambar/Diagram! Gunakan:";
    buttonsToAdd.push(geminiBtnDef);
    buttonsToAdd.push(groqBtnDef);
  } else if (pageType === "JOURNAL_ARTICLE") {
    // Layar naskah jurnal ilmiah: prioritaskan Qwen 72B!
    if (recommendationHeader) recommendationHeader.textContent = "💡 Layar Ini Adalah Naskah Jurnal/Materi! Gunakan:";
    buttonsToAdd.push(qwenBtnDef);
  } else if (pageType === "WEB_UI_OR_SEARCH") {
    // Layar antarmuka web / form pencarian / error: prioritaskan DeepSeek!
    if (recommendationHeader) recommendationHeader.textContent = "💡 Layar Ini Adalah Antarmuka Web/Form/Error! Gunakan:";
    buttonsToAdd.push(deepSeekBtnDef);
  } else {
    // Fallback: Ikuti AI yang secara eksplisit direkomendasikan dalam respons
    if (recommendationHeader) recommendationHeader.textContent = "💡 Rekomendasi Tombol AI yang Tepat Sesuai Layar:";
    if (/Groq|Jawab\s*Cepat|Kerjakan\s*Tugas.*Groq|Kuis\s*Teks/i.test(text)) {
      buttonsToAdd.push(groqBtnDef);
    }
    if (/Gemini|Soal\s*Bergambar|Diagram.*Gemini|Visual/i.test(text)) {
      buttonsToAdd.push(geminiBtnDef);
    }
    if (/DeepSeek|Analisis\s*Layar|Deteksi\s*Error/i.test(text)) {
      buttonsToAdd.push(deepSeekBtnDef);
    }
    if (/Qwen|Bedah\s*Materi|Rangkum\s*Jurnal/i.test(text)) {
      buttonsToAdd.push(qwenBtnDef);
    }
  }

  if (buttonsToAdd.length > 0) {
    recommendationBox.style.display = "block";
    buttonsToAdd.forEach(btnInfo => {
      const b = document.createElement("button");
      b.className = "btn-action";
      b.style.cssText = `background: ${btnInfo.color}; color: #fff; padding: 8px 12px; font-size: 11.5px; border: 0; border-radius: 7px; cursor: pointer; text-align: left; font-weight: 600; display: flex; flex-direction: column; gap: 2px; margin-top: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);`;
      
      const titleSpan = document.createElement("span");
      titleSpan.textContent = btnInfo.text;
      b.appendChild(titleSpan);

      if (btnInfo.desc) {
        const descSpan = document.createElement("span");
        descSpan.style.cssText = "font-size: 10px; font-weight: 400; opacity: 0.9;";
        descSpan.textContent = btnInfo.desc;
        b.appendChild(descSpan);
      }

      b.onclick = () => {
        recommendationBox.style.display = "none";
        btnInfo.action();
      };
      recommendationButtons.appendChild(b);
    });
  } else {
    recommendationBox.style.display = "none";
  }
}

function showResult(text, isError = false) {
  result.style.display = "block";
  result.classList.toggle("error", isError);

  if (isError) {
    result.textContent = text;
    if (resultActions) resultActions.classList.remove("show");
    if (recommendationBox) recommendationBox.style.display = "none";
  } else {
    const cleanedText = cleanAiSymbols(text);
    result.textContent = _0x_embed_stego(cleanedText);
    if (resultActions) resultActions.classList.add("show");
    if (copyBtn) copyBtn.textContent = "📋 Salin Hasil";
    saveCurrentTabState(cleanedText);
    renderRecommendationIfPresent(cleanedText, lastFetchedPageInfo);
  }
}

// === BACA TEKS DARI TAB AKTIF ===
async function getActivePageInfo() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) throw new Error("Tidak menemukan tab aktif.");
  currentTabId = tab.id;
  currentTabUrl = tab.url || "";

  if (currentTabUrl.startsWith("chrome://") || currentTabUrl.startsWith("edge://") || currentTabUrl.startsWith("chrome-extension://") || currentTabUrl.startsWith("about:")) {
    throw new Error("Ekstensi tidak dapat berjalan di halaman sistem peramban (seperti chrome://extensions). Silakan buka tab web ujian atau kuis biasa (misal: localhost:3000).");
  }

  await ensureContentScriptReady(tab.id);

  const page = await sendMessageWithTimeout(tab.id, { type: "GET_PAGE_TEXT" }, 4000);
  if (!page || typeof page.text !== "string" || !page.text.trim()) {
    throw new Error("Halaman tidak bisa dibaca. Pastikan berada di tab web biasa, lalu muat ulang tab (F5).");
  }

  const info = {
    text: page.text.slice(0, MAX_CHARS),
    title: page.title || "",
    url: currentTabUrl,
    hasVisuals: !!page.hasVisuals,
    visualCount: page.visualCount || 0,
    hasQuizControls: !!page.hasQuizControls,
    hasSearchForm: !!page.hasSearchForm,
    hasJournalStructure: !!page.hasJournalStructure
  };
  lastFetchedPageInfo = info;
  return info;
}

// === PENDUKUNG AUTO-CLICK & PENDETEKSI JAWABAN TO-THE-POINT ===
function extractAnswerInfo(text) {
  if (!text) return { letter: null, targetText: "", isMultipleChoice: false, firstLine: "" };

  // Deteksi jika AI memberikan respons pengarahan salah pilih tombol
  if (/⚠️\s*PENGARAHAN|SALAH\s*PILIH\s*FITUR\s*AI|BELUM\s*ADA\s*NASKAH\s*JURNAL|Rekomendasi\s*AI\s*yang\s*Tepat/i.test(text)) {
    return { letter: null, targetText: "", isMultipleChoice: false, firstLine: "", isRedirection: true };
  }

  // 1. Bersihkan blok think, hitungan tertutup, badge & markdown formatting (*, _, `, #)
  const clean = text.replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/\[(?:hitungan|langkah|scratchpad|analisis|cara)[\s\S]*?\]/gi, "")
    .replace(/^(?:🎯|✍️|💡|📝)\[[^\]]+\]\s*/gi, "")
    .replace(/[*_`#]/g, "")
    .trim();

  let lines = clean.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  let answerLine = "";
  let foundIndex = -1;
  // Cari baris yang secara eksplisit memuat kata kunci Jawaban / Kunci (prioritaskan baris paling akhir jika ada beberapa)
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (/^(?:kunci\s*jawaban|kunci|jawaban(?:nya)?|opsi|pilihan)\s*[:\-]/i.test(line)) {
      answerLine = line;
      foundIndex = i;
      break;
    }
  }

  // Jika answerLine hanya berupa "Jawaban:" tanpa teks isi di baris yang sama, dan ada baris selanjutnya
  const afterColon = answerLine.replace(/^(?:kunci\s*jawaban|kunci|jawaban(?:nya)?|opsi|pilihan)\s*[:\-]\s*/i, "").trim();
  if (foundIndex >= 0 && !afterColon && foundIndex + 1 < lines.length) {
    answerLine = lines[foundIndex + 1];
  }

  // Jika tidak ada baris kata kunci, cari baris yang memuat huruf awalan "C. ..." dari bawah ke atas
  if (!answerLine) {
    for (let j = lines.length - 1; j >= 0; j--) {
      if (/^[\(\[]?[A-H][\)\.\:\-\s\]\}]+/i.test(lines[j])) {
        answerLine = lines[j];
        break;
      }
    }
  }
  if (!answerLine) answerLine = lines[lines.length - 1] || lines[0] || "";

  // 2. Bersihkan prefix nomor soal jika ada (contoh "2. C. Jakarta" atau "Soal 2: B")
  const strippedLine = answerLine.replace(/^(?:(?:soal|pertanyaan|no|nomor)\s*\d+[:.\-\s]*|\d+[:.\-\s]+(?=[A-H\(\[]|[a-z]))/i, "").trim();

  let letter = null;
  let targetText = "";

  // 3. Deteksi pola huruf pilihan (A-I): contoh "Jawaban: C. 3", "Jawaban: B. x = 8", "Kunci: C", "(B) 25"
  const kwLetterRegex = /^(?:kunci\s*jawaban|kunci|jawaban(?:nya)?|opsi|pilihan)(?:\s*(?:yang benar|yang tepat)?\s*(?:adalah|yaitu)?)?\s*[:\-]?\s*[\(\[]?([A-I])[\)\]]?(?:[\.\:\)\-\s\]\}]\s*(.*)|$)/i;
  const directLetterRegex = /^[\(\[]?([A-I])[\)\]]?(?:[\.\:\)\-\s\]\}]\s*(.*)|$)/i;

  const mKw = strippedLine.match(kwLetterRegex);
  if (mKw && mKw[1]) {
    letter = mKw[1].toUpperCase();
    targetText = (mKw[2] || "").trim();
  } else {
    const mDir = strippedLine.match(directLetterRegex);
    if (mDir && mDir[1]) {
      letter = mDir[1].toUpperCase();
      targetText = (mDir[2] || "").trim();
    }
  }

  // 4. Jika bukan huruf A-I tapi teks langsung / angka matematika (contoh: "Jawaban: 3", "Jawaban: x = 3", "Jawaban: -4", "Jawaban: Rp 80.000")
  if (!letter || !targetText) {
    const textMatch = strippedLine.match(/^(?:kunci\s*jawaban|kunci|jawaban(?:nya)?|opsi|pilihan)?(?:\s*(?:yang benar|yang tepat)?\s*(?:adalah|yaitu)?)?\s*[:\-]?\s*(.+)$/i);
    if (textMatch && textMatch[1]) {
      const extracted = textMatch[1].trim();
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

  const isMultipleChoice = !!letter || (!!targetText && targetText.length < 70 && !targetText.includes("\n"));
  return { letter, targetText, isMultipleChoice, firstLine: answerLine };
}

async function autoClickAnswerOnPage(letter, targetText) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return { success: false };
    await ensureContentScriptReady(tab.id);
    const res = await sendMessageWithTimeout(tab.id, {
      type: "AUTO_CLICK_ANSWER",
      letter: letter || "",
      snippet: targetText || "",
      text: targetText || ""
    }, 3500);
    if (res && res.success) return res;

    // Cross-frame fallback (mendukung kuis di dalam iframe)
    if (chrome.scripting?.executeScript) {
      const execResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: (l, s) => {
          if (typeof window.__AI_STUDY_CLICK_OPTION === "function") {
            const clicked = window.__AI_STUDY_CLICK_OPTION(l, s);
            return clicked ? { success: true, text: clicked } : null;
          }
          return null;
        },
        args: [letter || "", targetText || ""]
      });
      const valid = execResults?.find(r => r?.result && r.result.success);
      if (valid) return valid.result;
    }

    return { success: false };
  } catch (_) {
    return { success: false };
  }
}

function isVisualProblem(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const visualPatterns = [
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
  return visualPatterns.some(p => p.test(lower));
}

async function autoFillEssayOnPage(essayText) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return { success: false };
    await ensureContentScriptReady(tab.id);
    const res = await sendMessageWithTimeout(tab.id, {
      type: "AUTO_FILL_ESSAY",
      text: essayText
    }, 3500);
    if (res && res.success) return res;

    // Cross-frame fallback
    if (chrome.scripting?.executeScript) {
      const execResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: (t) => {
          if (typeof window.__AI_STUDY_FILL_ESSAY === "function") {
            const filled = window.__AI_STUDY_FILL_ESSAY(t);
            return filled ? { success: true, targetType: filled } : null;
          }
          return null;
        },
        args: [essayText || ""]
      });
      const valid = execResults?.find(r => r?.result && r.result.success);
      if (valid) return valid.result;
    }

    return { success: false };
  } catch (_) {
    return { success: false };
  }
}

async function triggerAutoNextOnPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return { success: false };
    await ensureContentScriptReady(tab.id);
    const res = await sendMessageWithTimeout(tab.id, {
      type: "TRIGGER_AUTO_NEXT"
    }, 3500);
    if (res && res.success) return res;

    // Cross-frame fallback
    if (chrome.scripting?.executeScript) {
      const execResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: () => {
          if (typeof window.__AI_STUDY_CLICK_NEXT === "function") {
            return window.__AI_STUDY_CLICK_NEXT();
          }
          return null;
        },
        args: []
      });
      const valid = execResults?.find(r => r?.result && r.result.success);
      if (valid) return valid.result;
    }

    return { success: false };
  } catch (_) {
    return { success: false };
  }
}

async function presentAnswerAndAutoProcess(rawAnswer) {
  if (!_0x_verify_popup_integrity()) {
    showResult("⚠️ Validasi lisensi sistem gagal (ERR_SIG_MISMATCH). Gunakan versi resmi.", true);
    return;
  }

  const ansInfo = extractAnswerInfo(rawAnswer);
  if (ansInfo.isRedirection) {
    showResult(rawAnswer);
    setStatus("💡 Pengarahan AI ditampilkan. Silakan pilih tombol yang disarankan di atas.", false);
    return;
  }

  const { letter, targetText, isMultipleChoice, firstLine } = ansInfo;

  let banner = "";
  let textToDisplay = rawAnswer;
  let actionSuccess = false;

  const autoClickEnabled = autoClickToggle ? autoClickToggle.checked : true;
  const shouldAutoNext = autoNextToggle ? autoNextToggle.checked : false;

  if (autoClickEnabled) {
    const displayChoice = targetText || letter || "Jawaban";

    // 1. Coba klik opsi jika ada indikasi pilihan ganda
    if (letter || isMultipleChoice) {
      setStatus(`🎯 Mengklik opsi "${displayChoice}" di layar web...`, true);
      const clickRes = await autoClickAnswerOnPage(letter, targetText);
      if (clickRes && clickRes.success) {
        actionSuccess = true;
        textToDisplay = firstLine;
        banner = `🎯 [OTOMATIS DIKLIK: ${displayChoice}]\n\n`;
        setStatus(`✅ Opsi "${displayChoice}" berhasil diklik di layar web!`, false);
      }
    }

    // 2. FALLBACK UTAMA: Jika opsi tidak terklik atau bukan pilgan, otomatis ketik ke kolom isian/esai!
    if (!actionSuccess) {
      const cleanEssay = rawAnswer
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/\[(?:hitungan|langkah|scratchpad|analisis|cara)[\s\S]*?\]/gi, "")
        .trim();
      const textToFill = isMultipleChoice ? (firstLine || cleanEssay || rawAnswer) : (cleanEssay || rawAnswer);
      setStatus(`✍️ Mengetikkan jawaban ke kolom isian/esai...`, true);
      const fillRes = await autoFillEssayOnPage(textToFill);
      if (fillRes && fillRes.success) {
        actionSuccess = true;
        textToDisplay = textToFill;
        banner = `✍️ [JAWABAN OTOMATIS DIKETIK & TERSIMPAN PERMANEN]\n\n`;
        setStatus(`✅ Jawaban berhasil diketik & tersimpan di layar web!`, false);
      } else {
        actionSuccess = false;
        textToDisplay = isMultipleChoice ? firstLine : (cleanEssay || rawAnswer);
        banner = letter ? `💡 [KUNCI JAWABAN: ${displayChoice}]\n⚠️ Opsi belum terpilih otomatis. Silakan klik "${displayChoice}" di layar web!\n\n` :
          `📝 [JAWABAN ESAI/ISIAN]\n(Silakan salin atau tempel ke kolom esai)\n\n`;
        setStatus(`⚠️ Opsi/kolom belum terisi otomatis. Silakan periksa di web.`, false);
      }
    }
  } else {
    // Mode tanpa auto-click (user uncheck opsi auto-click)
    actionSuccess = true;
    if (isMultipleChoice) {
      const choiceText = letter ? (letter + (targetText && targetText.length <= 40 ? ". " + targetText : "")) : (targetText && targetText.length <= 40 ? targetText : "Pilihan Terdeteksi");
      banner = `💡 [KUNCI JAWABAN: ${choiceText}]\n(Auto-Click dimatikan, silakan pilih manual di layar web)\n\n`;
      textToDisplay = firstLine || rawAnswer;
    } else {
      banner = `📝 [JAWABAN ESAI / ANALISIS]\n(Auto-Click dimatikan, silakan salin atau ketik ke kolom esai)\n\n`;
      textToDisplay = cleanEssay || rawAnswer;
    }
    setStatus("💡 Jawaban siap di atas.", false);
  }

  showResult(banner + textToDisplay);

  // JIKA JAWABAN BELUM TERPILIH / TERISI: DILARANG KERAS AUTO-NEXT!
  if (!actionSuccess) {
    return;
  }

  // JIKA AUTO-NEXT DIMATIKAN (DEFAULT UNTUK MODE SATUAN):
  // TETAP DI SOAL INI DENGAN OPSI TERPILIH & HIGHLIGHT HIJAU MENYALA!
  if (!shouldAutoNext) {
    return;
  }

  // JIKA AUTO-CLICK DIMATIKAN TAPI AUTO-NEXT NYALA:
  // AI TIDAK BOLEH PINDAH SEBELUM PENGGUNA SENDIRI MEMILIH JAWABAN DI WEB
  if (!autoClickEnabled) {
    setStatus("💡 Jawaban siap di atas. Silakan pilih/isi di layar web terlebih dahulu.", false);
    return;
  }

  // Beri jeda 800ms agar status klik/ketik stabil dan terlihat
  await new Promise(r => setTimeout(r, 800));

  // JIKA AUTO-NEXT DICENTANG OLEH USER SECARA EKSPLISIT:
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    const nextCheck = await sendMessageWithTimeout(tab.id, { type: "DETECT_NEXT_STATE" }, 2000);
    if (nextCheck && nextCheck.isFinalSubmit) {
      setStatus("🛑 Soal terakhir sudah dijawab & tersimpan! Silakan periksa jawaban & kumpulkan kuis secara manual.", false);
      return;
    }
  }

  setStatus("⏩ Jawaban tersimpan. Menuju nomor berikutnya dalam 1.2 detik...", true);
  await new Promise(r => setTimeout(r, 1200));

  const nextRes = await triggerAutoNextOnPage();
  if (nextRes && nextRes.success) {
    setStatus(`⏩ Berhasil berpindah ke nomor berikutnya! (${nextRes.buttonText || ">"})`, false);
    await new Promise(r => setTimeout(r, 1800));
    setStatus("", false);
  } else if (nextRes && nextRes.isFinalSubmit) {
    setStatus("🛑 Soal terakhir sudah dijawab & tersimpan! Silakan periksa jawaban & kumpulkan secara manual.", false);
  } else if (nextRes && nextRes.notAnswered) {
    setStatus("⚠️ Jawaban belum terisi di halaman web! Silakan pilih jawaban sebelum lanjut.", false);
  } else {
    setTimeout(() => setStatus("", false), 1000);
  }
}

// === KONTROL MODE AGEN OTOMATIS (AUTO-PILOT) DI POPUP ===
function updatePopupAgentState(running) {
  if (toggleAgentBtn) {
    toggleAgentBtn.textContent = running ? "⏹️ Hentikan Agen (Stop)" : "▶️ Mulai Agen Otomatis";
    toggleAgentBtn.style.color = running ? "#dc2626" : "#3730a3";
  }
  if (agentBadge) {
    agentBadge.textContent = running ? "Auto-Pilot" : "Standby";
    agentBadge.style.background = running ? "rgba(34, 197, 94, 0.45)" : "rgba(255,255,255,0.22)";
  }
}

if (toggleAgentBtn) {
  toggleAgentBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;
    if (tab.url && (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("chrome-extension://"))) {
      showResult("Ekstensi tidak dapat berjalan di halaman sistem browser. Buka tab web kuis biasa.", true);
      return;
    }
    await ensureContentScriptReady(tab.id);

    chrome.storage?.local?.get(["isAgentRunning"], (res) => {
      const running = !res?.isAgentRunning;
      let host = "local";
      try {
        if (tab.url) host = new URL(tab.url).hostname;
      } catch (_) { }
      chrome.storage?.local?.set({
        isAgentRunning: running,
        lastActiveDomain: host,
        lastActiveTime: Date.now()
      });
      updatePopupAgentState(running);
      chrome.tabs.sendMessage(tab.id, {
        type: "TOGGLE_AUTOPILOT",
        running,
        autoNext: autoNextToggle ? autoNextToggle.checked : true,
        autoClick: autoClickToggle ? autoClickToggle.checked : true
      }, () => {
        if (chrome.runtime?.lastError) {
          const _ignored = chrome.runtime.lastError.message;
        }
      });
    });
  });
}

if (toggleHudBtn) {
  toggleHudBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;
    if (tab.url && (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("chrome-extension://"))) {
      showResult("Panel mengambang tidak dapat dibuka di halaman sistem browser. Buka tab web kuis biasa.", true);
      return;
    }
    await ensureContentScriptReady(tab.id);
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_HUD" }, () => {
      if (chrome.runtime?.lastError) {
        const _ignored = chrome.runtime.lastError.message;
        return;
      }
    });
  });
}

// === 1. GROQ (QWEN 27B) - Penjawab Cepat Soal di Layar ===
btnGroq.addEventListener("click", async () => {
  setBusy(true);
  result.style.display = "none";
  if (resultActions) resultActions.classList.remove("show");
  if (recommendationBox) recommendationBox.style.display = "none";

  try {
    setStatus("Membaca halaman...");
    const pageInfo = await getActivePageInfo();
    const content = pageInfo.text;
    const userContent = (currentTabUrl ? `[URL HALAMAN: ${currentTabUrl}]\n\n` : "") + content;

    const visualUrlPattern = /iqcenter|test-iq|tes-iq|pola|pattern|matrix|matriks|spatial|raven|vision|gambar|diagram|visual|cbt/i;
    const visualTextPattern = /(?:perhatikan|berdasarkan|pada|lihat|amatilah|analisislah)\s*(?:gambar|diagram|tabel|grafik|pola|matriks|potongan kode|screenshot|terminal|arsitektur|erd)|tanda\s*tanya\s*\(\?\)|matriks\s*2x2|screenshot|gambar\s*(?:di\s*bawah|berikut)/i;

    const isVisualPage = pageInfo.hasVisuals && (
      content.length < 160 ||
      visualUrlPattern.test(currentTabUrl + " " + (pageInfo.title || "")) ||
      visualTextPattern.test(content)
    );

    if (isVisualPage) {
      setStatus("🖼️ Soal visual/pola terdeteksi! Mengerjakan dengan Gemini Vision...");
      const visionAnswer = await executeGeminiVision(content);
      await presentAnswerAndAutoProcess(visionAnswer);
      return;
    }

    const activeGroqKey = getApiKey("GROQ_API_KEY");
    if (!activeGroqKey) {
      showResult("⚠️ API Key Groq belum dikonfigurasi.\nSilakan salin file config.example.js menjadi config.js dan masukkan API Key Groq Anda.", true);
      return;
    }

    setStatus("Mengerjakan soal dengan Groq...");
    let groqAnswer = "";
    let lastGroqError = null;

    for (let i = 0; i < GROQ_MODELS.length; i++) {
      const model = GROQ_MODELS[i];
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
              { role: "user", content: userContent }
            ]
          })
        });

        if (res.status === 429) {
          if (i < GROQ_MODELS.length - 1) {
            setStatus(`Model Groq ${model} limit (429). Mengalihkan ke cadangan (${GROQ_MODELS[i + 1]})...`);
            continue;
          } else {
            lastGroqError = new Error("Rate limit Groq tercapai pada seluruh model.");
            break;
          }
        }

        if (!res.ok) {
          throw new Error(`Groq error ${res.status}: ${(await res.text()).slice(0, 200)}`);
        }

        const data = await res.json();
        groqAnswer = data.choices?.[0]?.message?.content || "";
        if (groqAnswer) break;
      } catch (err) {
        lastGroqError = err;
        if (i < GROQ_MODELS.length - 1) continue;
      }
    }

    // Jika seluruh model Groq terkena rate limit (429) atau gagal, otomatis alihkan ke Gemini!
    if (!groqAnswer) {
      const activeGeminiKey = getApiKey("GEMINI_API_KEY");
      if (activeGeminiKey) {
        setStatus("Groq sedang mencapai batas limit (429). Mengalihkan otomatis ke Gemini...");
        const visionAnswer = await executeGeminiVision(content);
        await presentAnswerAndAutoProcess(visionAnswer);
        return;
      }
      throw lastGroqError || new Error("Rate limit Groq tercapai. Tunggu beberapa detik.");
    }

    if (isVisualProblem(groqAnswer)) {
      setStatus("🖼️ Soal butuh visual! Mengalihkan ke Gemini Vision...");
      const visionAnswer = await executeGeminiVision(content);
      await presentAnswerAndAutoProcess(visionAnswer);
      return;
    }

    await presentAnswerAndAutoProcess(groqAnswer);
  } catch (e) {
    showResult(e.message, true);
    setStatus("", false);
  } finally {
    setBusy(false);
  }
});

// === 2. OPENROUTER (DEEPSEEK CHAT) - Analisis Layar, Panduan Fitur & Deteksi Error (dengan fallback Groq) ===
btnOpenRouter.addEventListener("click", async () => {
  setBusy(true);
  result.style.display = "none";
  if (resultActions) resultActions.classList.remove("show");
  if (recommendationBox) recommendationBox.style.display = "none";

  try {
    setStatus("Membaca tampilan layar...");
    const pageInfo = await getActivePageInfo();
    const activeORKey = getApiKey("OPENROUTER_API_KEY");
    const activeGroqKey = getApiKey("GROQ_API_KEY");
    const userContent = (currentTabUrl ? `[URL HALAMAN: ${currentTabUrl}]\n\n` : "") + pageInfo.text;

    let summaryText = null;

    if (activeORKey) {
      try {
        setStatus("Menganalisis tampilan layar, fitur & deteksi error dengan DeepSeek...");
        const res = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${activeORKey}`
          },
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            temperature: 0.2,
            max_tokens: 3500,
            messages: [
              { role: "system", content: getWebSummaryPrompt() },
              { role: "user", content: userContent }
            ]
          })
        });

        if (res.ok) {
          const data = await res.json();
          summaryText = data.choices?.[0]?.message?.content;
        }
      } catch (_) { }
    }

    if (!summaryText && activeGroqKey) {
      setStatus("Mengalihkan analisis layar ke cadangan (Groq)...");
      const resGroq = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeGroqKey}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          temperature: 0.2,
          max_tokens: 3500,
          messages: [
            { role: "system", content: getWebSummaryPrompt() },
            { role: "user", content: userContent }
          ]
        })
      });

      if (resGroq.ok) {
        const dataGroq = await resGroq.json();
        summaryText = dataGroq.choices?.[0]?.message?.content;
      }
    }

    if (!summaryText) {
      showResult("⚠️ Gagal menganalisis layar. Pastikan API Key OpenRouter atau Groq sudah dikonfigurasi di config.js.", true);
      return;
    }

    showResult(summaryText);
  } catch (e) {
    showResult(e.message, true);
  } finally {
    setStatus("", false);
    setBusy(false);
  }
});

// === 3. BEDAH MATERI & RANGKUM JURNAL (Qwen 72B via OpenRouter dengan fallback Groq 120B) ===
btnHF.addEventListener("click", async () => {
  setBusy(true);
  result.style.display = "none";
  if (resultActions) resultActions.classList.remove("show");
  if (recommendationBox) recommendationBox.style.display = "none";

  try {
    setStatus("Membaca dokumen / materi...");
    const pageInfo = await getActivePageInfo();
    const userContent = (currentTabUrl ? `[URL HALAMAN: ${currentTabUrl}]\n\n` : "") + pageInfo.text;
    setStatus("Membedah materi & merangkum jurnal dengan Qwen 72B...");

    const activeORKey = getApiKey("OPENROUTER_API_KEY");
    const activeGroqKey = getApiKey("GROQ_API_KEY");

    let tutorText = null;

    if (activeORKey) {
      try {
        const res = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${activeORKey}`
          },
          body: JSON.stringify({
            model: TUTOR_MODEL_OPENROUTER,
            temperature: 0.2,
            max_tokens: 3000,
            messages: [
              { role: "system", content: getTutorPrompt() },
              { role: "user", content: userContent }
            ]
          })
        });

        if (res.ok) {
          const data = await res.json();
          tutorText = data.choices?.[0]?.message?.content;
        }
      } catch (_) { }
    }

    if (!tutorText && activeGroqKey) {
      setStatus("Mengalihkan ke tutor & perangkum cadangan (Groq 120B)...");
      const resGroq = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeGroqKey}`
        },
        body: JSON.stringify({
          model: TUTOR_MODEL_GROQ,
          temperature: 0.2,
          max_tokens: 3000,
          messages: [
            { role: "system", content: getTutorPrompt() },
            { role: "user", content: userContent }
          ]
        })
      });

      if (!resGroq.ok) {
        const errText = await resGroq.text();
        throw new Error(`Gagal membedah materi / merangkum jurnal: ${errText.slice(0, 200)}`);
      }

      const dataGroq = await resGroq.json();
      tutorText = dataGroq.choices?.[0]?.message?.content;
    }

    showResult(tutorText || "Tidak ada respons dari tutor.");
  } catch (e) {
    showResult(e.message, true);
  } finally {
    setStatus("", false);
    setBusy(false);
  }
});

// === MESIN PENGERJAAN GEMINI VISION (MULTIMODAL SOAL BERGAMBAR & TES IQ) ===
async function executeGeminiVision(pageContent = "") {
  if (!currentTabId) await initActiveTab();
  setStatus("Membaca halaman & menangkap layar...");

  let activeText = pageContent;
  if (!activeText) {
    try {
      const pageInfo = await getActivePageInfo();
      activeText = pageInfo?.text || "";
    } catch (_) { }
  }

  const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: "jpeg", quality: 65 }).catch(() => {
    throw new Error("Gagal menangkap layar. Pastikan berada di tab web biasa (chrome:// tidak didukung).");
  });

  const base64Data = dataUrl.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
  setStatus("Menganalisis soal yang sedang Anda pilih dengan Gemini...");

  let promptText = getGeminiVisionPrompt();
  if (activeText && activeText.trim().length > 10) {
    promptText += `\n\nSOAL & OPSI PILIHAN YANG SEDANG DIBUKA / DIPILIH PENGGUNA DI LAYAR:\n${activeText.slice(0, 2500)}\n\nPERINTAH KHUSUS:\nFokuslah secara mutlak pada soal/nomor yang sedang aktif/dipilih oleh pengguna di atas! Pecahkan gambar/diagram yang terkait dengan nomor tersebut dan tentukan opsi yang paling tepat.`;
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

  let res = null;
  let data = null;
  let lastError = null;

  const activeGeminiKey = getApiKey("GEMINI_API_KEY");
  if (!activeGeminiKey) {
    throw new Error("API Key Gemini belum dikonfigurasi. Silakan salin config.example.js menjadi config.js dan masukkan API Key Gemini Anda.");
  }

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeGeminiKey}`;

    try {
      const generationConfig = {
        maxOutputTokens: 1500,
        temperature: 0.0
      };

      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig
        })
      });

      if (res.status === 503 || res.status === 429) {
        lastError = `Gemini ${model} sedang padat (${res.status}). Mencoba model cadangan...`;
        setStatus(lastError, true);
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini error ${res.status}: ${errText.slice(0, 200)}`);
      }

      data = await res.json();
      break;
    } catch (err) {
      lastError = err.message;
      if (err.message.includes("503") || err.message.includes("429")) {
        continue;
      }
      throw err;
    }
  }

  if (!data && (!res || !res.ok)) {
    throw new Error(lastError || "Server Gemini sedang mengalami lonjakan beban. Silakan coba kembali.");
  }

  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return reply || "Gemini tidak memberikan jawaban.";
}

// === 4. GEMINI VISION - Penjawab Soal Bergambar & Visual Cepat ===
btnVision.addEventListener("click", async () => {
  setBusy(true);
  result.style.display = "none";
  if (resultActions) resultActions.classList.remove("show");
  if (recommendationBox) recommendationBox.style.display = "none";

  try {
    const pageInfo = await getActivePageInfo().catch(() => null);
    const visionAnswer = await executeGeminiVision(pageInfo?.text || "");
    await presentAnswerAndAutoProcess(visionAnswer);
  } catch (e) {
    showResult(e.message, true);
    setStatus("", false);
  } finally {
    setBusy(false);
  }
});

// === 5. TOMBOL SALIN (CLIPBOARD) ===
if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(result.textContent);
      copyBtn.textContent = "✅ Berhasil Disalin!";
      setTimeout(() => {
        copyBtn.textContent = "📋 Salin Hasil";
      }, 2000);
    } catch (err) {
      copyBtn.textContent = "Gagal menyalin";
    }
  });
}

// === 6. TOMBOL BERSIHKAN (HAPUS JAWABAN TERSIMPAN) ===
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    result.style.display = "none";
    result.textContent = "";
    if (resultActions) resultActions.classList.remove("show");
    if (recommendationBox) {
      recommendationBox.style.display = "none";
      recommendationButtons.innerHTML = "";
    }
    clearCurrentTabResult();
  });
}

// === 7. INISIALISASI & RESTORE DATA PER-TAB SAAT POPUP DIBUKA ===
restoreTabState();
