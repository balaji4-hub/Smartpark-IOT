import { ArrowUpRight } from 'lucide-react';
import { Logo } from './Navbar.jsx';

const COLUMNS = [
  { title: 'Platform', links: ['Live digital twin', 'Sensor fusion', 'Edge gateway', 'Analytics'] },
  { title: 'Developers', links: ['REST API', 'WebSocket stream', 'MQTT bridge', 'Hardware kit'] },
  { title: 'Company', links: ['About SmartPark', 'Case studies', 'Contact', 'Careers'] }
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>Connected parking infrastructure for smarter, shorter, calmer journeys.</p>
          <span className="footer-status"><span className="hud-dot hud-dot--live" /> Systems operational</span>
        </div>
        {COLUMNS.map((column) => (
          <div className="footer-column" key={column.title}>
            <strong>{column.title}</strong>
            {column.links.map((link) => (
              <a key={link} href="#overview">{link} <ArrowUpRight size={12} /></a>
            ))}
          </div>
        ))}
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} SmartPark IoT. Built for connected infrastructure.</span>
        <span>Privacy · Terms · Status</span>
      </div>
    </footer>
  );
}
