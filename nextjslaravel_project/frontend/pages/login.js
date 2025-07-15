import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ReCAPTCHA from "react-google-recaptcha";
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const { login, user } = useAuth();
  const router = useRouter();
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, router]);

  const validateEmail = (email) => {
    // Simple email regex
    return /^\S+@\S+\.\S+$/.test(email);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Validasi manual
    if (!email && !password) {
      setModalMessage('Harap isi form login');
      setLoading(false);
      return;
    }
    if (!email || !validateEmail(email)) {
      setModalMessage('Email tidak valid');
      setLoading(false);
      return;
    }
    if (!password || password.length < 6) {
      setModalMessage('Password tidak valid');
      setLoading(false);
      return;
    }
    if (!recaptchaToken) {
      setModalMessage('Harap verifikasi Captcha');
      setLoading(false);
      return;
    }
    try {
      const user = await login(email, password, recaptchaToken);
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      // Jika error dari backend (email/password salah/tidak terdaftar)
      setModalMessage('Email atau Password tidak valid/tidak terdaftar');
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };
  const closeModal = () => setModalMessage('');

  return (
    <div className="min-h-screen flex">
      {/* Kiri: Gambar Saja */}
      <div
        className="flex-1 h-screen"
        style={{
          backgroundImage: "url('/gedung-kansai.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '500px'
        }}
      ></div>
      {/* Kanan: Form Login langsung di atas background putih */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white">
        <div className="w-full max-w-md px-8">
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo-login.png" alt="Logo" className="h-10 w-10 object-contain" />
            <span className="h-8 border-l-2 border-gray-300"></span>
            <span className="text-3xl font-bold" style={{ color: '#001F5A' }}>Login</span>
          </div>
          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 focus:border-blue-700 outline-none bg-blue-50 py-3 px-4 text-gray-900 placeholder-gray-400 rounded transition"
                placeholder=""
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm mb-1">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 focus:border-blue-700 outline-none bg-blue-50 py-3 px-4 text-gray-900 placeholder-gray-400 rounded transition"
                placeholder=""
              />
              <div className="flex items-center mt-2">
                <input
                  id="show-password"
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword((v) => !v)}
                  className="mr-2 accent-[#001F5A]"
                />
                <label htmlFor="show-password" className="text-xs text-[#001F5A] select-none cursor-pointer">Show password</label>
              </div>
            </div>
            <div className="flex justify-center mt-2 mb-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                onChange={setRecaptchaToken}
              />
            </div>
            {error && (
              <div className="rounded bg-red-50 text-red-700 text-sm px-3 py-2 text-center">{error}</div>
            )}
            <button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded transition" disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
          </form>
        </div>
      </div>
      {/* Modal Pop-up tetap di luar */}
      {modalMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 280, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            <div style={{ fontSize: 18, color: '#001F5A', marginBottom: 16 }}>{modalMessage}</div>
            <button onClick={closeModal} style={{ background: '#001F5A', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 32px', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
