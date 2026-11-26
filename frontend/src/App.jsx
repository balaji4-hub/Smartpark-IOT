import Architecture from './components/Architecture.jsx';
import CTA from './components/CTA.jsx';
import Features from './components/Features.jsx';
import Footer from './components/Footer.jsx';
import Hero from './components/Hero.jsx';
import LiveDashboard from './components/LiveDashboard.jsx';
import Navbar from './components/Navbar.jsx';
import StatsStrip from './components/StatsStrip.jsx';
import { useParkingStream } from './hooks/useParkingStream.js';

export default function App() {
  const { snapshot, mode, sendCommand } = useParkingStream();

  return (
    <div className="app-shell">
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />
      <Navbar mode={mode} />
      <main>
        <Hero stats={snapshot.stats} mode={mode} />
        <StatsStrip stats={snapshot.stats} />
        <LiveDashboard snapshot={snapshot} mode={mode} sendCommand={sendCommand} />
        <Features />
        <Architecture />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
