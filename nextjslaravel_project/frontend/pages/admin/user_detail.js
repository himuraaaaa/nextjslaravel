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
          <div className="bg-white shadow-md border border-gray-200 rounded-xl p-8">
            <h2 className="text-xl font-bold text-blue-900 mb-1">Informasi User</h2>
            <hr className="mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-6">
              <div className="font-semibold text-gray-700">Nama</div>
              <div className="text-gray-900">{user.name}</div>
              <div className="font-semibold text-gray-700">Email</div>
              <div className="text-gray-900">{user.email}</div>
              <div className="font-semibold text-gray-700">Role</div>
              <div className="text-gray-900 capitalize">{user.role}</div>
              <div className="font-semibold text-gray-700">Posisi yang Dilamar</div>
              <div className="text-gray-900">{user.position_applied || '-'}</div>
              <div className="font-semibold text-gray-700">Hari/Tanggal Assessment</div>
              <div className="text-gray-900">{formatDate(user.schedule_date)}</div>
              <div className="font-semibold text-gray-700">Waktu Assessment</div>
              <div className="text-gray-900">{formatTime(user.schedule_time)}</div>
              <div className="font-semibold text-gray-700">Dibuat oleh</div>
              <div className="text-gray-900">{user.created_by || '-'}</div>
              <div className="font-semibold text-gray-700">Dibuat pada</div>
              <div className="text-gray-900">{formatDate(user.created_at)}</div>
              <div className="font-semibold text-gray-700">Update terakhir</div>
              <div className="text-gray-900">{formatDate(user.updated_at)}</div>
            </div>
            <div className="flex gap-3">
              <Link href={`/admin/user_edit?id=${user.id}`} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center font-semibold transition">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6v6H7v-6z"/></svg>
                Edit
              </Link>
              <Link href="/admin/user_list" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center font-semibold transition">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                Kembali
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 