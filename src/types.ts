export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
}

export interface SkillItem {
  name: string;
  icon: string;
}

export interface Skill {
  category: string;
  icon: string;
  items: SkillItem[];
}

export interface ContactInfo {
  email: string;
  phone?: string;
  location?: string;
}

export interface SocialLinks {
  github: string;
  linkedin: string;
  resume: string;
}

export interface PortfolioData {
  name: string;
  title: string;
  description: string;
  contactInfo: ContactInfo;
  socialLinks: SocialLinks;
  skills: Skill[];
  projects: Project[];
}
