import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/utils/api';
import Link from 'next/link';

export default function UserDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.get(`/admin/users/${id}`)
      .then(res => setUser(res.data))
      .catch(() => setError('User tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [id]);

  // Helper untuk format tanggal dan waktu
  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
  function formatTime(timeStr) {
    if (!timeStr) return '-';
    // Jika format sudah HH:mm, tampilkan saja
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    // Jika format lain, coba ambil jam dan menit
    const t = timeStr.split(':');
    if (t.length >= 2) return `${t[0]}:${t[1]}`;
    return timeStr;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <Link href="/admin/user_list" className="mr-4 text-blue-600">Kembali ke Daftar User</Link>
          <h1 className="text-2xl font-bold text-gray-900 ml-2">Detail User</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto py-8 px-4">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : user && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-4">
              <span className="font-semibold text-black">Nama:</span> <span className="text-gray-900">{user.name}</span>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-black">Email:</span> <span className="text-gray-900">{user.email}</span>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-black">Role:</span> <span className="text-gray-900">{user.role}</span>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-black">Posisi yang Dilamar:</span> <span className="text-gray-900">{user.position_applied || '-'}</span>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-black">Hari/Tanggal Assessment:</span> <span className="text-gray-900">{formatDate(user.schedule_date)}</span>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-black">Waktu Assessment:</span> <span className="text-gray-900">{formatTime(user.schedule_time)}</span>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-black">Dibuat oleh (created_by):</span> <span className="text-gray-900">{user.created_by || '-'}</span>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-black">Dibuat pada:</span> <span className="text-gray-900">{user.created_at}</span>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-black">Update terakhir:</span> <span className="text-gray-900">{user.updated_at}</span>
            </div>
            <Link href={`/admin/user_edit?id=${user.id}`} className="bg-yellow-500 text-white px-4 py-2 rounded mr-2">Edit</Link>
            <Link href="/admin/user_list" className="bg-gray-600 text-white px-4 py-2 rounded">Kembali</Link>
          </div>
        )}
      </div>
    </div>
  );
} 