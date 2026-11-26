import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CarFront, CheckCircle2, Clock3, MapPin, Radio, RadioTower, Sparkles, WifiOff, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import LiveMap from './LiveMap.jsx';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';

const ZONE_FILTERS = [
  { id: 'all', label: 'All zones' },
  { id: 'A', label: 'Zone A' },
  { id: 'B', label: 'Zone B' },
  { id: 'C', label: 'Zone C' }
];

const ACTIVITY_ICONS = {
  occupied: CarFront,
  available: CheckCircle2,
  reserved: Zap,
  released: CheckCircle2,
  online: RadioTower,
  offline: WifiOff
};

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function LiveDashboard({ snapshot, mode, sendCommand }) {
  const [zoneFilter, setZoneFilter] = useState('all');
  const [selectedId, setSelectedId] = useState('A-06');
  const [notice, setNotice] = useState('');

  const selected = snapshot.spots.find((spot) => spot.id === selectedId) ?? null;
  const zonesToShow = zoneFilter === 'all' ? ['A', 'B', 'C'] : [zoneFilter];

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 3200);
    return () => clearTimeout(timer);
  }, [notice]);

  const handleAction = async () => {
    if (!selected) return;
    const type = selected.occupied ? 'release' : 'reserve';
    const result = await sendCommand(type, selected.id);
    setNotice(result.ok ? `${selected.id} ${type === 'reserve' ? 'reserved' : 'released'} successfully` : result.error);
  };

  return (
    <section className="section live-section" id="live">
      <div className="container">
        <SectionHeading
          eyebrow="LIVE DIGITAL TWIN"
          title="See every bay."
          highlight="In 3D."
          description="Click any space to inspect its sensor, type and live status. Reserve or release a bay and watch the twin update instantly."
        />

        <Reveal delay={0.1}>
          <div className="dashboard-grid">
            <div className="panel map-panel">
              <div className="panel-head">
                <div>
                  <span className="panel-label">PARKING LOT 01 · LIVE VIEW</span>
                  <h3>Interactive 3D map</h3>
                </div>
                <div className="filter-tabs" role="group" aria-label="Filter by zone">
                  {ZONE_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      className={zoneFilter === filter.id ? 'active' : ''}
                      onClick={() => {
                        setZoneFilter(filter.id);
                        setSelectedId(null);
                      }}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="map-stage">
                <LiveMap
                  spots={snapshot.spots}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  zoneFilter={zoneFilter}
                />
                {zonesToShow.map((zone) => (
                  <span key={zone} className={`zone-tag zone-tag--${zone}`}>
                    ZONE {zone} <small>{snapshot.zones.find((item) => item.id === zone)?.name}</small>
                  </span>
                ))}
                <div className="map-legend">
                  <span><i className="legend-dot legend-dot--free" /> Free</span>
                  <span><i className="legend-dot legend-dot--busy" /> Occupied</span>
                  <span><i className="legend-dot legend-dot--reserved" /> Reserved</span>
                  <span><i className="legend-dot legend-dot--alert" /> Sensor alert</span>
                </div>
              </div>

              <div className="map-footer">
                <span>Drag to orbit · Scroll to zoom · Click a bay</span>
                <span className="sync-time"><span className={`hud-dot ${mode === 'live' ? 'hud-dot--live' : ''}`} /> Sync {formatTime(snapshot.generatedAt)}</span>
              </div>
            </div>

            <aside className="panel side-panel">
              <div className="panel-head">
                <div>
                  <span className="panel-label">BAY INSPECTOR</span>
                  <h3>Selected space</h3>
                </div>
                <span className="panel-badge"><Sparkles size={13} /> {mode === 'live' ? 'LIVE' : 'DEMO'}</span>
              </div>

              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div
                    key={selected.id}
                    className="spot-detail"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                  >
                    <div className="spot-detail-top">
                      <div>
                        <small>SPACE ID</small>
                        <strong>{selected.id}</strong>
                      </div>
                      <span className={`status-chip status-chip--${selected.occupied ? 'busy' : 'free'}`}>
                        {selected.vehicle === 'RESERVED' ? 'Reserved' : selected.occupied ? 'Occupied' : 'Available'}
                      </span>
                    </div>

                    <div className="detail-grid">
                      <div><span><MapPin size={13} /> Zone</span><strong>{selected.zoneName}</strong></div>
                      <div><span><RadioTower size={13} /> Sensor</span><strong>{selected.sensorOnline ? 'Online' : 'Offline'}</strong></div>
                      <div><span><Zap size={13} /> Type</span><strong className="capitalize">{selected.type}</strong></div>
                      <div><span><Clock3 size={13} /> Updated</span><strong>{formatTime(selected.updatedAt)}</strong></div>
                    </div>

                    <button className={`button button--wide ${selected.occupied ? 'button--ghost' : 'button--primary'}`} onClick={handleAction}>
                      {selected.occupied ? 'Release this bay' : 'Reserve this bay'} <ArrowRight size={16} />
                    </button>
                    <AnimatePresence>
                      {notice && (
                        <motion.p className="notice" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{notice}</motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div key="empty" className="spot-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="spot-empty-icon"><MapPin size={22} /></div>
                    <strong>No bay selected</strong>
                    <p>Click a space in the 3D map to inspect its live telemetry.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="panel-divider" />

              <div className="side-block">
                <span className="side-title">Zone occupancy</span>
                {snapshot.zones.map((zone) => (
                  <div className="zone-row" key={zone.id}>
                    <div className="zone-row-top"><span>{zone.name}</span><strong>{zone.available}/{zone.total} free</strong></div>
                    <div className="progress-track"><span style={{ width: `${(zone.occupied / zone.total) * 100}%` }} /></div>
                  </div>
                ))}
              </div>

              <div className="panel-divider" />

              <div className="side-block">
                <span className="side-title">Sensor activity</span>
                <div className="activity-list">
                  <AnimatePresence initial={false}>
                    {snapshot.activity.slice(0, 5).map((item) => {
                      const Icon = ACTIVITY_ICONS[item.kind] ?? Radio;
                      return (
                        <motion.div
                          key={item.id}
                          className="activity-item"
                          initial={{ opacity: 0, x: 18, height: 0 }}
                          animate={{ opacity: 1, x: 0, height: 'auto' }}
                          exit={{ opacity: 0, x: -18, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className={`activity-icon activity-icon--${item.kind}`}><Icon size={14} /></span>
                          <div><strong>{item.message}</strong><small>{formatTime(item.time)}</small></div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </aside>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
