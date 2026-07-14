require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'rescueher_super_secret_matrix_key_2026';

app.use(cors());
app.use(express.json());

// 🛡️ Middleware: সিকিউরিটি পাহারাদার
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: "Access Denied: No Token Provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: "Invalid or Expired Token" });
    req.user = user; 
    next();
  });
};

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// MongoDB Schemas
const User = mongoose.model('User', new mongoose.Schema({ name: String, phone: String, blood_group: String, email: { type: String, unique: true }, password: String }));
const Incident = mongoose.model('Incident', new mongoose.Schema({ user_id: String, location: String, severity: String, description: String, timestamp: String }));
const Contact = mongoose.model('Contact', new mongoose.Schema({ user_id: String, name: String, role: String, phone: String, email: String }));
const LiveLocation = mongoose.model('LiveLocation', new mongoose.Schema({ user_id: String, latitude: Number, longitude: Number, area: String, updated_at: String }));

app.get('/', (req, res) => res.send('Central MongoDB Backend API is running SECURELY...'));

// AUTH API
app.post('/api/signup', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await User.create({ ...req.body, password: hashedPassword });
    const token = jwt.sign({ id: newUser._id, email: req.body.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user: { id: newUser._id, name: req.body.name, email: req.body.email } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) return res.status(400).json({ success: false, message: "Invalid credentials!" });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ success: false, message: "Server Error" }); }
});

// REPORTS API
app.get('/api/reports', authenticateToken, async (req, res) => {
  try { 
    const rows = await Incident.find({ user_id: req.user.id }).sort({ _id: -1 }); 
    res.status(200).json(rows); 
  } catch (err) { res.status(500).json({ success: false, message: "Error" }); }
});

app.post('/api/report', authenticateToken, async (req, res) => {
  try { 
    const report = await Incident.create({ ...req.body, user_id: req.user.id, timestamp: new Date().toLocaleString() }); 
    res.status(201).json({ success: true, data: report }); 
  } catch (err) { res.status(500).json({ success: false, message: "Failed" }); }
});

// CONTACTS API
app.get('/api/contacts', authenticateToken, async (req, res) => {
  try { 
    const rows = await Contact.find({ user_id: req.user.id }).sort({ _id: -1 }); 
    res.status(200).json(rows); 
  } catch (err) { res.status(500).json({ success: false, message: "Error fetching contacts" }); }
});

app.post('/api/contacts', authenticateToken, async (req, res) => {
  try { 
    await Contact.create({ ...req.body, user_id: req.user.id }); 
    const rows = await Contact.find({ user_id: req.user.id }).sort({ _id: -1 }); 
    res.status(201).json({ success: true, data: rows }); 
  } catch (err) { res.status(500).json({ success: false, message: "Failed to save contact" }); }
});

app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
  try { 
    console.log("Attempting to delete contact ID:", req.params.id);
    await Contact.findOneAndDelete({ _id: req.params.id, user_id: req.user.id }); 
    const rows = await Contact.find({ user_id: req.user.id }).sort({ _id: -1 }); 
    res.status(200).json({ success: true, data: rows }); 
  } catch (err) { 
    console.error("Delete Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete contact" }); 
  }
});

// LOCATION API
app.get('/api/location/:userId', authenticateToken, async (req, res) => {
  try { 
    const loc = await LiveLocation.findOne({ user_id: req.params.userId }); 
    res.status(200).json(loc || { latitude: 23.8103, longitude: 90.4125, area: "📍 Secure Matrix Initiated" }); 
  } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/api/location/update', authenticateToken, async (req, res) => {
  try { 
    const { userId, latitude, longitude, area } = req.body;
    const updated = await LiveLocation.findOneAndUpdate(
      { user_id: userId }, 
      { latitude, longitude, area, updated_at: new Date().toLocaleTimeString() }, 
      { upsert: true, new: true }
    ); 
    res.status(200).json({ success: true, data: updated }); 
  } catch (err) { res.status(500).json({ success: false }); }
});

// 🛠️ SOS API UPDATE: এখন শুধু হিস্ট্রি সেভ করবে। ইমেইল পাঠানো ফ্রন্টএন্ড হ্যান্ডেল করছে।
app.post('/api/sos/trigger', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { area } = req.body;
    
    // 1. শুধু ডাটাবেজে হিস্ট্রি (Incident) সেভ করা হচ্ছে
    await Incident.create({ 
      user_id: userId, 
      location: area || "SOS Module Triggered", 
      severity: 'Critical', 
      description: 'Emergency SOS Broadcast Generated', 
      timestamp: new Date().toLocaleString() 
    });
    
    // 2. সফলতার মেসেজ পাঠিয়ে দেওয়া হচ্ছে (বাকি মেইল ফ্রন্টএন্ড করবে)
    res.status(200).json({ success: true, message: "SOS Location Logged Successfully!" });
  } catch (err) { 
    console.error("🔥 CRITICAL SOS ERROR:", err); 
    res.status(500).json({ success: false, message: err.message }); 
  }
});

app.listen(PORT, () => console.log(`🚀 Secure Node System Active on port: ${PORT}`));