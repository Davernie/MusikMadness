import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import GenreCategories from '../components/GenreCategories';
import CallToAction from '../components/CallToAction';

const HomePage = () => {
  return (
    <div className="min-h-screen relative">
      <div className="relative">
        <HeroSection />
        <HowItWorks />
        <GenreCategories />
        <CallToAction />
      </div>
    </div>
  );
};

export default HomePage;