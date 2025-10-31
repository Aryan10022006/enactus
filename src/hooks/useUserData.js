// useUserData.js
// Custom hook for real-time user data listener
// Listens to event/{appId}/users/{userId} document

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, getEventPath } from '../firebase';

export function useUserData(userId) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setUserData(null);
      setLoading(false);
      return;
    }

    const userRef = doc(db, `${getEventPath()}/users/${userId}`);

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setUserData({ id: snapshot.id, ...snapshot.data() });
        } else {
          setUserData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to user data:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { userData, loading, error };
}
