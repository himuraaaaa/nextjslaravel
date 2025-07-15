import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { LogOut, User, Home, Settings, BarChart3, FileText, Users, Plus, Menu, X, RefreshCw } from 'lucide-react';
import { useState, useRef, useEffect, Fragment } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef();

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isAdminPage = router.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileMenuOpen]);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    if (!profileDropdownOpen) return;
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileDropdownOpen]);

  // Helper untuk inisial nama
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  };

  return (
    <nav className="shadow-md border-b relative z-20" style={{ background: '#001F5A' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href={isAdmin ? '/admin' : '/dashboard'} className="text-xl font-bold text-white">
              Psycho Test App
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {isAdmin && (
              <>
                <Link href="/admin/test_list" className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === '/admin/test_list' ? 'bg-blue-100 text-blue-700' : 'text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10'}`}><FileText className="h-4 w-4" /><span>Tests</span></Link>
                <Link href="/admin/test-results" className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === '/admin/test-results' ? 'bg-blue-100 text-blue-700' : 'text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10'}`}><BarChart3 className="h-4 w-4" /><span>Results</span></Link>
                <Link href="/admin/user_list" className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === '/admin/user_list' ? 'bg-blue-100 text-blue-700' : 'text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10'}`}><Users className="h-4 w-4" /><span>Users</span></Link>
                <Link href="/admin/user-attempts" className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === '/admin/user-attempts' ? 'bg-blue-100 text-blue-700' : 'text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10'}`}><RefreshCw className="h-4 w-4" /><span>Attempts</span></Link>
                <Link href="/admin/review" className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === '/admin/review' ? 'bg-green-100 text-green-700' : 'text-white hover:text-green-200 hover:bg-white hover:bg-opacity-10'}`}><BarChart3 className="h-4 w-4" /><span>Live Monitor</span></Link>
              </>
            )}
          </div>

          {/* User Menu - only show on desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Profile Badge & Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(v => !v)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#001F5A] font-bold text-lg shadow hover:shadow-lg focus:outline-none border-2 border-blue-200"
                title={user.name}
              >
                {getInitials(user.name)}
              </button>
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg border border-gray-100 bg-white py-4 z-50 animate-fade-in">
                  <div className="flex flex-col items-center mb-3">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold mb-2 shadow">
                      {getInitials(user.name)}
                    </div>
                    <div className="font-semibold text-gray-900 text-lg">{user.name}</div>
                    {isAdmin && (
                      <span className="mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Admin</span>
                    )}
                  </div>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-blue-900 font-semibold hover:bg-blue-50 transition"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
            {/* Hamburger Button for mobile only */}
            <button
              className="md:hidden ml-2 p-2 rounded hover:bg-blue-900 focus:outline-none"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
            </button>
          </div>
          {/* Hamburger Button for mobile only */}
          <button
            className="md:hidden ml-2 p-2 rounded hover:bg-blue-900 focus:outline-none"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div ref={menuRef} className="md:hidden absolute top-16 left-0 w-full bg-[#001F5A] shadow-lg border-b z-30 animate-fade-in">
        <div className="px-2 pt-2 pb-3 space-y-1">
            {isAdmin && (
            <>
                <Link href="/admin/test_list" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/admin/test_list' ? 'bg-blue-100 text-blue-700' : 'text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10'}`} onClick={() => setMobileMenuOpen(false)}>Tests</Link>
                <Link href="/admin/question_list" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/admin/question_list' ? 'bg-blue-100 text-blue-700' : 'text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10'}`} onClick={() => setMobileMenuOpen(false)}>Questions</Link>
                <Link href="/admin/test-results" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/admin/test-results' ? 'bg-blue-100 text-blue-700' : 'text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10'}`} onClick={() => setMobileMenuOpen(false)}>Results</Link>
                <Link href="/admin/user_list" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/admin/user_list' ? 'bg-blue-100 text-blue-700' : 'text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10'}`} onClick={() => setMobileMenuOpen(false)}>Users</Link>
                <Link href="/admin/user-attempts" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/admin/user-attempts' ? 'bg-blue-100 text-blue-700' : 'text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10'}`} onClick={() => setMobileMenuOpen(false)}>Attempts</Link>
                <Link href="/admin/review" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/admin/review' ? 'bg-green-100 text-green-700' : 'text-white hover:text-green-200 hover:bg-white hover:bg-opacity-10'}`} onClick={() => setMobileMenuOpen(false)}>Live Monitor</Link>
              </>
            )}
            <div className="border-t mt-2 pt-2 flex items-center space-x-2 px-3">
              <User className="h-5 w-5 text-white" />
              <span className="text-sm text-white">{user.name}</span>
              {isAdmin && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                  Admin
                </span>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="flex items-center space-x-1 text-sm text-white hover:text-blue-200 transition-colors ml-auto"
              >
                <LogOut className="h-4 w-4 text-white" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 