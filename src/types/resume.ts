export type Personal = {
  name: string;
  surname: string;
  title: string;
  tagline: string;
  email: string;
  linkedin: string;
  github: string;
  location: string;
  availability: string;
};

export type AboutService = {
  icon: string;
  title: string;
  points: string[];
};

export type About = {
  summary: string;
  services: AboutService[];
};

export type SkillItem = {
  name: string;
  level: string;
};

export type Skill = {
  category: string;
  items: SkillItem[];
};

export type Project = {
  id: string;
  title: string;
  company: string;
  role: string;
  period: string;
  location: string;
  jobType: string;
  employmentType: string;
  description: string;
  achievements: string[];
  skills: string[];
  images: string[];
  links: {
    live: string;
    github: string;
  };
  featured: boolean;
};

export type Recommendation = {
  id: string;
  name: string;
  position: string;
  company: string;
  date: string;
  content: string;
};

export type Resume = {
  personal: Personal;
  about: About;
  skills: Skill[];
  projects: Project[];
  recommendations: Recommendation[];
};