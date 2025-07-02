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

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!recaptchaToken) {
      setError("Silakan selesaikan reCAPTCHA.");
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
      setError(err.message || 'Failed to login. Please check your credentials.');
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #001F5A 0%, #274690 100%)' }}>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
        <img src="/logo-login.png" alt="Logo" className="max-w-[120px] mb-4 mx-auto" />
        <h2 className="text-2xl font-semibold tracking-widest text-center text-[#001F5A] mb-6 border-b border-blue-100 pb-2">LOGIN</h2>
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
              className="w-full border-b border-[#001F5A] focus:border-[#001F5A] outline-none bg-transparent py-2 px-0 text-gray-900 placeholder-gray-400 transition"
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
              className="w-full border-b border-[#001F5A] focus:border-[#001F5A] outline-none bg-blue-50 py-2 px-3 text-gray-900 placeholder-gray-400 transition h-11"
              placeholder=""
              style={{ minHeight: '44px' }}
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
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
        </form>
      </div>
      <div className="absolute bottom-4 left-0 right-0 text-center text-[#001F5A] text-xs opacity-80">
        KY©copyright 2019
      </div>
    </div>
  );
};

export default Login;
