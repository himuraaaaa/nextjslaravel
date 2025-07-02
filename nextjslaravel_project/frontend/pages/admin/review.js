import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/utils/api';
import { useAdminTests } from '@/hooks/useAdminTests';

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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-black">Review Soal Test</h1>
      <div className="mb-4">
        <label className="block mb-2 font-medium text-black">Pilih Test:</label>
        <select
          className="border rounded px-3 py-2 w-full text-black"
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
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">{reviewData.test.title}</h2>
          <ol className="space-y-6">
            {reviewData.questions.map((q, idx) => (
              <li key={q.id} className="border-b pb-4">
                {q.question_image_url && (
                  <div className="mb-2">
                    <img
                      src={q.question_image_url}
                      alt="Gambar Soal"
                      className="rounded border"
                      style={{ maxHeight: 200, maxWidth: '100%', display: 'block' }}
                    />
                  </div>
                )}
                <div className="mb-2 font-medium text-black">{idx + 1}. {q.question_text}</div>
                {Array.isArray(q.options) && q.options.length > 0 && (
                  <ul className="mb-2">
                    {q.options.map((opt, i) => {
                      const isCorrect = q.correct_answer == opt.value || q.correct_answer == i;
                      return (
                        <li key={i} className={`pl-2 py-1 rounded text-black ${isCorrect ? 'bg-green-100 font-bold' : ''}`}>
                          <span className="mr-2">{String.fromCharCode(65 + i)}.</span>
                          {typeof opt === 'object' ? opt.text : opt}
                          {typeof opt === 'object' && opt.image_url && (
                            <img src={opt.image_url} alt="Opsi Gambar" className="inline-block h-8 ml-2" />
                          )}
                          {isCorrect ? <span className="ml-2 text-green-700">(Jawaban Benar)</span> : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
                {q.question_type === 'essay' && (
                  <div className="italic text-gray-600">(Soal Essay - Jawaban benar dinilai manual)</div>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
      {selectedTest && !loading && !reviewData && (
        <div className="text-black">Tidak ada data soal untuk test ini.</div>
      )}
    </div>
  );
} 