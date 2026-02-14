import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { User } from '../types';
import { ShieldCheck, Mail, ArrowRight, Loader2 } from 'lucide-react';

interface AdminLoginPageProps {
  setUser: (user: User) => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const user = await login(email, password);
      // Strict check for admin email
      if (user.email === 'milkesayohanes@gmail.com') {
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        setUser(user);
        navigate('/admin');
      } else {
        alert('Access Denied: You are not authorized to access the admin portal.');
        // Optionally logout user here if they are not admin
      }
    } catch (error) {
      console.error('Login failed', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-950 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center border-4 border-slate-700">
          <ShieldCheck className="w-8 h-8 text-slate-900" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-serif font-bold text-white leading-tight">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Restricted access for management only.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100 dark:border-slate-800 transition-colors duration-300">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Admin Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-slate-500 focus:border-slate-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-slate-700 rounded-md py-2.5 border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-gray-400"
                  placeholder="admin@grandhorizon.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-slate-500 focus:border-slate-500 block w-full sm:text-sm border-gray-300 dark:border-slate-700 rounded-md py-2.5 border px-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-gray-400"
                  placeholder="********"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-slate-900 bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign in to Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
             <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md text-xs text-slate-500 dark:text-slate-400 text-center">
               Admin Access Only. <br/>
               Use verified admin credentials.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
