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
              <span className="font-semibold text-black">Nama:</span> {user.name}
            </div>
            <div className="mb-4">
              <span className="font-semibold text-black">Email:</span> {user.email}
            </div>
            <div className="mb-4">
              <span className="font-semibold text-black">Role:</span> {user.role}
            </div>
            <div className="mb-4">
              <span className="font-semibold text-black">Dibuat oleh (created_by):</span> {user.created_by || '-'}
            </div>
            <div className="mb-4">
              <span className="font-semibold text-black">Dibuat pada:</span> {user.created_at}
            </div>
            <div className="mb-4">
              <span className="font-semibold text-black">Update terakhir:</span> {user.updated_at}
            </div>
            <Link href={`/admin/user_edit?id=${user.id}`} className="bg-yellow-500 text-white px-4 py-2 rounded mr-2">Edit</Link>
            <Link href="/admin/user_list" className="bg-gray-600 text-white px-4 py-2 rounded">Kembali</Link>
          </div>
        )}
      </div>
    </div>
  );
} 