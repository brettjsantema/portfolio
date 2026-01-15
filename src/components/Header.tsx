import React from 'react';
import './Header.css';

interface HeaderProps {
  isHidden: boolean;
}

const Header: React.FC<HeaderProps> = ({ isHidden }) => {
  if (isHidden) return null;

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-brand">Portfolio</div>
        <div className="nav-hint">Use ← → arrows to navigate</div>
      </nav>
    </header>
  );
};

export default Header;
