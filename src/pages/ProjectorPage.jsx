// ProjectorPage.jsx
// Projector view for displaying live pitches and leaderboard on the main screen

import React, { useMemo, useState, useEffect } from 'react';
import { useEventState } from '../hooks/useEventState';
import { useProjects } from '../hooks/useProjects';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaTrophy, FaMicrophone, FaClock, FaChartBar, FaUsers, FaFire, FaRupeeSign, FaChartLine } from 'react-icons/fa';

export default function ProjectorPage() {
  const { eventState, loading: stateLoading } = useEventState();
  const { projects, loading: projectsLoading } = useProjects();
  const [animatedTotals, setAnimatedTotals] = useState({});
  const [flashingProjects, setFlashingProjects] = useState({});
  const [previousBidCounts, setPreviousBidCounts] = useState({});
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [recentBids, setRecentBids] = useState([]);

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

  // Timer countdown effect
  useEffect(() => {
    if (eventState?.timer_active && eventState?.timer_end_time) {
      const updateTimer = () => {
        const remaining = Math.max(0, Math.floor((eventState.timer_end_time - Date.now()) / 1000));
        setTimerSeconds(remaining);
        
        if (remaining === 0) {
          clearInterval(timerInterval);
        }
      };

      updateTimer();
      const timerInterval = setInterval(updateTimer, 100);
      return () => clearInterval(timerInterval);
    } else {
      setTimerSeconds(0);
    }
  }, [eventState?.timer_active, eventState?.timer_end_time]);

  // Track recent bids for live activity feed
  useEffect(() => {
    if (currentProject) {
      const bids = currentProject.bids || [];
      const sorted = [...bids].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setRecentBids(sorted.slice(0, 5)); // Keep last 5 bids
    } else {
      setRecentBids([]);
    }
  }, [currentProject]);

  if (stateLoading || projectsLoading) {
    return <LoadingSpinner message="Loading projector view..." />;
  }

  const currentProjectTotal = currentProject?.bids?.reduce((sum, bid) => sum + bid.amount, 0) || 0;

  // Debug: Log projects data to check if bids are loading
  useEffect(() => {
    console.log('ProjectorPage - Projects data:', projects);
    projects.forEach(project => {
      const totalBid = project.bids?.reduce((sum, bid) => sum + bid.amount, 0) || 0;
      console.log(`Project: ${project.name}, Bids: ${project.bids?.length || 0}, Total: ₹${totalBid}`);
    });
  }, [projects]);

  // Show Final Leaderboard if enabled
  if (eventState?.show_leaderboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-2 h-16 bg-yellow-400 rounded-full"></div>
            <FaTrophy className="text-6xl sm:text-8xl text-yellow-400" />
            <div className="w-2 h-16 bg-yellow-400 rounded-full"></div>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-4 text-yellow-400 tracking-tight">
            FINAL RESULTS
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 font-semibold">
            Pitch Competition Leaderboard
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-gray-400 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <FaChartLine />
              <span>{sortedProjects.length} Pitches</span>
            </div>
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <div className="flex items-center gap-2">
              <FaUsers />
              <span>{stats.totalParticipants} Participants</span>
            </div>
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <div className="flex items-center gap-2">
              <FaRupeeSign />
              <span>₹{stats.totalAmount.toLocaleString()} Total</span>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 sm:px-8 py-5">
              <div className="grid grid-cols-12 gap-4 text-black font-bold text-base sm:text-xl">
                <div className="col-span-1 text-center">RANK</div>
                <div className="col-span-6 sm:col-span-7">PITCH NAME</div>
                <div className="col-span-2 text-center">BIDS</div>
                <div className="col-span-3 sm:col-span-2 text-right">TOTAL AMOUNT</div>
              </div>
            </div>

            {/* Leaderboard Entries */}
            <div className="divide-y divide-gray-700">
              {sortedProjects.length === 0 ? (
                <div className="px-8 py-12 text-center text-gray-400 text-xl">
                  No pitches available
                </div>
              ) : (
                sortedProjects.map((project, index) => {
                  const totalBid = project.bids?.reduce((sum, bid) => sum + bid.amount, 0) || 0;
                  const bidCount = project.bids?.length || 0;
                  const isTop3 = index < 3;
                  
                  // Rank styling for top 3
                  const rankColors = {
                    0: 'text-yellow-400',  // Gold
                    1: 'text-gray-300',     // Silver
                    2: 'text-orange-400'    // Bronze
                  };
                  
                  const bgColors = {
                    0: 'bg-yellow-400/10 border-l-4 border-yellow-400',
                    1: 'bg-gray-300/10 border-l-4 border-gray-300',
                    2: 'bg-orange-400/10 border-l-4 border-orange-400'
                  };

                  return (
                    <div
                      key={project.id}
                      className={`px-6 sm:px-8 py-5 transition-all hover:bg-gray-700/50 ${
                        isTop3 ? bgColors[index] : 'border-l-4 border-transparent'
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center text-sm sm:text-lg">
                        {/* Rank */}
                        <div className="col-span-1 text-center">
                          <div className={`text-3xl sm:text-4xl font-extrabold ${isTop3 ? rankColors[index] : 'text-gray-500'}`}>
                            {index + 1}
                          </div>
                        </div>

                        {/* Project Name & Description */}
                        <div className="col-span-6 sm:col-span-7">
                          <div className={`font-bold text-lg sm:text-2xl mb-1 ${isTop3 ? 'text-yellow-400' : 'text-white'}`}>
                            {project.name}
                          </div>
                          {project.description && (
                            <div className="text-sm text-gray-400 line-clamp-2">
                              {project.description}
                            </div>
                          )}
                        </div>

                        {/* Bid Count */}
                        <div className="col-span-2 text-center">
                          <div className="font-bold text-2xl sm:text-3xl text-white">
                            {bidCount}
                          </div>
                          <div className="text-xs text-gray-500 uppercase">
                            {bidCount === 1 ? 'bid' : 'bids'}
                          </div>
                        </div>

                        {/* Total Amount */}
                        <div className="col-span-3 sm:col-span-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <FaRupeeSign className="text-yellow-400 text-lg" />
                            <span className="font-extrabold text-2xl sm:text-3xl text-yellow-400">
                              {totalBid.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Message */}
          <div className="mt-10 text-center">
            <p className="text-2xl sm:text-4xl font-bold text-white mb-2">
              Thank You for Participating!
            </p>
            <p className="text-lg sm:text-xl text-gray-400">
              Enactus Orientation 2025
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 px-4 sm:px-0">
      {/* Enactus Branding Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-yellow-400/30">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl p-3">
            <img 
              src="/images/logotab.png" 
              alt="Enactus Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-3xl sm:text-4xl font-bold text-yellow-400">E</span>';
              }}
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Enactus Orientation 2025</h1>
            <p className="text-sm sm:text-base text-gray-400">Live Bidding Competition</p>
          </div>
        </div>
        <div className="text-center sm:text-right">
          <div className="flex items-center gap-2 justify-center sm:justify-end text-gray-400 text-sm">
            <FaChartLine />
            Projects
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-yellow-400">{sortedProjects.length}</div>
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
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center shadow-2xl relative overflow-hidden border-2 border-yellow-400">
        {/* Animated Background Effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400 to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          {currentProject ? (
            <>
              <div className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 uppercase tracking-wider flex items-center justify-center gap-2 sm:gap-3">
                <FaMicrophone className="text-xl sm:text-2xl md:text-3xl text-yellow-400" />
                <span className="text-yellow-400">NOW PITCHING</span>
                <FaMicrophone className="text-xl sm:text-2xl md:text-3xl text-yellow-400" />
              </div>
              <div className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-4 sm:mb-6 md:mb-8 drop-shadow-lg break-words">
                {currentProject.name}
              </div>
              {currentProject.description && (
                <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 text-gray-300">
                  {currentProject.description}
                </p>
              )}
              <div className="border-t-2 sm:border-t-4 border-gray-700 pt-4 sm:pt-6 mt-4 sm:mt-6">
                <div className="text-base sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 uppercase tracking-wide text-gray-400 flex items-center justify-center gap-2">
                  <FaRupeeSign />
                  TOTAL BID AMOUNT
                </div>
                
                {/* Animated Bid Amount */}
                <div className="text-5xl sm:text-7xl md:text-9xl font-extrabold drop-shadow-2xl mb-4 text-yellow-400">
                  ₹{(animatedTotals[currentProject.id] || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                
                {/* Progress Bar */}
                <div className="max-w-2xl mx-auto mb-4">
                  <div className="h-4 sm:h-6 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${stats.totalAmount > 0 ? (currentProjectTotal / stats.totalAmount * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs sm:text-sm mt-2 text-gray-400">
                    {stats.totalAmount > 0 ? `${(currentProjectTotal / stats.totalAmount * 100).toFixed(1)}% of total bids` : '0% of total bids'}
                  </div>
                </div>
                
                <div className="mt-4 text-sm sm:text-base md:text-lg text-gray-300 flex items-center justify-center gap-2">
                  <FaChartBar className="text-yellow-400" />
                  {currentProject.bids?.length || 0} {currentProject.bids?.length === 1 ? 'bid' : 'bids'} placed
                </div>

                {/* Timer Display */}
                {timerSeconds > 0 && (
                  <div className="mt-6 sm:mt-8 bg-red-600 text-white rounded-2xl p-4 sm:p-6 shadow-2xl border-2 border-red-400">
                    <div className="text-base sm:text-xl md:text-2xl font-bold mb-2 uppercase tracking-wider flex items-center justify-center gap-2">
                      <FaClock />
                      LAST MINUTE BIDDING!
                    </div>
                    <div className={`text-6xl sm:text-8xl md:text-9xl font-extrabold ${timerSeconds <= 10 ? 'text-yellow-300' : ''}`}>
                      {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
                    </div>
                    <div className="text-sm sm:text-base md:text-lg mt-2 uppercase tracking-wide">
                      Place your bids now!
                    </div>
                  </div>
                )}
              </div>

              {/* Live Bidding Activity */}
              {recentBids.length > 0 && (
                <div className="mt-6 border-t-2 border-gray-700 pt-6">
                  <div className="text-base sm:text-lg md:text-xl font-bold mb-4 uppercase tracking-wide flex items-center justify-center gap-2 text-yellow-400">
                    <FaChartLine />
                    Recent Bids
                  </div>
                  <div className="space-y-2 max-w-2xl mx-auto">
                    {recentBids.map((bid, index) => (
                      <div 
                        key={`${bid.userId}-${bid.timestamp}`}
                        className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between animate-slideInUp border border-gray-600"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center gap-3">
                          <FaUsers className="text-xl text-yellow-400" />
                          <div>
                            <div className="font-bold text-sm sm:text-base">{bid.userName}</div>
                            {bid.isTeamMember && (
                              <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded font-semibold">Team</span>
                            )}
                          </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-yellow-400">₹{bid.amount.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <FaClock className="text-4xl sm:text-5xl md:text-6xl mx-auto mb-4 sm:mb-6 text-gray-400" />
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold">Waiting for the next pitch...</div>
            </>
          )}
        </div>
      </div>

      {/* Live Leaderboard */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-700">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <FaTrophy className="text-2xl sm:text-3xl md:text-4xl text-yellow-400" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 text-center">LIVE LEADERBOARD</h2>
            <FaTrophy className="text-2xl sm:text-3xl md:text-4xl text-yellow-400" />
          </div>
          <span className="flex items-center gap-2 text-sm sm:text-base bg-red-500 text-white px-3 py-1.5 rounded-full font-bold">
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></span>
            LIVE
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
                      ? 'bg-yellow-400 text-black scale-105 shadow-2xl border-2 border-yellow-500'
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
                            ? 'bg-yellow-500 text-black scale-110'
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
                          <div className="text-xs sm:text-sm font-medium mt-1 uppercase tracking-wide flex items-center gap-1 text-black/70">
                            <FaMicrophone className="text-xs" />
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
                        <FaFire className={`text-xs ${rank <= 3 ? 'text-red-500' : ''}`} />
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
