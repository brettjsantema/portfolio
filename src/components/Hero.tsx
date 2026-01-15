import React from 'react';
import { SocialLinks } from '../types';
import './Hero.css';

interface HeroProps {
  name: string;
  title: string;
  description: string;
  socialLinks: SocialLinks;
}

const Hero: React.FC<HeroProps> = ({ name, title, description, socialLinks }) => {
  return (
    <section id="about" className="hero">
      <div className="hero-content">
        <h1 className="hero-name">{name}</h1>
        <h2 className="hero-title">{title}</h2>
        <p className="hero-description">{description}</p>
        <div className="social-links">
          <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-link">
            GitHub
          </a>
          <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
            LinkedIn
          </a>
          <a href={socialLinks.resume} target="_blank" rel="noopener noreferrer" className="social-link">
            Resume
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
