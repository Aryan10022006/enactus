// AdminPage.jsx
// Admin panel for managing the event, registration, and pitches

import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, addDoc, collection, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { db, getEventPath, TOTAL_BUDGET, TEAM_BUDGET_PERCENTAGE } from '../firebase';
import { useEventState } from '../hooks/useEventState';
import { useProjects } from '../hooks/useProjects';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaUsers, FaWallet, FaChartLine, FaDoorOpen, FaUserCheck, FaClipboardList, FaPlay, FaStop, FaPlusCircle, FaTrophy, FaTrash, FaUndo, FaUserShield } from 'react-icons/fa';

export default function AdminPage({ onLogout }) {
  const { eventState, loading: stateLoading } = useEventState();
  const { projects, loading: projectsLoading } = useProjects();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [totalBudget, setTotalBudget] = useState(TOTAL_BUDGET);
  const [teamPercentage, setTeamPercentage] = useState(TEAM_BUDGET_PERCENTAGE * 100);
  const closeTimerRef = useRef(null);

  // Fetch users for team member management
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, `${getEventPath()}/users`));
        const usersList = [];
        usersSnapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() });
        });
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
    // Re-fetch users every 5 seconds to keep list updated
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-close registration after 10 minutes if timer is active
  useEffect(() => {
    if (!eventState) return;

    const expiresAt = eventState.registration_expires_at;
    if (expiresAt && Date.now() > expiresAt && eventState.registration_open) {
      // Registration period expired, close it
      updateDoc(doc(db, `${getEventPath()}/state/state`), {
        registration_open: false,
        registration_expires_at: null
      }).catch((err) => console.error('Error auto-closing registration:', err));
    }
  }, [eventState]);

  const openRegistration = async () => {
    try {
      setProcessing(true);
      setStatusMessage('Opening registration...');
      
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now
      await updateDoc(doc(db, `${getEventPath()}/state/state`), {
        registration_open: true,
        registration_expires_at: expiresAt
      });

      // Set local timer to close registration after 10 minutes
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout(async () => {
        await updateDoc(doc(db, `${getEventPath()}/state/state`), {
          registration_open: false,
          registration_expires_at: null
        });
        setStatusMessage('Registration automatically closed after 10 minutes.');
      }, 10 * 60 * 1000);

      setStatusMessage('Registration opened! Will auto-close in 10 minutes.');
    } catch (error) {
      console.error('Error opening registration:', error);
      setStatusMessage('Error opening registration: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const closeRegistration = async () => {
    try {
      setProcessing(true);
      setStatusMessage('Closing registration...');
      
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      
      await updateDoc(doc(db, `${getEventPath()}/state/state`), {
        registration_open: false,
        registration_expires_at: null
      });

      setStatusMessage('Registration closed successfully.');
    } catch (error) {
      console.error('Error closing registration:', error);
      setStatusMessage('Error closing registration: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const distributeWallets = async () => {
    try {
      setProcessing(true);
      setStatusMessage('Distributing wallets...');

      // Check if registration is closed
      if (eventState?.registration_open) {
        setStatusMessage('Please close registration before distributing wallets.');
        setProcessing(false);
        return;
      }

      // Fetch all users and projects to calculate remaining budget
      const usersSnapshot = await getDocs(collection(db, `${getEventPath()}/users`));
      const projectsSnapshot = await getDocs(collection(db, `${getEventPath()}/projects`));
      
      const users = [];
      usersSnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });

      if (users.length === 0) {
        setStatusMessage('No users found to distribute wallets to.');
        setProcessing(false);
        return;
      }

      // Calculate total spent across all bids
      let totalSpent = 0;
      projectsSnapshot.forEach((doc) => {
        const project = doc.data();
        if (project.bids && Array.isArray(project.bids)) {
          project.bids.forEach(bid => {
            totalSpent += bid.amount || 0;
          });
        }
      });

      // Calculate budgets based on admin-set values
      const teamBudgetPercent = teamPercentage / 100;
      const attendeeBudgetPercent = (100 - teamPercentage) / 100;
      
      const teamTotal = totalBudget * teamBudgetPercent;
      const attendeeTotal = totalBudget * attendeeBudgetPercent;

      // Separate existing users (with wallets already distributed) and new users
      const existingUsers = users.filter((u) => u.wallet > 0 || u.hasReceivedWallet === true);
      const newUsers = users.filter((u) => u.wallet === 0 && !u.hasReceivedWallet);

      const teamUsers = users.filter((u) => u.isTeamMember === true);
      const attendeeUsers = users.filter((u) => !u.isTeamMember);

      const teamCount = teamUsers.length;
      const attendeeCount = attendeeUsers.length;

      if (teamCount === 0 && attendeeCount === 0) {
        setStatusMessage('No users to distribute wallets to.');
        setProcessing(false);
        return;
      }

      // Calculate amounts per user
      const teamAmount = teamCount > 0 ? Math.floor(teamTotal / teamCount) : 0;
      const attendeeAmount = attendeeCount > 0 ? Math.floor(attendeeTotal / attendeeCount) : 0;

      // Batch update: only distribute to NEW users who haven't received wallets yet
      const batch = writeBatch(db);
      
      if (newUsers.length > 0) {
        newUsers.forEach((user) => {
          const userRef = doc(db, `${getEventPath()}/users/${user.id}`);
          const amount = user.isTeamMember ? teamAmount : attendeeAmount;
          batch.update(userRef, { 
            wallet: amount,
            hasReceivedWallet: true,
            walletDistributedAt: new Date().toISOString()
          });
        });

        await batch.commit();
        
        const newTeamCount = newUsers.filter(u => u.isTeamMember).length;
        const newAttendeeCount = newUsers.filter(u => !u.isTeamMember).length;
        
        setStatusMessage(
          `Wallets distributed to ${newUsers.length} new user(s)! (${newTeamCount} team, ${newAttendeeCount} attendees)`
        );
      } else {
        setStatusMessage('No new users to distribute wallets to. All users already have wallets.');
      }
      
      setUsers(users.map(u => {
        const isNew = newUsers.find(nu => nu.id === u.id);
        if (isNew) {
          return { ...u, wallet: u.isTeamMember ? teamAmount : attendeeAmount, hasReceivedWallet: true };
        }
        return u;
      }));
    } catch (error) {
      console.error('Error distributing wallets:', error);
      setStatusMessage('Error distributing wallets: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This will remove all their bids and cannot be undone.`)) {
      return;
    }

    try {
      setProcessing(true);
      setStatusMessage(`Deleting ${userName}...`);

      // Delete user document
      await deleteDoc(doc(db, `${getEventPath()}/users/${userId}`));

      // Remove user's bids from all projects
      const projectsSnapshot = await getDocs(collection(db, `${getEventPath()}/projects`));
      const batch = writeBatch(db);

      projectsSnapshot.forEach((projectDoc) => {
        const project = projectDoc.data();
        if (project.bids && Array.isArray(project.bids)) {
          const updatedBids = project.bids.filter(bid => bid.userId !== userId);
          if (updatedBids.length !== project.bids.length) {
            batch.update(doc(db, `${getEventPath()}/projects/${projectDoc.id}`), {
              bids: updatedBids
            });
          }
        }
      });

      await batch.commit();

      // Update local state
      setUsers(users.filter(u => u.id !== userId));
      setStatusMessage(`${userName} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting user:', error);
      setStatusMessage('Error deleting user: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const resetUserWallet = async (userId, userName) => {
    if (!window.confirm(`Reset ${userName}'s wallet? This will clear their bids and restore their original wallet amount.`)) {
      return;
    }

    try {
      setProcessing(true);
      setStatusMessage(`Resetting ${userName}'s wallet...`);

      const user = users.find(u => u.id === userId);
      if (!user) {
        setStatusMessage('User not found.');
        setProcessing(false);
        return;
      }

      // Remove user's bids from all projects
      const projectsSnapshot = await getDocs(collection(db, `${getEventPath()}/projects`));
      const batch = writeBatch(db);

      let totalRefund = 0;
      projectsSnapshot.forEach((projectDoc) => {
        const project = projectDoc.data();
        if (project.bids && Array.isArray(project.bids)) {
          const userBids = project.bids.filter(bid => bid.userId === userId);
          userBids.forEach(bid => {
            totalRefund += bid.amount;
          });
          
          const updatedBids = project.bids.filter(bid => bid.userId !== userId);
          if (updatedBids.length !== project.bids.length) {
            batch.update(doc(db, `${getEventPath()}/projects/${projectDoc.id}`), {
              bids: updatedBids
            });
          }
        }
      });

      // Calculate original wallet amount
      const teamBudgetPercent = teamPercentage / 100;
      const teamTotal = totalBudget * teamBudgetPercent;
      const attendeeTotal = totalBudget * (1 - teamBudgetPercent);
      
      const teamCount = users.filter(u => u.isTeamMember).length;
      const attendeeCount = users.filter(u => !u.isTeamMember).length;
      
      const originalWallet = user.isTeamMember 
        ? (teamCount > 0 ? Math.floor(teamTotal / teamCount) : 0)
        : (attendeeCount > 0 ? Math.floor(attendeeTotal / attendeeCount) : 0);

      // Reset user's wallet
      batch.update(doc(db, `${getEventPath()}/users/${userId}`), {
        wallet: originalWallet
      });

      await batch.commit();

      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, wallet: originalWallet } : u));
      setStatusMessage(`${userName}'s wallet reset successfully. Refunded ₹${totalRefund}.`);
    } catch (error) {
      console.error('Error resetting wallet:', error);
      setStatusMessage('Error resetting wallet: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const toggleTeamMember = async (userId, userName, currentStatus) => {
    if (!window.confirm(`Change ${userName} to ${currentStatus ? 'Attendee' : 'Team Member'}?`)) {
      return;
    }

    try {
      setProcessing(true);
      setStatusMessage(`Updating ${userName}...`);

      await updateDoc(doc(db, `${getEventPath()}/users/${userId}`), {
        isTeamMember: !currentStatus
      });

      setUsers(users.map(u => u.id === userId ? { ...u, isTeamMember: !currentStatus } : u));
      setStatusMessage(`${userName} is now ${!currentStatus ? 'Team Member' : 'Attendee'}.`);
    } catch (error) {
      console.error('Error updating user:', error);
      setStatusMessage('Error updating user: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const addProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setStatusMessage('Please enter a project name.');
      return;
    }

    try {
      setProcessing(true);
      setStatusMessage('Adding project...');

      await addDoc(collection(db, `${getEventPath()}/projects`), {
        name: projectName.trim(),
        description: projectDescription.trim() || 'No description provided',
        bids: [],
        createdAt: new Date().toISOString(),
      });

      setProjectName('');
      setProjectDescription('');
      setStatusMessage(`Project "${projectName.trim()}" added successfully.`);
    } catch (error) {
      console.error('Error adding project:', error);
      setStatusMessage('Error adding project: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const startPitch = async (projectId, projectName) => {
    try {
      setProcessing(true);
      setStatusMessage(`Starting pitch for "${projectName}"...`);

      await updateDoc(doc(db, `${getEventPath()}/state/state`), {
        current_pitch_id: projectId
      });

      setStatusMessage(`Pitch started for "${projectName}".`);
    } catch (error) {
      console.error('Error starting pitch:', error);
      setStatusMessage('Error starting pitch: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const endPitch = async () => {
    try {
      setProcessing(true);
      setStatusMessage('Ending current pitch...');

      await updateDoc(doc(db, `${getEventPath()}/state/state`), {
        current_pitch_id: null
      });

      setStatusMessage('Pitch ended successfully.');
    } catch (error) {
      console.error('Error ending pitch:', error);
      setStatusMessage('Error ending pitch: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (stateLoading || projectsLoading) {
    return <LoadingSpinner message="Loading admin panel..." />;
  }

  const teamMembers = users.filter(u => u.isTeamMember);
  const attendees = users.filter(u => !u.isTeamMember);

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Admin Header with Logo and Logout */}
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl border border-yellow-400/20">
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
              <h1 className="text-xl sm:text-3xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-400 text-sm sm:text-base">Event Control Center</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 sm:py-2 bg-black text-yellow-400 rounded-lg font-medium hover:bg-gray-900 transition-all flex items-center gap-2 text-sm sm:text-base min-h-[44px]"
          >
            <FaDoorOpen />
            Logout
          </button>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className="bg-yellow-400 text-black px-4 py-3 rounded-lg font-medium text-sm sm:text-base">
          {statusMessage}
        </div>
      )}

      {/* Team Member Management */}
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <FaUsers className="text-xl sm:text-2xl text-yellow-400" />
          <h2 className="text-lg sm:text-xl font-bold text-yellow-400">Participants Overview</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Team Members</span>
              <span className="bg-yellow-400 text-black px-2 py-1 rounded text-sm font-bold">{teamMembers.length}</span>
            </div>
            <p className="text-xs text-gray-500">Special access participants</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Regular Attendees</span>
              <span className="bg-gray-600 text-white px-2 py-1 rounded text-sm font-bold">{attendees.length}</span>
            </div>
            <p className="text-xs text-gray-500">General participants</p>
          </div>
        </div>
        
        {/* Team Members List */}
        {teamMembers.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-200 mb-2 flex items-center gap-2">
              <FaUserCheck className="text-yellow-400" />
              Registered Team Members
            </h3>
            <div className="bg-gray-900 rounded-lg p-3 sm:p-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 px-3 bg-gray-800 rounded-lg gap-3 card-hover"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaUserShield className="text-gray-900 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm sm:text-base truncate">{member.name}</p>
                        <p className="text-xs text-gray-400">ID: {member.id.slice(0, 8)}...</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">Team</span>
                          {member.hasReceivedWallet && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Wallet Given</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                        <FaWallet className="text-xs" />
                        ₹{member.wallet || 0}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => toggleTeamMember(member.id, member.name, member.isTeamMember)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                          title="Change to Attendee"
                        >
                          <FaUsers />
                        </button>
                        <button
                          onClick={() => resetUserWallet(member.id, member.name)}
                          className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs transition-colors"
                          title="Reset Wallet"
                        >
                          <FaUndo />
                        </button>
                        <button
                          onClick={() => deleteUser(member.id, member.name)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Attendees List */}
        {attendees.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-200 mb-2 flex items-center gap-2">
              <FaUsers className="text-gray-400" />
              Registered Attendees
            </h3>
            <div className="bg-gray-900 rounded-lg p-3 sm:p-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {attendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 px-3 bg-gray-800 rounded-lg gap-3 card-hover"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaUsers className="text-gray-300 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm sm:text-base truncate">{attendee.name}</p>
                        <p className="text-xs text-gray-400">ID: {attendee.id.slice(0, 8)}...</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded">Attendee</span>
                          {attendee.hasReceivedWallet && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Wallet Given</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center gap-1 text-gray-300 font-bold text-sm">
                        <FaWallet className="text-xs" />
                        ₹{attendee.wallet || 0}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => toggleTeamMember(attendee.id, attendee.name, attendee.isTeamMember)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                          title="Change to Team Member"
                        >
                          <FaUserShield />
                        </button>
                        <button
                          onClick={() => resetUserWallet(attendee.id, attendee.name)}
                          className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs transition-colors"
                          title="Reset Wallet"
                        >
                          <FaUndo />
                        </button>
                        <button
                          onClick={() => deleteUser(attendee.id, attendee.name)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 sm:p-4">
          <p className="text-blue-300 text-xs sm:text-sm">
            <strong>Team Member Access:</strong> Share the secret code <span className="bg-blue-800 px-2 py-1 rounded font-mono text-xs">enactus2025team</span> with team members. They can access the event at <span className="font-mono text-xs">/#/team</span>
          </p>
        </div>
      </div>

      {/* Registration Control */}
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <FaClipboardList className="text-xl sm:text-2xl text-yellow-400" />
          <h2 className="text-lg sm:text-xl font-bold text-yellow-400">Registration Control</h2>
        </div>
        <div className="mb-4">
          <p className="text-gray-300 text-sm sm:text-base">
            Registration Status:{' '}
            <span className={`font-bold ${eventState?.registration_open ? 'text-green-400' : 'text-red-400'}`}>
              {eventState?.registration_open ? 'OPEN' : 'CLOSED'}
            </span>
          </p>
          {eventState?.registration_expires_at && eventState?.registration_open && (
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Auto-closes at: {new Date(eventState.registration_expires_at).toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={openRegistration}
            disabled={processing || eventState?.registration_open}
            className="flex-1 px-4 py-3 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base min-h-[44px]"
          >
            Open Registration (10 min)
          </button>
          <button
            onClick={closeRegistration}
            disabled={processing || !eventState?.registration_open}
            className="flex-1 px-4 py-3 bg-gray-700 text-gray-100 rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base min-h-[44px]"
          >
            Close Registration
          </button>
        </div>
      </div>

      {/* Wallet Distribution */}
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <FaWallet className="text-xl sm:text-2xl text-yellow-400" />
          <h2 className="text-lg sm:text-xl font-bold text-yellow-400">Budget & Wallet Distribution</h2>
        </div>
        
        {/* Budget Configuration - Editable */}
        <div className="bg-gray-900 rounded-lg p-3 sm:p-4 mb-4">
          <h3 className="text-sm font-semibold text-yellow-400 mb-3">Configure Budget (Before Distribution)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2">Total Budget (₹)</label>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-lg font-bold focus:outline-none focus:border-yellow-400"
                min="0"
                step="1000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Team Members Get (%)  </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={teamPercentage}
                  onChange={(e) => {
                    const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                    setTeamPercentage(val);
                  }}
                  className="w-20 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-lg font-bold focus:outline-none focus:border-yellow-400"
                  min="0"
                  max="100"
                />
                <span className="text-gray-400 text-sm">
                  (Attendees: {100 - teamPercentage}%)
                </span>
              </div>
            </div>
          </div>
          
          {/* Preview Calculation */}
          <div className="bg-gray-800 rounded p-3 border border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Preview (per person):</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-yellow-400">Team ({teamMembers.length}):</span>
                <span className="ml-2 font-bold text-white">
                  ₹{teamMembers.length > 0 ? Math.floor((totalBudget * teamPercentage / 100) / teamMembers.length).toLocaleString() : 0}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Attendees ({attendees.length}):</span>
                <span className="ml-2 font-bold text-white">
                  ₹{attendees.length > 0 ? Math.floor((totalBudget * (100 - teamPercentage) / 100) / attendees.length).toLocaleString() : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={distributeWallets}
          disabled={processing || eventState?.registration_open}
          className="w-full sm:w-auto px-4 py-3 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base min-h-[44px]"
        >
          Distribute Wallets Now
        </button>
        {eventState?.registration_open && (
          <p className="text-xs sm:text-sm text-red-400 mt-2">Close registration first before distributing wallets.</p>
        )}
      </div>

      {/* Project Management */}
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <FaChartLine className="text-xl sm:text-2xl text-yellow-400" />
          <h2 className="text-lg sm:text-xl font-bold text-yellow-400">Project Management</h2>
        </div>
        <form onSubmit={addProject} className="space-y-3 mb-6">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project name"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-yellow-400 text-sm sm:text-base min-h-[44px]"
          />
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Project description (optional)"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-yellow-400 text-sm sm:text-base min-h-[80px]"
            rows="2"
          />
          <button
            type="submit"
            disabled={processing || !projectName.trim()}
            className="w-full sm:w-auto px-4 py-3 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]"
          >
            <FaPlusCircle />
            Add New Project
          </button>
        </form>

        {/* Projects List with Bid Details */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-200 flex items-center gap-2">
            <FaPlay className="text-yellow-400" />
            Pitch Control & Bid Tracking
          </h3>
          {projects.length === 0 ? (
            <p className="text-gray-400 text-xs sm:text-sm">No projects added yet.</p>
          ) : (
            projects.map((project) => {
              const totalBid = project.bids?.reduce((sum, bid) => sum + bid.amount, 0) || 0;
              const sortedBids = project.bids ? [...project.bids].sort((a, b) => b.amount - a.amount) : [];
              
              return (
                <div
                  key={project.id}
                  className={`rounded-lg border-2 ${
                    eventState?.current_pitch_id === project.id
                      ? 'bg-yellow-400 text-black border-yellow-500'
                      : 'bg-gray-900 border-gray-700'
                  }`}
                >
                  {/* Project Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-sm sm:text-base">{project.name}</div>
                      {project.description && (
                        <div className={`text-xs sm:text-sm mt-1 ${eventState?.current_pitch_id === project.id ? 'text-black/70' : 'text-gray-400'}`}>
                          {project.description}
                        </div>
                      )}
                      <div className={`text-xs sm:text-sm mt-1 flex items-center gap-1 ${eventState?.current_pitch_id === project.id ? 'text-black/70' : 'text-gray-400'}`}>
                        <FaWallet />
                        Total: ₹{totalBid.toLocaleString()} • {sortedBids.length} {sortedBids.length === 1 ? 'bid' : 'bids'}
                      </div>
                    </div>
                    <button
                      onClick={() => startPitch(project.id, project.name)}
                      disabled={processing || eventState?.current_pitch_id === project.id}
                      className={`w-full sm:w-auto px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] ${
                        eventState?.current_pitch_id === project.id
                          ? 'bg-black text-yellow-400 cursor-not-allowed'
                          : 'bg-yellow-400 text-black hover:bg-yellow-500'
                      } disabled:opacity-50`}
                    >
                      <FaPlay />
                      {eventState?.current_pitch_id === project.id ? 'Currently Pitching' : 'Start Pitch'}
                    </button>
                  </div>

                  {/* Bid Details - Show who bid what */}
                  {sortedBids.length > 0 && (
                    <div className={`border-t-2 p-3 sm:p-4 ${
                      eventState?.current_pitch_id === project.id ? 'border-black/20' : 'border-gray-700'
                    }`}>
                      <h4 className={`text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2 ${
                        eventState?.current_pitch_id === project.id ? 'text-black' : 'text-gray-300'
                      }`}>
                        <FaTrophy className="text-xs" />
                        All Bids (Highest to Lowest)
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {sortedBids.map((bid, index) => (
                          <div
                            key={`${bid.userId}-${index}`}
                            className={`flex items-center justify-between p-2 rounded text-xs sm:text-sm ${
                              eventState?.current_pitch_id === project.id
                                ? 'bg-black/10'
                                : 'bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${
                                index === 0 ? 'text-yellow-600' :
                                index === 1 ? 'text-gray-500' :
                                index === 2 ? 'text-orange-700' :
                                eventState?.current_pitch_id === project.id ? 'text-black/70' : 'text-gray-500'
                              }`}>
                                #{index + 1}
                              </span>
                              <span className={`font-medium ${
                                eventState?.current_pitch_id === project.id ? 'text-black' : 'text-white'
                              }`}>
                                {bid.userName}
                              </span>
                              {bid.isTeamMember && (
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  eventState?.current_pitch_id === project.id
                                    ? 'bg-black text-yellow-400'
                                    : 'bg-yellow-400 text-black'
                                }`}>
                                  Team
                                </span>
                              )}
                            </div>
                            <span className={`font-bold ${
                              eventState?.current_pitch_id === project.id ? 'text-black' : 'text-yellow-400'
                            }`}>
                              ₹{bid.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* End Pitch Button */}
        <div className="mt-6">
          <button
            onClick={endPitch}
            disabled={processing || !eventState?.current_pitch_id}
            className="w-full sm:w-auto px-4 py-3 bg-gray-700 text-gray-100 rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]"
          >
            <FaStop />
            End Current Pitch
          </button>
        </div>
      </div>
    </div>
  );
}
