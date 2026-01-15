# Portfolio Setup Guide

## Backend Server Setup

### 1. Install Server Dependencies

```bash
cd server
npm install
```

### 2. Add Your Resume

Place your `resume.pdf` file in the `server/public/` directory:
```
server/
  └── public/
      └── resume.pdf  ← Place your resume here
```

### 3. Start the Server

For production:
```bash
npm start
```

For development (with auto-reload):
```bash
npm run dev
```

The server will run on `http://localhost:3001`

### 4. Test the Resume Download

Visit `http://localhost:3001/api/resume` in your browser to test the download.

---

## Frontend Setup

### 1. Create Environment File

Copy the example environment file:
```bash
cp .env.example .env
```

### 2. Configure API URL

Edit `.env` and set your server URL:

**For local development:**
```
REACT_APP_API_URL=http://localhost:3001
```

**For production (when deploying to GitHub Pages):**
```
REACT_APP_API_URL=http://your-server-ip:3001
```

Or if you have a domain:
```
REACT_APP_API_URL=https://api.brettsantema.com
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Start the Frontend

```bash
npm start
```

---

## Production Deployment

### Server (Your PC)

1. **Install PM2 for process management:**
```bash
npm install -g pm2
```

2. **Start the server with PM2:**
```bash
cd server
pm2 start server.js --name portfolio-server
pm2 save
pm2 startup
```

3. **Configure firewall to allow port 3001**

4. **Update CORS in server.js:**
Replace the origin in `server/server.js`:
```javascript
app.use(cors({
  origin: 'https://yourusername.github.io', // Your GitHub Pages URL
  methods: ['GET', 'POST'],
  credentials: true
}));
```

### Frontend (GitHub Pages)

1. **Update production .env:**
```
REACT_APP_API_URL=http://your-server-ip:3001
```

2. **Build and deploy:**
```bash
npm run build
npm run deploy
```

---

## Troubleshooting

### Resume not downloading
- Ensure `resume.pdf` is in `server/public/` directory
- Check server is running: `http://localhost:3001/api/health`
- Check file permissions

### CORS errors
- Update the CORS origin in `server/server.js` to match your GitHub Pages URL
- Restart the server after changes

### Connection refused
- Verify server is running
- Check firewall settings
- Ensure port 3001 is not blocked

---

## Future: Galaga Leaderboard

The server is already set up with a placeholder endpoint for the Galaga leaderboard at `/api/leaderboard`. This will be implemented when you're ready to add that feature.
