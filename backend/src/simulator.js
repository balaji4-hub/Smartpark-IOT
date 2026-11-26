import { createLot, zoneSummaries } from './lot.js';

const ACTIVITY_LIMIT = 14;

export class ParkingSimulator {
  constructor() {
    this.spots = createLot();
    this.activity = [];
    this.listeners = new Set();
    this.revenue = 18420;
    this.entries = 312;
    this.timer = null;
    this.seedActivity();
  }

  seedActivity() {
    for (let index = 0; index < 6; index += 1) {
      const spot = this.spots[(index * 7 + 3) % this.spots.length];
      this.activity.unshift({
        id: `seed-${index}`,
        spotId: spot.id,
        zone: spot.zone,
        kind: index % 2 === 0 ? 'occupied' : 'available',
        message: index % 2 === 0 ? `Vehicle detected at ${spot.id}` : `Space ${spot.id} cleared`,
        time: new Date(Date.now() - index * 42000).toISOString()
      });
    }
  }

  start(interval = 2600) {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), interval);
    this.timer.unref?.();
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  stats() {
    const total = this.spots.length;
    const occupied = this.spots.filter((spot) => spot.occupied).length;
    const available = total - occupied;

    return {
      total,
      occupied,
      available,
      occupancy: total ? Math.round((occupied / total) * 100) : 0,
      sensorsOnline: this.spots.filter((spot) => spot.sensorOnline).length,
      avgSearchSeconds: Math.max(18, Math.round(110 - available * 1.3)),
      revenueToday: this.revenue,
      entriesToday: this.entries
    };
  }

  snapshot() {
    return {
      generatedAt: new Date().toISOString(),
      spots: this.spots.map((spot) => ({ ...spot })),
      zones: zoneSummaries(this.spots),
      stats: this.stats(),
      activity: this.activity.slice(0, ACTIVITY_LIMIT)
    };
  }

  emit(type = 'update') {
    const payload = { type, ...this.snapshot() };
    for (const listener of this.listeners) listener(payload);
  }

  log(spot, kind, message) {
    this.activity.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      spotId: spot.id,
      zone: spot.zone,
      kind,
      message,
      time: new Date().toISOString()
    });
    this.activity = this.activity.slice(0, ACTIVITY_LIMIT);
  }

  find(id) {
    return this.spots.find((spot) => spot.id === id.toUpperCase());
  }

  tick() {
    const spot = this.spots[Math.floor(Math.random() * this.spots.length)];
    spot.updatedAt = new Date().toISOString();

    if (Math.random() < 0.08) {
      spot.sensorOnline = !spot.sensorOnline;
      this.log(spot, spot.sensorOnline ? 'online' : 'offline', `Sensor ${spot.id} ${spot.sensorOnline ? 'back online' : 'needs attention'}`);
    } else {
      spot.occupied = !spot.occupied;
      if (spot.occupied) {
        spot.vehicle = `EV-${Math.floor(1000 + Math.random() * 8999)}`;
        this.entries += 1;
        this.revenue += Math.round(80 + Math.random() * 140);
        this.log(spot, 'occupied', `Vehicle detected at ${spot.id}`);
      } else {
        this.log(spot, 'available', `Space ${spot.id} is now available`);
        spot.vehicle = null;
      }
    }

    this.emit();
  }

  reserve(id) {
    const spot = this.find(id);
    if (!spot) return { status: 404, error: 'Space not found' };
    if (spot.occupied) return { status: 409, error: `${spot.id} is already occupied` };

    spot.occupied = true;
    spot.vehicle = 'RESERVED';
    spot.updatedAt = new Date().toISOString();
    this.entries += 1;
    this.log(spot, 'reserved', `${spot.id} reserved from web dashboard`);
    this.emit();
    return { status: 200, spot: { ...spot } };
  }

  release(id) {
    const spot = this.find(id);
    if (!spot) return { status: 404, error: 'Space not found' };

    spot.occupied = false;
    spot.vehicle = null;
    spot.updatedAt = new Date().toISOString();
    this.log(spot, 'released', `${spot.id} released from web dashboard`);
    this.emit();
    return { status: 200, spot: { ...spot } };
  }
}
