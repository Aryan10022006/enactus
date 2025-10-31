// Header.jsx
// Reusable header component for the application

import React from 'react';
import { FaUsers, FaTv } from 'react-icons/fa';

export default function Header() {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-700 gap-4 animate-fadeIn">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Logo with premium styling */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300 card-hover">
          <img 
            src="/images/logo.png" 
            alt="Enactus Logo" 
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            onError={(e) => {
              // Fallback if logo not found
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<span class="text-2xl sm:text-3xl font-bold text-black text-shadow">E</span>';
            }}
          />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text text-shadow">Enactus Orientation</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Live Bidding Platform • 2025</p>
        </div>
      </div>
      <nav className="flex items-center gap-2 sm:gap-4">
        <a 
          className="px-3 py-2 sm:px-4 text-xs sm:text-sm text-gray-300 hover:text-yellow-400 hover:bg-gray-800 rounded-lg smooth-transition flex items-center gap-2 min-h-[44px] card-hover" 
          href="#/"
        >
          <FaUsers />
          <span className="hidden sm:inline">Attendee</span>
        </a>
        <a 
          className="px-3 py-2 sm:px-4 text-xs sm:text-sm text-gray-300 hover:text-yellow-400 hover:bg-gray-800 rounded-lg smooth-transition flex items-center gap-2 min-h-[44px] card-hover" 
          href="#/projector"
        >
          <FaTv />
          <span className="hidden sm:inline">Projector</span>
        </a>
      </nav>
    </header>
  );
}
