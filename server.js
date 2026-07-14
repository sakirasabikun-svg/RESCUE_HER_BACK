// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');

// const app = express();
// const PORT = process.env.PORT || 5000;
// const JWT_SECRET = process.env.JWT_SECRET || 'rescueher_super_secret_matrix_key_2026';

// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected Successfully!"))
//   .catch(err => console.error("❌ MongoDB Connection Error:", err));

// // MongoDB Schemas & Models
// const User = mongoose.model('User', new mongoose.Schema({ name: String, phone: String, blood_group: String, email: { type: String, unique: true }, password: String }));
// const Incident = mongoose.model('Incident', new mongoose.Schema({ user_id: String, location: String, severity: String, description: String, timestamp: String }));
// const Contact = mongoose.model('Contact', new mongoose.Schema({ user_id: String, name: String, role: String, phone: String, email: String }));
// const LiveLocation = mongoose.model('LiveLocation', new mongoose.Schema({ id: Number, latitude: Number, longitude: Number, area: String, updated_at: String }));

// app.get('/', (req, res) => res.send('Central MongoDB Backend API is running smoothly...'));

// // AUTH API
// app.post('/api/signup', async (req, res) => {
//   const { name, phone, email, password } = req.body;
//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = await User.create({ name, phone, email, password: hashedPassword });
//     const token = jwt.sign({ id: newUser._id, email }, JWT_SECRET, { expiresIn: '7d' });
//     res.status(201).json({ success: true, token, user: { id: newUser._id, name, email } });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// });

// app.post('/api/login', async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });
//     if (!user || !(await bcrypt.compare(req.body.password, user.password))) return res.status(400).json({ success: false, message: "Invalid credentials!" });
//     const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
//     res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
//   } catch (err) { res.status(500).json({ success: false, message: "Server Error" }); }
// });

// // INCIDENT / REPORTS API
// app.get('/api/reports', async (req, res) => {
//   try { const rows = await Incident.find({ user_id: req.query.userId }).sort({ _id: -1 }); res.status(200).json(rows); } 
//   catch (err) { res.status(500).json({ success: false, message: "Error" }); }
// });

// app.post('/api/report', async (req, res) => {
//   try { const report = await Incident.create({ ...req.body, timestamp: new Date().toLocaleString() }); res.status(201).json({ success: true, data: report }); } 
//   catch (err) { res.status(500).json({ success: false, message: "Failed" }); }
// });

// // CONTACTS API
// app.get('/api/contacts', async (req, res) => {
//   try { const rows = await Contact.find({ user_id: req.query.userId }).sort({ _id: -1 }); res.status(200).json(rows); } 
//   catch (err) { res.status(500).json({ success: false, message: "Error" }); }
// });

// app.post('/api/contacts', async (req, res) => {
//   try { await Contact.create(req.body); const rows = await Contact.find({ user_id: req.body.userId }).sort({ _id: -1 }); res.status(201).json({ success: true, data: rows }); } 
//   catch (err) { res.status(500).json({ success: false, message: "Failed" }); }
// });

// app.delete('/api/contacts/:id', async (req, res) => {
//   try { await Contact.findByIdAndDelete(req.params.id); const rows = await Contact.find({ user_id: req.query.userId }).sort({ _id: -1 }); res.status(200).json({ success: true, data: rows }); } 
//   catch (err) { res.status(500).json({ success: false, message: "Failed" }); }
// });

// // LOCATION API
// app.get('/api/location', async (req, res) => {
//   try { const loc = await LiveLocation.findOne({ id: 1 }); res.status(200).json(loc || { latitude: 23.8103, longitude: 90.4125 }); } 
//   catch (err) { res.status(500).json({ success: false }); }
// });

// app.post('/api/location/update', async (req, res) => {
//   try { const updated = await LiveLocation.findOneAndUpdate({ id: 1 }, { ...req.body, updated_at: new Date().toLocaleTimeString() }, { upsert: true, new: true }); res.status(200).json({ success: true, data: updated }); } 
//   catch (err) { res.status(500).json({ success: false }); }
// });

// // SOS API
// app.post('/api/sos/trigger', async (req, res) => {
//   try {
//     const { userId, latitude, longitude, area } = req.body;
//     const contacts = await Contact.find({ user_id: userId });
//     await Incident.create({ user_id: userId, location: area, severity: 'Critical', description: 'Emergency SOS', timestamp: new Date().toLocaleString() });
    
//     const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: contacts.map(c => c.email).join(','),
//       subject: '🚨 EMERGENCY ALERT!',
//       html: `<p>Emergency at ${area}. <a href="https://www.google.com/maps?q=$${latitude},${longitude}">Track Location</a></p>`
//     });
//     res.status(200).json({ success: true, message: "SOS Activated!" });
//   } catch (err) { res.status(200).json({ success: true, message: "SOS Telemetry logged securely." }); }
// });

// app.listen(PORT, () => console.log(`Node & MongoDB System Active -> Running on port: ${PORT}`));











// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');

// const app = express();
// const PORT = process.env.PORT || 5000;
// const JWT_SECRET = process.env.JWT_SECRET || 'rescueher_super_secret_matrix_key_2026';

// app.use(cors());
// app.use(express.json());

// // 🛡️ Middleware: সিকিউরিটি পাহারাদার
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) return res.status(401).json({ success: false, message: "Access Denied: No Token Provided" });

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ success: false, message: "Invalid or Expired Token" });
//     req.user = user; 
//     next();
//   });
// };

// // MongoDB Connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected Successfully!"))
//   .catch(err => console.error("❌ MongoDB Connection Error:", err));

// // MongoDB Schemas
// const User = mongoose.model('User', new mongoose.Schema({ name: String, phone: String, blood_group: String, email: { type: String, unique: true }, password: String }));
// const Incident = mongoose.model('Incident', new mongoose.Schema({ user_id: String, location: String, severity: String, description: String, timestamp: String }));
// const Contact = mongoose.model('Contact', new mongoose.Schema({ user_id: String, name: String, role: String, phone: String, email: String }));
// const LiveLocation = mongoose.model('LiveLocation', new mongoose.Schema({ id: Number, latitude: Number, longitude: Number, area: String, updated_at: String }));

// app.get('/', (req, res) => res.send('Central MongoDB Backend API is running SECURELY...'));

// // AUTH API
// app.post('/api/signup', async (req, res) => {
//   try {
//     const hashedPassword = await bcrypt.hash(req.body.password, 10);
//     const newUser = await User.create({ ...req.body, password: hashedPassword });
//     const token = jwt.sign({ id: newUser._id, email: req.body.email }, JWT_SECRET, { expiresIn: '7d' });
//     res.status(201).json({ success: true, token, user: { id: newUser._id, name: req.body.name, email: req.body.email } });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// });

// app.post('/api/login', async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });
//     if (!user || !(await bcrypt.compare(req.body.password, user.password))) return res.status(400).json({ success: false, message: "Invalid credentials!" });
//     const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
//     res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
//   } catch (err) { res.status(500).json({ success: false, message: "Server Error" }); }
// });

// // REPORTS API
// app.get('/api/reports', authenticateToken, async (req, res) => {
//   try { 
//     const rows = await Incident.find({ user_id: req.user.id }).sort({ _id: -1 }); 
//     res.status(200).json(rows); 
//   } catch (err) { res.status(500).json({ success: false, message: "Error" }); }
// });

// app.post('/api/report', authenticateToken, async (req, res) => {
//   try { 
//     const report = await Incident.create({ ...req.body, user_id: req.user.id, timestamp: new Date().toLocaleString() }); 
//     res.status(201).json({ success: true, data: report }); 
//   } catch (err) { res.status(500).json({ success: false, message: "Failed" }); }
// });

// // CONTACTS API
// app.get('/api/contacts', authenticateToken, async (req, res) => {
//   try { 
//     const rows = await Contact.find({ user_id: req.user.id }).sort({ _id: -1 }); 
//     res.status(200).json(rows); 
//   } catch (err) { res.status(500).json({ success: false, message: "Error fetching contacts" }); }
// });

// app.post('/api/contacts', authenticateToken, async (req, res) => {
//   try { 
//     await Contact.create({ ...req.body, user_id: req.user.id }); 
//     const rows = await Contact.find({ user_id: req.user.id }).sort({ _id: -1 }); 
//     res.status(201).json({ success: true, data: rows }); 
//   } catch (err) { res.status(500).json({ success: false, message: "Failed to save contact" }); }
// });

// // 🛠️ DELETE API FIX: ডিলিট এখন ১০০% কাজ করবে
// app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
//   try { 
//     console.log("Attempting to delete contact ID:", req.params.id);
//     await Contact.findOneAndDelete({ _id: req.params.id, user_id: req.user.id }); 
//     const rows = await Contact.find({ user_id: req.user.id }).sort({ _id: -1 }); 
//     res.status(200).json({ success: true, data: rows }); 
//   } catch (err) { 
//     console.error("Delete Error:", err);
//     res.status(500).json({ success: false, message: "Failed to delete contact" }); 
//   }
// });

// // LOCATION API
// app.get('/api/location', authenticateToken, async (req, res) => {
//   try { const loc = await LiveLocation.findOne({ id: 1 }); res.status(200).json(loc || { latitude: 23.8103, longitude: 90.4125 }); } catch (err) { res.status(500).json({ success: false }); }
// });

// app.post('/api/location/update', authenticateToken, async (req, res) => {
//   try { 
//     const updated = await LiveLocation.findOneAndUpdate({ id: 1 }, { ...req.body, updated_at: new Date().toLocaleTimeString() }, { upsert: true, returnDocument: 'after' }); 
//     res.status(200).json({ success: true, data: updated }); 
//   } catch (err) { res.status(500).json({ success: false }); }
// });

// // 🛠️ SOS API FIX: ক্র্যাশ প্রুফ ইমেইল সেন্ডার
// app.post('/api/sos/trigger', authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { latitude, longitude, area } = req.body;
    
//     // 1. Incident Save
//     await Incident.create({ user_id: userId, location: area, severity: 'Critical', description: 'Emergency SOS', timestamp: new Date().toLocaleString() });
    
//     // 2. Fetch Contacts
//     const contacts = await Contact.find({ user_id: userId });
    
//     // 3. Filter Valid Emails (খালি ইমেইল বা @ ছাড়া ইমেইল বাদ দেবে)
//     const validEmails = contacts.map(c => c.email).filter(email => email && email.includes('@')).join(',');

//     if (!validEmails) {
//       console.log("No valid email addresses found for user:", userId);
//       return res.status(200).json({ success: false, message: "No valid email addresses found in your contacts!" });
//     }

//     // 4. Send Email
//     const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: validEmails,
//       subject: '🚨 EMERGENCY ALERT!',
//       html: `<p>Emergency at ${area}. <br><a href="https://www.google.com/maps?q=${latitude},${longitude}">Track Location on Google Maps</a></p>`
//     });
    
//     res.status(200).json({ success: true, message: "SOS Activated!" });
//   } catch (err) { 
//     console.error("🔥 CRITICAL SOS ERROR:", err); // এখন সমস্যা হলে Render Log-এ বিশাল করে দেখাবে!
//     res.status(500).json({ success: false, message: err.message }); 
//   }
// });

// app.listen(PORT, () => console.log(`🚀 Secure Node System Active on port: ${PORT}`));









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
const LiveLocation = mongoose.model('LiveLocation', new mongoose.Schema({ id: Number, latitude: Number, longitude: Number, area: String, updated_at: String }));

app.get('/', (req, res) => res.send('RescueHer System Online - Status: SECURE'));

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
  try { const rows = await Incident.find({ user_id: req.user.id }).sort({ _id: -1 }); res.status(200).json(rows); } 
  catch (err) { res.status(500).json({ success: false, message: "Error" }); }
});

app.post('/api/report', authenticateToken, async (req, res) => {
  try { const report = await Incident.create({ ...req.body, user_id: req.user.id, timestamp: new Date().toLocaleString() }); res.status(201).json({ success: true, data: report }); } 
  catch (err) { res.status(500).json({ success: false, message: "Failed" }); }
});

// CONTACTS API
app.get('/api/contacts', authenticateToken, async (req, res) => {
  try { const rows = await Contact.find({ user_id: req.user.id }).sort({ _id: -1 }); res.status(200).json(rows); } 
  catch (err) { res.status(500).json({ success: false, message: "Error" }); }
});

app.post('/api/contacts', authenticateToken, async (req, res) => {
  try { await Contact.create({ ...req.body, user_id: req.user.id }); const rows = await Contact.find({ user_id: req.user.id }).sort({ _id: -1 }); res.status(201).json({ success: true, data: rows }); } 
  catch (err) { res.status(500).json({ success: false, message: "Failed" }); }
});

app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
  try { await Contact.findOneAndDelete({ _id: req.params.id, user_id: req.user.id }); const rows = await Contact.find({ user_id: req.user.id }).sort({ _id: -1 }); res.status(200).json({ success: true, data: rows }); } 
  catch (err) { res.status(500).json({ success: false, message: "Failed" }); }
});

// LOCATION API
app.get('/api/location', authenticateToken, async (req, res) => {
  try { const loc = await LiveLocation.findOne({ id: 1 }); res.status(200).json(loc || { latitude: 23.8103, longitude: 90.4125 }); } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/api/location/update', authenticateToken, async (req, res) => {
  try { const updated = await LiveLocation.findOneAndUpdate({ id: 1 }, { ...req.body, updated_at: new Date().toLocaleTimeString() }, { upsert: true, returnDocument: 'after' }); res.status(200).json({ success: true, data: updated }); } 
  catch (err) { res.status(500).json({ success: false }); }
});

// SOS API (Optimized with Timeout Settings)
app.post('/api/sos/trigger', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, area } = req.body;
    await Incident.create({ user_id: userId, location: area, severity: 'Critical', description: 'Emergency SOS', timestamp: new Date().toLocaleString() });
    
    const contacts = await Contact.find({ user_id: userId });
    const validEmails = contacts.map(c => c.email).filter(email => email && email.includes('@')).join(',');

    if (!validEmails) return res.status(200).json({ success: false, message: "No valid email addresses found!" });

    const transporter = nodemailer.createTransport({ 
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      connectionTimeout: 20000,
      socketTimeout: 20000
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: validEmails,
      subject: '🚨 EMERGENCY ALERT!',
      html: `<p>Emergency at ${area}. <br><a href="http://maps.google.com/?q=${latitude},${longitude}">Track Location on Google Maps</a></p>`
    });
    
    res.status(200).json({ success: true, message: "SOS Activated!" });
  } catch (err) { 
    console.error("🔥 CRITICAL SOS ERROR:", err); 
    res.status(500).json({ success: false, message: "SMTP Timeout or Config error. Check Logs." }); 
  }
});

app.listen(PORT, () => console.log(`🚀 Secure Node System Active on port: ${PORT}`));