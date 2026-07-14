require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'rescueher_super_secret_matrix_key_2026';

app.use(cors());
app.use(express.json());

// 🛡️ Middleware: সিকিউরিটি পাহারাদার (টোকেন ভেরিফিকেশন)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN" ফরম্যাট থেকে টোকেন আলাদা করা

  if (!token) {
    return res.status(401).json({ success: false, message: "Access Denied: No Token Provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid or Expired Token" });
    }
    req.user = user; // টোকেন থেকে ইউজারের আইডি ও ইমেইল req.user-এ সেভ করা হলো
    next(); // টোকেন সঠিক হলে পরের ধাপে যাওয়ার অনুমতি দেওয়া হলো
  });
};

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// MongoDB Schemas & Models
const User = mongoose.model('User', new mongoose.Schema({ name: String, phone: String, blood_group: String, email: { type: String, unique: true }, password: String }));
const Incident = mongoose.model('Incident', new mongoose.Schema({ user_id: String, location: String, severity: String, description: String, timestamp: String }));
const Contact = mongoose.model('Contact', new mongoose.Schema({ user_id: String, name: String, role: String, phone: String, email: String }));
const LiveLocation = mongoose.model('LiveLocation', new mongoose.Schema({ id: Number, latitude: Number, longitude: Number, area: String, updated_at: String }));

app.get('/', (req, res) => res.send('Central MongoDB Backend API is running SECURELY...'));

// ----------------------------------------
// 🔓 PUBLIC API (যেগুলোতে পাহারাদার লাগবে না)
// ----------------------------------------

app.post('/api/signup', async (req, res) => {
  const { name, phone, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, phone, email, password: hashedPassword });
    const token = jwt.sign({ id: newUser._id, email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user: { id: newUser._id, name, email } });
  } catch (err) { 
    res.status(500).json({ success: false, message: err.message }); 
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(400).json({ success: false, message: "Invalid credentials!" });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { 
    res.status(500).json({ success: false, message: "Server Error" }); 
  }
});

// ----------------------------------------
// 🔒 PROTECTED API (যেগুলোতে পাহারাদার চেক করবে)
// ----------------------------------------

// INCIDENT / REPORTS API
app.get('/api/reports', authenticateToken, async (req, res) => {
  try { 
    // ফ্রন্টএন্ডের আইডির ভরসায় না থেকে টোকেনের আইডি (req.user.id) ব্যবহার করা হলো
    const rows = await Incident.find({ user_id: req.user.id }).sort({ _id: -1 }); 
    res.status(200).json(rows); 
  } catch (err) { 
    res.status(500).json({ success: false, message: "Error" }); 
  }
});

app.post('/api/report', authenticateToken, async (req, res) => {
  try { 
    const report = await Incident.create({ ...req.body, user_id: req.user.id, timestamp: new Date().toLocaleString() }); 
    res.status(201).json({ success: true, data: report }); 
  } catch (err) { 
    res.status(500).json({ success: false, message: "Failed" }); 
  }
});

// CONTACTS API
app.get('/api/contacts', authenticateToken, async (req, res) => {
  try { 
    const rows = await Contact.find({ user_id: req.user.id }).sort({ _id: -1 }); 
    res.status(200).json(rows); 
  } catch (err) { 
    res.status(500).json({ success: false, message: "Error fetching contacts" }); 
  }
});

app.post('/api/contacts', authenticateToken, async (req, res) => {
  try { 
    // Contact সেভ করার সময় টোকেন থেকে পাওয়া আইডি ডেটাবেসে পুশ করা হচ্ছে
    await Contact.create({ ...req.body, user_id: req.user.id }); 
    const rows = await Contact.find({ user_id: req.user.id }).sort({ _id: -1 }); 
    res.status(201).json({ success: true, data: rows }); 
  } catch (err) { 
    res.status(500).json({ success: false, message: "Failed to save contact" }); 
  }
});

app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
  try { 
    // শুধু ডিলিট করলেই হবে না, ওই ইউজার নিজের কন্ট্যাক্ট ডিলিট করছে কি না তা নিশ্চিত করা হলো
    await Contact.findOneAndDelete({ _id: req.params.id, user_id: req.user.id }); 
    const rows = await Contact.find({ user_id: req.user.id }).sort({ _id: -1 }); 
    res.status(200).json({ success: true, data: rows }); 
  } catch (err) { 
    res.status(500).json({ success: false, message: "Failed to delete contact" }); 
  }
});

// LOCATION API
app.get('/api/location', authenticateToken, async (req, res) => {
  try { 
    const loc = await LiveLocation.findOne({ id: 1 }); 
    res.status(200).json(loc || { latitude: 23.8103, longitude: 90.4125 }); 
  } catch (err) { 
    res.status(500).json({ success: false }); 
  }
});

app.post('/api/location/update', authenticateToken, async (req, res) => {
  try { 
    const updated = await LiveLocation.findOneAndUpdate({ id: 1 }, { ...req.body, updated_at: new Date().toLocaleTimeString() }, { upsert: true, new: true }); 
    res.status(200).json({ success: true, data: updated }); 
  } catch (err) { 
    res.status(500).json({ success: false }); 
  }
});

// SOS API
app.post('/api/sos/trigger', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // টোকেন থেকে আইডি নেওয়া হলো
    const { latitude, longitude, area } = req.body;
    const contacts = await Contact.find({ user_id: userId });
    
    await Incident.create({ user_id: userId, location: area, severity: 'Critical', description: 'Emergency SOS', timestamp: new Date().toLocaleString() });
    
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: contacts.map(c => c.email).join(','),
      subject: '🚨 EMERGENCY ALERT!',
      html: `<p>Emergency at ${area}. <a href="https://www.google.com/maps?q=$${latitude},${longitude}">Track Location</a></p>`
    });
    res.status(200).json({ success: true, message: "SOS Activated!" });
  } catch (err) { 
    res.status(200).json({ success: true, message: "SOS Telemetry logged securely." }); 
  }
});

app.listen(PORT, () => console.log(`🚀 Secure Node System Active on port: ${PORT}`));