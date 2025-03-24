const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors({
  origin: 'http://localhost:3001', // Update to match frontend port
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());

// Mock user data
const users = [
  { id: 1, email: 'user@example.com', password: 'password123' },
];

// Mock dashboard data
const dashboardData = {
  cards: [
    { id: 1, title: 'Card 1' },
    { id: 2, title: 'Card 2' },
    { id: 3, title: 'Card 3' },
  ],
};

// Mock map data
const mapData = {
  1: { cardId: 1, location: { lat: 20.5937, lng: 78.9629 } },
  2: { cardId: 2, location: { lat: 20.5937, lng: 78.9629 } },
  3: { cardId: 3, location: { lat: 20.5937, lng: 78.9629 } },
};

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'User not logged in' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({ token, message: 'Login successful' });
});

// Dashboard endpoint (protected)
app.get('/api/dashboard', authenticateToken, (req, res) => {
  res.json(dashboardData);
});

// Map endpoint (protected)
app.get('/api/map/:cardId', authenticateToken, (req, res) => {
  const { cardId } = req.params;
  const mapInfo = mapData[cardId];

  if (!mapInfo) {
    return res.status(404).json({ message: 'Card not found' });
  }

  res.json(mapInfo);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});