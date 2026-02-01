import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

// ID COMPARTIDO: Al usar una constante fija, todos los dispositivos 
// leerán/escribirán en la misma ubicación de Firestore.
const SHARED_ID = 'shared_admin_dashboard';

/**
 * A hook that syncs a state variable with a Firestore document.
 * Data path: users/shared_admin_dashboard/data/{key}
 */
export function useUserData<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void, boolean] {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  // 1. Listen for Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        // Fallback to localStorage if logged out (optional, or just reset)
        try {
            const localItem = localStorage.getItem(key);
            if (localItem) setData(JSON.parse(localItem));
        } catch(e) {}
      }
    });
    return () => unsubscribe();
  }, [key]);

  // 2. Listen for Firestore Data (SHARED PATH)
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    // CHANGE: Use SHARED_ID instead of user.uid
    const docRef = doc(db, 'users', SHARED_ID, 'data', key);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.data().value as T);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, key]);

  // 3. Setter function that updates Local State AND Firestore (SHARED PATH)
  const setSyncedData = async (newValueOrFn: T | ((prev: T) => T)) => {
    // Calculate new value
    let newValue: T;
    if (typeof newValueOrFn === 'function') {
      newValue = (newValueOrFn as (prev: T) => T)(data);
    } else {
      newValue = newValueOrFn;
    }

    // Optimistic Update
    setData(newValue);

    // Persist
    if (user) {
      try {
        // CHANGE: Use SHARED_ID instead of user.uid
        const docRef = doc(db, 'users', SHARED_ID, 'data', key);
        await setDoc(docRef, { value: newValue, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (error) {
        console.error("Error writing to Firestore:", error);
      }
    } else {
      // Fallback to localStorage
      localStorage.setItem(key, JSON.stringify(newValue));
    }
  };

  return [data, setSyncedData, loading];
}