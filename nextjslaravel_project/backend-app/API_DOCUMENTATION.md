# API Documentation - Test Online System

## Base URL
```
http://localhost:8000/api
```

## Authentication
Semua endpoint (kecuali login/register) memerlukan Bearer Token yang didapat dari login.

## Email Notifications
Sistem ini memiliki fitur notifikasi email otomatis yang akan dikirim saat user menyelesaikan test:

### Email yang Dikirim:
1. **User Email** - Notifikasi hasil test dengan detail score dan statistik
2. **Admin Email** - Notifikasi bahwa ada user yang menyelesaikan test

### Konfigurasi Email:
- Development: Email disimpan di `storage/logs/laravel.log`
- Production: Konfigurasi SMTP di file `.env`
- Lihat `EMAIL_SETUP.md` untuk panduan lengkap

### Testing Email:
```bash
# Test user email
php artisan email:test --user=user@example.com

# Test admin email
php artisan email:test --admin
```

## Endpoints

### Authentication

#### POST /register
Mendaftarkan user baru.

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user" // optional, default: "user"
}
```

**Response:**
```json
{
    "message": "Register success",
    "token": "1|abc123...",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
    }
}
```

#### POST /login
Login user.

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "message": "Login success",
    "token": "1|abc123...",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin"
    }
}
```

#### POST /logout
Logout user (memerlukan auth).

**Headers:**
```
Authorization: Bearer {token}
```

### User Endpoints (memerlukan auth)

#### GET /available-tests
Mendapatkan daftar test yang tersedia untuk user.

**Response:**
```json
[
    {
        "id": 1,
        "title": "Programming Basics",
        "description": "Test dasar pemrograman",
        "duration": 30,
        "allowed_attempts": 2,
        "code": "PROG001",
        "status": "active",
        "completed_attempts": 0,
        "remaining_attempts": 2
    }
]
```

#### GET /tests/{test}/questions
Mendapatkan soal-soal untuk test tertentu.

**Response:**
```json
[
    {
        "id": 1,
        "question_text": "Apa yang dimaksud dengan variabel?",
        "question_type": "multiple_choice",
        "options": {
            "A": "Tempat penyimpanan data",
            "B": "Jenis data",
            "C": "Fungsi program",
            "D": "Loop statement"
        }
    }
]
```

#### POST /tests/{test}/start
Memulai test attempt baru.

**Response:**
```json
{
    "message": "Test started successfully.",
    "attempt_id": 1,
    "started_at": "2025-01-01T10:00:00.000000Z",
    "duration_minutes": 30
}
```

#### POST /tests/{test}/auto-save
Auto-save jawaban untuk soal tertentu.

**Request Body:**
```json
{
    "attempt_id": 1,
    "question_id": 1,
    "answer": "A"
}
```

**Response:**
```json
{
    "message": "Answer saved successfully.",
    "answer_id": 1
}
```

#### POST /tests/{test}/submit
Submit test attempt.

**Request Body:**
```json
{
    "attempt_id": 1,
    "answers": {
        "1": "A",
        "2": "C",
        "3": "B",
        "4": "Essay answer here...",
        "5": "B"
    }
}
```

**Response:**
```json
{
    "message": "Test submitted successfully.",
    "score": 80,
    "total_questions": 5,
    "completed_at": "2025-01-01T10:30:00.000000Z"
}
```

#### GET /test-history
Mendapatkan riwayat test user.

**Response:**
```json
[
    {
        "id": 1,
        "user_id": 1,
        "test_id": 1,
        "attempt_number": 1,
        "status": "completed",
        "score": 80,
        "started_at": "2025-01-01T10:00:00.000000Z",
        "completed_at": "2025-01-01T10:30:00.000000Z",
        "test": {
            "id": 1,
            "title": "Programming Basics"
        }
    }
]
```

#### GET /attempt-result/{attemptId}
Mendapatkan detail hasil attempt tertentu.

**Response:**
```json
{
    "id": 1,
    "user_id": 1,
    "test_id": 1,
    "attempt_number": 1,
    "status": "completed",
    "score": 80,
    "started_at": "2025-01-01T10:00:00.000000Z",
    "completed_at": "2025-01-01T10:30:00.000000Z",
    "test": {
        "id": 1,
        "title": "Programming Basics"
    },
    "test_answers": [
        {
            "id": 1,
            "question_id": 1,
            "answer": "A",
            "is_correct": true,
            "question": {
                "id": 1,
                "question_text": "Apa yang dimaksud dengan variabel?"
            }
        }
    ]
}
```

### Admin Endpoints (memerlukan auth + admin role)

#### GET /admin/results
Mendapatkan semua hasil test dengan filter.

**Query Parameters:**
- `test_id` (optional): Filter by test ID
- `user_id` (optional): Filter by user ID
- `start_date` (optional): Filter by start date (YYYY-MM-DD)
- `end_date` (optional): Filter by end date (YYYY-MM-DD)
- `page` (optional): Page number for pagination

**Response:**
```json
{
    "data": [
        {
            "id": 1,
            "user_id": 1,
            "test_id": 1,
            "attempt_number": 1,
            "status": "completed",
            "score": 80,
            "started_at": "2025-01-01T10:00:00.000000Z",
            "completed_at": "2025-01-01T10:30:00.000000Z",
            "user": {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com"
            },
            "test": {
                "id": 1,
                "title": "Programming Basics"
            }
        }
    ],
    "current_page": 1,
    "total": 50
}
```

#### GET /admin/results/{attemptId}
Mendapatkan detail attempt tertentu.

**Response:**
```json
{
    "id": 1,
    "user_id": 1,
    "test_id": 1,
    "attempt_number": 1,
    "status": "completed",
    "score": 80,
    "started_at": "2025-01-01T10:00:00.000000Z",
    "completed_at": "2025-01-01T10:30:00.000000Z",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
    },
    "test": {
        "id": 1,
        "title": "Programming Basics"
    },
    "test_answers": [
        {
            "id": 1,
            "question_id": 1,
            "answer": "A",
            "is_correct": true,
            "question": {
                "id": 1,
                "question_text": "Apa yang dimaksud dengan variabel?"
            }
        }
    ]
}
```

#### GET /admin/test-summary?test_id={testId}
Mendapatkan ringkasan hasil test tertentu.

**Response:**
```json
{
    "test": {
        "id": 1,
        "title": "Programming Basics"
    },
    "total_attempts": 25,
    "unique_users": 20,
    "average_score": 75.5,
    "highest_score": 100,
    "lowest_score": 40,
    "score_distribution": {
        "excellent": 5,
        "good": 8,
        "fair": 7,
        "poor": 3,
        "fail": 2
    },
    "recent_attempts": [...]
}
```

#### GET /admin/user-summary?user_id={userId}
Mendapatkan ringkasan hasil user tertentu.

**Response:**
```json
{
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
    },
    "total_attempts": 5,
    "unique_tests": 3,
    "average_score": 78.5,
    "highest_score": 95,
    "lowest_score": 60,
    "total_time_spent": 7200,
    "recent_attempts": [...]
}
```

#### GET /admin/statistics
Mendapatkan statistik keseluruhan sistem.

**Response:**
```json
{
    "total_tests": 10,
    "active_tests": 8,
    "total_users": 50,
    "total_attempts": 150,
    "total_questions": 100,
    "average_score_all_tests": 72.3,
    "recent_activity": [...]
}
```

#### GET /admin/question-analysis?test_id={testId}
Mendapatkan analisis per soal untuk test tertentu.

**Response:**
```json
{
    "test": {
        "id": 1,
        "title": "Programming Basics"
    },
    "question_analysis": [
        {
            "question_id": 1,
            "question_text": "Apa yang dimaksud dengan variabel?",
            "question_type": "multiple_choice",
            "total_answers": 25,
            "correct_answers": 20,
            "incorrect_answers": 5,
            "null_answers": 0,
            "success_rate": 80.0
        }
    ]
}
```

#### GET /admin/export-results?test_id={testId}
Export hasil test ke format CSV.

**Response:**
```json
{
    "test": {
        "id": 1,
        "title": "Programming Basics"
    },
    "csv_data": [
        ["User ID", "User Name", "User Email", "Attempt Number", "Score", "Started At", "Completed At", "Duration (seconds)", "Duration (formatted)"],
        [1, "John Doe", "john@example.com", 1, 80, "2025-01-01T10:00:00.000000Z", "2025-01-01T10:30:00.000000Z", 1800, "30:00"]
    ],
    "total_records": 25
}
```

## Error Responses

### Validation Error (422)
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email field is required."]
    }
}
```

### Authentication Error (401)
```json
{
    "message": "Unauthenticated."
}
```

### Authorization Error (403)
```json
{
    "message": "Access denied. Admin role required."
}
```

### Not Found Error (404)
```json
{
    "message": "Test not found."
}
```

## Fitur Utama

### 1. Pembatasan Attempt
- Sistem otomatis membatasi jumlah attempt sesuai `allowed_attempts`
- `allowed_attempts = 0` berarti unlimited attempts
- Validasi dilakukan saat start test

### 2. Tracking Jawaban Per Soal
- Setiap jawaban disimpan di tabel `test_answers`
- Auto-save saat user menjawab
- Tracking kebenaran jawaban (true/false/null untuk essay)

### 3. Admin Reporting
- Rekap hasil per test dan per user
- Analisis per soal
- Statistik keseluruhan
- Export ke CSV

### 4. API Endpoints Lengkap
- Start test dengan attempt tracking
- Auto-save jawaban real-time
- Submit test dengan scoring otomatis
- History dan detail results

## Database Schema

### Tabel Utama
- `users`: Data user dengan role
- `tests`: Data test dengan durasi dan attempt limit
- `questions`: Soal dengan tipe dan jawaban benar
- `test_attempts`: Attempt user per test
- `test_answers`: Jawaban per soal per attempt

### Relasi
- User → TestAttempt (1:N)
- Test → TestAttempt (1:N)
- TestAttempt → TestAnswer (1:N)
- Question → TestAnswer (1:N)
- User → Test (created_by) (1:N) 