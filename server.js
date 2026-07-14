require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend'); // 🛠️ Nodemailer এর বদলে Resend ইমপোর্ট করা হলো

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'rescueher_super_secret_matrix_key_2026';

// 🛠️ Resend ইনিশিয়ালাইজেশন
const resend = new Resend(process.env.RESEND_API_KEY);

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

// MongoDB Schemas (🛠️ LiveLocation-এ user_id যুক্ত করা হয়েছে যেন লোকেশন জ্যাম না লাগে)
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

// 🛠️ LOCATION API FIX: এখন নির্দিষ্ট ইউজারের আইডি ট্র্যাক করবে, কোনো মিক্সআপ হবে না
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

// 🛠️ SOS API: Resend API ব্যবহার করে ইমেইল পাঠানো (যা Render ফ্রি-তে ব্লক করতে পারবে না)
app.post('/api/sos/trigger', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, area } = req.body;
    
    // 1. Incident Save
    await Incident.create({ user_id: userId, location: area, severity: 'Critical', description: 'Emergency SOS', timestamp: new Date().toLocaleString() });
    
    // 2. Fetch Contacts
    const contacts = await Contact.find({ user_id: userId });
    
    // 3. Filter Valid Emails
    const validEmails = contacts.map(c => c.email).filter(email => email && email.includes('@'));

    if (validEmails.length === 0) {
      console.log("No valid email addresses found for user:", userId);
      return res.status(200).json({ success: false, message: "No valid email addresses found in your contacts!" });
    }

    // 4. Send Email via Resend API
    const { data, error } = await resend.emails.send({
      from: 'RescueHer SOS <onboarding@resend.dev>',
      to: validEmails,
      subject: '🚨 EMERGENCY ALERT!',
      html: `<p>Emergency at <strong>${area}</strong>. <br><br><a href="https://maps.google.com/?q=${latitude},${longitude}" target="_blank">Track Location on Google Maps</a></p>`
    });

    if (error) {
      console.error("Resend API Error details:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
    
    res.status(200).json({ success: true, message: "SOS Activated!", mailId: data.id });
  } catch (err) { 
    console.error("🔥 CRITICAL SOS ERROR:", err); 
    res.status(500).json({ success: false, message: err.message }); 
  }
});

app.listen(PORT, () => console.log(`🚀 Secure Node System Active on port: ${PORT}`));