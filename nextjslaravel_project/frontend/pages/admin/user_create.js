import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/utils/api';
import Link from 'next/link';

export default function UserCreate() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [position_applied, setPositionApplied] = useState('');
  const [schedule_date, setScheduleDate] = useState('');
  const [schedule_time, setScheduleTime] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.post('/admin/users', { name, email, password, position_applied, schedule_date, schedule_time });
      setSuccess('User berhasil dibuat. Email verifikasi telah dikirim ke user.');
      setName(''); setEmail(''); setPassword(''); setPositionApplied(''); setScheduleDate(''); setScheduleTime('');
      setTimeout(() => router.push('/admin/user_list'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Gagal membuat user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <Link href="/admin/user_list" className="mr-4 text-blue-600">Kembali ke Daftar User</Link>
          <h1 className="text-2xl font-bold text-gray-900 ml-2">Tambah User</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto py-8 px-4">
        {success && (
          <div className="rounded-md bg-green-50 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{success}</h3>
              </div>
            </div>
          </div>
        )}
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
            <label className="block text-sm font-medium mb-1 text-black">Password</label>
            <input type="password" className="w-full border border-gray-300 rounded px-3 py-2 text-black" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Posisi yang Dilamar</label>
            <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-black" value={position_applied} onChange={e => setPositionApplied(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Hari/Tanggal Assessment</label>
            <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 text-black" value={schedule_date} onChange={e => setScheduleDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Waktu Assessment</label>
            <input type="time" className="w-full border border-gray-300 rounded px-3 py-2 text-black" value={schedule_time} onChange={e => setScheduleTime(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan User'}</button>
          {message && <div className={`mt-2 ${message.includes('berhasil') ? 'text-green-600' : 'text-red-600'}`}>{message}</div>}
        </form>
      </div>
    </div>
  );
} 