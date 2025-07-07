import { useState } from 'react';
import api from '@/utils/api';

export default function AdminSnapshots() {
  const [email, setEmail] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Cari attempt by email
  const fetchAttempts = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAttempts([]);
    setSnapshots([]);
    setSelectedAttempt(null);
    try {
      const res = await api.get(`/admin/user-attempts?email=${encodeURIComponent(email)}`);
      setAttempts(res.data);
      if (res.data.length === 0) setError('Tidak ada attempt untuk user ini.');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal fetch attempts');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Fetch snapshot by attempt
  const fetchSnapshots = async (attempt) => {
    setLoading(true);
    setError('');
    setSnapshots([]);
    setSelectedAttempt(attempt);
    try {
      const res = await api.get(`/snapshots/${attempt.id}`);
      setSnapshots(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal fetch snapshot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Hasil Snapshots (Screenshot Test)</h1>
      <form onSubmit={fetchAttempts} className="flex items-center gap-4 mb-8">
        <input
          type="email"
          placeholder="Cari berdasarkan email user"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border px-3 py-2 rounded w-64"
          required
        />
        <button type="submit" className="btn-primary px-4 py-2 rounded text-white">Cari Attempt</button>
      </form>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {/* Step 1: Pilih attempt */}
      {!loading && attempts.length > 0 && !selectedAttempt && (
        <div>
          <div className="mb-2 text-gray-700">Pilih salah satu attempt:</div>
          <div className="space-y-2">
            {attempts.map(attempt => (
              <div key={attempt.id} className="border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between bg-white shadow">
                <div>
                  <div className="font-medium">{attempt.test?.title || 'Test #' + attempt.test_id}</div>
                  <div className="text-xs text-gray-500">Attempt ID: {attempt.id}</div>
                  <div className="text-xs text-gray-500">Tanggal: {attempt.started_at ? new Date(attempt.started_at).toLocaleString() : '-'}</div>
                  <div className="text-xs text-gray-500">Status: {attempt.status}</div>
                </div>
                <button
                  className="btn-primary px-4 py-2 rounded text-white mt-2 md:mt-0"
                  onClick={() => fetchSnapshots(attempt)}
                >
                  Lihat Snapshots
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Step 2: Tampilkan snapshot */}
      {selectedAttempt && (
        <div className="mt-8">
          <button className="mb-4 text-blue-600 hover:underline" onClick={() => { setSelectedAttempt(null); setSnapshots([]); }}>← Kembali ke daftar attempt</button>
          <div className="mb-2 font-medium">Test: {selectedAttempt.test?.title || 'Test #' + selectedAttempt.test_id}</div>
          <div className="mb-2 text-sm text-gray-500">Attempt ID: {selectedAttempt.id}</div>
          {snapshots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {snapshots.map(snap => (
                <div key={snap.id} className="border rounded-lg p-3 bg-white shadow">
                  <img src={snap.image_url} alt="Snapshot" className="w-full h-40 object-cover rounded mb-2" />
                  <div className="text-xs text-gray-500 mb-1">{new Date(snap.taken_at).toLocaleString()}</div>
                  <div className="text-sm font-medium mb-1">Soal ID: {snap.question_id ?? '-'}</div>
                  <div className="text-xs text-gray-700 break-all">Jawaban: {snap.user_answer_at_time ?? '-'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 mt-8">Tidak ada snapshot untuk Attempt ini.</div>
          )}
        </div>
      )}
    </div>
  );
} 