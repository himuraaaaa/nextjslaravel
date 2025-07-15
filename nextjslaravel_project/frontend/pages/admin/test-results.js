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
  Download
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
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pilih Test</h3>
        {loadingTests ? (
          <div className="text-black">Loading daftar test...</div>
        ) : errorTests ? (
          <div className="text-red-600">{errorTests}</div>
        ) : (
          <select
            className="border rounded px-3 py-2 w-full mb-4 text-black"
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
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filter</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <input
                type="text"
                value={filters.user_id}
                onChange={e => setFilters(prev => ({ ...prev, user_id: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                placeholder="Filter by user ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={e => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={e => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
              />
            </div>
          </div>
          {/* Export Button */}
          <div className="mt-6 flex justify-end">
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
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
            >
              Export ke CSV
            </button>
          </div>
        </div>
      )}

      {/* Tampilkan pesan jika belum pilih test */}
      {!selectedTest && (
        <div className="text-center py-12 text-black">Silakan pilih test terlebih dahulu untuk melihat hasil.</div>
      )}

      {/* Results Table */}
      {selectedTest && !loading && results.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Daftar Hasil Test</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attempt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {result.user?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.user?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {result.test?.title || 'Unknown Test'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {result.test_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{result.attempt_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(result)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.score || 0}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDuration(result.started_at, result.completed_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(result.completed_at || result.started_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewDetail(result.id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {selectedTest && !loading && results.length === 0 && (
        <div className="text-center py-12 text-black">Tidak ada hasil untuk test ini.</div>
      )}
      {loading && (
        <div className="text-center py-12">Loading...</div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedResult && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/30 backdrop-blur">
          <div className="bg-white shadow-lg border border-gray-200 rounded-xl max-w-2xl w-full p-8 relative">
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              aria-label="Tutup"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Detail Hasil Test</h2>
            <hr className="mb-6" />
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="font-semibold text-gray-700">User</div>
              <div className="text-gray-900">{selectedResult.user?.name} ({selectedResult.user?.email})</div>
              <div className="font-semibold text-gray-700">Test</div>
              <div className="text-gray-900">{selectedResult.test?.title}</div>
              <div className="font-semibold text-gray-700">Attempt</div>
              <div className="text-gray-900">#{selectedResult.attempt_number}</div>
              <div className="font-semibold text-gray-700">Score</div>
              <div className="text-gray-900">{selectedResult.score || 0}%</div>
              <div className="font-semibold text-gray-700">Status</div>
              <div className="text-gray-900 capitalize">{selectedResult.status}</div>
              <div className="font-semibold text-gray-700">Started</div>
              <div className="text-gray-900">{formatDate(selectedResult.started_at)}</div>
              <div className="font-semibold text-gray-700">Completed</div>
              <div className="text-gray-900">{selectedResult.completed_at ? formatDate(selectedResult.completed_at) : '-'}</div>
            </div>
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Jawaban Detail</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {selectedResult.test_answers && selectedResult.test_answers.length > 0 ? (
                selectedResult.test_answers.map((answer, index) => (
                  <div key={answer.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="font-semibold text-gray-700 mb-1">Soal {index + 1}: {answer.question?.question_text}</div>
                    <div className="text-gray-900 mb-1">Jawaban: {answer.answer || 'Tidak dijawab'}</div>
                    <div>
                      <span className="font-bold text-black">Status:</span>{' '}
                      {answer.is_correct === true ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-600 text-white shadow">
                          ✓ Benar
                        </span>
                      ) : answer.is_correct === false ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white shadow">
                          ✗ Salah
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-400 text-white shadow">
                          ? Perlu penilaian manual
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">Tidak ada jawaban.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResults; 