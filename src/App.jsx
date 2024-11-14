import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import AuthScreen from './components/AuthScreen';
import RoleSelection from './components/RoleSelection';
import InstructorDashboard from './components/InstructorDashboard';
import StudentDashboard from './components/StudentDashboard';
import './styles.css';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        setUser({ ...user, role: userData?.role });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">PocketClass Coding Assestment : Mohammad Memon </h1>
        {user ? (
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <button
              onClick={() => signOut(auth)}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        ) : null}
      </header>
      {!user ? (
        <AuthScreen />
      ) : user.role ? (
        user.role === 'instructor' ? (
          <InstructorDashboard />
        ) : (
          <StudentDashboard />
        )
      ) : (
        <RoleSelection userId={user.uid} setUser={setUser} />
      )}
    </div>
  );
}

export default App;