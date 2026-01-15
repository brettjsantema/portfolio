import React, { useEffect, useRef, useState } from 'react';
import { API_ENDPOINTS } from '../config';
import './GalagaGame.css';

interface GalagaGameProps {
  isPaused: boolean;
  spaceshipType: number;
  themeColor: string;
}

interface Bullet {
  x: number;
  y: number;
  speed: number;
}

interface Alien {
  x: number;
  y: number;
  width: number;
  height: number;
  directionX: number;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  company: string | null;
  score: number;
  spaceshipType: number;
  themeColor: string;
  createdAt: string;
}

const GalagaGame: React.FC<GalagaGameProps> = ({ isPaused, spaceshipType, themeColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spaceshipXRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const bulletsRef = useRef<Bullet[]>([]);
  const spaceshipYRef = useRef<number>(0);
  const aliensRef = useRef<Alien[]>([]);
  const starsRef = useRef<{ x: number; y: number; speed: number; size: number; trail: { x: number; y: number }[] }[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hasKilledFirst, setHasKilledFirst] = useState(false);
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);
  const hasKilledFirstRef = useRef(false);
  const waveRef = useRef(1);
  const verticalSpeedRef = useRef(0.3);
  const [showWaveText, setShowWaveText] = useState(false);
  const showWaveTextRef = useRef(false);
  const [currentWave, setCurrentWave] = useState(1);
  const lastShotTimeRef = useRef(0);

  // Modal states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerCompany, setPlayerCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitRank, setSubmitRank] = useState<number | null>(null);

  // Leaderboard states
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardTotalPages, setLeaderboardTotalPages] = useState(1);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  // Fetch leaderboard data
  const fetchLeaderboard = async (page: number) => {
    setIsLoadingLeaderboard(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.leaderboard}?page=${page}&limit=10`);
      const data = await response.json();
      setLeaderboardData(data.scores);
      setLeaderboardPage(data.currentPage);
      setLeaderboardTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
    setIsLoadingLeaderboard(false);
  };

  // Submit score
  const handleSubmitScore = async () => {
    if (!playerName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(API_ENDPOINTS.leaderboard, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName.trim(),
          company: playerCompany.trim() || null,
          score: score,
          spaceshipType: spaceshipType,
          themeColor: themeColor,
        }),
      });
      const data = await response.json();
      setSubmitRank(data.rank);
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting score:', error);
    }
    setIsSubmitting(false);
  };

  // Open leaderboard modal
  const openLeaderboard = () => {
    setShowLeaderboardModal(true);
    fetchLeaderboard(1);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reference resolution for scaling (1920x1080 as baseline)
    const REF_WIDTH = 1920;
    const REF_HEIGHT = 1080;

    // Get current scale factor based on canvas size
    const getScale = () => {
      // Use the smaller scale to ensure everything fits
      return Math.min(canvas.width / REF_WIDTH, canvas.height / REF_HEIGHT);
    };

    // Base values at reference resolution
    const BASE_SPACESHIP_WIDTH = 40;
    const BASE_SPACESHIP_Y_OFFSET = 80; // Distance from bottom
    const BASE_ALIEN_WIDTH = 60;
    const BASE_ALIEN_HEIGHT = 60;
    const BASE_ALIEN_START_Y = 100;
    const BASE_ALIEN_SPACING = 70;
    const BASE_ALIEN_ROW_SPACING = 50;
    const BASE_ALIEN_VERTICAL_SPEED = 0.3;
    const BASE_ALIEN_HORIZONTAL_SPEED = 1.0;
    const BASE_BULLET_SPEED = 8;
    const BASE_BULLET_WIDTH = 4;
    const BASE_BULLET_HEIGHT = 12;
    const BASE_EDGE_MARGIN = 50;
    const BASE_GAME_OVER_Y = 100; // Distance from bottom for game over trigger
    const BASE_X_SPACING = 25;
    const BASE_X_OFFSET = 150;
    const BASE_PIXEL_SIZE = 6;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse movement - convert to normalized position (0-1)
    const handleMouseMove = (e: MouseEvent) => {
      // Store as ratio of screen width for resolution independence
      spaceshipXRef.current = e.clientX / canvas.width;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Handle spacebar for shooting
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isPaused && !gameOverRef.current) {
        e.preventDefault();
        const currentTime = Date.now();
        // Allow rapid fire with 150ms cooldown
        if (currentTime - lastShotTimeRef.current >= 150) {
          lastShotTimeRef.current = currentTime;
          const scale = getScale();
          const spaceshipWidth = BASE_SPACESHIP_WIDTH * scale;
          // Convert normalized X back to pixel position
          const spaceshipX = Math.max(
            spaceshipWidth,
            Math.min(canvas.width - spaceshipWidth, spaceshipXRef.current * canvas.width)
          );
          bulletsRef.current.push({
            x: spaceshipX / canvas.width, // Store as normalized
            y: spaceshipYRef.current, // Already normalized
            speed: BASE_BULLET_SPEED, // Base speed, will be scaled during update
          });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Spaceship Y position (normalized, 0 = top, 1 = bottom)
    const getSpaceshipY = () => {
      const scale = getScale();
      return (canvas.height - BASE_SPACESHIP_Y_OFFSET * scale) / canvas.height;
    };
    spaceshipYRef.current = getSpaceshipY();

    // Function to spawn a wave of aliens (positions stored as normalized 0-1)
    const spawnWave = (wave: number) => {
      const scale = getScale();
      const alienWidth = BASE_ALIEN_WIDTH * scale;
      const alienHeight = BASE_ALIEN_HEIGHT * scale;
      const startY = (BASE_ALIEN_START_Y * scale) / canvas.height; // Normalized
      const spacing = (BASE_ALIEN_SPACING * scale) / canvas.width; // Normalized
      const rowSpacing = (BASE_ALIEN_ROW_SPACING * scale) / canvas.height; // Normalized

      // Calculate vertical speed with 10% increase per wave (normalized per frame)
      verticalSpeedRef.current = BASE_ALIEN_VERTICAL_SPEED * Math.pow(1.1, wave - 1);

      // Determine starting direction: odd waves go right, even waves go left
      const initialDirection = wave % 2 === 1 ? 1 : -1;

      // Wave patterns repeat every 7 waves
      const patternWave = ((wave - 1) % 7) + 1;

      // Define the formation for each wave pattern
      let formation: number[] = [];

      switch (patternWave) {
        case 1:
          // Wave 1: 2 rows of 5
          formation = [5, 5];
          break;
        case 2:
          // Wave 2: 6, 5, 6
          formation = [6, 5, 6];
          break;
        case 3:
          // Wave 3: Triangle (1, 2, 3, 4, 5, 6)
          formation = [1, 2, 3, 4, 5, 6];
          break;
        case 4:
          // Wave 4: 7, 6, 7
          formation = [7, 6, 7];
          break;
        case 5:
          // Wave 5: 6, 8, 8, 6
          formation = [6, 8, 8, 6];
          break;
        case 6:
          // Wave 6: Inverted triangle (6, 5, 4, 3, 2, 1)
          formation = [6, 5, 4, 3, 2, 1];
          break;
        case 7:
          // Wave 7: Two X formations (9 aliens each, total 18)
          const xSpacing = (BASE_X_SPACING * scale) / canvas.width;
          const xSpacingY = (BASE_X_SPACING * scale) / canvas.height;
          const xOffset = (BASE_X_OFFSET * scale) / canvas.width;
          const xOffsetCenter = (50 * scale) / canvas.width;

          // First X (left side)
          for (let i = 0; i < 5; i++) {
            // Left diagonal
            aliensRef.current.push({
              x: 0.5 - xOffset - i * xSpacing,
              y: startY + i * xSpacingY,
              width: alienWidth,
              height: alienHeight,
              directionX: initialDirection,
            });
            // Right diagonal
            aliensRef.current.push({
              x: 0.5 - xOffset + i * xSpacing,
              y: startY + i * xSpacingY,
              width: alienWidth,
              height: alienHeight,
              directionX: initialDirection,
            });
          }

          // Second X (right side)
          for (let i = 0; i < 5; i++) {
            // Left diagonal
            aliensRef.current.push({
              x: 0.5 + xOffsetCenter - i * xSpacing,
              y: startY + i * xSpacingY,
              width: alienWidth,
              height: alienHeight,
              directionX: initialDirection,
            });
            // Right diagonal
            aliensRef.current.push({
              x: 0.5 + xOffsetCenter + i * xSpacing,
              y: startY + i * xSpacingY,
              width: alienWidth,
              height: alienHeight,
              directionX: initialDirection,
            });
          }

          // Add center alien for each X
          aliensRef.current.push({
            x: 0.5 - xOffset,
            y: startY + 2 * xSpacingY,
            width: alienWidth,
            height: alienHeight,
            directionX: initialDirection,
          });
          aliensRef.current.push({
            x: 0.5 + xOffsetCenter,
            y: startY + 2 * xSpacingY,
            width: alienWidth,
            height: alienHeight,
            directionX: initialDirection,
          });

          return; // Exit early for X pattern
      }

      // Spawn aliens for regular formations (waves 1-6)
      for (let row = 0; row < formation.length; row++) {
        const cols = formation[row];
        for (let col = 0; col < cols; col++) {
          aliensRef.current.push({
            x: 0.5 - (cols * spacing) / 2 + col * spacing,
            y: startY + row * rowSpacing,
            width: alienWidth,
            height: alienHeight,
            directionX: initialDirection,
          });
        }
      }
    };

    // Initialize first wave
    if (aliensRef.current.length === 0) {
      spawnWave(waveRef.current);
    }

    // Helper to get inverse color
    const getInverseColor = (color: string) => {
      const hex = color.replace('#', '');
      const r = 255 - parseInt(hex.substring(0, 2), 16);
      const g = 255 - parseInt(hex.substring(2, 4), 16);
      const b = 255 - parseInt(hex.substring(4, 6), 16);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    // Initialize stars only once
    if (starsRef.current.length === 0) {
      for (let i = 0; i < 50; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: Math.random() * 1 + 0.3,
          size: Math.random() * 2 + 1,
          trail: [],
        });
      }
    }

    // Draw spaceship - retro pixel art style
    const drawSpaceship = (x: number, y: number) => {
      const scale = getScale();
      const pixelSize = BASE_PIXEL_SIZE * scale;

      // Different spaceship designs
      const shipPatterns = [
        // Design 0: Classic
        [
          [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
          [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
          [0, 0, 1, 1, 2, 2, 2, 1, 1, 0, 0],
          [0, 1, 1, 2, 2, 3, 2, 2, 1, 1, 0],
          [1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1],
          [1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0],
          [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
        ],
        // Design 1: Wide Wing
        [
          [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0],
          [0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0],
          [1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1],
          [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
          [1, 2, 2, 1, 1, 1, 1, 1, 2, 2, 1],
          [1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
          [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        ],
        // Design 2: Arrow
        [
          [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0],
          [0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0],
          [0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 0],
          [0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0],
          [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
          [1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 1],
          [1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
          [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        ],
        // Design 3: Heavy
        [
          [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
          [0, 0, 1, 2, 2, 3, 2, 2, 1, 0, 0],
          [0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0],
          [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
          [1, 2, 2, 1, 2, 2, 2, 1, 2, 2, 1],
          [1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1],
          [1, 1, 0, 0, 1, 2, 1, 0, 0, 1, 1],
          [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
        ],
        // Design 4: Compact
        [
          [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
          [0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0],
          [0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 0],
          [0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0],
          [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
          [1, 2, 1, 2, 2, 2, 2, 2, 1, 2, 1],
          [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
        ],
      ];

      const shipPattern = shipPatterns[spaceshipType % shipPatterns.length];
      const offsetX = x - (shipPattern[0].length * pixelSize) / 2.0;
      const offsetY = y;
      // Use ceiling for pixel size to ensure overlap and eliminate gaps
      const drawSize = Math.ceil(pixelSize);

      shipPattern.forEach((row, rowIndex) => {
        row.forEach((pixel, colIndex) => {
          if (pixel > 0) {
            // Color based on pixel value and theme
            if (pixel === 1) ctx.fillStyle = themeColor;
            else if (pixel === 2) ctx.fillStyle = adjustColor(themeColor, -30);
            else if (pixel === 3) ctx.fillStyle = '#ffffff';

            ctx.fillRect(
              (offsetX + colIndex * pixelSize),
              (offsetY + rowIndex * pixelSize),
              drawSize,
              drawSize
            );
          }
        });
      });
    };

    // Helper to darken color
    const adjustColor = (color: string, amount: number) => {
      const hex = color.replace('#', '');
      const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
      const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
      const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    // Draw stars with trails
    const drawStars = () => {
      starsRef.current.forEach((star) => {
        // Draw trail (fading from old to new)
        star.trail.forEach((pos, index) => {
          const opacity = (index + 1) / (star.trail.length + 1) * 0.5;
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, star.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        });
        // Draw main star
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Update stars position
    const updateStars = () => {
      starsRef.current.forEach((star) => {
        // Add current position to trail
        star.trail.push({ x: star.x, y: star.y });
        // Keep trail length based on speed (faster stars = longer trails)
        const maxTrailLength = Math.floor(star.speed * 5);
        while (star.trail.length > maxTrailLength) {
          star.trail.shift();
        }

        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
          star.trail = []; // Clear trail when star wraps
        }
      });
    };

    // Draw bullets (convert from normalized to pixel coordinates)
    const drawBullets = () => {
      const scale = getScale();
      const bulletWidth = BASE_BULLET_WIDTH * scale;
      const bulletHeight = BASE_BULLET_HEIGHT * scale;
      ctx.fillStyle = themeColor;
      bulletsRef.current.forEach((bullet) => {
        const pixelX = bullet.x * canvas.width;
        const pixelY = bullet.y * canvas.height;
        ctx.fillRect(pixelX - bulletWidth / 2, pixelY, bulletWidth, bulletHeight);
      });
    };

    // Update bullets position (normalized coordinates)
    const updateBullets = () => {
      const scale = getScale();
      // Normalize bullet speed based on reference height
      const normalizedSpeed = (BASE_BULLET_SPEED * scale) / canvas.height;

      // Move bullets upward
      bulletsRef.current.forEach((bullet) => {
        bullet.y -= normalizedSpeed;
      });

      // Remove bullets that are off-screen
      bulletsRef.current = bulletsRef.current.filter((bullet) => bullet.y > -0.05);
    };

    // Draw aliens (convert from normalized to pixel coordinates)
    const drawAliens = () => {
      const inverseColor = getInverseColor(themeColor);
      const scale = getScale();
      const pixelSize = BASE_PIXEL_SIZE * scale;

      // Use ceiling for pixel size to ensure overlap and eliminate gaps
      const drawSize = Math.ceil(pixelSize);

      aliensRef.current.forEach((alien) => {
        // Simple alien pattern
        const alienPattern = [
          [0, 1, 1, 1, 1, 1, 0],
          [1, 1, 2, 1, 2, 1, 1],
          [1, 1, 1, 1, 1, 1, 1],
          [1, 2, 1, 1, 1, 2, 1],
          [0, 1, 0, 0, 0, 1, 0],
        ];

        const pixelX = alien.x * canvas.width;
        const pixelY = alien.y * canvas.height;
        const offsetX = pixelX - (alienPattern[0].length * pixelSize) / 2;
        const offsetY = pixelY;

        alienPattern.forEach((row, rowIndex) => {
          row.forEach((pixel, colIndex) => {
            if (pixel > 0) {
              if (pixel === 1) ctx.fillStyle = inverseColor;
              else if (pixel === 2) ctx.fillStyle = adjustColor(inverseColor, 30);

              ctx.fillRect(
                Math.floor(offsetX + colIndex * pixelSize),
                Math.floor(offsetY + rowIndex * pixelSize),
                drawSize,
                drawSize
              );
            }
          });
        });
      });
    };

    // Update aliens position (normalized coordinates)
    const updateAliens = () => {
      const scale = getScale();
      // Normalize speeds based on reference dimensions
      const normalizedHorizontalSpeed = (BASE_ALIEN_HORIZONTAL_SPEED * scale) / canvas.width;
      const normalizedVerticalSpeed = (verticalSpeedRef.current * scale) / canvas.height;
      const edgeMargin = (BASE_EDGE_MARGIN * scale) / canvas.width;
      const gameOverY = 1 - (BASE_GAME_OVER_Y * scale) / canvas.height;

      // Check if any alien hit the edge to change direction for all
      let shouldChangeDirection = false;
      aliensRef.current.forEach((alien) => {
        if (alien.x <= edgeMargin || alien.x >= 1 - edgeMargin) {
          shouldChangeDirection = true;
        }
      });

      // Change direction for all aliens if any hit the edge
      if (shouldChangeDirection) {
        aliensRef.current.forEach((alien) => {
          alien.directionX *= -1;
        });
      }

      // Move all aliens
      aliensRef.current.forEach((alien) => {
        // Move diagonally down (normalized)
        alien.x += alien.directionX * normalizedHorizontalSpeed;
        alien.y += normalizedVerticalSpeed;

        // Check if alien reached bottom - game over
        if (alien.y >= gameOverY) {
          setGameOver(true);
          gameOverRef.current = true;
        }
      });
    };

    // Check collision between bullets and aliens (all in normalized coordinates)
    const checkCollisions = () => {
      const scale = getScale();
      // Collision thresholds in normalized units
      const alienHalfWidth = (BASE_ALIEN_WIDTH * scale) / canvas.width / 2;
      const alienHalfHeight = (BASE_ALIEN_HEIGHT * scale) / canvas.height / 2;

      bulletsRef.current.forEach((bullet, bulletIndex) => {
        aliensRef.current.forEach((alien, alienIndex) => {
          // Simple AABB collision detection (normalized)
          if (
            bullet.x >= alien.x - alienHalfWidth &&
            bullet.x <= alien.x + alienHalfWidth &&
            bullet.y >= alien.y - alienHalfHeight &&
            bullet.y <= alien.y + alienHalfHeight
          ) {
            // Remove bullet and alien
            bulletsRef.current.splice(bulletIndex, 1);
            aliensRef.current.splice(alienIndex, 1);

            // Update score
            scoreRef.current += 1;
            setScore(scoreRef.current);
            if (!hasKilledFirstRef.current) {
              hasKilledFirstRef.current = true;
              setHasKilledFirst(true);
            }
          }
        });
      });
    };

    // Animation loop
    const animate = () => {
      const scale = getScale();

      // Clear canvas with solid black (star trails are drawn explicitly)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update spaceship Y position in case of resize
      spaceshipYRef.current = getSpaceshipY();

      // Draw and update stars
      if (!isPaused && !gameOverRef.current) {
        updateStars();
        updateBullets();
        updateAliens();
        checkCollisions();

        // Check if wave is cleared and spawn next wave
        if (aliensRef.current.length === 0) {
          // Show wave text after first wave is cleared
          if (waveRef.current === 1 && !showWaveTextRef.current) {
            showWaveTextRef.current = true;
            setShowWaveText(true);
          }
          waveRef.current += 1;
          setCurrentWave(waveRef.current);
          spawnWave(waveRef.current);
        }
      }
      drawStars();

      // Draw aliens
      drawAliens();

      // Draw bullets
      drawBullets();

      // Draw spaceship
      const spaceshipWidth = BASE_SPACESHIP_WIDTH * scale;
      const spaceshipPixelX = Math.max(
        spaceshipWidth,
        Math.min(canvas.width - spaceshipWidth, spaceshipXRef.current * canvas.width)
      );
      const spaceshipPixelY = spaceshipYRef.current * canvas.height;
      drawSpaceship(spaceshipPixelX, spaceshipPixelY);

      // Draw score if player has killed first alien
      if (hasKilledFirstRef.current) {
        const fontSize = Math.max(12, 16 * scale);
        ctx.fillStyle = themeColor;
        ctx.font = `${fontSize}px "Press Start 2P", cursive`;
        ctx.fillText(`Score: ${scoreRef.current}`, 20 * scale, 40 * scale);

        // Draw wave text if first wave is cleared
        if (showWaveTextRef.current) {
          ctx.fillText(`Wave: ${waveRef.current}`, 20 * scale, 70 * scale);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, spaceshipType, themeColor]);

  // Helper to render mini spaceship in leaderboard
  const renderMiniSpaceship = (type: number, color: string) => {
    const shipPatterns = [
      [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[0,1,0,1,0]],
      [[0,0,1,0,0],[1,1,1,1,1],[1,1,1,1,1],[1,0,0,0,1]],
      [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[1,0,0,0,1]],
      [[0,1,1,1,0],[1,1,1,1,1],[1,1,1,1,1],[0,1,0,1,0]],
      [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[1,0,1,0,1]],
    ];
    const pattern = shipPatterns[type % shipPatterns.length];
    return (
      <div className="mini-spaceship">
        {pattern.map((row, i) => (
          <div key={i} className="mini-spaceship-row">
            {row.map((pixel, j) => (
              <div
                key={j}
                className="mini-spaceship-pixel"
                style={{ backgroundColor: pixel ? color : 'transparent' }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <canvas ref={canvasRef} className="galaga-canvas" />

      {/* Game Over Modal */}
      {gameOver && !showSubmitModal && !showLeaderboardModal && (
        <div className="game-over-modal">
          <div className="game-over-content">
            <h1>GAME OVER</h1>
            <p className="final-score">Final Score: {score}</p>
            <div className="game-over-buttons">
              <button onClick={() => window.location.reload()} className="game-over-btn">
                Restart
              </button>
              <button onClick={() => setShowSubmitModal(true)} className="game-over-btn">
                Submit Score
              </button>
              <button onClick={openLeaderboard} className="game-over-btn">
                Leaderboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Score Modal */}
      {showSubmitModal && (
        <div className="game-over-modal">
          <div className="game-over-content submit-modal">
            {!submitSuccess ? (
              <>
                <h1>SUBMIT SCORE</h1>
                <p className="final-score">Score: {score}</p>
                <div className="submit-form">
                  <div className="input-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                      maxLength={30}
                      className="submit-input"
                    />
                  </div>
                  <div className="input-group">
                    <label>Company (optional)</label>
                    <input
                      type="text"
                      value={playerCompany}
                      onChange={(e) => setPlayerCompany(e.target.value)}
                      placeholder="Enter your company"
                      maxLength={30}
                      className="submit-input"
                    />
                  </div>
                </div>
                <div className="game-over-buttons">
                  <button
                    onClick={handleSubmitScore}
                    disabled={isSubmitting || !playerName.trim()}
                    className="game-over-btn"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                  <button onClick={() => setShowSubmitModal(false)} className="game-over-btn">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1>SUBMITTED!</h1>
                <p className="final-score">Your Rank: #{submitRank}</p>
                <div className="game-over-buttons">
                  <button onClick={openLeaderboard} className="game-over-btn">
                    View Leaderboard
                  </button>
                  <button onClick={() => window.location.reload()} className="game-over-btn">
                    Play Again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboardModal && (
        <div className="game-over-modal">
          <div className="game-over-content leaderboard-modal">
            <h1>LEADERBOARD</h1>
            {isLoadingLeaderboard ? (
              <p className="loading-text">Loading...</p>
            ) : (
              <>
                <div className="leaderboard-list">
                  {leaderboardData.length === 0 ? (
                    <p className="no-scores">No scores yet. Be the first!</p>
                  ) : (
                    leaderboardData.map((entry, index) => (
                      <div key={entry.id} className="leaderboard-entry">
                        <span className="leaderboard-rank">
                          #{(leaderboardPage - 1) * 10 + index + 1}
                        </span>
                        <div className="leaderboard-ship">
                          {renderMiniSpaceship(entry.spaceshipType, entry.themeColor)}
                        </div>
                        <div className="leaderboard-info">
                          <span className="leaderboard-name">{entry.name}</span>
                          {entry.company && (
                            <span className="leaderboard-company">{entry.company}</span>
                          )}
                        </div>
                        <span className="leaderboard-score">{entry.score}</span>
                      </div>
                    ))
                  )}
                </div>
                {leaderboardTotalPages > 1 && (
                  <div className="leaderboard-pagination">
                    <button
                      onClick={() => fetchLeaderboard(leaderboardPage - 1)}
                      disabled={leaderboardPage <= 1}
                      className="pagination-btn"
                    >
                      Prev
                    </button>
                    <span className="page-info">
                      {leaderboardPage} / {leaderboardTotalPages}
                    </span>
                    <button
                      onClick={() => fetchLeaderboard(leaderboardPage + 1)}
                      disabled={leaderboardPage >= leaderboardTotalPages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
            <div className="game-over-buttons">
              <button
                onClick={() => {
                  setShowLeaderboardModal(false);
                  setShowSubmitModal(false);
                }}
                className="game-over-btn"
              >
                Close
              </button>
              <button onClick={() => window.location.reload()} className="game-over-btn">
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalagaGame;
