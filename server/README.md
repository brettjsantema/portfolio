# Portfolio Backend Server

This server handles:
- Resume downloads
- Future: Galaga leaderboard functionality

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Place your `resume.pdf` file in the `server/public/` directory

3. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## Endpoints

- `GET /api/resume` - Download resume.pdf
- `GET /api/health` - Server health check
- `GET /api/leaderboard` - Leaderboard (coming soon)

## Running the Server

The server runs on port 3001 by default. You can change this by setting the PORT environment variable:

```bash
PORT=8080 npm start
```

## Production Deployment

When deploying to your PC server:

1. Update the CORS origin in `server.js` to your GitHub Pages URL
2. Ensure port 3001 is accessible from the internet
3. Consider using a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name portfolio-server
pm2 save
pm2 startup
```

## Connecting from GitHub Pages

Update your GitHub Pages site to point to your server:
- Resume link: `http://your-server-ip:3001/api/resume`
- Or use a domain name if you have one configured
