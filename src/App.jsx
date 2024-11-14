import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc,
  setDoc,
  getDoc 
} from 'firebase/firestore';
import './styles.css';

//Firebase Config

const firebaseConfig = {
  apiKey: "AIzaSyDQ_r9L5uQTXsH50WiRxDpSHn-3nRpsV-U",
  authDomain: "pocketclass-e3d20.firebaseapp.com",
  projectId: "pocketclass-e3d20",
  storageBucket: "pocketclass-e3d20.firebasestorage.app",
  messagingSenderId: "361042386731",
  appId: "1:361042386731:web:9964efdc89a3afe61c2f6e",
  measurementId: "G-XRDCJG2CWH"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Components

function App() {
  console.log("is working?")
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
        <h1 className="title">Appointment Booking System</h1>
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

      {!user ? <AuthScreen /> : (
        user.role ? (
          user.role === 'instructor' ? <InstructorDashboard /> : <StudentDashboard />
        ) : (
          <RoleSelection userId={user.uid} setUser={setUser} />
        )
      )}
    </div>
  );
}

function AuthScreen() {
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Welcome</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          className="google-button"
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

function RoleSelection({ userId, setUser }) {
  const [error, setError] = useState('');

  const selectRole = async (role) => {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        uid: userId,
        role: role,
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      setUser(prevUser => ({ ...prevUser, role }));
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="role-container">
      <div className="role-box">
        <h2 className="role-title">Select Your Role</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="role-buttons">
          <button
            onClick={() => selectRole('student')}
            className="student-button"
          >
            Continue as Student
          </button>
          
          <button
            onClick={() => selectRole('instructor')}
            className="instructor-button"
          >
            Continue as Instructor
          </button>
        </div>
      </div>
    </div>
  );
}

// InstructorDashboard
function InstructorDashboard() {
    const [slots, setSlots] = useState([]);
    const [newSlot, setNewSlot] = useState({
      date: '',
      time: '',
      duration: 60,
      booked: false
    });
  
    useEffect(() => {
      fetchSlots();
    }, []);
  
    const fetchSlots = async () => {
      const slotsRef = collection(db, 'slots');
      const q = query(slotsRef, where("instructorId", "==", auth.currentUser.uid));
      const slotsSnap = await getDocs(q);
      const slotsData = slotsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSlots(slotsData);
    };
  
    const addSlot = async (e) => {
      e.preventDefault();
      try {
        await addDoc(collection(db, 'slots'), {
          ...newSlot,
          instructorId: auth.currentUser.uid,
          instructorEmail: auth.currentUser.email,
          createdAt: new Date().toISOString()
        });
        setNewSlot({
          date: '',
          time: '',
          duration: 60,
          booked: false
        });
        fetchSlots();
      } catch (error) {
        console.error("Error adding slot:", error);
      }
    };
  
    return (
      <div>
        <h2 className="dashboard-title">Instructor Dashboard</h2>
        
        <form onSubmit={addSlot} className="slot-form">
          <div className="form-inputs">
            <input
              type="date"
              value={newSlot.date}
              onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
              className="input-field"
              required
            />
            <input
              type="time"
              value={newSlot.time}
              onChange={(e) => setNewSlot({...newSlot, time: e.target.value})}
              className="input-field"
              required
            />
            <select
              value={newSlot.duration}
              onChange={(e) => setNewSlot({...newSlot, duration: parseInt(e.target.value)})}
              className="input-field"
            >
              <option value={30}>30 min</option>
              <option value={60}>1 hour</option>
            </select>
            <button type="submit" className="add-button">
              Add Slot
            </button>
          </div>
        </form>
  
        <div className="slots-grid">
          {slots.map(slot => (
            <div 
              key={slot.id} 
              className={`slot-card ${slot.booked ? 'booked' : ''}`}
            >
              <p>Date: {slot.date}</p>
              <p>Time: {slot.time}</p>
              <p>Duration: {slot.duration} minutes</p>
              <p>Status: {slot.booked ? 'Booked' : 'Available'}</p>
              {slot.booked && slot.studentEmail && (
                <p>Booked by: {slot.studentEmail}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  // StudentDashboard
  function StudentDashboard() {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
  
    useEffect(() => {
      fetchAvailableSlots();
      fetchMyBookings();
    }, []);
  
    const fetchAvailableSlots = async () => {
      const slotsRef = collection(db, 'slots');
      const q = query(slotsRef, where("booked", "==", false));
      const slotsSnap = await getDocs(q);
      const slotsData = slotsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailableSlots(slotsData);
    };
  
    const fetchMyBookings = async () => {
      const slotsRef = collection(db, 'slots');
      const q = query(
        slotsRef, 
        where("booked", "==", true),
        where("studentId", "==", auth.currentUser.uid)
      );
      const slotsSnap = await getDocs(q);
      const slotsData = slotsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMyBookings(slotsData);
    };
  
    const bookSlot = async (slotId) => {
      try {
        const slotRef = doc(db, 'slots', slotId);
        await updateDoc(slotRef, {
          booked: true,
          bookedAt: new Date().toISOString(),
          studentId: auth.currentUser.uid,
          studentEmail: auth.currentUser.email
        });
        fetchAvailableSlots();
        fetchMyBookings();
      } catch (error) {
        console.error("Error booking slot:", error);
      }
    };
  
    return (
      <div>
        <h2 className="dashboard-title">Student Dashboard</h2>
        
        <div className="bookings-section">
          <h3 className="section-title">My Bookings</h3>
          <div className="slots-grid">
            {myBookings.map(slot => (
              <div key={slot.id} className="booking-card">
                <p>Date: {slot.date}</p>
                <p>Time: {slot.time}</p>
                <p>Duration: {slot.duration} minutes</p>
                <p>Instructor: {slot.instructorEmail}</p>
              </div>
            ))}
          </div>
        </div>
  
        <h3 className="section-title">Available Slots</h3>
        <div className="slots-grid">
          {availableSlots.map(slot => (
            <div key={slot.id} className="slot-card">
              <p>Date: {slot.date}</p>
              <p>Time: {slot.time}</p>
              <p>Duration: {slot.duration} minutes</p>
              <p>Instructor: {slot.instructorEmail}</p>
              <button
                onClick={() => bookSlot(slot.id)}
                className="book-button"
              >
                Book Slot
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

export default App;