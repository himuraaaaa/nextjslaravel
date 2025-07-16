import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminTests } from '@/hooks/useAdminTests';
import Link from 'next/link';
import { Plus, Edit, Eye, Clock, Key, EyeOff, Trash2, CheckSquare, Square, Check, XCircle, Loader2, Search } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useState } from 'react';
import { useRef } from 'react';

const TestList = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { tests, loading, error, fetchTests, deleteTest, bulkDeleteTests, bulkUpdateStatus } = useAdminTests();
  const [showCodes, setShowCodes] = useState({});
  const [selectedTests, setSelectedTests] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const deleteBtnRef = useRef();
  const [search, setSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10); // default 10
  const [currentPage, setCurrentPage] = useState(1);

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

  // Filtered tests by search
  const filteredTests = tests.filter(test =>
    test.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalEntries = filteredTests.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const paginatedTests = filteredTests.slice(
    (currentPage - 1) * entriesPerPage,
    (currentPage - 1) * entriesPerPage + entriesPerPage
  );

  useEffect(() => {
    // Reset to page 1 if search or entriesPerPage changes
    setCurrentPage(1);
  }, [search, entriesPerPage]);

  if (!user || user.role !== 'admin') return null;
  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Loader2 className="animate-spin h-8 w-8 text-blue-600 mr-3" />
      <span className="text-lg text-blue-700 font-semibold">Memuat data test...</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Daftar Test"
        subtitle="Kelola semua test yang tersedia dengan mudah dan cepat"
      >
        <div className="flex gap-3">
          <Link href="/admin/test-results" className="btn-primary flex items-center gap-2 shadow">
            <Eye className="h-5 w-5" /> Lihat Hasil Test
          </Link>
          <Link href="/admin/test_create" className="btn-primary flex items-center gap-2 shadow">
            <Plus className="h-5 w-5" /> Tambah Test
          </Link>
        </div>
      </PageHeader>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar & Show Entries */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 max-w-2xl justify-between">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari judul test..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-base bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Tampilkan</span>
            <select
              className="border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              value={entriesPerPage}
              onChange={e => setEntriesPerPage(Number(e.target.value))}
            >
              {[5, 10, 25, 50, 100].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="text-sm text-gray-700">entri</span>
          </div>
        </div>
        {/* Bulk Action Bar */}
        <div className="mb-6">
          <div className="bg-white/80 shadow rounded-xl flex flex-wrap gap-3 items-center px-6 py-4 border border-gray-100">
            <button
              onClick={handleBulkDelete}
              disabled={selectedTests.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
            >
              <Trash2 className="h-5 w-5" /> Hapus Terpilih
            </button>
            <button
              onClick={() => handleBulkStatus('active')}
              disabled={selectedTests.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
            >
              <CheckSquare className="h-5 w-5" /> Jadikan Aktif
            </button>
            <button
              onClick={() => handleBulkStatus('draft')}
              disabled={selectedTests.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-yellow-500 hover:bg-yellow-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
            >
              <Square className="h-5 w-5" /> Jadikan Draft
            </button>
            <span className="ml-4 text-sm text-gray-600 font-medium">
              {selectedTests.length} test dipilih
            </span>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            {error}
          </div>
        )}
        <div className="bg-white/90 shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="accent-blue-600 h-5 w-5 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nama Test</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Kode</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Durasi</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Kesempatan</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tipe</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedTests.map(test => (
                  <tr key={test.id} className="hover:bg-blue-50 transition-all">
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedTests.includes(test.id)}
                        onChange={() => handleSelect(test.id)}
                        className="accent-blue-600 h-5 w-5 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      <div>
                        <div className="font-bold text-base mb-1">{test.title}</div>
                        {test.description && (
                          <div className="text-gray-500 text-xs truncate max-w-xs">
                            {test.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
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
                              title={showCodes[test.id] ? 'Sembunyikan kode' : 'Lihat kode'}
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
                        <span className="text-gray-400 italic">Tidak ada kode</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {test.duration || 60} menit
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {test.allowed_attempts > 0 ? `${test.allowed_attempts} kali` : 'Tak Terbatas'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm border ${
                        test.status === 'active' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : test.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {test.status === 'active' ? 'Aktif' : 
                         test.status === 'draft' ? 'Draft' : 'Arsip'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm border bg-blue-50 text-blue-800 border-blue-200">
                        {test.type === 'general' ? 'General' : test.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-wrap gap-2">
                        <Link 
                          href={`/admin/question_list?test_id=${test.id}`}
                          className="text-blue-600 hover:text-blue-900 font-semibold flex items-center gap-1 px-2 py-1 rounded transition hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" /> Kelola Soal
                        </Link>
                        <Link 
                          href={`/admin/review?test_id=${test.id}`}
                          className="text-purple-600 hover:text-purple-900 font-semibold flex items-center gap-1 px-2 py-1 rounded transition hover:bg-purple-50"
                        >
                          <Eye className="h-4 w-4" /> Review Test
                        </Link>
                        <Link 
                          href={`/admin/test_edit?test_id=${test.id}`}
                          className="text-green-600 hover:text-green-900 font-semibold flex items-center gap-1 px-2 py-1 rounded transition hover:bg-green-50"
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </Link>
                        <button 
                          ref={test.id === confirmDeleteId ? deleteBtnRef : undefined}
                          onClick={() => setConfirmDeleteId(test.id)}
                          className="text-red-600 hover:text-red-900 font-semibold flex items-center gap-1 px-2 py-1 rounded transition hover:bg-red-50 border border-transparent hover:border-red-200"
                        >
                          <Trash2 className="h-4 w-4" /> Hapus
                        </button>
                        {/* Popover konfirmasi hapus */}
                        {confirmDeleteId === test.id && (
                          <div className="absolute z-50 mt-8 ml-[-60px] bg-white border border-red-200 rounded-xl shadow-lg p-4 flex flex-col items-center animate-fade-in">
                            <div className="text-red-700 font-bold mb-2 flex items-center gap-2"><Trash2 className="h-5 w-5" /> Hapus Test?</div>
                            <div className="text-xs text-gray-500 mb-3 text-center">Semua soal, attempt, dan jawaban terkait akan ikut terhapus secara permanen.</div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => { handleDelete(test.id); setConfirmDeleteId(null); }}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 shadow"
                              >
                                <Check className="h-4 w-4 inline mr-1" /> Ya, Hapus
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 shadow"
                              >
                                <XCircle className="h-4 w-4 inline mr-1" /> Batal
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedTests.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-400 py-12 text-lg">Tidak ada test yang cocok dengan pencarian.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 px-2">
            <span className="text-sm text-gray-600">
              Menampilkan {(totalEntries === 0) ? 0 : ((currentPage - 1) * entriesPerPage + 1)} - {Math.min(currentPage * entriesPerPage, totalEntries)} dari {totalEntries} entri
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-l-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 disabled:opacity-50"
              >
                Sebelumnya
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border border-gray-300 ${currentPage === i + 1 ? 'bg-blue-600 text-white font-bold' : 'bg-white text-gray-700 hover:bg-blue-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-r-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 disabled:opacity-50"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestList;