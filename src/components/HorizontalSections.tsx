import React, { useState, useEffect, useRef } from 'react';
import Hero from './Hero';
import Skills from './Skills';
import Projects from './Projects';
import Contact from './Contact';
import { PortfolioData } from '../types';
import './HorizontalSections.css';

interface HorizontalSectionsProps {
  portfolioData: PortfolioData;
  isHidden: boolean;
  currentSection: number;
  setCurrentSection: (section: number | ((prev: number) => number)) => void;
}

const HorizontalSections: React.FC<HorizontalSectionsProps> = ({ portfolioData, isHidden, currentSection, setCurrentSection }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sections = ['about', 'skills', 'projects', 'contact'];
  const wasHiddenRef = useRef(isHidden);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSection((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentSection((prev) => Math.min(sections.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sections.length]);

  useEffect(() => {
    if (containerRef.current && !isHidden) {
      const container = containerRef.current;
      const scrollAmount = currentSection * container.clientWidth;
      // Use instant scroll when toggling visibility back on, smooth otherwise
      const behavior = wasHiddenRef.current ? 'instant' : 'smooth';
      container.scrollTo({
        left: scrollAmount,
        behavior: behavior as ScrollBehavior,
      });
    }
    wasHiddenRef.current = isHidden;
  }, [currentSection, isHidden]);

  if (isHidden) return null;

  return (
    <div className="horizontal-sections-wrapper">
      <div className="horizontal-sections" ref={containerRef}>
        <div className="section-slide">
          <Hero
            name={portfolioData.name}
            title={portfolioData.title}
            description={portfolioData.description}
            socialLinks={portfolioData.socialLinks}
          />
        </div>
        <div className="section-slide">
          <Skills skills={portfolioData.skills} />
        </div>
        <div className="section-slide">
          <Projects projects={portfolioData.projects} />
        </div>
        <div className="section-slide">
          <Contact contactInfo={portfolioData.contactInfo} />
        </div>
      </div>

      <div className="navigation-indicators">
        {sections.map((section, index) => (
          <button
            key={section}
            className={`indicator ${currentSection === index ? 'active' : ''}`}
            onClick={() => setCurrentSection(index)}
            aria-label={`Go to ${section} section`}
          />
        ))}
      </div>

      <div className="arrow-navigation">
        {currentSection > 0 && (
          <button
            className="nav-arrow left"
            onClick={() => setCurrentSection(currentSection - 1)}
            aria-label="Previous section"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}
        {currentSection < sections.length - 1 && (
          <button
            className="nav-arrow right"
            onClick={() => setCurrentSection(currentSection + 1)}
            aria-label="Next section"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default HorizontalSections;
