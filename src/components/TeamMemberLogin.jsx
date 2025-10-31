import React, { useState } from 'react';
import { FaUsers, FaKey, FaArrowRight } from 'react-icons/fa';

const TEAM_SECRET_CODE = 'enactus2025team';

function TeamMemberLogin({ onLogin }) {
  const [secretCode, setSecretCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (secretCode === TEAM_SECRET_CODE) {
      onLogin(true);
      localStorage.setItem('teamAuth', 'true');
    } else {
      setError('Invalid secret code');
      setTimeout(() => setError(''), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/images/logo.png" 
            alt="Enactus Logo" 
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full shadow-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
          <div 
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg hidden items-center justify-center"
          >
            <span className="text-4xl font-bold text-gray-900">E</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Team Member Access
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Enter the secret code to join as a team member
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-700">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-yellow-400 p-3 sm:p-4 rounded-full">
              <FaUsers className="text-2xl sm:text-3xl text-gray-900" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FaKey className="inline mr-2" />
                Secret Code
              </label>
              <input
                type="password"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className={`w-full px-4 py-3 sm:py-4 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-base sm:text-lg ${
                  error ? 'border-red-500 animate-shake' : 'border-gray-600'
                }`}
                placeholder="Enter secret code"
                required
              />
              {error && (
                <p className="mt-2 text-red-400 text-sm">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-3 sm:py-4 px-6 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center text-base sm:text-lg min-h-[44px]"
            >
              Join as Team Member
              <FaArrowRight className="ml-2" />
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">
            Don't have the code? Contact the event admin
          </p>
        </div>
      </div>
    </div>
  );
}

export default TeamMemberLogin;
