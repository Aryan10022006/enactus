// useProjects.js
// Custom hook for real-time projects collection listener
// Listens to event/{appId}/projects collection

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db, getEventPath } from '../firebase';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const projectsRef = collection(db, `${getEventPath()}/projects`);
    const q = query(projectsRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const projectsList = [];
        snapshot.forEach((doc) => {
          projectsList.push({ id: doc.id, ...doc.data() });
        });
        setProjects(projectsList);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to projects:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { projects, loading, error };
}
