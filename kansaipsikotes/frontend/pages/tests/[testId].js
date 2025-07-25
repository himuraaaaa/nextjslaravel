import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { FileText, ChevronRight, Send, Key } from 'lucide-react';
import Timer from '@/components/Timer';
import UserCameraStream from '@/components/UserCameraStream';

const TestTake = () => {
  const router = useRouter();
  const { testId } = router.query;
  const { user } = useAuth();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Flag untuk mencegah multiple submission
  
  // Code validation states
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [testCode, setTestCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);

  const [startedAt, setStartedAt] = useState(null);



  // Convert duration from minutes to seconds for timer
  const getInitialTime = () => {
    if (!test?.duration) return 0;
    
    // Check if there's saved time in localStorage
    const savedTime = localStorage.getItem(`test_timer_${testId}`);
    if (savedTime) {
      const { startTime, duration } = JSON.parse(savedTime);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = (duration * 60) - elapsed;
      return Math.max(0, remaining);
    }
    
    return test.duration * 60;
  };

  // Save timer state to localStorage
  const saveTimerState = (timeLeft) => {
    if (test?.duration) {
      const startTime = Date.now() - ((test.duration * 60 - timeLeft) * 1000);
      localStorage.setItem(`test_timer_${testId}`, JSON.stringify({
        startTime,
        duration: test.duration
      }));
    }
  };

  // Clear timer state from localStorage
  const clearTimerState = () => {
    localStorage.removeItem(`test_timer_${testId}`);
  };

  // Handle page unload warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (testStarted && !submitted && !timeUp) {
        e.preventDefault();
        e.returnValue = 'Anda sedang mengerjakan test. Jika Anda meninggalkan halaman ini, progress Anda mungkin hilang. Apakah Anda yakin ingin keluar?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [testStarted, submitted, timeUp]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (testId) {
      setLoading(true);
      
      api.get('/available-tests')
        .then(res => {
          const t = res.data.find(t => String(t.id) === String(testId));
          if (!t) {
            setError('Test tidak ditemukan');
            setLoading(false);
            return;
          }
          setTest(t);
          
          if (t.remaining_attempts === 0 && t.allowed_attempts > 0) {
            setError('Anda telah mencapai batas maksimal pengerjaan untuk test ini.');
            setLoading(false);
            return;
          }
          
          if (t.code) {
            // Test requires a code. Check if we have a validated one in storage.
            const validatedCode = sessionStorage.getItem(`validated_test_code_${testId}`);
            if (validatedCode) {
              // We have a code, let's use it to start the test
              sessionStorage.removeItem(`validated_test_code_${testId}`); // Clean up
              startTest(validatedCode);
            } else {
              // No validated code, show the input form
              setShowCodeInput(true);
              setLoading(false);
            }
          } else {
            // No code required, start test directly
            startTest(null);
          }
        })
        .catch(() => {
          setError('Test not found');
          setLoading(false);
        });
    }
  }, [testId, user]);

  const startTest = (code) => {
    api.post(`/tests/${testId}/start`, { code })
      .then((res) => {
        setAttemptId(res.data.attempt_id);
        setTestStarted(true);
        setStartedAt(res.data.started_at);
        // Ambil started_at, last_question_id, dan last_question_index dari response
        const startedAt = res.data.started_at;
        const lastQuestionId = res.data.last_question_id;
        const lastQuestionIndex = res.data.last_question_index;
        // Ambil data soal
        api.get(`/tests/${testId}/questions`, { params: { attempt_id: res.data.attempt_id } })
          .then(resQ => {
            setQuestions(resQ.data);
            // Fetch answers for this attempt
            api.get(`/tests/${testId}/answers`, { params: { attempt_id: res.data.attempt_id } })
              .then(resA => {
                // resA.data = {question_id: answer, ...}
                const answerMap = resA.data || {};
                setAnswers(resQ.data.map(q => answerMap[q.id] || ''));
              })
              .catch(() => {
                // fallback: kosongkan jika gagal
                setAnswers(Array(resQ.data.length).fill(''));
              });
            // Jika resume, set current ke index last_question_index (atau last_question_id)
            if (typeof lastQuestionIndex === 'number' && lastQuestionIndex >= 0 && lastQuestionIndex < resQ.data.length) {
              setCurrent(lastQuestionIndex);
            } else if (lastQuestionId) {
              const idx = resQ.data.findIndex(q => q.id === lastQuestionId);
              if (idx >= 0) setCurrent(idx);
            }
        })
          .catch(() => setError('Failed to load questions'))
        .finally(() => setLoading(false));
        // Timer: hitung sisa waktu dari startedAt
        if (test && startedAt) {
          const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
          const remaining = (test.duration * 60) - elapsed;
          setTimeout(() => setTimeUp(true), remaining * 1000);
        }
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setError('Anda telah mencapai batas maksimal pengerjaan untuk test ini.');
        } else {
          setError(err.response?.data?.message || 'Failed to start test');
        }
        setLoading(false);
      });
  };

  const validateAndStartTest = async () => {
    if (!testCode.trim()) {
      setCodeError('Kode test harus diisi');
      return;
    }

    setValidatingCode(true);
    setCodeError('');

    try {
      await api.post(`/tests/${testId}/validate-code`, { code: testCode });

      setShowCodeInput(false);
      setLoading(true);
      startTest(testCode);
    } catch (err) {
      setCodeError(err.response?.data?.message || 'Kode test tidak valid');
    } finally {
      setValidatingCode(false);
    }
  };

  // Auto-save answer
  const autoSaveAnswer = async (questionId, answer) => {
    if (!attemptId) return;
    try {
      await api.post(`/tests/${testId}/auto-save`, {
        attempt_id: attemptId,
        question_id: questionId,
        answer: answer,
        question_index: current
      });
    } catch (err) {
      console.error('Auto-save failed:', err.response?.data || err.message);
    }
  };

  // Handle time up - auto submit test
  const handleTimeUp = async () => {
    if (isSubmitting || submitted) {
      return;
    }
    
    setTimeUp(true);
    setSubmitting(true);
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate data before submitting
      if (!attemptId) {
        throw new Error('Attempt ID tidak valid');
      }
      
      if (!questions || questions.length === 0) {
        throw new Error('Tidak ada soal yang tersedia');
      }
      
      // Format jawaban: {question_id: user_answer, ...}
      const answerMap = {};
      questions.forEach((q, idx) => {
        answerMap[q.id] = answers[idx] || '';
      });
      
      const response = await api.post(`/tests/${testId}/submit`, { 
        attempt_id: attemptId,
        answers: answerMap 
      });
      
      
      clearTimerState();
      setSubmitted(true);
    } catch (err) {
      console.error('Submit error:', err);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      console.error('Error message:', err.message);
      console.error('Full error object:', err);
      
      // Handle specific error cases
      if (err.response?.data?.error === 'attempt_already_completed') {
        setError('Test sudah selesai. Hasil Anda sudah tersimpan.');
        setSubmitted(true);
      } else if (err.response?.data?.error === 'attempt_not_found') {
        setError('Sesi test tidak ditemukan. Silakan mulai test lagi.');
        // Redirect to dashboard after a delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setError(err.response?.data?.message || err.message || 'Gagal mengirim jawaban. Silakan coba lagi.');
      }
    } finally {
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  // Handle timer tick
  const handleTimerTick = (timeLeft) => {
    // Save timer state every 30 seconds
    if (timeLeft % 30 === 0 && timeLeft > 0) {
      saveTimerState(timeLeft);
    }
  };

  if (!user) return null;
  if (loading) return <div className="text-center py-12">Loading test...</div>;
  if (error) return (
    <div className="max-w-xl mx-auto py-12 text-center">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
        {error}
      </div>
      <button
        onClick={() => router.push('/dashboard')}
        className="btn-primary text-white px-6 py-2 rounded"
      >
        Kembali ke Dashboard
      </button>
    </div>
  );
  if (!test) return null;

  // Show code input if required
  if (showCodeInput) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{test.title}</h1>
            <p className="text-gray-600">Test ini memerlukan kode untuk diakses</p>
          </div>
          
          {codeError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {codeError}
            </div>
          )}
          
          <form onSubmit={(e) => { e.preventDefault(); validateAndStartTest(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Test
              </label>
              <input
                type="text"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
                placeholder="Masukkan kode test"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={validatingCode}
              className="w-full btn-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {validatingCode ? 'Memvalidasi...' : 'Mulai Test'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];

  const handleChange = (e) => {
    const value = e.target.value;
    setAnswers((prev) => prev.map((a, i) => (i === current ? value : a)));
    // Auto-save jawaban
    if (q) {
      autoSaveAnswer(q.id, value);
    }
  };

  const handleOptionChange = (value) => {
    setAnswers((prev) => prev.map((a, i) => (i === current ? value : a)));
    // Auto-save jawaban
    if (q) {
      autoSaveAnswer(q.id, value);
    }
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || submitted) {
      return;
    }
    
    setSubmitting(true);
    setIsSubmitting(true);
    setError(null);
    try {
      // Validate data before submitting
      if (!attemptId) {
        throw new Error('Attempt ID tidak valid');
      }
      
      if (!questions || questions.length === 0) {
        throw new Error('Tidak ada soal yang tersedia');
      }
      
      // Format jawaban: {question_id: user_answer, ...}
      const answerMap = {};
      questions.forEach((q, idx) => {
        answerMap[q.id] = answers[idx] || '';
      });
      
      const response = await api.post(`/tests/${testId}/submit`, { 
        attempt_id: attemptId,
        answers: answerMap 
      });
      
      
      clearTimerState();
      setSubmitted(true);
    } catch (err) {
      console.error('Submit error:', err);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      console.error('Error message:', err.message);
      console.error('Full error object:', err);
      
      // Handle specific error cases
      if (err.response?.data?.error === 'attempt_already_completed') {
        setError('Test sudah selesai. Hasil Anda sudah tersimpan.');
        setSubmitted(true);
      } else if (err.response?.data?.error === 'attempt_not_found') {
        setError('Sesi test tidak ditemukan. Silakan mulai test lagi.');
        // Redirect to dashboard after a delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setError(err.response?.data?.message || err.message || 'Gagal mengirim jawaban. Silakan coba lagi.');
      }
    } finally {
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundImage: "url('/bg-page.png')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="bg-white shadow-md border border-gray-100 rounded-xl px-8 py-10 flex flex-col items-center max-w-md w-full">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-6">
            <Send className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2 text-center">
            {timeUp ? 'Waktu habis! Jawaban berhasil dikirim otomatis.' : 'Jawaban berhasil dikirim!'}
          </h2>
          <p className="text-gray-600 mb-6 text-center">Terima kasih sudah mengerjakan test.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: "url('/bg-page.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
    <div className="max-w-xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
        {testStarted && test.duration && startedAt && (
          <Timer 
            startedAt={startedAt}
            duration={test?.duration}
            onTimeUp={handleTimeUp}
            onTick={handleTimerTick}
          />
        )}
      </div>
      
      {testStarted && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-blue-800 text-sm">
            ✅ Test tracking aktif - Jawaban Anda akan disimpan otomatis
          </p>
        </div>
      )}
      
      {timeUp && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-800 text-sm">
            ⏰ Waktu habis! Test akan disubmit otomatis...
          </p>
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-3xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Section Soal */}
        <div className="md:w-1/2 flex-1 border-b md:border-b-0 md:border-r border-gray-200 pr-0 md:pr-8 mb-6 md:mb-0">
          <div className="mb-4 text-gray-700 font-semibold text-sm tracking-wide text-center">
            SOAL {current + 1} DARI {questions.length}
            <div className="h-1 w-full bg-[#800000] rounded-full mt-2 mb-4"></div>
          </div>
          <div className="mt-4 text-xl text-gray-800 leading-relaxed">
            {questions[current].question_text}
          </div>
          {questions[current].question_image_url && (
            <div className="mt-6">
              <img 
                  src={
                    questions[current].question_image_url.replace('/storage/public/questions/', '/storage/questions/')
                  }
                alt="Soal" 
                className="max-w-full h-auto rounded-lg mx-auto"
                style={{ maxHeight: '400px' }}
              />
            </div>
          )}
        </div>
        {/* Section Jawaban */}
        <div className="md:w-1/2 flex-1 pl-0 md:pl-8">
          {q?.question_type === 'multiple_choice' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Array.isArray(q.options) ? q.options : []).map((option, idx) => {
                  const isObj = typeof option === 'object' && option !== null;
                  const text = isObj ? option.text : (typeof option === 'string' ? option : '');
                  const imageUrl = isObj ? option.image_url : (typeof option === 'string' && option.match(/^https?:\/\//) ? option : null);
                  return (
                    <label
                      key={idx}
                      className={`flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 cursor-pointer transition p-2
                        ${answers[current] === String(idx) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                      onClick={() => handleOptionChange(String(idx))}
                    >
                      <input
                        type="radio"
                        name={`question_${q.id}`}
                        value={String(idx)}
                        checked={answers[current] === String(idx)}
                        readOnly
                        className="mb-2 accent-blue-600"
                      />
                      {imageUrl && (
                        <img src={imageUrl} alt={`Opsi ${idx + 1}`} className="h-20 w-auto object-contain mx-auto" />
                      )}
                      {text && (
                        <span className="text-gray-800 font-medium text-lg mt-2 text-center">{text}</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          
          {q?.question_type === 'essay' ? (
            <textarea
              className="w-full border rounded px-3 py-2 mt-2 text-gray-900"
              rows={4}
              value={answers[current] || ''}
              onChange={handleChange}
              placeholder="Tulis jawaban Anda di sini..."
              disabled={timeUp}
            />
          ) : null}
          
          {q?.question_type === 'true_false' && (
            <div className="space-y-3">
              {['true', 'false'].map((val, idx) => (
                <label
                  key={val}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    answers[current] === val
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleOptionChange(val)}
                >
                  <input
                    type="radio"
                    name={`question_${q.id}`}
                    value={val}
                    checked={answers[current] === val}
                    readOnly
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-700">{val === 'true' ? 'Benar' : 'Salah'}</span>
                </label>
              ))}
            </div>
          )}
          
          {error && <div className="text-red-600 mt-4">{error}</div>}
          
          <div className="flex justify-between mt-6">
            {current < questions.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!answers[current] || timeUp}
                className="btn-primary text-white px-6 py-2 rounded flex items-center disabled:bg-gray-400"
              >
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || timeUp}
                className="btn-primary text-white px-6 py-2 rounded flex items-center disabled:bg-gray-400"
              >
                {submitting ? 'Submitting...' : 'Submit'} <Send className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    {/* Komponen streaming kamera user ke admin, render hanya sekali selama test berlangsung */}
    {user && attemptId && (
      <UserCameraStream
        userId={user.email}
        attemptId={attemptId}
      />
    )}
    </div>
  );
};

export default TestTake; 