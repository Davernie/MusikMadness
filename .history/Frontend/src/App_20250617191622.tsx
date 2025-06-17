import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TournamentsPage from './pages/TournamentsPage';
import TournamentDetailsPage from './pages/TournamentDetailsPage';
import MatchupDetailsPage from './pages/MatchupDetailsPage';
import CreateTournamentPage from './pages/CreateTournamentPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ResendVerificationPage from './pages/ResendVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SettingsPage from './pages/SettingsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import JoinTournamentPage from './pages/JoinTournamentPage';
import BecomeCreatorPage from './pages/BecomeCreatorPage';
import LiveStreamsPage from './pages/LiveStreamsPage';
import Drawer from './components/Drawer';
import MobileNavbar from './components/MobileNavbar';
import { DrawerProvider } from './context/DrawerContext';
import { useDrawer } from './context/DrawerContext';
import StandaloneProfileAvatar from './components/StandaloneProfileAvatar';
import ProtectedRoute from './components/ProtectedRoute';
import ConstructionBanner from './components/ConstructionBanner';

// Optimized background component that looks identical but performs much better
const AnimatedBackground = React.memo(() => {
  // Reduce from 60 to 20 elements for better performance while maintaining visual density
  const streaks = useMemo(() => Array.from({ length: 20 }, (_, i) => {
    // Generate a random rotation angle
    const rotationDeg = Math.floor(Math.random() * 360);
    
    return {
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.floor(Math.random() * 200) + 150}px`,
      rotate: `${rotationDeg}deg`,
      animationClass: `streak-optimized-${(i % 5) + 1}`,
      color: Math.random() > 0.5 ? '#ff00ff' : '#00ccff',
      baseOpacity: Math.random() * 0.4 + 0.1,
      // Pre-calculate the initial transform to prevent rotation jump
      initialTransform: `rotate(${rotationDeg}deg) translate3d(-20px, -15px, 0)`,
    };
  }), []); // Empty dependency array ensures streaks are only generated once
  
  return (
    <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
      <div className="absolute inset-0 opacity-40" style={{ 
        backgroundImage: `linear-gradient(135deg, transparent 0%, transparent 25%, #ff00ff33 25%, #ff00ff33 50%, transparent 50%, transparent 75%, #00ccff33 75%, #00ccff33 100%)`,
        backgroundSize: '400% 400%',
        animation: 'streak 20s linear infinite'
      }}></div>
      
      {/* Optimized animated diagonal streaks */}
      <div className="absolute inset-0">
        {streaks.map(streak => (
          <div 
            key={streak.id}
            className={`streak-optimized ${streak.animationClass}`}
            style={{
              top: streak.top,
              left: streak.left,
              width: streak.width,
              color: streak.color,
              opacity: streak.baseOpacity,
              '--base-opacity': streak.baseOpacity,
              '--base-width': streak.width,
              '--rotation': streak.rotate,
              // Apply initial transform immediately to prevent jump
              transform: streak.initialTransform,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
});

function AppContent() {
  const { isOpen } = useDrawer();
    return (
    <div className="min-h-screen bg-gray-1500">
      {/* Construction Banner - appears on top of everything */}
      <ConstructionBanner />
      
      {/* Fixed animated background separated from layout */}
      <AnimatedBackground />
        {/* Mobile Navigation */}
      <MobileNavbar />
      
      <StandaloneProfileAvatar /><ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      <Routes>        {/* Tournament details page with drawer but no navbar */}
        <Route path="/tournaments/:id" element={
          <div className="flex min-h-screen relative z-10 pt-10">
            <Drawer />
            <div className={`flex-1 transition-all duration-300 flex flex-col ${isOpen ? 'md:ml-64' : 'md:ml-20'}`}>
              <main className="flex-grow">
                <TournamentDetailsPage />
              </main>
              <Footer />
            </div>
          </div>
        } />
        
        {/* Matchup details page - similar layout to tournament details */}
        <Route path="/tournaments/:tournamentId/matchup/:matchupId" element={
          <div className="flex min-h-screen relative z-10 pt-10">
            <Drawer />
            <div className={`flex-1 transition-all duration-300 flex flex-col ${isOpen ? 'md:ml-64' : 'md:ml-20'}`}>
              <main className="flex-grow">
                <MatchupDetailsPage />
              </main>
              <Footer />
            </div>
          </div>
        } />
          {/* All other routes with navbar */}
        <Route path="*" element={
          <div className="flex min-h-screen relative z-10 pt-10">
            <Drawer />
            <div className={`flex-1 transition-all duration-300 flex flex-col ${isOpen ? 'md:ml-64' : 'md:ml-20'}`}>
              <main className="flex-grow md:pt-24">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/tournaments" element={<TournamentsPage />} />
                  <Route path="/create-tournament" element={<CreateTournamentPage />} />
                  <Route path="/become-creator" element={
                    <ProtectedRoute>
                      <BecomeCreatorPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/tournaments/:tournamentId/join" element={
                    <ProtectedRoute>
                      <JoinTournamentPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile/:id" element={<ProfilePage />} />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/live-streams" element={<LiveStreamsPage />} />                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />                  <Route path="/verify-email" element={<EmailVerificationPage />} />
                  <Route path="/resend-verification" element={<ResendVerificationPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <DrawerProvider>
        <AppContent />
      </DrawerProvider>
    </Router>
  );
}

export default App;