import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/utils/api';
import { useAdminTests } from '@/hooks/useAdminTests';
import AdminCameraMonitor from '@/components/AdminCameraMonitor';

export default function AdminTestReview() {
  const router = useRouter();
  const { test_id } = router.query;
  const { tests, fetchTests, loading: loadingTests, error: errorTests } = useAdminTests();
  const [selectedTest, setSelectedTest] = useState('');
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (test_id && !selectedTest) {
      setSelectedTest(test_id);
    }
  }, [test_id, selectedTest]);

  useEffect(() => {
    if (!selectedTest) {
      setReviewData(null);
      return;
    }
    setLoading(true);
    api.get(`/admin/tests/${selectedTest}/review-questions`)
      .then(res => setReviewData(res.data))
      .catch(() => setReviewData(null))
      .finally(() => setLoading(false));
  }, [selectedTest]);

  return (
    <div className="min-h-screen bg-[#F7F9FB] py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#001F5A] mb-2">Review Soal Test</h1>
          <p className="text-lg text-gray-600 font-medium">Live Camera Monitoring</p>
          <div className="mt-2 mb-4">
            <div className="bg-white rounded-xl shadow p-4">
              <AdminCameraMonitor />
            </div>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Test:</label>
          <select
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-[#001F5A] focus:border-[#001F5A] px-3 py-2 text-black bg-white"
            value={selectedTest}
            onChange={e => setSelectedTest(e.target.value)}
          >
            <option value="">-- Pilih Test --</option>
            {tests.map(test => (
              <option key={test.id} value={test.id}>{test.title || test.name} ({test.code})</option>
            ))}
          </select>
        </div>
        {loading && <div className="text-black">Loading...</div>}
        {reviewData && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-[#001F5A] mb-4">{reviewData.test.title}</h2>
            <ol className="space-y-8">
              {reviewData.questions.map((q, idx) => (
                <li key={q.id} className="border-b pb-8 last:border-b-0">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {q.question_image_url && (
                      <div className="mb-2 md:mb-0 md:w-72 w-full flex-shrink-0">
                        <img
                          src={q.question_image_url}
                          alt="Gambar Soal"
                          className="rounded-lg border shadow object-contain w-full max-h-56 bg-white"
                        />
                      </div>
                    )}
                    <div className="flex-1 w-full">
                      <div className="mb-3 font-semibold text-gray-800 text-lg">{idx + 1}. {q.question_text}</div>
                      {Array.isArray(q.options) && q.options.length > 0 && (
                        <div className="space-y-3">
                          {q.options.map((opt, i) => {
                            const isCorrect = q.correct_answer == opt.value || q.correct_answer == i;
                            return (
                              <div
                                key={i}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:bg-blue-50'} text-base`}
                              >
                                <span className="font-bold text-gray-700">{String.fromCharCode(65 + i)}.</span>
                                {typeof opt === 'object' && opt.image_url && (
                                  <img src={opt.image_url} alt="Opsi Gambar" className="w-12 h-12 object-contain rounded shadow border bg-white" />
                                )}
                                <span className="ml-1 text-gray-700">{typeof opt === 'object' ? opt.text : opt}</span>
                                {isCorrect && (
                                  <span className="ml-2 text-green-700 font-semibold">(Jawaban Benar)</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {q.question_type === 'essay' && (
                        <div className="italic text-gray-500 mt-2">(Soal Essay - Jawaban benar dinilai manual)</div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
        {selectedTest && !loading && !reviewData && (
          <div className="text-black">Tidak ada data soal untuk test ini.</div>
        )}
      </div>
    </div>
  );
} 