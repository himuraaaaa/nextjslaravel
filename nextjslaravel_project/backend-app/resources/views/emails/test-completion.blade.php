<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Selesai</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2d3748;
        }
        .test-info {
            background-color: #f7fafc;
            border-left: 4px solid #4299e1;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .test-title {
            font-size: 20px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 10px;
        }
        .score-section {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .score {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .score-label {
            font-size: 14px;
            opacity: 0.9;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-item {
            background-color: #f7fafc;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 12px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .footer {
            background-color: #f7fafc;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            margin: 5px 0;
            font-size: 14px;
            color: #718096;
        }
        .highlight {
            color: #4299e1;
            font-weight: 600;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Test Selesai!</h1>
        </div>
        
        <div class="content">
            <div class="greeting">
                Halo <strong>{{ $user->name }}</strong>,
            </div>
            
            <p>Selamat! Anda telah berhasil menyelesaikan test. Berikut adalah hasil test Anda:</p>
            
            <div class="test-info">
                <div class="test-title">{{ $test->title }}</div>
                <p style="margin: 5px 0; color: #718096;">
                    <strong>Deskripsi:</strong> {{ $test->description ?: 'Tidak ada deskripsi' }}
                </p>
                <p style="margin: 5px 0; color: #718096;">
                    <strong>Durasi:</strong> {{ $test->duration }} menit
                </p>
            </div>
            
            <div class="score-section">
                <div class="score">{{ $score }}%</div>
                <div class="score-label">Nilai Akhir</div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">{{ $correctAnswers }}</div>
                    <div class="stat-label">Jawaban Benar</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">{{ $totalQuestions }}</div>
                    <div class="stat-label">Total Soal</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">{{ $completionTime }}</div>
                    <div class="stat-label">Waktu (Menit)</div>
                </div>
            </div>
            
            <div style="margin: 25px 0; padding: 15px; background-color: #fef5e7; border-left: 4px solid #ed8936; border-radius: 0 6px 6px 0;">
                <p style="margin: 0; color: #744210;">
                    <strong>📊 Detail Hasil:</strong><br>
                    • Jawaban benar: <span class="highlight">{{ $correctAnswers }}</span> dari <span class="highlight">{{ $totalQuestions }}</span> soal<br>
                    • Waktu pengerjaan: <span class="highlight">{{ $completionTime }}</span> menit<br>
                    • Tanggal selesai: <span class="highlight">{{ \Carbon\Carbon::parse($testResult->completed_at)->format('d M Y H:i') }}</span>
                </p>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
                <strong>Terima kasih telah mengikuti test ini!</strong><br>
                Hasil test Anda telah tersimpan dan dapat diakses oleh administrator.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Sistem Online Test</strong></p>
            <p>Email ini dikirim secara otomatis saat test selesai</p>
            <p>Jika Anda memiliki pertanyaan, silakan hubungi administrator</p>
        </div>
    </div>
</body>
</html> 