import React, { useState, useContext } from 'react';
import { db } from '../firebase';
import { doc, setDoc, runTransaction } from 'firebase/firestore';
import { UserContext } from '../App';
import { useEventState } from '../hooks/useEventState';
import { useUserData } from '../hooks/useUserData';
import { useProjects } from '../hooks/useProjects';
import LoadingSpinner from '../components/LoadingSpinner';
import { getEventPath } from '../firebase';
import { FaUser, FaWallet, FaChartLine, FaTrophy, FaCheckCircle, FaUsers } from 'react-icons/fa';

function TeamMemberPage({ onLogout }) {
  const { userId } = useContext(UserContext);
  const { eventState, loading: stateLoading } = useEventState();
  const { userData, loading: userLoading } = useUserData(userId);
  const { projects } = useProjects();

  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [bidAmounts, setBidAmounts] = useState({});
  const [bidErrors, setBidErrors] = useState({});

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, `${getEventPath()}/users/${userId}`), {
        name: name.trim(),
        wallet: 0,
        isTeamMember: true,
        registeredAt: new Date().toISOString(),
      });
      setError('');
    } catch (err) {
      setError('Failed to register. Please try again.');
      console.error(err);
    }
  };

  const handleBid = async (projectId) => {
    const amount = parseInt(bidAmounts[projectId] || 0);
    if (!amount || amount <= 0) {
      setBidErrors(prev => ({ ...prev, [projectId]: 'Enter a valid amount' }));
      return;
    }
    if (amount > userData.wallet) {
      setBidErrors(prev => ({ ...prev, [projectId]: 'Insufficient funds' }));
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, `${getEventPath()}/users/${userId}`);
        const projectRef = doc(db, `${getEventPath()}/projects/${projectId}`);

        const userDoc = await transaction.get(userRef);
        const projectDoc = await transaction.get(projectRef);

        if (!userDoc.exists() || !projectDoc.exists()) {
          throw new Error('Document not found');
        }

        const currentWallet = userDoc.data().wallet;
        if (amount > currentWallet) {
          throw new Error('Insufficient funds');
        }

        const currentBids = projectDoc.data().bids || [];
        const existingBidIndex = currentBids.findIndex(b => b.userId === userId);

        if (existingBidIndex >= 0) {
          const refundAmount = currentBids[existingBidIndex].amount;
          currentBids[existingBidIndex] = {
            userId,
            userName: userData.name,
            amount,
            timestamp: new Date().toISOString(),
            isTeamMember: true,
          };
          transaction.update(userRef, {
            wallet: currentWallet + refundAmount - amount,
          });
        } else {
          currentBids.push({
            userId,
            userName: userData.name,
            amount,
            timestamp: new Date().toISOString(),
            isTeamMember: true,
          });
          transaction.update(userRef, {
            wallet: currentWallet - amount,
          });
        }

        transaction.update(projectRef, { bids: currentBids });
      });

      setBidAmounts(prev => ({ ...prev, [projectId]: '' }));
      setBidErrors(prev => ({ ...prev, [projectId]: '' }));
    } catch (err) {
      setBidErrors(prev => ({ ...prev, [projectId]: 'Bid failed. Try again.' }));
      console.error(err);
    }
  };

  if (stateLoading || userLoading) {
    return <LoadingSpinner />;
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
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
            <div className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full inline-flex items-center text-sm sm:text-base font-semibold mb-4">
              <FaUsers className="mr-2" />
              Team Member
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Welcome to the Pitch Battle!</h1>
            <p className="text-gray-400 text-sm sm:text-base">Register to participate in the bidding event</p>
          </div>          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-700">
            <form onSubmit={handleRegister} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaUser className="inline mr-2" />
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 sm:py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-base sm:text-lg min-h-[44px]"
                  placeholder="Enter your name"
                  required
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-3 sm:py-4 px-6 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-lg text-base sm:text-lg min-h-[44px]"
              >
                Join Event
              </button>
            </form>

            <button
              onClick={onLogout}
              className="w-full mt-4 bg-gray-700 text-gray-300 font-semibold py-2 sm:py-3 px-4 rounded-lg hover:bg-gray-600 transition-all text-sm sm:text-base min-h-[44px]"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!eventState?.registration_open) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 border border-yellow-400/20">
            <div className="text-center">
              <img 
                src="/images/logo.png" 
                alt="Enactus Logo" 
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg hidden items-center justify-center"
              >
                <span className="text-3xl font-bold text-gray-900">E</span>
              </div>
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-3xl sm:text-4xl text-gray-900" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">You're All Set!</h2>
              <p className="text-lg sm:text-xl text-yellow-400 font-semibold mb-4">{userData.name}</p>
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center text-gray-300">
                  <FaWallet className="mr-2 text-yellow-400" />
                  <span className="text-base sm:text-lg">Wallet: ₹{userData.wallet}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm sm:text-base mb-4">
                Waiting for the event to begin and pitches to start...
              </p>
              <div className="animate-pulse text-yellow-400 text-sm sm:text-base">⏳ Please wait...</div>
            </div>

            <button
              onClick={onLogout}
              className="w-full mt-6 bg-gray-700 text-gray-300 font-semibold py-2 sm:py-3 px-4 rounded-lg hover:bg-gray-600 transition-all text-sm sm:text-base min-h-[44px]"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentProject = eventState?.current_pitch_id 
    ? projects.find(p => p.id === eventState.current_pitch_id)
    : null;

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-700">
            <div className="text-center">
              <img 
                src="/images/logo.png" 
                alt="Enactus Logo" 
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg hidden items-center justify-center"
              >
                <span className="text-3xl font-bold text-gray-900">E</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ready to Bid!</h2>
              <p className="text-lg sm:text-xl text-yellow-400 font-semibold mb-4">{userData.name}</p>
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center text-gray-300">
                  <FaWallet className="mr-2 text-yellow-400" />
                  <span className="text-lg sm:text-xl font-bold">₹{userData.wallet}</span>
                </div>
                <div className="flex items-center justify-center text-yellow-400 mt-2">
                  <FaUsers className="mr-2" />
                  <span className="text-xs sm:text-sm">Team Member</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm sm:text-base">
                Waiting for the next pitch to begin...
              </p>
            </div>

            <button
              onClick={onLogout}
              className="w-full mt-6 bg-gray-700 text-gray-300 font-semibold py-2 sm:py-3 px-4 rounded-lg hover:bg-gray-600 transition-all text-sm sm:text-base min-h-[44px]"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userBid = currentProject.bids?.find(b => b.userId === userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 mb-6 border border-yellow-400/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl flex items-center justify-center shadow-lg p-2">
                <img 
                  src="/images/logo.png" 
                  alt="Enactus Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<span class="text-2xl sm:text-3xl font-bold text-yellow-400">E</span>';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <FaUser className="text-yellow-400" />
                  <h2 className="text-lg sm:text-xl font-bold text-white">{userData.name}</h2>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <FaUsers className="text-yellow-400 text-xs sm:text-sm" />
                  <span className="text-yellow-400 text-xs sm:text-sm font-semibold">Team Member</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <FaWallet className="text-gray-900" />
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">₹{userData.wallet}</span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="bg-gray-700 text-gray-300 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 transition-all text-sm sm:text-base min-h-[44px]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Current Pitch */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 sm:p-8 border border-yellow-400/30">
          <div className="text-center mb-6">
            <div className="inline-flex items-center bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm sm:text-base font-semibold mb-4">
              <FaChartLine className="mr-2" />
              Now Pitching
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{currentProject.name}</h1>
            <p className="text-base sm:text-lg text-gray-300">{currentProject.description}</p>
          </div>

          {/* Bid Form */}
          <div className="bg-gray-700/50 rounded-lg p-4 sm:p-6 mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Place Your Bid
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                value={bidAmounts[currentProject.id] || ''}
                onChange={(e) => setBidAmounts(prev => ({ ...prev, [currentProject.id]: e.target.value }))}
                className="flex-1 px-4 py-3 sm:py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base sm:text-lg min-h-[44px]"
                placeholder="Enter amount in ₹"
                min="1"
                max={userData.wallet}
              />
              <button
                onClick={() => handleBid(currentProject.id)}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-lg text-base sm:text-lg whitespace-nowrap min-h-[44px]"
              >
                Place Bid
              </button>
            </div>
            {bidErrors[currentProject.id] && (
              <p className="mt-2 text-red-400 text-sm">{bidErrors[currentProject.id]}</p>
            )}
          </div>

          {/* Current Bid Status */}
          {userBid && (
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <FaCheckCircle />
                <span className="font-semibold text-sm sm:text-base">Your Current Bid</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-white">₹{userBid.amount}</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">You can update your bid anytime</p>
            </div>
          )}

          {/* Leaderboard */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaTrophy className="text-yellow-400" />
              Current Bids
              <span className="ml-auto flex items-center gap-1 text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                LIVE
              </span>
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {currentProject.bids && currentProject.bids.length > 0 ? (
                [...currentProject.bids]
                  .sort((a, b) => b.amount - a.amount)
                  .map((bid, index) => (
                    <div
                      key={bid.userId}
                      className={`flex items-center justify-between p-3 sm:p-4 rounded-lg ${
                        bid.userId === userId
                          ? 'bg-yellow-400/20 border border-yellow-400/50'
                          : 'bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-400 text-gray-900' :
                          index === 1 ? 'bg-gray-400 text-gray-900' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-gray-600 text-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm sm:text-base ${
                            bid.userId === userId ? 'text-yellow-400' : 'text-white'
                          }`}>
                            {bid.userName}
                            {bid.userId === userId && ' (You)'}
                          </p>
                          {bid.isTeamMember && (
                            <p className="text-xs text-yellow-400 flex items-center gap-1">
                              <FaUsers className="text-xs" />
                              Team Member
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`text-lg sm:text-xl font-bold ${
                        bid.userId === userId ? 'text-yellow-400' : 'text-white'
                      }`}>
                        ₹{bid.amount}
                      </span>
                    </div>
                  ))
              ) : (
                <p className="text-gray-400 text-center py-4 text-sm sm:text-base">
                  No bids yet. Be the first to bid!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamMemberPage;
