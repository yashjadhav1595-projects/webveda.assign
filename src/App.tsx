import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SkillpathCourses } from './components/SkillpathCourses';
import { Footer } from './components/Footer';
import { FramerCodeModal } from './components/FramerCodeModal';
import { ApiSandboxModal } from './components/ApiSandboxModal';
import './App.css';

export function App() {
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isSandboxModalOpen, setIsSandboxModalOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Background Decorative Grid */}
      <div className="bg-grid" />

      {/* Navigation Header */}
      <Navbar
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        onOpenSandboxModal={() => setIsSandboxModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main>
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Courses Section (Live API, 4 States, Responsive Grid, Property Controls) */}
        <SkillpathCourses
          sectionTitle="Featured Courses"
          sectionSubtitle="From YouTube and video editing to productivity and client operating systems."
          defaultCurrency="auto"
          accentColor="#6366f1"
          showSearch={true}
        />
      </main>

      {/* 3. Footer Section (Three Links & Copyright Line) */}
      <Footer />

      {/* Modals & Dev Tools */}
      <FramerCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      <ApiSandboxModal
        isOpen={isSandboxModalOpen}
        onClose={() => setIsSandboxModalOpen(false)}
      />
    </div>
  );
}

export default App;
