import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { TestProvider } from '@/contexts/TestContext';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = typeof window !== 'undefined' ? require('next/router').useRouter() : { pathname: '' };
  const isLoginPage = router.pathname === '/login';

  return (
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
          </div>
        </Layout>
      </TestProvider>
    </AuthProvider>
  );
}
