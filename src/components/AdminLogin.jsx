// AdminLogin.jsx
// Password-protected login page for admin access

import React, { useState } from 'react';
import { FaLock, FaUnlock, FaShieldAlt } from 'react-icons/fa';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check password (change 'admin123' to your desired password)
    if (password === 'enactus2025') {
      setError('');
      onLogin(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      setError('Incorrect password. Access denied.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4">
      <div className={`max-w-md w-full ${isShaking ? 'animate-shake' : ''}`}>
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-white rounded-2xl mb-4 shadow-2xl p-5">
            <img 
              src="/images/logotab.png" 
              alt="Enactus Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback if logo not found
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-5xl font-bold text-yellow-400">E</span>';
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">Admin Access</h1>
          <p className="text-gray-400">Enter password to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!password}
              className="w-full px-4 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              <FaUnlock />
              Unlock Admin Panel
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
              <FaShieldAlt />
              This page is password-protected
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <a
            href="#/"
            className="text-sm text-gray-400 hover:text-yellow-400 transition-colors"
          >
            ← Back to Attendee View
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}
