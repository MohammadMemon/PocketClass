import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.REACT_APP_PORT || 3001;

// Middleware to validate slot booking
const validateSlotBooking = async (req, res, next) => {
  const { slotId } = req.params;
  
  try {
    const slotRef = doc(db, 'slots', slotId);
    const slotSnap = await getDoc(slotRef);
    
    if (!slotSnap.exists()) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    
    if (slotSnap.data().booked) {
      return res.status(400).json({ error: 'Slot already booked' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Routes
app.get('/api/slots', async (req, res) => {
  try {
    const slotsRef = collection(db, 'slots');
    const slotsSnap = await getDocs(slotsRef);
    const slots = slotsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

app.post('/api/slots', async (req, res) => {
  try {
    const newSlot = req.body;
    const docRef = await addDoc(collection(db, 'slots'), {
      ...newSlot,
      booked: false,
      createdAt: new Date().toISOString()
    });
    res.json({ id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create slot' });
  }
});

app.put('/api/slots/:slotId/book', validateSlotBooking, async (req, res) => {
  try {
    const { slotId } = req.params;
    const slotRef = doc(db, 'slots', slotId);
    await updateDoc(slotRef, {
      booked: true,
      bookedAt: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to book slot' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
