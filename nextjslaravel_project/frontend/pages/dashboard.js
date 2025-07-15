import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useTests } from '@/hooks/useTests';
import { Clock, FileText, Plus, Trash, Edit, PlayCircle, Repeat, Key, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';
import Greeting from '@/components/Greeting';
import Head from 'next/head';

const Dashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { tests, loading, error, deleteTest } = useTests();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testCode, setTestCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);
  const [showAssessmentNote, setShowAssessmentNote] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const testsPerPage = 6;
  // Pastikan activeTests sudah didefinisikan sebelum digunakan
  // Misal, jika sebelumnya ada:
  // const activeTests = tests.filter(...);
  // Maka deklarasikan di sini:
  const activeTests = tests.filter(test => test.status === 'active');
  const totalPages = Math.ceil(activeTests.length / testsPerPage);
  const paginatedTests = activeTests.slice((currentPage - 1) * testsPerPage, currentPage * testsPerPage);
  const [agreeChecked, setAgreeChecked] = useState(false);

  useEffect(() => {
    setShowAssessmentNote(true);
  }, []);

  // Tambahan: Redirect ke dashboard admin jika user adalah admin
  if (user && user.role === 'admin') {
    if (typeof window !== 'undefined') {
      router.push('/admin'); // Ganti sesuai URL dashboard admin jika berbeda
    }
    return null;
  }

  const handleDelete = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        setIsDeleting(true);
        await deleteTest(testId);
      } catch (err) {
        alert(err.message);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleStartTest = (test) => {
    if (test.code) {
      // Test requires code
      setSelectedTest(test);
      setShowCodeModal(true);
      setTestCode('');
      setCodeError('');
    } else {
      // No code required, go directly to test
      router.push(`/tests/${test.id}`);
    }
  };

  const validateAndStartTest = async () => {
    if (!selectedTest || !testCode.trim()) {
      setCodeError('Kode test harus diisi');
      return;
    }
    if (!agreeChecked) {
      setCodeError('Anda harus menyetujui instruksi dan note sebelum memulai test');
      return;
    }

    setValidatingCode(true);
    setCodeError('');

    try {
      // Validate code first
      await api.post(`/tests/${selectedTest.id}/validate-code`, {
        code: testCode
      });

      // If validation is successful, store the validated code in sessionStorage
      sessionStorage.setItem(`validated_test_code_${selectedTest.id}`, testCode);

      setShowCodeModal(false);
      setSelectedTest(null);
      setTestCode('');
      
      // Navigate to test page
      router.push(`/tests/${selectedTest.id}`);
    } catch (err) {
      setCodeError(err.response?.data?.message || 'Kode test tidak valid');
    } finally {
      setValidatingCode(false);
    }
  };

  // Filter hanya test yang statusnya 'active'
  // const activeTests = tests.filter(test => test.status === 'active'); // Moved outside

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard | Kansai Paint Assessment</title>
      </Head>
      {/* Konten utama */}
      <div className="relative z-10 pt-24">
        {/* Pop up Assessment Note */}
        {showAssessmentNote && (
          <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.35)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{background:'#fff',borderRadius:16,padding:32,maxWidth:600,width:'90%',boxShadow:'0 4px 32px rgba(0,0,0,0.18)',textAlign:'left',overflowY:'auto',maxHeight:'90vh'}}>
              <div style={{fontWeight:'bold',fontSize:20,color:'#001F5A',marginBottom:12}}>Welcome to Online Assessment PT Kansai Prakarsa Coatings!</div>
              <div style={{marginBottom:12,color:'#222'}}>Sebelum memulai untuk mengisi, mohon untuk membaca instruksi dan note dengan detail terlebih dahulu.</div>
              <div style={{fontWeight:'bold',marginBottom:4,color:'#001F5A'}}>Instruksi:</div>
              <ul style={{marginLeft:18,marginBottom:8,fontSize:15,color:'#222'}}>
                <li>• Setiap soal terdapat gambar yang kurang lengkap, anda diminta untuk melengkapi gambar mana yang paling cocok untuk menutupi kekurangan tersebut</li>
                <li>• Setiap soal terdapat beberapa pilihan jawaban</li>
                <li>• Pilihlah salah satu jawaban yang menurut anda cocok</li>
              </ul>
              <div style={{fontWeight:'bold',marginBottom:4,color:'#B9142E'}}>Note:</div>
              <ul style={{marginLeft:18,marginBottom:16,fontSize:15,color:'#B9142E'}}>
                <li>• Soal ini akan merekam akses Kamera dan Microphone anda secara live, adanya kecurangan akan terdeteksi</li>
                <li>• Soal hanya dapat diisi satu kali</li>
                <li>• Soal ini terdapat durasi waktu terbatas</li>
                <li>• Dilarang keras untuk menyebar luaskan soal psikotest</li>
                <li>• Pengisian soal psikotest wajib dikerjakan sendiri tanpa bantuan orang lain</li>
              </ul>
              <div style={{fontWeight:'bold',fontSize:16,marginBottom:8,color:'#001F5A'}}>Before you start to fill, kindly read the instructions and notes carefully.</div>
              <div style={{fontWeight:'bold',marginBottom:4,color:'#001F5A'}}>Instructions:</div>
              <ul style={{marginLeft:18,marginBottom:8,fontSize:15,color:'#222'}}>
                <li>• Every question has uncompleted picture, you requested to complete the matched picture</li>
                <li>• Every question has few answer options</li>
                <li>• Choose only one matched picture</li>
              </ul>
              <div style={{fontWeight:'bold',marginBottom:4,color:'#B9142E'}}>Note:</div>
              <ul style={{marginLeft:18,marginBottom:24,fontSize:15,color:'#B9142E'}}>
                <li>• This website will record your Camera and Microphone access live, any fraud will be detected</li>
                <li>• Assessment only able to be accessed once</li>
                <li>• Assessment has limited duration</li>
                <li>• We highly prohibit you to share the assessment</li>
                <li>• Assessment should be done by yourself without any other people help</li>
              </ul>
              <button onClick={()=>setShowAssessmentNote(false)} style={{background:'#001F5A',color:'#fff',border:'none',borderRadius:8,padding:'10px 36px',fontWeight:'bold',fontSize:16,margin:'0 auto',display:'block'}}>Tutup / Close</button>
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto flex-grow flex flex-col pt-16">

            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-indigo-600">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading tests...
                </div>
              </div>
            ) : activeTests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No active tests</h3>
                <p className="mt-1 text-sm text-gray-500">Belum ada test yang bisa dikerjakan.</p>
              </div>
            ) : (
              <>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedTests.map((test) => (
                  <div
                    key={test.id}
                    className={`relative bg-white/90 border border-gray-200 rounded-2xl shadow-2xl transition-all duration-200 mb-6 ${test.status === 'active' ? 'hover:scale-[1.03] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.18)] hover:border-[#001F5A]' : ''}`}
                    style={{ minHeight: 270 }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-6 pb-2">
                      <h3 className="text-xl font-bold text-[#001F5A] truncate">
                        {test.title}
                      </h3>
                      {test.code && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-[#001F5A] text-xs font-semibold border border-blue-200">
                          <Key className="h-4 w-4" /> Kode
                        </span>
                      )}
                    </div>
                    {/* Badge status di bawah judul */}
                    {test.remaining_attempts === 0 && test.allowed_attempts > 0 && (
                      <div className="px-6 pb-1">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#B9142E] bg-opacity-90 text-white text-xs font-semibold shadow-sm animate-pulse mb-2" style={{marginBottom:'0.5rem'}}>
                          Kesempatan Habis
                        </span>
                      </div>
                    )}
                    {/* Info */}
                    <div className="px-6 pb-2 flex flex-col gap-2">
                      <div className="flex items-center gap-4 text-sm text-gray-700 font-medium">
                        <span className="flex items-center gap-1"><Clock className="h-5 w-5 text-blue-400" /> {test.duration} menit</span>
                        <span className="flex items-center gap-1"><Repeat className="h-5 w-5 text-blue-400" /> {test.allowed_attempts > 0 ? `${test.remaining_attempts} kesempatan` : 'Tak terbatas'}</span>
                      </div>
                      <div className="text-gray-500 text-sm italic mt-1 min-h-[20px]">
                        {test.description || <span className="opacity-60">No description provided</span>}
                      </div>
                    </div>
                    {/* Kode diperlukan */}
                    {test.code && (
                      <div className="mx-6 my-2 p-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2 text-sm text-[#001F5A]">
                        <Key className="h-4 w-4" /> Test ini memerlukan kode untuk diakses
                      </div>
                    )}
                    {/* Footer/Aksi */}
                    <div className="px-6 pb-6 pt-2">
                      <button
                        onClick={() => handleStartTest(test)}
                        disabled={test.remaining_attempts === 0 && test.allowed_attempts > 0}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-base shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#001F5A] ${
                          test.remaining_attempts === 0 && test.allowed_attempts > 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-[#001F5A] text-white hover:bg-blue-700 active:bg-blue-900'
                        }`}
                      >
                        <PlayCircle className="h-5 w-5" />
                        {test.remaining_attempts === 0 && test.allowed_attempts > 0
                          ? 'Kesempatan Habis'
                          : test.code 
                            ? 'Masukkan Kode'
                            : 'Mulai Test'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-50"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i+1}
                      className={`px-3 py-1 rounded font-semibold ${currentPage === i+1 ? 'bg-[#001F5A] text-white' : 'bg-gray-100 text-[#001F5A] hover:bg-gray-200'}`}
                      onClick={() => setCurrentPage(i+1)}
                    >
                      {i+1}
                    </button>
                  ))}
                  <button
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-50"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
              </>
            )}
          </div>

        {/* Code Input Modal */}
        {showCodeModal && selectedTest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative w-full max-w-2xl mx-auto p-0">
              <div className="bg-white rounded-2xl shadow-2xl px-10 py-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Masukkan Kode Test
                  </h3>
                  <button
                    onClick={() => {
                      setShowCodeModal(false);
                      setSelectedTest(null);
                      setTestCode('');
                      setCodeError('');
                      setAgreeChecked(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg text-center">
                  {selectedTest.title}
                </h4>
                {/* Kotak scrollable untuk instruksi dan note */}
                <div className="mb-4 pb-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-56 overflow-y-auto">
                    {/* INSTRUKSI INDONESIA */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="font-bold text-blue-900 text-base mb-1">Instruksi:</div>
                      <ul className="list-none ml-0 mb-2 space-y-1">
                        <li className="flex items-start gap-2 text-gray-900 font-semibold"><span className="mt-1 w-2 h-2 rounded-full bg-blue-500 inline-block"></span>Setiap soal terdapat gambar yang kurang lengkap, anda diminta untuk melengkapi gambar mana yang paling cocok untuk menutupi kekurangan tersebut</li>
                        <li className="flex items-start gap-2 text-gray-900 font-semibold"><span className="mt-1 w-2 h-2 rounded-full bg-blue-500 inline-block"></span>Setiap soal terdapat beberapa pilihan jawaban</li>
                        <li className="flex items-start gap-2 text-gray-900 font-semibold"><span className="mt-1 w-2 h-2 rounded-full bg-blue-500 inline-block"></span>Pilihlah salah satu jawaban yang menurut anda cocok</li>
                      </ul>
                      <div className="font-bold text-red-800 text-base mb-1 mt-3">Note:</div>
                      <ul className="list-none ml-0 mb-2 space-y-1">
                        <li className="flex items-start gap-2 text-gray-900 font-semibold"><span className="mt-1 w-2 h-2 rounded-full bg-red-500 inline-block"></span>Soal ini akan merekam akses Kamera dan Microphone anda secara live, adanya kecurangan akan terdeteksi</li>
                        <li className="flex items-start gap-2 text-gray-900 font-semibold"><span className="mt-1 w-2 h-2 rounded-full bg-red-500 inline-block"></span>Soal hanya dapat diisi satu kali</li>
                        <li className="flex items-start gap-2 text-gray-900 font-semibold"><span className="mt-1 w-2 h-2 rounded-full bg-red-500 inline-block"></span>Soal ini terdapat durasi waktu terbatas</li>
                        <li className="flex items-start gap-2 text-gray-900 font-semibold"><span className="mt-1 w-2 h-2 rounded-full bg-red-500 inline-block"></span>Dilarang keras untuk menyebar luaskan soal psikotest</li>
                        <li className="flex items-start gap-2 text-gray-900 font-semibold"><span className="mt-1 w-2 h-2 rounded-full bg-red-500 inline-block"></span>Pengisian soal psikotest wajib dikerjakan sendiri tanpa bantuan orang lain</li>
                      </ul>
                    </div>
                    {/* INSTRUKSI ENGLISH */}
                    <div className="mb-2">
                      <div className="font-bold text-blue-900 text-base mb-1">Instructions:</div>
                      <ul className="list-none ml-0 mb-2 space-y-1">
                        <li className="flex items-start gap-2 text-gray-900 font-semibold"><span className="mt-1 w-2 h-2 rounded-full bg-blue-500 inline-block"></span>Every question has uncompleted picture, you requested to complete the matched picture</li>
                        <li className="flex items-start gap-2 text-gray-900 font-semibold"><span className="mt-1 w-2 h-2 rounded-full bg-blue-500 inline-block"></span>Every question has few answer options</li>
                        <li className="flex items-start gap-2 text-gray-900 font-semibold"><span className="mt-1 w-2 h-2 rounded-full bg-blue-500 inline-block"></span>Choose only one matched picture</li>
                      </ul>
                      <div className="font-bold text-red-800 text-base mb-1 mt-3">Note:</div>
                      <ul className="list-none ml-0 mb-2 space-y-1">
                        <li className="flex items-start gap-2 text-gray-900 font-semibold"><span className="mt-1 w-2 h-2 rounded-full bg-red-500 inline-block"></span>This website will record your Camera and Microphone access live, any fraud will be detected</li>
                        <li className="flex items-start gap-2 text-gray-900 font-semibold"><span className="mt-1 w-2 h-2 rounded-full bg-red-500 inline-block"></span>Assessment only able to be accessed once</li>
                        <li className="flex items-start gap-2 text-gray-900 font-semibold"><span className="mt-1 w-2 h-2 rounded-full bg-red-500 inline-block"></span>Assessment has limited duration</li>
                        <li className="flex items-start gap-2 text-gray-900 font-semibold"><span className="mt-1 w-2 h-2 rounded-full bg-red-500 inline-block"></span>We highly prohibit you to share the assessment</li>
                        <li className="flex items-start gap-2 text-gray-900 font-semibold"><span className="mt-1 w-2 h-2 rounded-full bg-red-500 inline-block"></span>Assessment should be done by yourself without any other people help</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Test ini memerlukan kode untuk diakses. Silakan masukkan kode yang telah diberikan oleh admin.
                </p>
                <div className="mb-4">
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Kode Test
                  </label>
                  <input
                    type="text"
                    value={testCode}
                    onChange={(e) => setTestCode(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Masukkan kode test..."
                    autoFocus
                  />
                  {codeError && (
                    <p className="text-red-600 text-sm mt-1 font-semibold">{codeError}</p>
                  )}
                </div>
                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    id="agree-check"
                    checked={agreeChecked}
                    onChange={e => setAgreeChecked(e.target.checked)}
                    className="mr-3 accent-indigo-600 h-5 w-5"
                    required
                  />
                  <label htmlFor="agree-check" className={`text-base font-semibold select-none ${!agreeChecked && codeError ? 'text-red-600' : 'text-gray-700'}`}>Saya mengerti dan setuju dengan instruksi dan note di atas</label>
                </div>
                <div className="flex justify-end space-x-3 mt-2">
                  <button
                    onClick={() => {
                      setShowCodeModal(false);
                      setSelectedTest(null);
                      setTestCode('');
                      setCodeError('');
                      setAgreeChecked(false);
                    }}
                    className="bg-gray-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-gray-700"
                  >
                    Batal
                  </button>
                  <button
                    onClick={validateAndStartTest}
                    disabled={validatingCode || !testCode.trim() || !agreeChecked}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow"
                  >
                    {validatingCode ? 'Memvalidasi...' : 'Mulai Test'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
