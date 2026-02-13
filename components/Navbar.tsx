import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types';
import { logout } from '../services/authService';
import { LogOut, LayoutDashboard, Home, ShieldCheck, BedDouble, Sun, Moon } from 'lucide-react';
import { ADMIN_EMAIL } from '../constants';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
            <div className="flex-shrink-0 flex items-center gap-3 transition-transform duration-300 group-hover:scale-105">
              <div className="bg-slate-900 p-2 rounded-full transition-shadow group-hover:shadow-lg group-hover:shadow-amber-400/20">
                <BedDouble className="h-6 w-6 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl text-gray-900 dark:text-white tracking-wide border-b-2 border-transparent group-hover:border-amber-400 transition-all duration-300">GRAND HORIZON</span>
                <span className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">Hotel & Spa</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-6">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${isActive('/') ? 'text-slate-900 bg-slate-100 dark:text-white dark:bg-slate-800' : 'text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden md:inline">Guest Home</span>
                </Link>
                {user.email === ADMIN_EMAIL && (
                  <Link 
                    to="/admin" 
                    className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${isActive('/admin') ? 'text-slate-900 bg-slate-100 dark:text-white dark:bg-slate-800' : 'text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden md:inline">Management</span>
                  </Link>
                )}
                <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>
                
                <Link to="/admin/login" className="px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden md:inline">Admin Login</span>
                </Link>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-slate-400 hidden xl:block">
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;