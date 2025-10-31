// AttendeePage.jsx
// Main attendee view for registration, waiting, and bidding

import React, { useState, useContext } from 'react';
import { doc, setDoc, runTransaction } from 'firebase/firestore';
import { db, getEventPath } from '../firebase';
import { useEventState } from '../hooks/useEventState';
import { useUserData } from '../hooks/useUserData';
import { useProjects } from '../hooks/useProjects';
import LoadingSpinner from '../components/LoadingSpinner';
import { UserContext } from '../App';
import { FaUser, FaWallet, FaChartLine, FaClock, FaTrophy, FaCheckCircle, FaCheck } from 'react-icons/fa';

export default function AttendeePage() {
  const { userId } = useContext(UserContext);
  const { eventState, loading: stateLoading } = useEventState();
  const { userData, loading: userLoading } = useUserData(userId);
  const { projects } = useProjects();
  const [name, setName] = useState('');
  const [bidAmounts, setBidAmounts] = useState({});
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bidErrors, setBidErrors] = useState({});

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    if (!userId) {
      setErrorMessage('Authentication not ready. Please wait and try again.');
      return;
    }

    try {
      setProcessing(true);
      setErrorMessage('');

      // Create user document without role (attendees don't have isTeamMember flag)
      await setDoc(doc(db, `${getEventPath()}/users/${userId}`), {
        name: name.trim(),
        wallet: 0,
        isTeamMember: false,
        registeredAt: new Date().toISOString(),
      });

      setName('');
    } catch (error) {
      console.error('Error registering:', error);
      setErrorMessage('Error registering: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handlePlaceBid = async (projectId) => {
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
      setProcessing(true);
      setBidErrors(prev => ({ ...prev, [projectId]: '' }));

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
          // Update existing bid
          const refundAmount = currentBids[existingBidIndex].amount;
          currentBids[existingBidIndex] = {
            userId,
            userName: userData.name,
            amount,
            timestamp: new Date().toISOString(),
            isTeamMember: false,
          };
          transaction.update(userRef, {
            wallet: currentWallet + refundAmount - amount,
          });
        } else {
          // New bid
          currentBids.push({
            userId,
            userName: userData.name,
            amount,
            timestamp: new Date().toISOString(),
            isTeamMember: false,
          });
          transaction.update(userRef, {
            wallet: currentWallet - amount,
          });
        }

        transaction.update(projectRef, { bids: currentBids });
      });

      setBidAmounts(prev => ({ ...prev, [projectId]: '' }));
    } catch (error) {
      console.error('Error placing bid:', error);
      setBidErrors(prev => ({ ...prev, [projectId]: 'Bid failed. Try again.' }));
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveBid = async (projectId) => {
    if (!window.confirm('Are you sure you want to remove your bid? Your funds will be returned to your wallet.')) {
      return;
    }

    try {
      setProcessing(true);
      setBidErrors(prev => ({ ...prev, [projectId]: '' }));

      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, `${getEventPath()}/users/${userId}`);
        const projectRef = doc(db, `${getEventPath()}/projects/${projectId}`);

        const userDoc = await transaction.get(userRef);
        const projectDoc = await transaction.get(projectRef);

        if (!userDoc.exists() || !projectDoc.exists()) {
          throw new Error('Document not found');
        }

        const currentWallet = userDoc.data().wallet;
        const currentBids = projectDoc.data().bids || [];
        const existingBidIndex = currentBids.findIndex(b => b.userId === userId);

        if (existingBidIndex >= 0) {
          const refundAmount = currentBids[existingBidIndex].amount;
          currentBids.splice(existingBidIndex, 1); // Remove the bid
          
          transaction.update(userRef, {
            wallet: currentWallet + refundAmount,
          });
          transaction.update(projectRef, { bids: currentBids });
        }
      });

      setBidAmounts(prev => ({ ...prev, [projectId]: '' }));
    } catch (error) {
      console.error('Error removing bid:', error);
      setBidErrors(prev => ({ ...prev, [projectId]: 'Failed to remove bid. Try again.' }));
    } finally {
      setProcessing(false);
    }
  };

  if (stateLoading || userLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  // Phase 1: Registration (registration open and user not registered)
  if (eventState?.registration_open && !userData) {
    return (
      <div className="max-w-md mx-auto px-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl p-4">
              <img 
                src="/images/logotab.png" 
                alt="Enactus Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-4xl sm:text-5xl font-bold text-yellow-400">E</span>';
                }}
              />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2 text-center">Welcome!</h2>
          <p className="text-gray-300 mb-6 text-center text-sm sm:text-base">Join the Enactus Orientation bidding event!</p>

          {errorMessage && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg mb-4 text-sm">{errorMessage}</div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                <FaUser />
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 sm:py-4 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-yellow-400 text-base sm:text-lg min-h-[44px]"
                disabled={processing}
              />
            </div>
            <button
              type="submit"
              disabled={processing || !name.trim()}
              className="w-full px-4 py-3 sm:py-4 bg-yellow-400 text-black rounded-lg font-bold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base sm:text-lg min-h-[44px]"
            >
              {processing ? 'Registering...' : 'Join as Attendee'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If no user data and registration is closed
  if (!userData) {
    return (
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 text-center border border-gray-700">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl p-4">
              <img 
                src="/images/logo.png" 
                alt="Enactus Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-4xl sm:text-5xl font-bold text-yellow-400">E</span>';
                }}
              />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4">Registration Status</h2>
          <p className="text-gray-300 text-sm sm:text-base">
            {eventState?.registration_open
              ? 'Please register to participate in the bidding.'
              : 'Registration is closed. Wallets are being distributed. Please wait...'}
          </p>
        </div>
      </div>
    );
  }

  // Phase 2: Waiting for wallet distribution
  if (userData.wallet === 0) {
    return (
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 text-center border border-gray-700">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl p-4">
              <FaClock className="text-4xl sm:text-5xl text-yellow-400" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4 flex items-center justify-center gap-2">
            Welcome, {userData.name}!
          </h2>
          <div className="space-y-2">
            <p className="text-green-400 font-semibold text-sm sm:text-base flex items-center justify-center gap-2">
              <FaCheck />
              Successfully registered!
            </p>
            <p className="text-gray-300 text-sm sm:text-base">
              {eventState?.registration_open 
                ? 'Please wait while the admin distributes wallets...'
                : 'Registration closed. Wallets are being distributed...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Phase 3: Bidding phase
  const currentProject = eventState?.current_pitch_id 
    ? projects.find(p => p.id === eventState.current_pitch_id)
    : null;

  const userBid = currentProject?.bids?.find(b => b.userId === userId);

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4">
      {/* User Info Card */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl border border-yellow-400/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <FaUser className="text-xl sm:text-3xl text-black" />
            </div>
            <div className="text-center sm:text-left">
              <div className="text-white font-bold text-lg sm:text-xl">{userData.name}</div>
              <div className="text-xs sm:text-sm text-gray-400">Attendee</div>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-xs sm:text-sm text-gray-400 flex items-center justify-center sm:justify-end gap-1">
              <FaWallet />
              Your Wallet
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-yellow-400">₹{userData.wallet?.toLocaleString() || 0}</div>
          </div>
        </div>
      </div>

      {/* Bidding Area */}
      {currentProject ? (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl border border-yellow-400/30">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <FaChartLine className="text-lg sm:text-2xl text-yellow-400" />
              <h3 className="text-xs sm:text-sm text-yellow-400 font-bold uppercase tracking-wider">Now Pitching</h3>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{currentProject.name}</h2>
            {currentProject.description && (
              <p className="text-sm sm:text-base text-gray-300 mb-4">{currentProject.description}</p>
            )}
            
            {/* Current Bid Status */}
            {userBid && (
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 sm:p-4 mb-4">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <FaCheckCircle />
                  <span className="font-semibold text-xs sm:text-sm">Your Current Bid</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white">₹{userBid.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">You can update or remove your bid</p>
              </div>
            )}
          </div>

          {bidErrors[currentProject.id] && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg mb-4 text-xs sm:text-sm">{bidErrors[currentProject.id]}</div>
          )}

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-2">Enter Bid Amount</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="number"
                  value={bidAmounts[currentProject.id] || ''}
                  onChange={(e) => setBidAmounts(prev => ({ ...prev, [currentProject.id]: e.target.value }))}
                  placeholder="Enter amount in ₹"
                  min="1"
                  max={userData.wallet}
                  className="flex-1 px-4 py-3 sm:py-4 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-yellow-400 text-base sm:text-lg min-h-[44px]"
                  disabled={processing}
                />
                <button
                  onClick={() => handlePlaceBid(currentProject.id)}
                  disabled={processing || !bidAmounts[currentProject.id] || parseInt(bidAmounts[currentProject.id]) <= 0}
                  className="sm:w-auto px-6 py-3 sm:py-4 bg-yellow-400 text-black rounded-lg font-bold text-base sm:text-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] whitespace-nowrap"
                >
                  {processing ? 'Placing...' : userBid ? 'Update Bid' : 'Place Bid'}
                </button>
                {userBid && (
                  <button
                    onClick={() => handleRemoveBid(currentProject.id)}
                    disabled={processing}
                    className="sm:w-auto px-6 py-3 sm:py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] whitespace-nowrap"
                  >
                    Remove Bid
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="mt-6 sm:mt-8">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaTrophy className="text-yellow-400" />
              Current Bids
              <span className="ml-auto flex items-center gap-1 text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold">
                <span className="w-2 h-2 bg-white rounded-full"></span>
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
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                          index === 0 ? 'bg-yellow-400 text-gray-900' :
                          index === 1 ? 'bg-gray-400 text-gray-900' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-gray-600 text-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className={`font-semibold text-xs sm:text-base ${
                            bid.userId === userId ? 'text-yellow-400' : 'text-white'
                          }`}>
                            {bid.userName}
                            {bid.userId === userId && ' (You)'}
                          </p>
                          {bid.isTeamMember && (
                            <p className="text-xs text-yellow-400">Team Member</p>
                          )}
                        </div>
                      </div>
                      <span className={`text-base sm:text-xl font-bold ${
                        bid.userId === userId ? 'text-yellow-400' : 'text-white'
                      }`}>
                        ₹{bid.amount}
                      </span>
                    </div>
                  ))
              ) : (
                <p className="text-gray-400 text-center py-4 text-xs sm:text-sm">
                  No bids yet. Be the first to bid!
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-8 sm:p-10 text-center shadow-2xl border border-gray-700">
          <FaClock className="text-5xl sm:text-6xl text-yellow-400 mx-auto mb-4" />
          <div className="text-lg sm:text-xl text-gray-300 mb-2">Waiting for the next pitch to begin...</div>
          <div className="text-xs sm:text-sm text-gray-400">Your wallet is ready. Stay tuned!</div>
        </div>
      )}
    </div>
  );
}
