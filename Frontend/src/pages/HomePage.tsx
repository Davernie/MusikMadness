import React from 'react';
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import GenreCategories from '../components/GenreCategories';
import Testimonials from '../components/Testimonials';
import CallToAction from '../components/CallToAction';

const HomePage = () => {
  return (
    <div className="min-h-screen relative">
      <div className="relative">
        <HeroSection />
        <HowItWorks />
        <GenreCategories />
        <Testimonials />
        <CallToAction />
      </div>
    </div>
  );
};

export default HomePage;