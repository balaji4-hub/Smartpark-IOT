import { motion } from 'framer-motion';
import { ArrowLeftRight, Cloud, Cpu, Radar, ScanLine, LayoutDashboard } from 'lucide-react';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';

const NODES = [
  { icon: Radar, tag: 'DEVICE', title: 'Sensor mesh', text: 'Ultrasonic + optical detection at every bay' },
  { icon: Cpu, tag: 'EDGE', title: 'AI gateway', text: 'Local fusion, filtering and decision making' },
  { icon: Cloud, tag: 'CLOUD', title: 'Parking API', text: 'REST endpoints and a live WebSocket stream' },
  { icon: LayoutDashboard, tag: 'CLIENT', title: '3D dashboard', text: 'This interface, always in sync with the lot' },
  { icon: ScanLine, tag: 'FIELD', title: 'Actuators', text: 'Signage, barriers and guidance lighting' }
];

export default function Architecture() {
  return (
    <section className="section architecture-section" id="architecture">
      <div className="container">
        <SectionHeading
          eyebrow="SYSTEM ARCHITECTURE"
          title="From asphalt to app."
          highlight="Without the wait."
          description="A closed-loop IoT stack: sensors report, edge hardware decides, the cloud distributes, and field devices respond."
        />

        <div className="pipeline">
          <div className="pipeline-track" aria-hidden="true"><span className="pipeline-pulse" /></div>
          <div className="pipeline-nodes">
            {NODES.map((node, index) => (
              <Reveal key={node.tag} delay={index * 0.09} className="pipeline-node-wrap">
                <motion.div className="pipeline-node" whileHover={{ y: -8, scale: 1.03 }} transition={{ duration: 0.25 }}>
                  <span className="pipeline-tag">{node.tag}</span>
                  <span className="pipeline-icon"><node.icon size={22} strokeWidth={1.8} /></span>
                  <h4>{node.title}</h4>
                  <p>{node.text}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.25}>
          <div className="architecture-footer">
            <p className="loop-label"><ArrowLeftRight size={16} /> Commands flow back to the lot in real time</p>
            <div className="protocol-chips">
              <span>MQTT</span><span>LoRaWAN</span><span>WebSocket</span><span>REST</span><span>Edge AI</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
