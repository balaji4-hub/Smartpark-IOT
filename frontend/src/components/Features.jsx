import { motion } from 'framer-motion';
import { BarChart3, Cpu, PlugZap, Radar, Route, Smartphone } from 'lucide-react';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';

const FEATURES = [
  {
    icon: Radar,
    title: 'Sensor fusion',
    text: 'Ultrasonic, magnetic and camera inputs cross-check every bay, cutting false positives to under 0.4%.'
  },
  {
    icon: Cpu,
    title: 'Edge AI gateway',
    text: 'On-site inference keeps decisions local. Bays update in milliseconds, even when the cloud is unreachable.'
  },
  {
    icon: Route,
    title: 'Dynamic guidance',
    text: 'Live availability flows into signage and apps, routing drivers straight to an open space with no circling.'
  },
  {
    icon: Smartphone,
    title: 'Tap to reserve',
    text: 'Reserve a bay from the web or mobile, then release it automatically when the session ends.'
  },
  {
    icon: BarChart3,
    title: 'Predictive analytics',
    text: 'Spot demand before it peaks. Forecast occupancy, revenue and maintenance needs from historical telemetry.'
  },
  {
    icon: PlugZap,
    title: 'Open hardware API',
    text: 'MQTT, LoRaWAN and REST make it simple to plug in your own sensors, gates and payment hardware.'
  }
];

export default function Features() {
  return (
    <section className="section features-section" id="features">
      <div className="container">
        <SectionHeading
          eyebrow="BUILT FOR REAL-WORLD LOTS"
          title="Hardware that talks."
          highlight="Software that thinks."
          description="One connected layer from the sensor in the asphalt to the dashboard in your browser."
        />

        <div className="features-grid">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={(index % 3) * 0.09}>
              <motion.article className="feature-card" whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
                <span className="feature-number">0{index + 1}</span>
                <span className="feature-icon"><feature.icon size={23} strokeWidth={1.8} /></span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
                <span className="feature-link">Explore capability <span>→</span></span>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
