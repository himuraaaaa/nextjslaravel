import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { LogOut, User, Home, Settings, BarChart3, FileText, Users, Plus, Menu, X, RefreshCw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef();

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
                <Link href="/admin/question_list" className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === '/admin/question_list' ? 'bg-blue-100 text-blue-700' : 'text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10'}`}><Plus className="h-4 w-4" /><span>Questions</span></Link>
                <Link href="/admin/test-results" className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === '/admin/test-results' ? 'bg-blue-100 text-blue-700' : 'text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10'}`}><BarChart3 className="h-4 w-4" /><span>Results</span></Link>
                <Link href="/admin/user_list" className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === '/admin/user_list' ? 'bg-blue-100 text-blue-700' : 'text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10'}`}><Users className="h-4 w-4" /><span>Users</span></Link>
                <Link href="/admin/user-attempts" className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === '/admin/user-attempts' ? 'bg-blue-100 text-blue-700' : 'text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10'}`}><RefreshCw className="h-4 w-4" /><span>Attempts</span></Link>
                <Link href="/admin/review" className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === '/admin/review' ? 'bg-green-100 text-green-700' : 'text-white hover:text-green-200 hover:bg-white hover:bg-opacity-10'}`}><BarChart3 className="h-4 w-4" /><span>Live Monitor</span></Link>
              </>
            )}
          </div>

          {/* User Menu - only show on desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-white" />
              <span className="text-sm text-white hidden sm:block">{user.name}</span>
              {isAdmin && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                  Admin
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-sm text-white hover:text-blue-200 transition-colors"
            >
              <LogOut className="h-4 w-4 text-white" />
              <span className="hidden sm:block">Logout</span>
            </button>
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