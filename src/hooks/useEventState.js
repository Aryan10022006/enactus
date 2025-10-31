// useEventState.js
// Custom hook for real-time event state listener
// Listens to event/{appId}/state document

import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, getEventPath } from '../firebase';

export function useEventState() {
  const [eventState, setEventState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stateRef = doc(db, `${getEventPath()}/state/state`);

    const unsubscribe = onSnapshot(
      stateRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          // Initialize the state document if it doesn't exist
          const initialState = {
            registration_open: false,
            current_pitch_id: null,
            registration_expires_at: null
          };
          setDoc(stateRef, initialState).catch((err) => {
            console.error('Error initializing state:', err);
            setError(err);
          });
          setEventState(initialState);
        } else {
          setEventState(snapshot.data());
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to event state:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { eventState, loading, error };
}
