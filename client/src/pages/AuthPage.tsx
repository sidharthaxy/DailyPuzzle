import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useModalStore } from '../store/modalStore';
import { useNetwork } from '../hooks/useNetwork';

const AuthPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isOnline = useNetwork();
  
  const navigate = useNavigate();
  const { login, register, loginAsGuest } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) return;
    
    setIsLoading(true);
    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        await register(email, password);
        useModalStore.getState().openModal({
          type: 'success',
          title: 'Account created successfully',
          message: 'Welcome to your daily logic journey.'
        });
      }
      navigate('/');
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.message.includes('Network') || err.message === 'Load failed') {
        useModalStore.getState().openModal({
          type: 'error',
          title: 'Connection Error',
          message: 'Could not reach the server. You might be offline or the server is currently down. Please connect to the internet or "Continue as Guest".'
        });
        setError('Server unreachable.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-brand-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-50 rounded-2xl shadow-xl overflow-hidden border border-brand-blue-200">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-brand-900 mb-2">
              {isLoginView ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-brand-800">
              {isLoginView ? 'Enter your details to access your daily puzzles.' : 'Sign up to keep your streak alive.'}
            </p>
          </div>

          {error && isOnline && (
            <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {!isOnline ? (
            <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-xl mb-6 shadow-sm">
              <div className="w-16 h-16 mx-auto bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-yellow-800 mb-2">You are Offline</h3>
              <p className="text-sm text-yellow-700 mb-6">
                Please connect to the internet to log into your account, or continue as a guest to play offline puzzles.
              </p>
              <button 
                onClick={handleGuestLogin}
                className="w-full bg-brand-blue-500 hover:bg-brand-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md"
              >
                Continue as Guest
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-brand-900 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-brand-blue-200 focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500 outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-brand-900 mb-2">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-brand-blue-200 focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md ${
                    isLoading ? 'bg-brand-blue-400 cursor-not-allowed' : 'bg-brand-blue-500 hover:bg-brand-blue-600 shadow-brand-blue-200'
                  }`}
                >
                  {isLoading ? 'Please wait...' : (isLoginView ? 'Sign In' : 'Sign Up')}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between">
                <span className="border-b border-brand-blue-200 w-1/5"></span>
                <button type="button" onClick={handleGuestLogin} className="text-xs text-brand-800 uppercase hover:text-brand-accent transition-colors font-semibold">Or continue as Guest</button>
                <span className="border-b border-brand-blue-200 w-1/5"></span>
              </div>

              <div className="mt-8 text-center">
                <p className="text-brand-800">
                  {isLoginView ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    type="button"
                    onClick={() => setIsLoginView(!isLoginView)}
                    className="text-brand-blue-500 hover:text-brand-blue-600 font-bold transition-colors"
                  >
                    {isLoginView ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
