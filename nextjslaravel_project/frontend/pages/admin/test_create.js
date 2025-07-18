import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAdminTests } from '@/hooks/useAdminTests';
import { Key, Eye, EyeOff } from 'lucide-react';

const TestCreate = () => {
  const router = useRouter();
  const { createTest } = useAdminTests();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(60);
  const [allowed_attempts, setAllowedAttempts] = useState(1);
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [type, setType] = useState('general');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const testData = {
        title,
        description,
        status,
        duration,
        allowed_attempts: Number(allowed_attempts),
        code,
        type // tambahkan type
      };
      
      await createTest(testData);
      router.push('/admin/test_list');
    } catch (err) {
      setError(err.message || 'Gagal membuat test');
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

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="bg-white shadow-md border border-gray-200 rounded-xl p-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-1">Tambah Test</h1>
        <p className="text-gray-500 mb-6">Silakan lengkapi data berikut untuk membuat test baru.</p>
        <hr className="mb-6" />
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-semibold text-gray-900">Judul Test</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
              className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" 
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-900">Deskripsi</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-semibold text-gray-900">Status</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value)} 
                className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-900">Tipe Test</label>
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
              <label className="block mb-1 font-semibold text-gray-900">Durasi (menit)</label>
              <input 
                type="number" 
                min="1" 
                value={duration} 
                onChange={e => setDuration(e.target.value)} 
                required 
                className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" 
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-900">Kesempatan Mengerjakan</label>
              <input 
                type="number" 
                min="0" 
                value={allowed_attempts} 
                onChange={e => setAllowedAttempts(e.target.value)} 
                required 
                className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" 
              />
              <p className="text-sm text-gray-500 mt-1">Isi 0 untuk kesempatan tak terbatas.</p>
            </div>
          </div>
          {/* Test Code Section */}
          <div className="border-t pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Key className="h-5 w-5 text-gray-600 mr-2" />
                <label className="text-lg font-medium text-blue-900">Kode Test</label>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Test
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <input
                      type={showCode ? "text" : "password"}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Masukkan kode test"
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-900 pr-10 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                      maxLength={20}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCode(!showCode)}
                      className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    >
                      {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-semibold transition"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Kode ini akan diperlukan user untuk mengakses test.
                </p>
                {code && (
                  <div className="p-3 bg-white border border-blue-100 rounded-md">
                    <div className="flex items-center text-sm text-blue-700">
                      <Key className="h-4 w-4 mr-2" />
                      <span>
                        <strong>Kode Test:</strong> {showCode ? code : '••••••••••'}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      User harus memasukkan kode ini untuk mengakses test
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Test'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TestCreate; 