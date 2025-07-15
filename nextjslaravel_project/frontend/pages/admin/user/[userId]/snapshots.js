import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/utils/api';
import { ArrowLeft } from 'lucide-react';

export default function UserSnapshots() {
  const router = useRouter();
  const { userId } = router.query;
  const [snapshots, setSnapshots] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalImg, setModalImg] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

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
    <div className="max-w-5xl mx-auto py-10 px-2">
      <div className="flex flex-col sm:flex-row sm:items-center mb-8 gap-4">
        <button
          onClick={() => router.push('/admin/user_list')}
          className="flex items-center text-blue-700 hover:underline font-semibold text-lg mb-2 sm:mb-0"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Kembali ke daftar user
        </button>
        <h1 className="text-3xl font-extrabold text-[#001F5A] ml-0 sm:ml-6">Hasil Snapshot User</h1>
      </div>
      {loading && <div className="text-gray-800">Loading...</div>}
      {error && <div className="text-red-600 mb-4 font-semibold">{error}</div>}
      {tests.length > 0 && (
        <div className="mb-8 flex items-center gap-4">
          <label className="font-semibold text-gray-700">Filter Test:</label>
          <select
            value={selectedTest}
            onChange={e => setSelectedTest(e.target.value)}
            className="rounded-xl px-4 py-2 shadow border border-gray-300 focus:ring-2 focus:ring-[#001F5A] text-gray-900"
          >
            <option value="all">Semua Test</option>
            {tests.map(test => (
              <option key={test.id} value={test.id}>{test.title}</option>
            ))}
          </select>
        </div>
      )}
      {/* Toggle view mode */}
      <div className="flex items-center gap-4 mb-6">
        <span className="font-semibold text-gray-700">Tampilan:</span>
        <button
          className={`px-4 py-2 rounded-l-xl font-semibold border ${viewMode === 'grid' ? 'bg-[#001F5A] text-white' : 'bg-white text-[#001F5A]'} border-[#001F5A]`}
          onClick={() => setViewMode('grid')}
        >
          Grid
        </button>
        <button
          className={`px-4 py-2 rounded-r-xl font-semibold border-l-0 border ${viewMode === 'table' ? 'bg-[#001F5A] text-white' : 'bg-white text-[#001F5A]'} border-[#001F5A]`}
          onClick={() => setViewMode('table')}
        >
          Tabel
        </button>
      </div>
      {/* Tampilan grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSnapshots.length > 0 ? filteredSnapshots.map(snap => (
            <div key={snap.id} className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center">
              <img
                src={snap.image_url}
                alt="Snapshot"
                className="w-full h-56 object-cover rounded-xl shadow hover:scale-105 transition cursor-pointer mb-4 border border-gray-200"
                onClick={() => setModalImg(snap.image_url)}
              />
              <div className="font-bold text-[#001F5A] text-lg mb-1 text-center w-full truncate">{snap.test_title || '-'}</div>
              <div className="text-gray-600 text-sm text-center w-full">{new Date(snap.taken_at).toLocaleString()}</div>
            </div>
          )) : (
            <div className="col-span-full text-center text-gray-500 py-12 text-lg">Tidak ada snapshot ditemukan.</div>
          )}
        </div>
      )}
      {/* Tampilan tabel */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-2 border-gray-300 bg-white shadow-lg rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#001F5A] text-white">
                <th className="px-4 py-3 border-b-2 border-gray-300 font-bold">Test</th>
                <th className="px-4 py-3 border-b-2 border-gray-300 font-bold">Foto Snapshot</th>
                <th className="px-4 py-3 border-b-2 border-gray-300 font-bold">Waktu Snapshot</th>
              </tr>
            </thead>
            <tbody>
              {filteredSnapshots.length > 0 ? filteredSnapshots.map(snap => (
                <tr key={snap.id} className="hover:bg-blue-50 transition">
                  <td className="px-4 py-3 border-b border-gray-200 text-gray-800 font-medium">{snap.test_title || '-'}</td>
                  <td className="px-4 py-3 border-b border-gray-200">
                    <img
                      src={snap.image_url}
                      alt="Snapshot"
                      className="w-32 h-20 object-cover rounded border border-gray-300 cursor-pointer hover:scale-105 transition"
                      onClick={() => setModalImg(snap.image_url)}
                    />
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 text-gray-700">{new Date(snap.taken_at).toLocaleString()}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="text-center text-gray-500 py-8">Tidak ada snapshot ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal fullscreen */}
      {modalImg && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setModalImg(null)}
        >
          <div className="relative" onClick={e => e.stopPropagation()}>
            <img src={modalImg} alt="Snapshot Full" className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl border-4 border-white" />
            <button
              className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-2 text-gray-800 hover:bg-opacity-100 shadow"
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