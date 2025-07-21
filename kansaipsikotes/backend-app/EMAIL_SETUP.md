# Email Setup Guide

## Overview
Sistem online test ini memiliki fitur notifikasi email yang akan dikirim saat user menyelesaikan test. Email akan dikirim ke:
1. **User** - Notifikasi hasil test dengan detail score dan statistik
2. **Admin** - Notifikasi bahwa ada user yang menyelesaikan test

## Konfigurasi Email

### 1. Development Environment (Log Driver)
Untuk development, email akan disimpan di log file:
```env
MAIL_MAILER=log
MAIL_FROM_ADDRESS="noreply@onlinetest.com"
MAIL_FROM_NAME="Online Test System"
```

### 2. Production Environment (SMTP)
Untuk production, gunakan SMTP settings:

#### Gmail SMTP
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="your-email@gmail.com"
MAIL_FROM_NAME="Online Test System"
```

#### Outlook/Hotmail SMTP
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USERNAME=your-email@outlook.com
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="your-email@outlook.com"
MAIL_FROM_NAME="Online Test System"
```

#### Custom SMTP Server
```env
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-server.com
MAIL_PORT=587
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="Online Test System"
```

## Email Templates

### User Email Template
- File: `resources/views/emails/test-completion.blade.php`
- Berisi: Hasil test, score, statistik, dan informasi test
- Design: Responsive dengan gradient colors

### Admin Email Template
- File: `resources/views/emails/admin-test-completion.blade.php`
- Berisi: Informasi user, detail test, dan hasil
- Design: Professional dengan alert styling

## Testing Email

### 1. Development Testing
Email akan disimpan di: `storage/logs/laravel.log`
```bash
tail -f storage/logs/laravel.log
```

### 2. Production Testing
Gunakan Mailtrap untuk testing:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_ENCRYPTION=tls
```

## Troubleshooting

### Email tidak terkirim
1. Cek log file: `storage/logs/laravel.log`
2. Pastikan konfigurasi SMTP benar
3. Cek firewall dan port settings
4. Untuk Gmail, pastikan menggunakan App Password

### Email masuk spam
1. Setup SPF record untuk domain
2. Setup DKIM authentication
3. Gunakan domain email yang valid
4. Hindari kata-kata spam di subject dan content

## Queue Configuration (Optional)

Untuk performa yang lebih baik, gunakan queue untuk email:
```env
QUEUE_CONNECTION=database
```

Lalu jalankan:
```bash
php artisan queue:table
php artisan migrate
php artisan queue:work
```

## Security Notes

1. Jangan commit file `.env` ke repository
2. Gunakan environment variables untuk sensitive data
3. Setup proper email authentication (SPF, DKIM, DMARC)
4. Monitor email delivery rates 