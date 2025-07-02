import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import Breadcrumb from './Breadcrumb';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      {user && <Breadcrumb />}
      <main>{children}</main>
      <footer className="w-full py-4 text-center text-gray-500 text-sm mt-8">
        © 2025 Fayyadh Abdillah. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
