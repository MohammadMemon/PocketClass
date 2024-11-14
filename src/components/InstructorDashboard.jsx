import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function InstructorDashboard() {
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({
    date: '',
    time: '',
    duration: 60,
    booked: false,
  });
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    const slotsRef = collection(db, 'slots');
    const q = query(slotsRef, where('instructorId', '==', auth.currentUser.uid));
    const slotsSnap = await getDocs(q);
    const slotsData = slotsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
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
        createdAt: new Date().toISOString(),
      });
      setNewSlot({
        date: '',
        time: '',
        duration: 60,
        booked: false,
      });
      fetchSlots();
    } catch (error) {
      console.error('Error adding slot:', error);
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

export default InstructorDashboard;