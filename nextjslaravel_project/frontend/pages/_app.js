import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { TestProvider } from '@/contexts/TestContext';
import Layout from '@/components/Layout';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <TestProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </TestProvider>
    </AuthProvider>
  );
}
