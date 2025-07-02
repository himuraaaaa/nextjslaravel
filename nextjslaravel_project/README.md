# Next.js + Laravel Test Application

Aplikasi test online dengan timer realtime yang dapat diatur oleh admin.

## Fitur Timer

### Admin Panel
- **Pengaturan Durasi**: Admin dapat mengatur durasi test dalam menit melalui form pembuatan/edit test
- **Tampilan Durasi**: Durasi test ditampilkan di daftar test admin dengan ikon jam
- **Validasi**: Durasi minimal 1 menit

### User Interface
- **Timer Realtime**: Timer menampilkan waktu tersisa dalam format MM:SS atau HH:MM:SS
- **Visual Feedback**: 
  - Normal: Biru
  - < 5 menit: Kuning dengan peringatan
  - < 1 menit: Merah dengan animasi pulse
  - < 30 detik: Merah gelap dengan animasi pulse dan shadow
- **Auto-submit**: Test otomatis disubmit ketika waktu habis
- **Persistensi**: Timer state disimpan di localStorage untuk mencegah reset saat refresh

### Keamanan
- **Page Unload Warning**: Peringatan saat user mencoba refresh/keluar halaman
- **Auto-save**: Jawaban disimpan otomatis setiap kali user menjawab
- **Disabled Input**: Input dinonaktifkan setelah waktu habis

## Teknologi

### Frontend
- Next.js
- React Hooks (useState, useEffect)
- localStorage untuk persistensi timer
- Tailwind CSS untuk styling

### Backend
- Laravel
- MySQL database
- Duration field di tabel tests (dalam menit)

## Cara Penggunaan

1. **Admin membuat test** dengan durasi tertentu
2. **User memulai test** dan timer mulai berjalan
3. **Timer menampilkan waktu tersisa** dengan visual feedback
4. **Auto-submit** ketika waktu habis
5. **Progress tersimpan** meskipun user refresh halaman

## Struktur Database

```sql
CREATE TABLE tests (
    id BIGINT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    duration INTEGER, -- dalam menit
    status ENUM('active', 'draft', 'archived'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
``` 