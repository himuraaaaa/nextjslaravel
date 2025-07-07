import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import Breadcrumb from './Breadcrumb';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {user && <Navbar />}
      {user && <Breadcrumb />}
      <main className="flex-grow">{children}</main>
      <footer className="w-full py-4 text-center text-sm" style={{background:'#001F5A', color:'#fff', fontWeight:'bold', letterSpacing:'0.5px'}}>
        © 2025 Fayyadh Abdillah. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
