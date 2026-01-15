import React from 'react';
import { Skill } from '../types';
import './Skills.css';

interface SkillsProps {
  skills: Skill[];
}

const Skills: React.FC<SkillsProps> = ({ skills }) => {
  return (
    <section id="skills" className="skills">
      <div className="skills-container">
        <h2 className="section-title">Skills</h2>
        <div className="skills-grid">
          {skills.map((skill, index) => (
            <div key={index} className="skill-category">
              <h3 className="skill-category-title">{skill.category}</h3>
              <div className="skill-items">
                {skill.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="skill-item">
                    <img src={item.icon} alt={item.name} className="skill-icon" />
                    <span className="skill-name">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
