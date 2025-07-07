<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Psychotest Invitation</title>
    <style>
        body { font-family: Arial, sans-serif; color: #222; }
        .bilingual { margin-bottom: 16px; }
        .en { font-style: italic; color: #555; }
        .button {
            display: inline-block;
            padding: 10px 24px;
            background: #2563eb;
            color: #fff !important;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 24px;
        }
    </style>
</head>
<body>
    <h2>Psychotest Invitation</h2>
    <div class="bilingual">
        <strong>Congratulations! Your qualifications meet our requirements</strong><br>
        <span class="en">Your submitted application with data bellows:</span>
    </div>
    <div class="bilingual">
        Lowongan pekerjaan yang sudah anda lamar dengan data berikut:<br>
        Nama: {{ $name }}<br>
        @if(!empty($position_applied))
        <span style="color:#222;"><strong>Posisi yang Dilamar (Detail):</strong> {{ $position_applied }}</span><br>
        @endif
        <span class="en">Name: {{ $name }}</span>
    </div>
    <hr>
    <div class="bilingual">
        Bersama ini kami mengundang anda untuk melakukan proses recruitment lanjutan yaitu “Online Assessment” yang akan dilakukan pada:<br>
        Hari/Tanggal: {{ $date }}<br>
        Waktu: {{ $time }}<br>
        <span class="en">
            Herewith we would like to invite you to the next recruitment process, “Online Assessment” will be held on:<br>
            Date: {{ $date }}<br>
            Time: {{ $time }}
        </span>
    </div>
    <hr>
    <div class="bilingual">
        Hal-hal yang perlu disiapkan pada saat Online Assessment:<br>
        • Laptop/PC yang memiliki akses Kamera dan Microphone<br>
        • Jaringan internet yang stabil<br>
        • Berada pada ruangan yang tenang dan kondusif<br>
        • Memakai pakaian bebas rapi<br>
        • Assessment memiliki waktu terbatas dan hanya bisa diakses 1 kali<br>
        <span class="en">
            Things you need to prepare for Online Assessment:<br>
            • Laptop/PC with Camera and Microphone access<br>
            • Stable internet connection<br>
            • Be in quiet room<br>
            • Dressed well<br>
            • Assessment has limited duration and only able to be accessed once
        </span>
    </div>
    <hr>
    <div class="bilingual">
        Diharapkan untuk hadir tepat waktu sesuai dengan jadwal yang telah diberikan.<br>
        <span class="en">We hope you able to attend on time as we scheduled.</span><br>
        Semoga sukses!<br>
        <span class="en">Wish you success!</span>
    </div>
    <a href="{{ $loginUrl }}" class="button">Login untuk Assessment</a>
</body>
</html> 