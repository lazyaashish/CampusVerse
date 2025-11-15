const fileUpload = require('express-fileupload');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const DATA_DIR = path.join(__dirname, 'data');
const JWT_SECRET = process.env.JWT_SECRET || 'campushub_dev_secret';
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

// helpers
function readJSON(filename){
  const p = path.join(DATA_DIR, filename);
  if(!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p));
}
function writeJSON(filename, obj){
  const p = path.join(DATA_DIR, filename);
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

// initialize default data files
const defaults = {
  users: [],
  events: [],
  notices: [],
  clubs: [],
  complaints: [],
  feedback: []
};
Object.keys(defaults).forEach(k => {
  const p = path.join(DATA_DIR, k + '.json');
  if(!fs.existsSync(p)){
    fs.writeFileSync(p, JSON.stringify(defaults[k], null, 2));
  }
});

// JWT + Auth middleware
function generateToken(user){
  return jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next){
  const header = req.headers.authorization;
  if(!header) return res.status(401).json({error:'No authorization header'});
  const parts = header.split(' ');
  if(parts.length !== 2) return res.status(401).json({error:'Invalid authorization header'});
  const token = parts[1];
  try{
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  }catch(e){
    return res.status(401).json({error:'Invalid token'});
  }
}

function adminMiddleware(req, res, next){
  if(!req.user) return res.status(401).json({error:'Unauthorized'});
  if(req.user.role !== 'admin') return res.status(403).json({error:'Admin only'});
  next();
}

// -------- AUTH ROUTES --------
app.post('/api/auth/signup', async (req, res) => {
  const { username, password, name, role } = req.body;
  if(!username || !password) return res.status(400).json({ error: 'username and password required' });
  const users = readJSON('users.json') || [];
  if(users.find(u => u.username === username)) return res.status(409).json({ error: 'User exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = { 
    id: uuidv4(), 
    username, 
    password: hashed, 
    name: name || username, 
    role: role || 'student', 
    createdAt: new Date().toISOString() 
  };

  users.push(user);
  writeJSON('users.json', users);
  const token = generateToken(user);

  res.json({ token, role: user.role, name: user.name });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) return res.status(400).json({ error: 'username and password required' });

  const users = readJSON('users.json') || [];
  const user = users.find(u => u.username === username);
  if(!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if(!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = generateToken(user);
  res.json({ token, role: user.role, name: user.name });
});

// -------- PUBLIC GET ROUTES --------
app.get('/api/events', (req, res) => {
  res.json(readJSON('events.json') || []);
});

app.get('/api/notices', (req, res) => {
  res.json(readJSON('notices.json') || []);
});

app.get('/api/clubs', (req, res) => {
  res.json(readJSON('clubs.json') || []);
});

// -------- STUDENT ACTIONS --------
app.post('/api/complaints', authMiddleware, (req, res) => {
  const { title, description, type } = req.body;
  if(!title || !description) return res.status(400).json({ error: 'title and description required' });

  const complaints = readJSON('complaints.json') || [];
  const item = { 
    id: uuidv4(),
    title,
    description,
    type: type || 'general',
    status: 'open',
    createdBy: req.user.id,
    createdAt: new Date().toISOString()
  };

  complaints.push(item);
  writeJSON('complaints.json', complaints);
  res.json({ success:true, complaint: item });
});

app.post('/api/feedback', authMiddleware, (req, res) => {
  const { message, category } = req.body;
  if(!message) return res.status(400).json({ error: 'message required' });

  const feedback = readJSON('feedback.json') || [];
  const item = { 
    id: uuidv4(),
    message,
    category: category || 'general',
    createdBy: req.user.id,
    createdAt: new Date().toISOString()
  };

  feedback.push(item);
  writeJSON('feedback.json', feedback);
  res.json({ success:true, feedback: item });
});

// -------- ADMIN ROUTES --------
app.get('/api/admin/pending', authMiddleware, adminMiddleware, (req, res) => {
  const complaints = readJSON('complaints.json') || [];
  res.json(complaints.filter(c => c.status === 'open'));
});

app.post('/api/admin/approve/:id', authMiddleware, adminMiddleware, (req, res) => {
  const id = req.params.id;
  const complaints = readJSON('complaints.json') || [];
  const idx = complaints.findIndex(c => c.id === id);
  if(idx === -1) return res.status(404).json({ error: 'Not found' });

  complaints[idx].status = 'approved';
  writeJSON('complaints.json', complaints);
  res.json({ success:true, complaint: complaints[idx] });
});

app.post('/api/admin/reject/:id', authMiddleware, adminMiddleware, (req, res) => {
  const id = req.params.id;
  const complaints = readJSON('complaints.json') || [];
  const idx = complaints.findIndex(c => c.id === id);
  if(idx === -1) return res.status(404).json({ error: 'Not found' });

  complaints[idx].status = 'rejected';
  writeJSON('complaints.json', complaints);
  res.json({ success:true, complaint: complaints[idx] });
});

// -------- HEALTH CHECK --------
app.get('/api/health', (req, res) => res.json({ ok:true, version: 'campushub-backend-1.0' }));

// -------- STATIC FILES / FRONTEND --------
app.use('/public', express.static(path.join(__dirname, 'public')));

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
if (fs.existsSync(FRONTEND_DIR)) {
  app.use(express.static(FRONTEND_DIR));
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
  });
}

// -------- IMAGE UPLOAD --------
app.post('/api/events/upload', (req, res) => {
  if (!req.files || !req.files.image) {
    return res.status(400).json({error:"No image uploaded"});
  }

  const img = req.files.image;
  const saveDir = path.join(__dirname, '..', 'frontend', 'assets');

  if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

  const savePath = path.join(saveDir, img.name);

  img.mv(savePath, err => {
    if (err) return res.status(500).json({error:"Upload failed"});
    res.json({success:true, file: img.name});
  });
});

// -------- START SERVER --------
app.listen(PORT, () => console.log('Server ready on port', PORT));
