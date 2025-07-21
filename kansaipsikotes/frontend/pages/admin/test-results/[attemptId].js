import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import api from '@/utils/api';

const formatDate = (dateString) => new Date(dateString).toLocaleString('id-ID');
const getDuration = (startedAt, completedAt) => {
  if (!startedAt || !completedAt) return '-';
  const start = new Date(startedAt);
  const end = new Date(completedAt);
  const diff = Math.floor((end - start) / 1000 / 60); // dalam menit
  return `${diff} menit`;
};

export default function TestResultDetail() {
  const router = useRouter();
  const { attemptId } = router.query;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;
    setLoading(true);
    api.get(`/admin/results/${attemptId}`)
      .then(res => setDetail(res.data))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-lg">Loading...</div>;
  if (!detail) return <div className="flex items-center justify-center min-h-screen text-lg text-gray-400">Data tidak ditemukan</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button
        className="mb-6 text-blue-600 hover:underline font-semibold"
        onClick={() => router.back()}
      >
        &larr; Kembali ke Daftar Hasil
      </button>
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl shadow-xl p-8 mb-8">
        <h1 className="text-3xl font-extrabold mb-4 text-blue-900 tracking-tight">Detail Hasil Test</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold text-gray-700 mb-1">Nama:</div>
            <div className="text-lg font-bold text-gray-900 mb-2">{detail.user?.name || '-'}</div>
            <div className="font-semibold text-gray-700 mb-1">Email:</div>
            <div className="text-gray-900 mb-2">{detail.user?.email || '-'}</div>
            <div className="font-semibold text-gray-700 mb-1">Test:</div>
            <div className="text-gray-900 mb-2">{detail.test?.title || '-'}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-1">Status:</div>
            <div className="text-gray-900 mb-2">{detail.status || '-'}</div>
            <div className="font-semibold text-gray-700 mb-1">Skor:</div>
            <div className="text-blue-700 font-bold text-lg mb-2">{detail.score ?? '-'}</div>
            <div className="font-semibold text-gray-700 mb-1">Durasi:</div>
            <div className="text-gray-900 mb-2">{getDuration(detail.started_at, detail.completed_at)}</div>
            <div className="font-semibold text-gray-700 mb-1">Tanggal:</div>
            <div className="text-gray-900 mb-2">{formatDate(detail.completed_at)}</div>
          </div>
        </div>
      </div>
      {detail.test_answers && (
        <div className="mt-8 bg-white rounded-2xl shadow p-6">
          {/* Ringkasan jumlah soal, benar, salah */}
          <div className="flex flex-wrap gap-6 mb-6">
            <div className="bg-blue-50 rounded-xl px-5 py-3 text-blue-900 font-bold text-lg flex-1 text-center shadow-sm">
              Jumlah Soal<br />
              <span className="text-2xl">{detail.test_answers.length}</span>
            </div>
            <div className="bg-green-50 rounded-xl px-5 py-3 text-green-800 font-bold text-lg flex-1 text-center shadow-sm">
              Jumlah Benar<br />
              <span className="text-2xl">{detail.test_answers.filter(a => a.is_correct).length}</span>
            </div>
            <div className="bg-red-50 rounded-xl px-5 py-3 text-red-700 font-bold text-lg flex-1 text-center shadow-sm">
              Jumlah Salah<br />
              <span className="text-2xl">{detail.test_answers.filter(a => !a.is_correct).length}</span>
            </div>
          </div>
          <h3 className="text-xl font-bold mb-4 text-blue-800">Jawaban Peserta</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-3 py-2 text-left font-bold text-gray-700">No</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-700">Soal</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-700">Jawaban</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-700">Benar?</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {detail.test_answers.map((ans, idx) => {
                  let jawabanUser = ans.answer;
                  if (
                    ans.question &&
                    ans.question.question_type === 'multiple_choice' &&
                    Array.isArray(ans.question.options)
                  ) {
                    const optIdx = parseInt(ans.answer, 10);
                    if (!isNaN(optIdx) && ans.question.options[optIdx]) {
                      jawabanUser = `${String.fromCharCode(65 + optIdx)}. ${ans.question.options[optIdx].text}`;
                    }
                  }
                  return (
                    <tr key={ans.id || idx} className={ans.is_correct ? 'bg-green-50' : 'bg-red-50'}>
                      <td className="px-3 py-2 font-semibold">{idx + 1}</td>
                      <td className="px-3 py-2">{ans.question?.question_text || '-'}</td>
                      <td className="px-3 py-2 font-semibold">{jawabanUser || '-'}</td>
                      <td className="px-3 py-2">{ans.is_correct ? <span className="text-green-700 font-bold">Ya</span> : <span className="text-red-600 font-bold">Tidak</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 