# Dokumentasi Backend Kansai Psikotes

## Daftar Isi
1. [Struktur Direktori](#1-struktur-direktori)
2. [Routes](#2-routes)
3. [Controllers](#3-controllers)
4. [Models](#4-models)
5. [Middleware](#5-middleware)
6. [Notifikasi](#6-notifikasi)
7. [Template Email](#7-template-email)
8. [Storage](#8-storage)
9. [Konfigurasi](#9-konfigurasi)
10. [Panduan Pengembangan](#10-panduan-pengembangan)

---

## 1. Struktur Direktori

```
backend-app/
├── app/
│   ├── Http/
│   │   ├── Controllers/     # Controller aplikasi
│   │   └── Middleware/      # Middleware kustom
│   ├── Models/              # Model Eloquent
│   └── Notifications/       # Kelas notifikasi
├── config/                  # File konfigurasi
├── database/
│   ├── migrations/         # Migrasi database
│   └── seeders/            # Data dummy
├── public/                 # File yang dapat diakses publik
├── resources/
│   └── views/
│       └── emails/         # Template email
├── routes/                 # Definisi rute
└── storage/                # File yang diunggah dan cache
```

## 2. Routes

### API Routes (`routes/api.php`)

#### Autentikasi
- `POST /api/register` - Register user baru
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user (memerlukan auth)
- `GET /api/user` - Dapatkan data user yang login

#### Admin Routes (prefix: `/api/admin`)
- **Test Management**
  - `GET /tests` - Daftar test
  - `POST /tests` - Buat test baru
  - `GET /tests/{test}` - Detail test
  - `PUT /tests/{test}` - Update test
  - `DELETE /tests/{test}` - Hapus test

- **Question Management**
  - `GET /questions` - Daftar soal
  - `POST /questions` - Buat soal baru
  - `GET /questions/{question}` - Detail soal
  - `PUT /questions/{question}` - Update soal
  - `DELETE /questions/{question}` - Hapus soal

- **User Management**
  - `GET /users` - Daftar user
  - `POST /users` - Buat user baru
  - `GET /users/{id}` - Detail user
  - `PUT /users/{id}` - Update user
  - `DELETE /users/{id}` - Hapus user

#### Test Execution
- `GET /available-tests` - Daftar test yang tersedia
- `POST /tests/{test}/start` - Mulai test
- `POST /tests/{test}/auto-save` - Simpan jawaban sementara
- `POST /tests/{test}/submit` - Submit test
- `GET /test-history` - Riwayat test user
- `GET /attempt-result/{attemptId}` - Hasil test

## 3. Controllers

### AuthController
- **File**: `app/Http/Controllers/AuthController.php`
- **Method**:
  - `register()` - Daftar user baru
  - `login()` - Login user
  - `logout()` - Logout user
  - `admin*()` - Method untuk manajemen user oleh admin

### TestController
- **File**: `app/Http/Controllers/TestController.php`
- **Method**:
  - `index()` - Daftar test
  - `store()` - Buat test baru
  - `show()` - Detail test
  - `update()` - Update test
  - `destroy()` - Hapus test

### QuestionController
- **File**: `app/Http/Controllers/QuestionController.php`
- **Method**:
  - `index()` - Daftar soal
  - `store()` - Buat soal baru
  - `show()` - Detail soal
  - `update()` - Update soal
  - `destroy()` - Hapus soal

### TestExecutionController
- **File**: `app/Http/Controllers/TestExecutionController.php`
- **Method**:
  - `availableTests()` - Daftar test yang tersedia
  - `startTest()` - Mulai test
  - `autoSaveAnswer()` - Simpan jawaban sementara
  - `submitTest()` - Submit test
  - `testHistory()` - Riwayat test user

### AdminReportController
- **File**: `app/Http/Controllers/AdminReportController.php`
- **Method**:
  - `getAllResults()` - Semua hasil test
  - `getAttemptDetail()` - Detail attempt
  - `getTestResultsSummary()` - Ringkasan hasil test
  - `exportResults()` - Export hasil ke Excel

## 4. Models

### User
- **File**: `app/Models/User.php`
- **Relasi**:
  - `testAttempts()` - Has many TestAttempt
  - `testResults()` - Has many TestResult
  - `chats()` - Has many Chat

### Test
- **File**: `app/Models/Test.php`
- **Relasi**:
  - `questions()` - Belongs to many Question
  - `attempts()` - Has many TestAttempt
  - `results()` - Has many through TestResult

### Question
- **File**: `app/Models/Question.php`
- **Relasi**:
  - `tests()` - Belongs to many Test
  - `answers()` - Has many TestAnswer

### TestAttempt
- **File**: `app/Models/TestAttempt.php`
- **Relasi**:
  - `user()` - Belongs to User
  - `test()` - Belongs to Test
  - `answers()` - Has many TestAnswer

## 5. Middleware

### AdminMiddleware
- **File**: `app/Http/Middleware/AdminMiddleware.php`
- **Deskripsi**: Memastikan user adalah admin
- **Penggunaan**:
  ```php
  Route::middleware(['auth:sanctum', 'admin'])->group(function () {
      // Routes yang memerlukan akses admin
  });
  ```

### Authenticate
- **File**: `app/Http/Middleware/Authenticate.php`
- **Deskripsi**: Middleware autentikasi default Laravel

## 6. Notifikasi

### UserCreatedNotification
- **File**: `app/Notifications/UserCreatedNotification.php`
- **Deskripsi**: Notifikasi saat user baru dibuat
- **Parameter**:
  - `schedule_date` - Tanggal jadwal
  - `schedule_time` - Waktu jadwal
  - `position_applied` - Posisi yang dilamar

## 7. Template Email

### User Invitation
- **File**: `resources/views/emails/user-invitation.blade.php`
- **Deskripsi**: Template undangan untuk user baru
- **Variabel**:
  - `$user` - Data user
  - `$schedule_date` - Tanggal jadwal
  - `$schedule_time` - Waktu jadwal
  - `$position_applied` - Posisi yang dilamar

### Test Completion
- **File**: `resources/views/emails/test-completion.blade.php`
- **Deskripsi**: Notifikasi setelah menyelesaikan test

### Admin Test Completion
- **File**: `resources/views/emails/admin-test-completion.blade.php`
- **Deskripsi**: Notifikasi ke admin saat test selesai

## 8. Storage

### Struktur Direktori
```
storage/
├── app/
│   ├── public/         # File yang diunggah
│   └── snapshots/      # Screenshot monitoring
├── framework/         # File framework
└── logs/              # Log aplikasi
```

### Konfigurasi Link Simbolik
```bash
php artisan storage:link
```

## 9. Konfigurasi

### Environment Variables Penting
```
APP_NAME=KansaiPsikotes
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kansai_psikotes
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

## 10. Panduan Pengembangan

### Instalasi
1. Clone repositori
2. Install dependencies:
   ```bash
   composer install
   npm install
   ```
3. Salin file .env:
   ```bash
   cp .env.example .env
   ```
4. Generate key aplikasi:
   ```bash
   php artisan key:generate
   ```
5. Migrasi database:
   ```bash
   php artisan migrate --seed
   ```

### Perintah Artisan
```bash
# Jalankan server development
php artisan serve

# Generate model + migration + controller
php artisan make:model NamaModel -mcr

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Generate dokumentasi API
php artisan l5-swagger:generate
```

### Testing
```bash
# Jalankan test
php artisan test

# Jalankan test dengan coverage
php artisan test --coverage-html=coverage
```

### Deployment
1. Set `APP_ENV=production` di `.env`
2. Generate key produksi:
   ```bash
   php artisan key:generate --force
   ```
3. Optimasi aplikasi:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```
4. Set permission storage:
   ```bash
   chmod -R 775 storage/
   chmod -R 775 bootstrap/cache/
   ```

---

Dokumentasi ini terakhir diperbarui pada: 1 Agustus 2025
