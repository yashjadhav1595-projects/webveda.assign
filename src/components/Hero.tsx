import React from 'react';
import { Sparkles, ArrowDown, BookOpen, ShieldCheck, Zap } from 'lucide-react';
import './Hero.css';

export const Hero: React.FC = () => {
  const scrollToCourses = () => {
    const section = document.getElementById('courses');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-badge">
          <Sparkles className="hero-badge-icon" size={14} />
          <span>Real-World Systems • Built for Modern Creators</span>
        </div>

        <h1 className="hero-headline">
          Master high-leverage skills from <span className="hero-gradient-text">proven creators</span>
        </h1>

        <p className="hero-subhead">
          Actionable, system-driven playbooks for creators, freelancers, and ambitious builders who value execution over theory.
        </p>

        <div className="hero-actions">
          <button className="hero-cta-button" onClick={scrollToCourses}>
            <span>Explore Courses</span>
            <ArrowDown size={18} className="hero-cta-icon" />
          </button>
        </div>

        {/* Value Highlights */}
        <div className="hero-highlights">
          <div className="highlight-item">
            <BookOpen size={16} className="highlight-icon" />
            <span>Interactive Curriculums</span>
          </div>
          <div className="highlight-divider" />
          <div className="highlight-item">
            <Zap size={16} className="highlight-icon" />
            <span>Live Dynamic Pricing</span>
          </div>
          <div className="highlight-divider" />
          <div className="highlight-item">
            <ShieldCheck size={16} className="highlight-icon" />
            <span>100% Risk-Free Guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
};
