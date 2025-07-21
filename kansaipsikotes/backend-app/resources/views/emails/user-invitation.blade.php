<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Psychotest Invitation</title>
    <style>
        body {
            background: #f5f6fa;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #222;
        }
        .email-container {
            background: #fff;
            max-width: 540px;
            margin: 32px auto;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            padding: 36px 32px 32px 32px;
        }
        .logo-header {
            background: #232946;
            border-radius: 10px 10px 0 0;
            padding: 24px 0 18px 0;
            text-align: center;
        }
        .logo-header img {
            max-width: 180px;
            filter: brightness(0) invert(1);
        }
        h2 {
            color: #232946;
            font-size: 1.5rem;
            margin-top: 24px;
            margin-bottom: 18px;
            letter-spacing: 0.5px;
        }
        .section {
            margin-bottom: 22px;
            line-height: 1.7;
        }
        .section strong {
            color: #232946;
        }
        hr {
            border: none;
            border-top: 1.5px solid #e0e3ea;
            margin: 32px 0 28px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 32px;
            background: #2563eb;
            color: #fff !important;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 32px;
            font-size: 1rem;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 8px rgba(37,99,235,0.08);
        }
        @media (max-width: 600px) {
            .email-container { padding: 16px 4vw; }
            .logo-header { padding: 16px 0 12px 0; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="logo-header">
            <img src="{{ asset('logokansaiandtext.png') }}" alt="Kansai Paint" />
        </div>
        <h2>Psychotest Invitation</h2>
        <!-- Bagian Indonesia -->
        <div class="section">
            <strong>Selamat! Kualifikasi Anda memenuhi persyaratan kami</strong><br>
            Lowongan pekerjaan yang sudah anda lamar dengan data berikut:<br>
            Nama: {{ $name }}<br>
            @if(!empty($position_applied))
            Posisi yang dilamar: {{ $position_applied }}<br>
            @endif
            <br>
            Bersama ini kami mengundang anda untuk melakukan proses recruitment lanjutan yaitu “Online Assessment” yang akan dilakukan pada:<br>
            Hari/Tanggal: {{ $date }}<br>
            Waktu: {{ $time }}<br>
            <br>
            Hal-hal yang perlu disiapkan pada saat Online Assessment:<br>
            • Laptop/PC yang memiliki akses Kamera dan Microphone<br>
            • Jaringan internet yang stabil<br>
            • Berada pada ruangan yang tenang dan kondusif<br>
            • Memakai pakaian bebas rapi<br>
            • Assessment memiliki waktu terbatas dan hanya bisa diakses 1 kali<br>
            <br>
            Diharapkan untuk hadir tepat waktu sesuai dengan jadwal yang telah diberikan.<br>
            Semoga sukses!
        </div>
        <hr>
        <!-- English Section -->
        <div class="section" style="color: #555;">
            <strong>Congratulations! Your qualifications meet our requirements</strong><br>
            Your submitted application with data bellows:<br>
            Name: {{ $name }}<br>
            @if(!empty($position_applied))
            Applied Position: {{ $position_applied }}<br>
            @endif
            <br>
            Herewith we would like to invite you to the next recruitment process, “Online Assessment” will be held on:<br>
            Date: {{ $date }}<br>
            Time: {{ $time }}<br>
            <br>
            Things you need to prepare for Online Assessment:<br>
            • Laptop/PC with Camera and Microphone access<br>
            • Stable internet connection<br>
            • Be in quiet room<br>
            • Dressed well<br>
            • Assessment has limited duration and only able to be accessed once<br>
            <br>
            We hope you able to attend on time as we scheduled.<br>
            Wish you success!
        </div>
        <div style="text-align:center;">
            <a href="{{ $loginUrl }}" class="button">Login untuk Assessment</a>
        </div>
    </div>
</body>
</html> 