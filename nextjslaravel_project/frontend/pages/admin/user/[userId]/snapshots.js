import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/utils/api';

export default function UserSnapshots() {
  const router = useRouter();
  const { userId } = router.query;
  const [snapshots, setSnapshots] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalImg, setModalImg] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError('');
    api.get(`/admin/user-snapshots/${userId}`)
      .then(res => {
        setSnapshots(res.data.snapshots);
        setTests(res.data.tests);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Gagal fetch snapshot');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // Filter snapshot by test
  const filteredSnapshots = selectedTest === 'all'
    ? snapshots
    : snapshots.filter(s => String(s.test_id) === String(selectedTest));

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Hasil Snapshot User</h1>
      <button className="mb-4 text-blue-700 hover:underline font-semibold" onClick={() => router.push('/admin/user_list')}>← Kembali ke daftar user</button>
      {loading && <div className="text-gray-800">Loading...</div>}
      {error && <div className="text-red-600 mb-4 font-semibold">{error}</div>}
      {tests.length > 0 && (
        <div className="mb-6">
          <label className="mr-2 font-medium text-gray-800">Filter Test:</label>
          <select
            value={selectedTest}
            onChange={e => setSelectedTest(e.target.value)}
            className="border px-3 py-2 rounded bg-white text-gray-900"
          >
            <option value="all">Semua Test</option>
            {tests.map(test => (
              <option key={test.id} value={test.id}>{test.title}</option>
            ))}
          </select>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border-2 border-gray-400 bg-white shadow-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border-2 border-gray-400 text-gray-900 font-bold">Test</th>
              <th className="px-4 py-2 border-2 border-gray-400 text-gray-900 font-bold">Foto Snapshot</th>
              <th className="px-4 py-2 border-2 border-gray-400 text-gray-900 font-bold">Waktu Snapshot</th>
            </tr>
          </thead>
          <tbody>
            {filteredSnapshots.length > 0 ? filteredSnapshots.map(snap => (
              <tr key={snap.id} className="hover:bg-blue-50 transition">
                <td className="px-4 py-2 border-2 border-gray-300 text-gray-800 font-medium">{snap.test_title || '-'}</td>
                <td className="px-4 py-2 border-2 border-gray-300">
                  <img
                    src={snap.image_url}
                    alt="Snapshot"
                    className="w-32 h-20 object-cover rounded border border-gray-400 cursor-pointer hover:scale-105 transition"
                    onClick={() => setModalImg(snap.image_url)}
                  />
                </td>
                <td className="px-4 py-2 border-2 border-gray-300 text-gray-700">{new Date(snap.taken_at).toLocaleString()}</td>
              </tr>
            )) : (
              <tr><td colSpan={3} className="text-center text-gray-500 py-8">Tidak ada snapshot ditemukan.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Modal fullscreen */}
      {modalImg && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setModalImg(null)}
        >
          <div className="relative" onClick={e => e.stopPropagation()}>
            <img src={modalImg} alt="Snapshot Full" className="max-h-[90vh] max-w-[90vw] rounded shadow-2xl border-4 border-white" />
            <button
              className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-2 text-gray-800 hover:bg-opacity-100"
              onClick={() => setModalImg(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 