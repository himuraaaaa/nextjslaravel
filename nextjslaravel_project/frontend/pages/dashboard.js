import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useTests } from '@/hooks/useTests';
import { Clock, FileText, Plus, Trash, Edit, PlayCircle, Repeat, Key, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';
import Greeting from '@/components/Greeting';

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
  const activeTests = tests.filter(test => test.status === 'active');

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <Greeting />
        </div>

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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeTests.map((test) => (
              <div
                key={test.id}
                className={`bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 ${test.remaining_attempts === 0 && test.allowed_attempts > 0 ? 'border-l-4 border-[#B9142E]' : ''}`}
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-medium text-gray-900 truncate flex items-center">
                      {test.title}
                      {test.remaining_attempts === 0 && test.allowed_attempts > 0 && (
                        <span className="inline-block px-2 py-1 ml-2 rounded bg-[#B9142E] text-white text-xs font-semibold">Kesempatan Habis</span>
                      )}
                    </h3>
                    {test.code && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Key className="h-4 w-4 mr-1" />
                        <span>Kode Diperlukan</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {test.description || 'No description provided'}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <span>{test.duration} menit</span>
                    </div>
                    <div className="flex items-center">
                      <Repeat className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <span>
                        {test.allowed_attempts > 0
                          ? `${test.remaining_attempts} kesempatan tersisa`
                          : 'Kesempatan tak terbatas'}
                      </span>
                    </div>
                  </div>
                  {test.code && (
                    <div className="mt-3 p-2 bg-white border border-gray-200 rounded-md">
                      <div className="flex items-center text-sm text-[#001F5A]">
                        <Key className="h-4 w-4 mr-1" />
                        <span>Test ini memerlukan kode untuk diakses</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-4 py-4 sm:px-6 flex justify-end items-center bg-gray-50">
                  <button
                    onClick={() => handleStartTest(test)}
                    disabled={test.remaining_attempts === 0 && test.allowed_attempts > 0}
                    className={`btn-primary inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#001F5A] ${
                      test.remaining_attempts === 0 && test.allowed_attempts > 0
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
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
        )}
      </div>

      {/* Code Input Modal */}
      {showCodeModal && selectedTest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Masukkan Kode Test
                </h3>
                <button
                  onClick={() => {
                    setShowCodeModal(false);
                    setSelectedTest(null);
                    setTestCode('');
                    setCodeError('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {selectedTest.title}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Test ini memerlukan kode untuk diakses. Silakan masukkan kode yang telah diberikan oleh admin.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Test
                  </label>
                  <input
                    type="text"
                    value={testCode}
                    onChange={(e) => setTestCode(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Masukkan kode test..."
                    autoFocus
                  />
                  {codeError && (
                    <p className="text-red-600 text-sm mt-1">{codeError}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCodeModal(false);
                    setSelectedTest(null);
                    setTestCode('');
                    setCodeError('');
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  onClick={validateAndStartTest}
                  disabled={validatingCode || !testCode.trim()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {validatingCode ? 'Memvalidasi...' : 'Mulai Test'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
