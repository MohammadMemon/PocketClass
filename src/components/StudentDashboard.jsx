import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function StudentDashboard() {
  const [availableSlots, setAvailableSlots] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const db = getFirestore();
    const auth = getAuth();
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
    console.log("Available Slots:", availableSlots);
console.log("My Bookings:", myBookings);
  
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


    export default StudentDashboard;