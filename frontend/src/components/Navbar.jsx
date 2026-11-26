import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, Radio, X } from 'lucide-react';
import { useState } from 'react';

const LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Live map', href: '#live' },
  { label: 'Features', href: '#features' },
  { label: 'Architecture', href: '#architecture' }
];

export function Logo() {
  return (
    <a className="logo" href="#overview" aria-label="SmartPark home">
      <span className="logo-mark">
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <path d="M9 27V9h9.5a6.5 6.5 0 0 1 0 13H9" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="26" cy="11" r="2.4" fill="currentColor" />
          <circle cx="27.5" cy="20" r="1.5" fill="currentColor" opacity=".6" />
        </svg>
      </span>
      <span className="logo-text">SmartPark<span className="logo-accent">.iot</span></span>
    </a>
  );
}

export default function Navbar({ mode }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Logo />

        <nav className="nav-links" aria-label="Main navigation">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </nav>

        <div className="nav-actions">
          <span className={`feed-pill ${mode === 'live' ? 'feed-pill--live' : ''}`}>
            <Radio size={13} strokeWidth={2.4} />
            {mode === 'live' ? 'SENSORS LIVE' : mode === 'demo' ? 'DEMO FEED' : 'CONNECTING'}
          </span>
          <a className="button button--small" href="#contact">
            Request demo <ArrowUpRight size={15} />
          </a>
          <button className="menu-toggle" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
            ))}
            <a href="#contact" onClick={() => setOpen(false)}>Request demo</a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
