import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/utils/api';
import Link from 'next/link';

export default function UserEdit() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    api.get(`/admin/users/${id}`)
      .then(res => {
        setUser(res.data);
        setName(res.data.name);
        setEmail(res.data.email);
        setRole(res.data.role);
      })
      .catch(() => setError('User tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.put(`/admin/users/${id}`, {
        name,
        email,
        password: password || undefined,
        role,
      });
      setMessage('User berhasil diupdate!');
      setTimeout(() => router.push(`/admin/user_detail?id=${id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal update user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <Link href={`/admin/user_detail?id=${id}`} className="mr-4 text-blue-600">Kembali ke Detail</Link>
          <h1 className="text-2xl font-bold text-gray-900 ml-2">Edit User</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto py-8 px-4">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Nama</label>
              <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-black" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Email</label>
              <input type="email" className="w-full border border-gray-300 rounded px-3 py-2 text-black" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Password (kosongkan jika tidak ingin mengubah)</label>
              <input type="password" className="w-full border border-gray-300 rounded px-3 py-2 text-black" value={password} onChange={e => setPassword(e.target.value)} minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Role</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2 text-black" value={role} onChange={e => setRole(e.target.value)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
            {message && <div className="text-green-600 mt-2">{message}</div>}
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
} 