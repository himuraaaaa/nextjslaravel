import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminQuestions } from '@/hooks/useAdminQuestions';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import api from '@/utils/api';

const QuestionList = () => {
  const router = useRouter();
  const { test_id } = router.query;
  const { user } = useAuth();
  const { questions, loading, error, fetchQuestions, deleteQuestion } = useAdminQuestions();
  const [testType, setTestType] = useState('general');
  const [testTitle, setTestTitle] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Semua hook dipanggil di atas, tidak ada return sebelum ini

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    } else if (test_id) {
      fetchQuestions();
      api.get(`/admin/tests/${test_id}`)
        .then(res => {
          setTestType(res.data.type || 'general');
          setTestTitle(res.data.title || '');
        })
        .catch(() => {
          setTestType('general');
          setTestTitle('');
        });
    }
  }, [user, router, test_id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [entriesPerPage, test_id]);

  // Setelah semua hook, baru lakukan return
  if (!user || user.role !== 'admin') return null;
  if (loading) return <div>Loading...</div>;

  // Filter questions by test_id
  const filteredQuestions = questions.filter(q => String(q.test_id) === String(test_id));

  // Pagination logic
  const totalEntries = filteredQuestions.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * entriesPerPage,
    (currentPage - 1) * entriesPerPage + entriesPerPage
  );

  const handleDelete = async (questionId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
      try {
        await deleteQuestion(questionId);
      } catch (err) {
        alert(err.message || 'Gagal menghapus soal');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={testTitle ? `Questions (${testTitle})` : 'Questions'}
        subtitle="Kelola soal-soal untuk test ini"
        backLink="/admin/test_list"
        backText="Kembali ke Daftar Test"
      >
        <Link href={`/admin/question_create?test_id=${test_id}`} className="btn-primary flex items-center">Tambah Soal</Link>
      </PageHeader>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {/* Show Entries Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 max-w-2xl justify-between mb-4">
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
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pertanyaan
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
              {paginatedQuestions.map(q => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-md truncate" title={q.question_text}>
                      {q.question_text}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      q.question_type === 'multiple_choice' 
                        ? 'bg-blue-100 text-blue-800'
                        : q.question_type === 'true_false'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {q.question_type === 'multiple_choice' ? 'Pilihan Ganda' :
                       q.question_type === 'true_false' ? 'Benar/Salah' : 'Essay'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <Link 
                        href={`/admin/question_edit?question_id=${q.id}&test_id=${test_id}`} 
                        className="text-green-600 hover:text-green-900 font-medium flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(q.id)} 
                        className="text-red-600 hover:text-red-900 font-medium flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedQuestions.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-gray-400 py-12 text-lg">Tidak ada soal.</td>
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
    </div>
  );
};

export default QuestionList; 