# Dokumentasi Frontend Aplikasi Kansai Psikotes

## Daftar Isi
1. [Struktur Proyek](#1-struktur-proyek)
2. [Komponen (Components)](#2-komponen-components)
3. [Halaman (Pages)](#3-halaman-pages)
4. [Hooks Kustom](#4-hooks-kustom)
5. [Context API](#5-context-api)
6. [Utils](#6-utils)
7. [API Client](#7-api-client)
8. [Styling](#8-styling)

---

## 1. Struktur Proyek

```
frontend/
├── components/      # Komponen UI yang dapat digunakan kembali
├── contexts/       # Context API untuk state management
├── hooks/          # Custom hooks
├── pages/          # Halaman aplikasi (Next.js routing)
├── public/         # Aset statis
├── styles/         # File styling global
└── utils/          # Fungsi utilitas
```

## 2. Komponen (Components)

### Timer
- **File**: `components/Timer.js`
- **Deskripsi**: Komponen untuk menampilkan hitung mundur waktu pengerjaan tes.
- **Props**:
  - `startedAt`: Waktu mulai tes (timestamp)
  - `duration`: Durasi tes dalam menit
  - `onTimeUp`: Callback ketika waktu habis
  - `onTick`: Callback setiap detik
- **Fitur**:
  - Menampilkan sisa waktu dalam format menit:detik
  - Warna berubah menjadi merah saat waktu hampir habis
  - Optimasi performa dengan `requestAnimationFrame`

### Navbar
- **File**: `components/Navbar.js`
- **Deskripsi**: Navigasi utama aplikasi
- **Fitur**:
  - Responsif
  - Menampilkan menu berbeda berdasarkan role user
  - Logout functionality

### QuestionCard
- **File**: `components/QuestionCard.js`
- **Deskripsi**: Menampilkan soal dan pilihan jawaban
- **Props**:
  - `question`: Data pertanyaan
  - `onAnswer`: Callback ketika user memilih jawaban
  - `selectedAnswer`: Jawaban yang dipilih

### AdminCameraMonitor
- **File**: `components/AdminCameraMonitor.js`
- **Deskripsi**: Monitor untuk melihat feed kamar peserta ujian

### UserCameraStream
- **File**: `components/UserCameraStream.js`
- **Deskripsi**: Komponen untuk menangkap dan mengirim stream kamera user

## 3. Halaman (Pages)

### Halaman Utama
- **Path**: `/`
- **File**: `pages/index.js`
- **Deskripsi**: Halaman landing page dengan informasi tes yang tersedia

### Halaman Login
- **Path**: `/login`
- **File**: `pages/login.js`
- **Deskripsi**: Form login untuk admin dan peserta

### Halaman Dashboard
- **Path**: `/dashboard`
- **File**: `pages/dashboard.js`
- **Deskripsi**: Dashboard setelah login

### Halaman Tes
- **Path**: `/tests/[testId]`
- **File**: `pages/tests/[testId].js`
- **Deskripsi**: Halaman pengerjaan tes
- **Fitur**:
  - Timer countdown
  - Navigasi antar soal
  - Auto-save jawaban
  - Submit test

### Halaman Admin
- **Path**: `/admin`
- **File**: `pages/admin/index.js`
- **Deskripsi**: Dashboard admin

### Manajemen Soal
- **Path**: `/admin/question_list`
- **File**: `pages/admin/question_list.js`
- **Deskripsi**: Daftar soal

- **Path**: `/admin/question_create`
- **File**: `pages/admin/question_create.js`
- **Deskripsi**: Form buat soal baru

- **Path**: `/admin/question_edit`
- **File**: `pages/admin/question_edit.js`
- **Deskripsi**: Form edit soal

### Manajemen Test
- **Path**: `/admin/test_list`
- **File**: `pages/admin/test_list.js`
- **Deskripsi**: Daftar test

- **Path**: `/admin/test_create`
- **File**: `pages/admin/test_create.js`
- **Deskripsi**: Form buat test baru

- **Path**: `/admin/test_edit`
- **File**: `pages/admin/test_edit.js`
- **Deskripsi**: Form edit test

### Live Monitor
- **Path**: `/admin/live-monitor`
- **File**: `pages/admin/live-monitor.js`
- **Deskripsi**: Monitor live aktivitas peserta

### Hasil Test
- **Path**: `/admin/test-results`
- **File**: `pages/admin/test-results.js`
- **Deskripsi**: Daftar hasil test

- **Path**: `/admin/test-results/[attemptId]`
- **File**: `pages/admin/test-results/[attemptId].js`
- **Deskripsi**: Detail hasil test per peserta

## 4. Hooks Kustom

### useAdminTests
- **File**: `hooks/useAdminTests.js`
- **Deskripsi**: Hook untuk manajemen state test di admin
- **Method**:
  - `fetchTests()`: Ambil daftar test
  - `createTest(data)`: Buat test baru
  - `updateTest(id, data)`: Update test
  - `deleteTest(id)`: Hapus test

### useAdminQuestions
- **File**: `hooks/useAdminQuestions.js`
- **Deskripsi**: Hook untuk manajemen state soal di admin
- **Method**:
  - `fetchQuestions()`: Ambil daftar soal
  - `createQuestion(data)`: Buat soal baru
  - `updateQuestion(id, data)`: Update soal
  - `deleteQuestion(id)`: Hapus soal

### useTests
- **File**: `hooks/useTests.js`
- **Deskripsi**: Hook untuk manajemen test di sisi user
- **Method**:
  - `startTest(testId)`: Mulai test
  - `submitAnswer(questionId, answer)`: Kirim jawaban
  - `submitTest()`: Selesaikan test
  - `getTestResult(attemptId)`: Dapatkan hasil test

## 5. Context API

### AuthContext
- **File**: `contexts/AuthContext.js`
- **Deskripsi**: Mengelola state autentikasi
- **State**:
  - `user`: Data user yang login
  - `isAuthenticated`: Status login
  - `loading`: Status loading
- **Method**:
  - `login(email, password)`: Proses login
  - `logout()`: Proses logout
  - `checkAuth()`: Cek status autentikasi

### TestContext
- **File**: `contexts/TestContext.js`
- **Deskripsi**: Mengelola state test yang sedang berjalan
- **State**:
  - `currentTest`: Data test saat ini
  - `currentQuestion`: Soal yang sedang ditampilkan
  - `answers`: Jawaban sementara
  - `timeLeft`: Sisa waktu
- **Method**:
  - `loadTest(testId)`: Muat data test
  - `saveAnswer(questionId, answer)`: Simpan jawaban
  - `submitTest()`: Kirim test

## 6. Utils

### API Client
- **File**: `utils/api.js`
- **Deskripsi**: Konfigurasi axios untuk request ke backend
- **Fitur**:
  - Interceptor untuk menambahkan token auth
  - Error handling terpusat
  - Konfigurasi base URL

## 7. Styling

### Global Styles
- **File**: `styles/globals.css`
- **Deskripsi**: Gaya global aplikasi
- **Fitur**:
  - Reset CSS
  - Variabel warna dan ukuran
  - Utility classes

### Komponen Styling
- **Teknologi**: CSS Modules
- **Struktur**:
  ```
  components/
  ├── ComponentName.module.css
  └── ...
  ```

## 8. Integrasi API

### Endpoint
- **Base URL**: Didefinisikan di `.env.local`
- **Auth**: Menggunakan JWT
- **Headers**:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```

### Contoh Request
```javascript
import api from '../utils/api';

// Get test data
const getTest = async (testId) => {
  try {
    const response = await api.get(`/tests/${testId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching test:', error);
    throw error;
  }
};
```

## 9. Environment Variables

### `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## 10. Panduan Pengembangan

### Menjalankan Aplikasi
```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk produksi
npm run build

# Jalankan produksi
npm start
```

### Testing
```bash
# Jalankan test
npm test

# Jalankan test dengan coverage
npm test -- --coverage
```

### Linting
```bash
# Cek error
npm run lint

# Perbaiki error yang bisa diperbaiki otomatis
npm run lint:fix
```

---

## File yang membutuhkan konfigurasi API

- `utils/api.js`
- `.env.local`
- `contexts/AuthContext.js`
- `cameraPreview.js`
- `admincameraMonitor.js`
- `userCameraStream.js`

Dokumentasi ini terakhir diperbarui pada: 1 Agustus 2025
