const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Leaderboard data file path
const LEADERBOARD_FILE = path.join(__dirname, 'data', 'leaderboard.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize leaderboard file if it doesn't exist
if (!fs.existsSync(LEADERBOARD_FILE)) {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify({ scores: [] }, null, 2));
}

// Helper functions for leaderboard
const readLeaderboard = () => {
  try {
    const data = fs.readFileSync(LEADERBOARD_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading leaderboard:', error);
    return { scores: [] };
  }
};

const writeLeaderboard = (data) => {
  try {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing leaderboard:', error);
    return false;
  }
};

// Enable CORS for your GitHub Pages domain
app.use(cors({
  origin: '*', // Change this to your GitHub Pages URL in production: 'https://yourusername.github.io'
  methods: ['GET', 'POST'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Resume download endpoint
app.get('/api/resume', (req, res) => {
  const resumePath = path.join(__dirname, 'public', 'resume.pdf');
  res.download(resumePath, 'Brett_Santema_Resume.pdf', (err) => {
    if (err) {
      console.error('Error downloading resume:', err);
      res.status(404).json({ error: 'Resume not found' });
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get leaderboard scores with pagination
app.get('/api/leaderboard', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const leaderboard = readLeaderboard();
  const sortedScores = leaderboard.scores.sort((a, b) => b.score - a.score);

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedScores = sortedScores.slice(startIndex, endIndex);

  res.json({
    scores: paginatedScores,
    currentPage: page,
    totalPages: Math.ceil(sortedScores.length / limit),
    totalScores: sortedScores.length
  });
});

// Submit a new score
app.post('/api/leaderboard', (req, res) => {
  const { name, company, score, spaceshipType, themeColor } = req.body;

  // Validate required fields
  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Name and score are required' });
  }

  // Sanitize and validate input
  const newScore = {
    id: Date.now().toString(),
    name: name.trim().substring(0, 30),
    company: company ? company.trim().substring(0, 30) : null,
    score: Math.max(0, Math.floor(score)),
    spaceshipType: typeof spaceshipType === 'number' ? spaceshipType : 0,
    themeColor: themeColor || '#00ff00',
    createdAt: new Date().toISOString()
  };

  const leaderboard = readLeaderboard();
  leaderboard.scores.push(newScore);

  if (writeLeaderboard(leaderboard)) {
    // Return the rank of the new score
    const sortedScores = leaderboard.scores.sort((a, b) => b.score - a.score);
    const rank = sortedScores.findIndex(s => s.id === newScore.id) + 1;

    res.status(201).json({
      message: 'Score submitted successfully',
      score: newScore,
      rank: rank
    });
  } else {
    res.status(500).json({ error: 'Failed to save score' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Resume available at: http://localhost:${PORT}/api/resume`);
  console.log(`Leaderboard available at: http://localhost:${PORT}/api/leaderboard`);
});
