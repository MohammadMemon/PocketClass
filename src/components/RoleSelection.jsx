import React, { useState } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

function RoleSelection({ userId, setUser }) {
  const [error, setError] = useState('');
  const db = getFirestore();

  const selectRole = async (role) => {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        uid: userId,
        role: role,
        createdAt: new Date().toISOString(),
      }, { merge: true });
      setUser((prevUser) => ({ ...prevUser, role }));
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="role-container">
      <div className="role-box">
        <h2 className="role-title">Select Your Role</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="role-buttons">
          <button onClick={() => selectRole('student')} className="student-button">
            Continue as Student
          </button>
          <button onClick={() => selectRole('instructor')} className="instructor-button">
            Continue as Instructor
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;