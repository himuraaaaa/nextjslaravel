import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminTests } from '@/hooks/useAdminTests';
import Link from 'next/link';
import { Plus, Edit, Eye, Clock, Key, EyeOff, Trash2, CheckSquare, Square } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useState } from 'react';

const TestList = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { tests, loading, error, fetchTests, deleteTest, bulkDeleteTests, bulkUpdateStatus } = useAdminTests();
  const [showCodes, setShowCodes] = useState({});
  const [selectedTests, setSelectedTests] = useState([]);

  // Select all handler
  const allSelected = tests.length > 0 && selectedTests.length === tests.length;
  const handleSelectAll = () => {
    if (allSelected) setSelectedTests([]);
    else setSelectedTests(tests.map(t => t.id));
  };
  const handleSelect = (id) => {
    setSelectedTests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const handleBulkDelete = async () => {
    if (selectedTests.length === 0) return;
    if (!window.confirm('Yakin ingin menghapus semua test terpilih?')) return;
    try {
      await bulkDeleteTests(selectedTests);
      setSelectedTests([]);
    } catch (err) {
      alert(err.message || 'Gagal menghapus test secara massal');
    }
  };
  const handleBulkStatus = async (status) => {
    if (selectedTests.length === 0) return;
    try {
      await bulkUpdateStatus(selectedTests, status);
      setSelectedTests([]);
    } catch (err) {
      alert(err.message || 'Gagal update status massal');
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    } else {
      fetchTests();
    }
  }, [user, router]);

  const toggleCodeVisibility = (testId) => {
    setShowCodes(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };

  const handleDelete = async (testId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus test ini? Semua soal, attempt, dan jawaban terkait akan ikut terhapus secara permanen.')) {
      try {
        await deleteTest(testId);
        // The state will be updated automatically by the hook
      } catch (err) {
        alert(err.message || 'Gagal menghapus test');
      }
    }
  };

  if (!user || user.role !== 'admin') return null;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Daftar Test"
        subtitle="Kelola semua test yang tersedia"
      >
        <Link href="/admin/test-results" className="btn-primary flex items-center">Lihat Hasil Test</Link>
        <Link href="/admin/test_create" className="btn-primary flex items-center">Tambah Test</Link>
      </PageHeader>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Tombol aksi massal */}
        <div className="mb-4 flex flex-wrap gap-3 items-center">
          <button
            onClick={handleBulkDelete}
            disabled={selectedTests.length === 0}
            className={`px-4 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            Hapus Terpilih
          </button>
          <button
            onClick={() => handleBulkStatus('active')}
            disabled={selectedTests.length === 0}
            className={`px-4 py-2 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            Jadikan Aktif
          </button>
          <button
            onClick={() => handleBulkStatus('draft')}
            disabled={selectedTests.length === 0}
            className={`px-4 py-2 rounded-lg font-semibold text-white bg-yellow-600 hover:bg-yellow-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            Jadikan Draft
          </button>
          <span className="ml-4 text-sm text-gray-500">{selectedTests.length} test dipilih</span>
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="accent-blue-600 h-5 w-5 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Test
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kesempatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tests.map(test => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedTests.includes(test.id)}
                        onChange={() => handleSelect(test.id)}
                        className="accent-blue-600 h-5 w-5 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div>
                        <div className="font-medium">{test.title}</div>
                        {test.description && (
                          <div className="text-gray-500 text-xs truncate max-w-xs">
                            {test.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.code ? (
                        <div className="flex items-center space-x-2">
                          <Key className="h-4 w-4 text-blue-500" />
                          <div className="flex items-center space-x-1">
                            <span className="font-mono">
                              {showCodes[test.id] ? test.code : '••••••••••'}
                            </span>
                            <button
                              onClick={() => toggleCodeVisibility(test.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {showCodes[test.id] ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Tidak ada kode</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {test.duration || 60} menit
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.allowed_attempts > 0 ? `${test.allowed_attempts} kali` : 'Tak Terbatas'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        test.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : test.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {test.status === 'active' ? 'Aktif' : 
                         test.status === 'draft' ? 'Draft' : 'Arsip'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        test.type === 'general' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        General
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-3">
                        <Link 
                          href={`/admin/question_list?test_id=${test.id}`}
                          className="text-blue-600 hover:text-blue-900 font-medium flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Kelola Soal
                        </Link>
                        <Link 
                          href={`/admin/review?test_id=${test.id}`}
                          className="text-purple-600 hover:text-purple-900 font-medium flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review Test
                        </Link>
                        <Link 
                          href={`/admin/test_edit?test_id=${test.id}`}
                          className="text-green-600 hover:text-green-900 font-medium flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(test.id)}
                          className="text-red-600 hover:text-red-900 font-medium flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestList;