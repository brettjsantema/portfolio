import React, { useState, useEffect } from 'react';
import GalagaGame from './components/GalagaGame';
import HorizontalSections from './components/HorizontalSections';
import { portfolioData } from './data';
import './App.css';

const themeColors = ['#ffd43b', '#ff922b', '#ff6b6b', '#ff6b9d', '#845ef7', '#0099ff', '#51cf66'];

const App: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [isPortfolioHidden, setIsPortfolioHidden] = useState(false);
  const [spaceshipType, setSpaceshipType] = useState(2);
  const [themeColorIndex, setThemeColorIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);


  useEffect(() => {
    // Update CSS variables for theme color
    const newColor = themeColors[themeColorIndex];
    document.documentElement.style.setProperty('--theme-color', newColor);
  }, [themeColorIndex]);

  return (
    <div className="App">
      <GalagaGame isPaused={isPaused} spaceshipType={spaceshipType} themeColor={themeColors[themeColorIndex]} />
      <HorizontalSections
        portfolioData={portfolioData}
        isHidden={isPortfolioHidden}
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
      />

      <div className="left-controls">
        <div className="button-row">
          <button
            className="control-btn"
            onClick={() => setThemeColorIndex((prev) => (prev + 1) % themeColors.length)}
            aria-label="Cycle theme color"
            title="Change color theme"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 2 A10 10 0 0 1 12 22 A10 10 0 0 1 12 2" fill="url(#rainbow)" />
              <defs>
                <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff0000" />
                  <stop offset="16.66%" stopColor="#ff9900" />
                  <stop offset="33.33%" stopColor="#ffff00" />
                  <stop offset="50%" stopColor="#00ff00" />
                  <stop offset="66.66%" stopColor="#0099ff" />
                  <stop offset="83.33%" stopColor="#9900ff" />
                  <stop offset="100%" stopColor="#ff0099" />
                </linearGradient>
              </defs>
            </svg>
          </button>
          <button
            className="control-btn"
            onClick={() => setSpaceshipType((prev) => (prev + 1) % 5)}
            aria-label="Cycle spaceship design"
            title="Change spaceship"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
        </div>
        <button className="pause-btn" onClick={() => setIsPaused((prev) => !prev)}>
          {isPaused ? 'Unpause' : 'Pause'}
        </button>
      </div>

      <div className="right-controls">
        <button
          className="toggle-portfolio-btn"
          onClick={() => setIsPortfolioHidden((prev) => !prev)}
          aria-label={isPortfolioHidden ? 'Show Portfolio' : 'Hide Portfolio'}
        >
          {isPortfolioHidden ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default App;
