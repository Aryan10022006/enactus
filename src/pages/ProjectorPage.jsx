// ProjectorPage.jsx
// Projector view for displaying live pitches and leaderboard on the main screen

import React, { useMemo, useState, useEffect } from 'react';
import { useEventState } from '../hooks/useEventState';
import { useProjects } from '../hooks/useProjects';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaTrophy, FaMicrophone, FaClock, FaChartBar, FaUsers, FaFire } from 'react-icons/fa';

export default function ProjectorPage() {
  const { eventState, loading: stateLoading } = useEventState();
  const { projects, loading: projectsLoading } = useProjects();
  const [animatedTotals, setAnimatedTotals] = useState({});
  const [flashingProjects, setFlashingProjects] = useState({});
  const [previousBidCounts, setPreviousBidCounts] = useState({});

  // Get current project
  const currentProject = useMemo(() => {
    if (!eventState?.current_pitch_id) return null;
    return projects.find((p) => p.id === eventState.current_pitch_id);
  }, [eventState, projects]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalParticipants = new Set();
    let totalAmount = 0;
    let totalBids = 0;

    projects.forEach(project => {
      project.bids?.forEach(bid => {
        totalParticipants.add(bid.userId);
        totalAmount += bid.amount;
        totalBids++;
      });
    });

    const avgBidAmount = totalBids > 0 ? totalAmount / totalBids : 0;

    return {
      totalParticipants: totalParticipants.size,
      totalAmount,
      totalBids,
      avgBidAmount,
    };
  }, [projects]);

  // Sort projects by total bids (descending)
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aTotalBid = a.bids?.reduce((sum, bid) => sum + bid.amount, 0) || 0;
      const bTotalBid = b.bids?.reduce((sum, bid) => sum + bid.amount, 0) || 0;
      return bTotalBid - aTotalBid;
    });
  }, [projects]);

  // Animate numbers when they change
  useEffect(() => {
    const intervals = [];
    
    projects.forEach(project => {
      const totalBid = project.bids?.reduce((sum, bid) => sum + bid.amount, 0) || 0;
      const bidCount = project.bids?.length || 0;
      const previousCount = previousBidCounts[project.id] || 0;
      
      // Flash effect when new bid arrives
      if (bidCount > previousCount && previousCount > 0) {
        setFlashingProjects(prev => ({ ...prev, [project.id]: true }));
        setTimeout(() => {
          setFlashingProjects(prev => ({ ...prev, [project.id]: false }));
        }, 1000);
      }
      
      setAnimatedTotals(prev => {
        const currentAnimated = prev[project.id] || 0;
        
        if (totalBid !== currentAnimated && totalBid !== 0) {
          // Smooth animation from current to new value
          const duration = 1000; // 1 second
          const steps = 30;
          const increment = (totalBid - currentAnimated) / steps;
          let step = 0;

          const interval = setInterval(() => {
            step++;
            if (step >= steps) {
              setAnimatedTotals(p => ({ ...p, [project.id]: totalBid }));
              clearInterval(interval);
            } else {
              setAnimatedTotals(p => ({ ...p, [project.id]: currentAnimated + (increment * step) }));
            }
          }, duration / steps);

          intervals.push(interval);
        }
        
        return prev;
      });
    });

    // Update bid counts
    const newCounts = {};
    projects.forEach(project => {
      newCounts[project.id] = project.bids?.length || 0;
    });
    setPreviousBidCounts(newCounts);

    return () => intervals.forEach(interval => clearInterval(interval));
  }, [projects, previousBidCounts]);

  if (stateLoading || projectsLoading) {
    return <LoadingSpinner message="Loading projector view..." />;
  }

  const currentProjectTotal = currentProject?.bids?.reduce((sum, bid) => sum + bid.amount, 0) || 0;

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 px-4 sm:px-0">
      {/* Enactus Branding Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-xl flex items-center justify-center shadow-lg">
            <img 
              src="/images/logo.png" 
              alt="Enactus Logo" 
              className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-xl sm:text-2xl font-bold text-yellow-400">E</span>';
              }}
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">Enactus Orientation 2025</h1>
            <p className="text-sm sm:text-base text-black text-opacity-70">Live Bidding Competition</p>
          </div>
        </div>
        <div className="text-center sm:text-right">
          <div className="flex items-center gap-2 justify-center sm:justify-end text-black text-opacity-70 text-sm">
            <FaChartBar />
            Projects
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-black">{sortedProjects.length}</div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Participants */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 sm:p-6 shadow-xl transform hover:scale-105 transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <FaUsers className="text-2xl sm:text-3xl text-white" />
            <div className="text-xs sm:text-sm text-blue-200 uppercase tracking-wide">Participants</div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white">{stats.totalParticipants}</div>
        </div>

        {/* Total Bids */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 sm:p-6 shadow-xl transform hover:scale-105 transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <FaFire className="text-2xl sm:text-3xl text-white" />
            <div className="text-xs sm:text-sm text-purple-200 uppercase tracking-wide">Total Bids</div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white">{stats.totalBids}</div>
        </div>

        {/* Total Amount */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 sm:p-6 shadow-xl transform hover:scale-105 transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <FaTrophy className="text-2xl sm:text-3xl text-white" />
            <div className="text-xs sm:text-sm text-green-200 uppercase tracking-wide">Total Amount</div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">₹{stats.totalAmount.toLocaleString()}</div>
        </div>

        {/* Average Bid */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4 sm:p-6 shadow-xl transform hover:scale-105 transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <FaChartBar className="text-2xl sm:text-3xl text-white" />
            <div className="text-xs sm:text-sm text-orange-200 uppercase tracking-wide">Avg Bid</div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">₹{Math.round(stats.avgBidAmount).toLocaleString()}</div>
        </div>
      </div>

      {/* Current Pitch Highlight */}
      <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-black rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
        {/* Animated Background Effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white to-transparent animate-pulse"></div>
        </div>
        
        <div className="relative z-10">
          {currentProject ? (
            <>
              <div className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 uppercase tracking-wider flex items-center justify-center gap-2 sm:gap-3 animate-pulse">
                <FaMicrophone className="text-xl sm:text-2xl md:text-3xl animate-bounce" />
                <span>NOW PITCHING</span>
                <FaMicrophone className="text-xl sm:text-2xl md:text-3xl animate-bounce" />
              </div>
              <div className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-4 sm:mb-6 md:mb-8 drop-shadow-lg break-words">
                {currentProject.name}
              </div>
              {currentProject.description && (
                <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 text-black/80">
                  {currentProject.description}
                </p>
              )}
              <div className="border-t-2 sm:border-t-4 border-black pt-4 sm:pt-6 mt-4 sm:mt-6">
                <div className="text-base sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 uppercase tracking-wide">TOTAL BIDS</div>
                
                {/* Animated Bid Amount */}
                <div className="text-5xl sm:text-7xl md:text-9xl font-extrabold drop-shadow-2xl mb-4">
                  ₹{(animatedTotals[currentProject.id] || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                
                {/* Progress Bar */}
                <div className="max-w-2xl mx-auto mb-4">
                  <div className="h-4 sm:h-6 bg-black/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-black transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${stats.totalAmount > 0 ? (currentProjectTotal / stats.totalAmount * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs sm:text-sm mt-2 text-black/70">
                    {stats.totalAmount > 0 ? `${(currentProjectTotal / stats.totalAmount * 100).toFixed(1)}% of total bids` : '0% of total bids'}
                  </div>
                </div>
                
                <div className="mt-4 text-sm sm:text-base md:text-lg text-black/70 flex items-center justify-center gap-2">
                  <FaFire className="text-red-600 animate-pulse" />
                  {currentProject.bids?.length || 0} {currentProject.bids?.length === 1 ? 'bid' : 'bids'} placed
                </div>
              </div>
            </>
          ) : (
            <>
              <FaClock className="text-4xl sm:text-5xl md:text-6xl mx-auto mb-4 sm:mb-6 animate-bounce" />
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold">Waiting for the next pitch...</div>
            </>
          )}
        </div>
      </div>

      {/* Live Leaderboard */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-700">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <FaTrophy className="text-2xl sm:text-3xl md:text-4xl text-yellow-400 animate-pulse" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 text-center">LIVE LEADERBOARD</h2>
            <FaTrophy className="text-2xl sm:text-3xl md:text-4xl text-yellow-400 animate-pulse" />
          </div>
          <span className="flex items-center gap-2 text-sm sm:text-base bg-red-500 text-white px-3 py-1.5 rounded-full animate-pulse font-bold">
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-ping"></span>
            LIVE UPDATES
          </span>
        </div>
        
        {sortedProjects.length === 0 ? (
          <p className="text-center text-gray-400 text-base sm:text-lg">No projects yet.</p>
        ) : (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {sortedProjects.map((project, index) => {
              const isCurrentPitch = eventState?.current_pitch_id === project.id;
              const rank = index + 1;
              const totalBid = project.bids?.reduce((sum, bid) => sum + bid.amount, 0) || 0;
              const animatedTotal = animatedTotals[project.id] || 0;
              const maxBid = sortedProjects[0]?.bids?.reduce((sum, bid) => sum + bid.amount, 0) || 1;
              const percentage = (totalBid / maxBid) * 100;
              const isFlashing = flashingProjects[project.id];
              
              return (
                <div
                  key={project.id}
                  className={`relative overflow-hidden rounded-lg transition-all duration-500 ${
                    isCurrentPitch
                      ? 'bg-yellow-400 text-black scale-105 shadow-2xl animate-pulse'
                      : isFlashing
                      ? 'bg-green-500 scale-105 shadow-2xl'
                      : 'bg-gray-900'
                  }`}
                >
                  {/* Flash effect overlay for new bids */}
                  {isFlashing && (
                    <div className="absolute inset-0 bg-green-400 animate-ping opacity-75"></div>
                  )}
                  
                  {/* Progress Bar Background */}
                  {!isCurrentPitch && !isFlashing && (
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  )}
                  
                  <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 md:p-6 gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
                      {/* Rank Badge with Animation */}
                      <div
                        className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full font-bold text-base sm:text-lg md:text-2xl flex-shrink-0 transform transition-transform ${
                          rank === 1
                            ? 'bg-yellow-500 text-black scale-110 animate-bounce'
                            : rank === 2
                            ? 'bg-gray-400 text-black scale-105'
                            : rank === 3
                            ? 'bg-orange-600 text-white scale-105'
                            : isCurrentPitch
                            ? 'bg-black text-yellow-400'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {rank === 1 && <FaTrophy />}
                        {rank !== 1 && `#${rank}`}
                      </div>

                      {/* Project Info */}
                      <div className="flex-1">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold break-words">{project.name}</div>
                        {project.description && (
                          <div className={`text-xs sm:text-sm mt-1 ${isCurrentPitch ? 'text-black/70' : 'text-gray-400'}`}>
                            {project.description}
                          </div>
                        )}
                        {isCurrentPitch && (
                          <div className="text-xs sm:text-sm font-medium mt-1 uppercase tracking-wide flex items-center gap-1 animate-pulse">
                            <FaMicrophone className="text-xs animate-bounce" />
                            Currently Pitching
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total Bid with Animation */}
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <div
                        className={`text-xs sm:text-sm font-medium mb-1 flex items-center gap-1 ${
                          isCurrentPitch ? 'text-black' : 'text-gray-400'
                        }`}
                      >
                        <FaTrophy className="text-xs" />
                        Total Bids
                      </div>
                      <div
                        className={`text-2xl sm:text-3xl md:text-4xl font-extrabold transition-all duration-300 ${
                          isCurrentPitch ? 'text-black' : 'text-yellow-400'
                        }`}
                      >
                        ₹{Math.round(animatedTotal).toLocaleString()}
                      </div>
                      <div className={`text-xs mt-1 flex items-center gap-1 ${isCurrentPitch ? 'text-black/70' : 'text-gray-500'}`}>
                        <FaFire className={`text-xs ${rank <= 3 ? 'text-red-500 animate-pulse' : ''}`} />
                        {project.bids?.length || 0} {project.bids?.length === 1 ? 'bid' : 'bids'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center text-gray-500 text-xs sm:text-sm">
        <p>Real-time updates • Enactus Orientation 2025</p>
      </div>
    </div>
  );
}
