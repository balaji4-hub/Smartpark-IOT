import { motion } from 'framer-motion';
import { Activity, CarFront, Gauge, RadioTower } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal.jsx';

function CountUp({ value, suffix = '', prefix = '' }) {
  const [display, setDisplay] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const from = current.current;
    const duration = 900;
    let frame;

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + (value - from) * eased);
      current.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{prefix}{display.toLocaleString()}{suffix}</>;
}

export default function StatsStrip({ stats }) {
  const cards = [
    { icon: CarFront, label: 'Bays under management', value: <CountUp value={stats.total} />, note: 'Across 3 connected zones' },
    { icon: Activity, label: 'Live occupancy', value: <CountUp value={stats.occupancy} suffix="%" />, note: `${stats.available} spaces open now` },
    { icon: Gauge, label: 'Avg. search time', value: <CountUp value={stats.avgSearchSeconds} suffix="s" />, note: 'Down from 6 min walking' },
    { icon: RadioTower, label: 'Sensors online', value: <CountUp value={stats.sensorsOnline} />, note: 'Self-healing mesh network' }
  ];

  return (
    <section className="stats-section" aria-label="Live platform statistics">
      <div className="stats-grid">
        {cards.map((card, index) => (
          <Reveal key={card.label} delay={index * 0.08}>
            <motion.div className="stat-card" whileHover={{ y: -6 }} transition={{ duration: 0.25 }}>
              <span className="stat-icon"><card.icon size={19} /></span>
              <strong className="stat-value">{card.value}</strong>
              <span className="stat-label">{card.label}</span>
              <span className="stat-note">{card.note}</span>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
