import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { TestProvider } from '@/contexts/TestContext';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import Head from 'next/head';
import UserChatBox from '@/components/UserChatBox';
import { useAuth } from '@/contexts/AuthContext';

function getTitleFromPath(pathname) {
  if (pathname === '/') return 'Beranda';
  const map = {
    '/dashboard': 'Dashboard',
    '/login': 'Login',
    '/register': 'Register',
    '/admin/test_list': 'Daftar Test',
    '/admin/user_list': 'Daftar User',
    '/admin/review': 'Review Test',
    // Tambahkan mapping lain jika perlu
  };
  if (map[pathname]) return map[pathname];
  // Dynamic route: /tests/[id] => Tes
  if (/^\/tests\//.test(pathname)) return 'Tes';
  // Default: ambil segmen terakhir, kapitalisasi
  const last = pathname.split('/').filter(Boolean).pop() || 'Halaman';
  return last.charAt(0).toUpperCase() + last.slice(1);
}

function ChatBoxWrapper() {
  const { user } = useAuth();
  return user && user.role !== 'admin' ? <UserChatBox userId={user.id} /> : null;
}

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';
  const pageTitle = `${getTitleFromPath(router.pathname)} | Kansai Paint Assessment`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <link rel="icon" type="image/png" href="/logo-login.png" />
      </Head>
      <AuthProvider>
        <TestProvider>
          <Layout>
            {/*
            <div
              className={!isLoginPage ? 'min-h-screen' : ''}
              style={
                !isLoginPage
                  ? {
                      minHeight: '100vh',
                      backgroundImage: "url('/bg-page.jpg')",
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : {}
              }
            >
              <Component {...pageProps} />
            </div>
            */}
            <div className={!isLoginPage ? 'min-h-screen' : ''}>
              <Component {...pageProps} />
              {/* Tampilkan chat box di semua halaman user (bukan admin) */}
              <ChatBoxWrapper />
            </div>
          </Layout>
        </TestProvider>
      </AuthProvider>
    </>
  );
}
