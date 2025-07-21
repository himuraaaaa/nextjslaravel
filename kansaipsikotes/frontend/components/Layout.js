import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import Breadcrumb from './Breadcrumb';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {user && <Navbar />}
      {user && <Breadcrumb />}
      <main
        className="flex-grow min-h-screen"
        style={{
          backgroundImage: "url('/bg-page.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {children}
      </main>
      <footer className="w-full pt-4 pb-2 text-sm" style={{background:'#001F5A', color:'#fff', fontWeight:'bold', letterSpacing:'0.5px'}}>
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start px-4">
          <img src="/logo-login.png" alt="Kansai Paint Logo" className="h-10 w-auto" />
          <div className="w-px h-10 bg-white/40 mx-4"></div>
          <div className="flex flex-col text-left text-xs font-normal tracking-normal" style={{opacity:0.85}}>
            <span>PT. Kansai Prakarsa Coatings</span>
            <span>Jl. Gatot Subroto KM 7, Pasir Jaya, Jatiuwung, RT.007/RW.002, Pasir Jaya, Kec. Jatiuwung, Kota Tangerang, Banten 15135</span>
            <span>Telp: (021) 5901314</span>
          </div>
        </div>
        <div className="mt-4 border-t border-white/30 w-full"></div>
        <div className="w-full text-center mt-2 text-[11px] font-normal opacity-80">
          © 2025 Fayyadh Abdillah. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
