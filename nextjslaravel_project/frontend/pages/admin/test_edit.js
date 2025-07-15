import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAdminTests } from '@/hooks/useAdminTests';
import { Key, Eye, EyeOff, Loader2, XCircle, RefreshCw } from 'lucide-react';

const TestEdit = () => {
  const router = useRouter();
  const { test_id } = router.query;
  const { getTest, updateTest } = useAdminTests();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [duration, setDuration] = useState(60);
  const [allowed_attempts, setAllowedAttempts] = useState(1);
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [type, setType] = useState('general');

  useEffect(() => {
    if (test_id) {
      getTest(test_id).then(test => {
        setTitle(test.title);
        setDescription(test.description);
        setStatus(test.status || 'draft');
        setDuration(test.duration || 60);
        setAllowedAttempts(test.allowed_attempts !== undefined ? test.allowed_attempts : 1);
        setCode(test.code || '');
        setType(test.type || 'general');
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [test_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateTest(test_id, { 
        title, 
        description, 
        status, 
        duration, 
        allowed_attempts: Number(allowed_attempts),
        code,
        type // tambahkan type
      });
      router.push('/admin/test_list');
    } catch (err) {
      setError(err.message || 'Gagal update test');
    } finally {
      setSaving(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Loader2 className="animate-spin h-8 w-8 text-blue-600 mr-3" />
      <span className="text-lg text-blue-700 font-semibold">Memuat data test...</span>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="bg-white/90 shadow-xl rounded-2xl p-10 border border-gray-100">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Edit Test</h1>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-900">Judul Test</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-900">Deskripsi</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-900">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900">Tipe Test</label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value)} 
                className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
              >
                <option value="general">General</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-900">Durasi (menit)</label>
              <input type="number" min="1" value={duration} onChange={e => setDuration(e.target.value)} required className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900">Kesempatan Mengerjakan</label>
              <input type="number" min="0" value={allowed_attempts} onChange={e => setAllowedAttempts(e.target.value)} required className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" />
              <p className="text-sm text-gray-500 mt-1">Isi 0 untuk kesempatan tak terbatas.</p>
            </div>
          </div>
          {/* Test Code Section */}
          <div className="border-t pt-6 mt-2">
            <div className="flex items-center mb-3">
              <Key className="h-5 w-5 text-gray-600 mr-2" />
              <label className="text-lg font-bold text-gray-900">Kode Test</label>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Kode Test (opsional)
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type={showCode ? "text" : "password"}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Kosongkan jika tidak ada kode"
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-900 pr-10 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    title={showCode ? 'Sembunyikan kode' : 'Lihat kode'}
                  >
                    {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm flex items-center gap-1 font-semibold shadow"
                  title="Generate kode acak"
                >
                  <RefreshCw className="h-4 w-4" /> Generate
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Jika diisi, user harus memasukkan kode ini untuk mengakses test.
              </p>
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-3 text-lg font-bold mt-4 shadow">
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TestEdit; 