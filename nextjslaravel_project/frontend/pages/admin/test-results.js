import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Eye, 
  Calendar,
  FileText,
  User,
  Download,
  Loader2,
  XCircle
} from 'lucide-react';
import { useAdminTests } from '@/hooks/useAdminTests';

const TestResults = () => {
  const { user } = useAuth();
  const { tests, loading: loadingTests, error: errorTests, fetchTests } = useAdminTests();
  const [selectedTest, setSelectedTest] = useState('');
  const [results, setResults] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filters, setFilters] = useState({
    user_id: '',
    start_date: '',
    end_date: ''
  });
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (user?.role !== 'admin' || !selectedTest) return;
    setLoading(true);
    api.get('/admin/results', { params: { ...filters, test_id: selectedTest } })
      .then(res => setResults(res.data.data || res.data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [user, selectedTest, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [entriesPerPage, selectedTest, filters]);

  const getStatusBadge = (result) => {
    if (result.status === 'completed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Selesai
        </span>
      );
    } else if (result.status === 'started') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Sedang Berlangsung
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <Clock className="w-3 h-3 mr-1" />
        {result.status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  const getDuration = (startedAt, completedAt) => {
    if (!startedAt || !completedAt) return '-';
    const start = new Date(startedAt);
    const end = new Date(completedAt);
    const diff = Math.floor((end - start) / 1000 / 60); // dalam menit
    return `${diff} menit`;
  };

  const viewDetail = async (attemptId) => {
    try {
      const res = await api.get(`/admin/results/${attemptId}`);
      setSelectedResult(res.data);
      setShowDetail(true);
    } catch (error) {
      console.error('Error fetching detail:', error);
    }
  };

  const exportResults = async (testId) => {
    try {
      const res = await api.get('/admin/export-results', { 
        params: { test_id: testId } 
      });
      
      // Create CSV content
      const csvContent = res.data.csv_data.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test_results_${testId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting results:', error);
    }
  };

  // Pagination logic
  const totalEntries = results.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const paginatedResults = results.slice(
    (currentPage - 1) * entriesPerPage,
    (currentPage - 1) * entriesPerPage + entriesPerPage
  );

  if (user?.role !== 'admin') {
    return <div className="text-center py-12">Akses ditolak</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hasil Test</h1>
        <p className="text-gray-600">Kelola dan lihat hasil test dari semua pengguna</p>
      </div>

      {/* Pilih Test Dropdown */}
      <div className="bg-white/90 shadow-xl rounded-2xl p-8 mb-8 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Pilih Test</h3>
        {loadingTests ? (
          <div className="flex items-center gap-2 text-black"><Loader2 className="animate-spin h-5 w-5" /> Loading daftar test...</div>
        ) : errorTests ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"><XCircle className="h-5 w-5" />{errorTests}</div>
        ) : (
          <select
            className="border rounded-lg px-3 py-2 w-full mb-4 text-black focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
            value={selectedTest}
            onChange={e => setSelectedTest(e.target.value)}
          >
            <option value="">-- Pilih Test --</option>
            {tests.map(test => (
              <option key={test.id} value={test.id}>{test.title || test.name} ({test.code})</option>
            ))}
          </select>
        )}
      </div>

      {/* Filter lain hanya muncul jika test sudah dipilih */}
      {selectedTest && (
        <div className="bg-white/90 shadow-xl rounded-2xl p-8 mb-8 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filter</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <input
                type="text"
                value={filters.user_id}
                onChange={e => setFilters(prev => ({ ...prev, user_id: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black"
                placeholder="Filter by user ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={e => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={e => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black"
              />
            </div>
          </div>
          {/* Export Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={async () => {
                try {
                  const res = await api.get('/admin/export-results', {
                    params: { test_id: selectedTest, ...filters },
                  });
                  const csvContent = res.data.csv_data.map(row => row.join(',')).join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `test_results_${selectedTest}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  alert('Gagal export CSV');
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 shadow"
            >
              <Download className="h-5 w-5" /> Export ke CSV
            </button>
          </div>
        </div>
      )}

      {/* Tampilkan pesan jika belum pilih test */}
      {!selectedTest && (
        <div className="text-center py-16 text-black text-lg font-medium">Silakan pilih test terlebih dahulu untuk melihat hasil.</div>
      )}

      {/* Results Table */}
      {selectedTest && loading && (
        <div className="flex items-center justify-center min-h-[20vh]">
          <Loader2 className="animate-spin h-7 w-7 text-blue-600 mr-3" />
          <span className="text-base text-blue-700 font-semibold">Memuat hasil test...</span>
        </div>
      )}
      {selectedTest && !loading && results.length > 0 && (
        <div className="bg-white/90 shadow-xl rounded-2xl p-8 border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Daftar Hasil Test</h3>
          </div>
          {/* Show Entries Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 max-w-2xl justify-between mb-4 mt-4">
            <div></div>
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Test</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Attempt</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Skor</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Durasi</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedResults.map((result) => (
                  <tr key={result.id} className="hover:bg-blue-50 transition-all">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">{result.user?.name || '-'}</span>
                        <span className="text-xs text-gray-500">({result.user?.email || '-'})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{result.test?.title || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{result.attempt_number || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(result)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-700">{result.score ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getDuration(result.started_at, result.completed_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(result.completed_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => viewDetail(result.id)}
                        className="text-purple-600 hover:text-purple-900 font-semibold flex items-center gap-1 px-2 py-1 rounded transition hover:bg-purple-50"
                      >
                        <Eye className="h-4 w-4" /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedResults.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-400 py-12 text-lg">Tidak ada hasil.</td>
                  </tr>
                )}
              </tbody>
            </table>
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
      )}
      {/* Detail modal, dsb, tetap pakai style lama atau bisa dioptimasi jika diinginkan */}
    </div>
  );
};

export default TestResults; 