import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminQuestions } from '@/hooks/useAdminQuestions';
import Link from 'next/link';
import { Save, ArrowLeft, FileText, AlertCircle, Plus, Trash2, UploadCloud } from 'lucide-react';
import api from '@/utils/api';
import DiscQuestionForm from '@/components/DiscQuestionForm';

const QuestionEdit = () => {
  const router = useRouter();
  const { question_id, test_id } = router.query;
  const { user } = useAuth();
  const { getQuestion, updateQuestion } = useAdminQuestions();

  const [questionText, setQuestionText] = useState('');
  const [questionImageUrl, setQuestionImageUrl] = useState('');
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [points, setPoints] = useState(1);
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [testType, setTestType] = useState('general');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) router.push('/login');
    else if (user.role !== 'admin') router.push('/dashboard');
    else if (question_id) {
      setLoading(true);
      getQuestion(question_id)
        .then(q => {
          setQuestionText(q.question_text);
          setQuestionImageUrl(q.question_image_url || '');
          setQuestionType(q.question_type);
          setPoints(q.points);
          setOptions(Array.isArray(q.options) ? q.options : []);
          setCorrectAnswer(q.correct_answer || '');
          setLoading(false);
        })
        .catch(err => {
          setError('Gagal memuat soal.');
          setLoading(false);
        });
    }
  }, [user, router, question_id]);

  useEffect(() => {
    if (test_id) {
      api.get(`/admin/tests/${test_id}`)
        .then(res => setTestType(res.data.type || 'general'))
        .catch(() => setTestType('general'));
    }
  }, [test_id]);

  useEffect(() => {
    if (testType === 'disc') setQuestionType('disc');
  }, [testType]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setQuestionType(newType);
    setError(null);
    setCorrectAnswer(''); 
    if (newType === 'multiple_choice') {
      if (!Array.isArray(options) || options.length === 0) {
        setOptions([{ text: '' }, { text: '' }, { text: '' }, { text: '' }]);
      }
    } else {
      setOptions([]);
    }
  };

  const addOption = () => {
    setOptions(prev => [...(Array.isArray(prev) ? prev : []), { text: '' }]);
  };

  const removeOption = (index) => {
    if (Array.isArray(options) && options.length > 2) {
      const removedOptionText = options[index].text;
      setOptions(prev => prev.filter((_, i) => i !== index));
      if (correctAnswer === String(index)) {
        setCorrectAnswer('');
      }
    }
  };

  const updateOptionText = (index, text) => {
    setOptions(prev => (Array.isArray(prev) ? prev : []).map((opt, i) => i === index ? { ...opt, text } : opt));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    setError(null);

    try {
      const res = await api.post('/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setQuestionImageUrl(res.data.url);
    } catch (err) {
      setError('Gagal mengupload gambar. Pastikan file adalah gambar dan ukurannya tidak lebih dari 2MB.');
    } finally {
      setUploading(false);
    }
  };

  const handleOptionImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    setError(null);
    try {
      const res = await api.post('/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setOptions(prev => prev.map((opt, i) => i === index ? { ...opt, image_url: res.data.url } : opt));
    } catch (err) {
      setError('Gagal mengupload gambar opsi. Pastikan file adalah gambar dan ukurannya tidak lebih dari 2MB.');
    } finally {
      setUploading(false);
    }
  };

  const removeOptionImage = (index) => {
    setOptions(prev => prev.map((opt, i) => i === index ? { ...opt, image_url: '' } : opt));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    let payload = {
      question_text: questionText,
      question_type: questionType,
      points: Number(points),
      question_image_url: questionImageUrl,
    };

    if (questionType === 'multiple_choice') {
      if (!Array.isArray(options) || options.some(opt => (!opt.text?.trim() && !opt.image_url))) {
        setError("Setiap opsi harus diisi dengan teks atau gambar.");
        setSaving(false);
        return;
      }
      if (correctAnswer === '' || correctAnswer === null) {
        setError("Pilih jawaban yang benar.");
        setSaving(false);
        return;
      }
      payload.options = options;
      payload.correct_answer = correctAnswer;
    } else if (questionType === 'true_false') {
      if (!correctAnswer) {
        setError("Pilih jawaban yang benar (Benar/Salah).");
        setSaving(false);
        return;
      }
      payload.correct_answer = correctAnswer;
    } else if (questionType === 'essay') {
        payload.options = null;
        payload.correct_answer = null;
    }
    
    try {
      await updateQuestion(question_id, payload);
      router.push(`/admin/question_list?test_id=${test_id}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal memperbarui soal';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Memuat...</div>;
  if (!user || user.role !== 'admin') return null;
  
  return (
    <div className="min-h-screen bg-gray-50">
       <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href={`/admin/question_list?test_id=${test_id}`} className="mr-4">
            <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
          </Link>
          <FileText className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Edit Soal</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto py-6 px-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Question Text & Image */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Pertanyaan *</label>
              <textarea
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                required
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Tulis pertanyaan..."
              />
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar Soal (Opsional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {questionImageUrl ? (
                      <div>
                        <img src={questionImageUrl} alt="Preview" className="max-h-48 mx-auto rounded-md" />
                        <button 
                          type="button" 
                          onClick={() => setQuestionImageUrl('')}
                          className="mt-2 text-sm text-red-600 hover:text-red-800"
                        >
                          Hapus Gambar
                        </button>
                      </div>
                    ) : (
                      <div>
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                          >
                            <span>Upload sebuah file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                          </label>
                          <p className="pl-1">atau drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                      </div>
                    )}
                    {uploading && <p className="text-sm text-blue-500 mt-2">Uploading...</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Question Type */}
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Tipe Soal *</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-black"
                  value={questionType}
                  onChange={handleTypeChange}
                >
                  <option value="multiple_choice">Pilihan Ganda</option>
                  <option value="true_false">Benar/Salah</option>
                  <option value="essay">Esai</option>
                </select>
              </div>

              {/* Points */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Poin *</label>
                <input
                  type="number"
                  value={points}
                  onChange={e => setPoints(e.target.value)}
                  required min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Answer Section */}
            {questionType === 'multiple_choice' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">Opsi Jawaban</h3>
                  <button type="button" onClick={addOption} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md flex items-center text-sm hover:bg-blue-100">
                    <Plus className="h-4 w-4 mr-1" />Tambah Opsi
                  </button>
                </div>
                <p className="text-sm text-gray-500">Pilih salah satu opsi sebagai jawaban yang benar.</p>
                <div className="space-y-3">
                  {(Array.isArray(options) ? options : []).map((option, index) => (
                    <div key={index} className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center flex-1 space-x-3">
                      <input 
                        type="radio" 
                        name="correct_answer_radio" 
                          checked={correctAnswer === String(index)} 
                          onChange={() => setCorrectAnswer(String(index))}
                        className="h-5 w-5 text-blue-600"
                      />
                      <input 
                        type="text" 
                        value={option.text} 
                        onChange={e => updateOptionText(index, e.target.value)} 
                        placeholder={`Opsi ${index + 1}`} 
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" 
                      />
                        {Array.isArray(options) && options.length > 2 && (
                        <button type="button" onClick={() => removeOption(index)} className="text-gray-500 hover:text-red-600 p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      </div>
                      {/* Gambar Opsi */}
                      <div className="flex flex-col items-center w-full md:w-auto">
                        {option.image_url ? (
                          <div className="flex flex-col items-center">
                            <img src={option.image_url} alt="Preview" className="max-h-20 rounded mb-1" />
                            <button type="button" onClick={() => removeOptionImage(index)} className="text-xs text-red-600 hover:text-red-800">Hapus Gambar</button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                            <UploadCloud className="h-5 w-5 mb-1" />
                            <span>Upload Gambar</span>
                            <input type="file" className="sr-only" accept="image/*" onChange={e => handleOptionImageUpload(index, e)} />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {questionType === 'true_false' && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium text-gray-900">Jawaban Benar</h3>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer p-3 bg-gray-50 rounded-lg flex-1">
                    <input 
                      type="radio" 
                      name="correct_answer_tf" 
                      value="true"
                      checked={correctAnswer === 'true'} 
                      onChange={e => setCorrectAnswer(e.target.value)}
                      className="h-5 w-5 text-blue-600"
                    />
                    <span className="font-medium text-gray-800">Benar</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer p-3 bg-gray-50 rounded-lg flex-1">
                    <input 
                      type="radio" 
                      name="correct_answer_tf" 
                      value="false"
                      checked={correctAnswer === 'false'} 
                      onChange={e => setCorrectAnswer(e.target.value)}
                      className="h-5 w-5 text-blue-600"
                    />
                    <span className="font-medium text-gray-800">Salah</span>
                  </label>
                </div>
              </div>
            )}

            {questionType === 'essay' && (
               <div className="pt-4 border-t">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">Soal esai tidak memiliki jawaban benar dan akan diperiksa secara manual.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end pt-6 border-t">
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionEdit; 