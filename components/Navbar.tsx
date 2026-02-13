import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types';
import { logout } from '../services/authService';
import { LogOut, LayoutDashboard, Home, ShieldCheck, BedDouble, Sun, Moon, Menu, X } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/login');
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center cursor-pointer group" onClick={() => { navigate('/'); setIsMenuOpen(false); }}>
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
          
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                <div className="hidden lg:flex items-center space-x-4">
                  <Link 
                    to="/" 
                    className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${isActive('/') ? 'text-slate-900 bg-slate-100 dark:text-white dark:bg-slate-800' : 'text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <Home className="w-4 h-4" />
                    <span>Guest Home</span>
                  </Link>
                  {user.email === ADMIN_EMAIL && (
                    <Link 
                      to="/admin" 
                      className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${isActive('/admin') ? 'text-slate-900 bg-slate-100 dark:text-white dark:bg-slate-800' : 'text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Management</span>
                    </Link>
                  )}
                  <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-2"></div>
                  
                  <Link to="/admin/login" className="px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Login</span>
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
                      <span>Logout</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="lg:hidden p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 shadow-sm"
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && user && (
        <div className="lg:hidden animate-in slide-in-from-top-4 duration-300 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className={`w-full px-4 py-3 rounded-xl text-base font-medium flex items-center gap-3 transition-all ${isActive('/') ? 'text-slate-900 bg-slate-100 dark:text-white dark:bg-slate-800' : 'text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <Home className="w-5 h-5" />
              Guest Home
            </Link>
            {user.email === ADMIN_EMAIL && (
              <Link 
                to="/admin" 
                onClick={() => setIsMenuOpen(false)}
                className={`w-full px-4 py-3 rounded-xl text-base font-medium flex items-center gap-3 transition-all ${isActive('/admin') ? 'text-slate-900 bg-slate-100 dark:text-white dark:bg-slate-800' : 'text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Management
              </Link>
            )}
            <Link 
              to="/admin/login" 
              onClick={() => setIsMenuOpen(false)}
              className="w-full px-4 py-3 rounded-xl text-base font-medium flex items-center gap-3 text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <ShieldCheck className="w-5 h-5" />
              Admin Login
            </Link>
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
              <div className="px-4 py-2 mb-2">
                <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-widest font-bold">Logged in as</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium text-red-600 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;