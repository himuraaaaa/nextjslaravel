import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Register() {
  const router = useRouter();
  useEffect(() => {
    // Redirect ke login
    router.replace('/login');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl font-bold text-gray-700">Registrasi dinonaktifkan. Silakan login dengan akun yang sudah dibuat admin.</div>
      <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Loading...' : 'Register'}</button>
    </div>
  );
} 