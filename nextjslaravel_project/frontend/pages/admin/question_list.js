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

  if (!user || user.role !== 'admin') return null;
  if (loading) return <div>Loading...</div>;

  // Filter questions by test_id
  const filteredQuestions = questions.filter(q => String(q.test_id) === String(test_id));

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
        title={testTitle ? `Daftar Soal - ${testTitle}` : 'Daftar Soal'}
        subtitle="Kelola soal-soal untuk test ini"
        backLink="/admin/test_list"
        backText="Kembali ke Daftar Test"
      >
        <Link href={`/admin/question_create?test_id=${test_id}`} className="btn-primary flex items-center">Tambah Soal</Link>
      </PageHeader>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="text-red-600 mb-4">{error}</div>}
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
              {filteredQuestions.map(q => (
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuestionList; 