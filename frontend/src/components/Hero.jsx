import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle } from 'lucide-react';
import Scene3D from './Scene3D.jsx';

const rise = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

export default function Hero({ stats, mode }) {
  return (
    <section className="hero" id="overview">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-copy">
          <motion.div className="eyebrow" variants={rise} initial="hidden" animate="visible">
            <span className="eyebrow-line" /> IoT PARKING INTELLIGENCE
          </motion.div>

          <motion.h1 variants={rise} initial="hidden" animate="visible" transition={{ delay: 0.08 }}>
            The parking lot, <span className="gradient-text">alive in 3D.</span>
          </motion.h1>

          <motion.p className="hero-lead" variants={rise} initial="hidden" animate="visible" transition={{ delay: 0.16 }}>
            SmartPark fuses IoT sensors, edge AI and a live digital twin so drivers find a bay in seconds —
            and operators watch every space update in real time.
          </motion.p>

          <motion.div className="hero-actions" variants={rise} initial="hidden" animate="visible" transition={{ delay: 0.24 }}>
            <a className="button button--primary" href="#live">
              Explore live lot <ArrowRight size={17} />
            </a>
            <a className="button button--ghost" href="#architecture">
              <PlayCircle size={17} /> See how it works
            </a>
          </motion.div>

          <motion.div className="hero-kpis" variants={rise} initial="hidden" animate="visible" transition={{ delay: 0.32 }}>
            <div><strong>{stats.total}</strong><span>Smart bays</span></div>
            <div><strong>&lt;120<span className="kpi-unit">ms</span></strong><span>Sensor latency</span></div>
            <div><strong>99.9<span className="kpi-unit">%</span></strong><span>System uptime</span></div>
          </motion.div>
        </div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.9, x: 28 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hero-visual-glow" aria-hidden="true" />
          <Scene3D />

          <div className="hud hud--tl">
            <span className="hud-label">DIGITAL TWIN</span>
            <strong>LOT / 01</strong>
            <div className="hud-bar"><span /></div>
          </div>

          <div className="hud hud--tr">
            <span className={`hud-dot ${mode === 'live' ? 'hud-dot--live' : ''}`} />
            {mode === 'live' ? 'LIVE SENSOR MESH' : 'SIMULATED SENSOR MESH'}
            <small>{stats.available} bays open</small>
          </div>

          <div className="hud hud--bl">
            <span><i className="legend-dot legend-dot--free" /> Available</span>
            <span><i className="legend-dot legend-dot--busy" /> Occupied</span>
            <span><i className="legend-dot legend-dot--sensor" /> Sensor node</span>
          </div>

          <div className="hud hud--br">DRAG TO ORBIT</div>
        </motion.div>
      </div>

      <div className="hero-bottom" aria-hidden="true">
        <span>SCROLL TO EXPLORE</span>
        <div className="hero-scroll-line" />
      </div>
    </section>
  );
}
