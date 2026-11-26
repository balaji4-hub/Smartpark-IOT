const ZONES = [
  { id: 'A', name: 'North Deck' },
  { id: 'B', name: 'Central Hub' },
  { id: 'C', name: 'South Wing' }
];

const PLATES = ['EV-4021', 'MH-8890', 'TX-1174', 'DL-7623', 'PK-3345', 'RJ-9081', 'KA-5510', 'TS-2208'];

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return value / 2147483647;
  };
}

export function summarize(spots) {
  return ZONES.map((zone) => {
    const inZone = spots.filter((spot) => spot.zone === zone.id);
    const occupied = inZone.filter((spot) => spot.occupied).length;
    return { id: zone.id, name: zone.name, total: inZone.length, occupied, available: inZone.length - occupied };
  });
}

export function computeStats(spots) {
  const total = spots.length;
  const occupied = spots.filter((spot) => spot.occupied).length;
  const available = total - occupied;
  return {
    total,
    occupied,
    available,
    occupancy: total ? Math.round((occupied / total) * 100) : 0,
    sensorsOnline: spots.filter((spot) => spot.sensorOnline).length,
    avgSearchSeconds: Math.max(18, Math.round(110 - available * 1.3)),
    revenueToday: 18420,
    entriesToday: 312
  };
}

export function createFallbackSnapshot() {
  const random = seededRandom(2026);
  const spots = [];

  for (const zone of ZONES) {
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 4; column += 1) {
        const index = row * 4 + column;
        const number = index + 1;
        const occupied = random() < 0.52;

        spots.push({
          id: `${zone.id}-${String(number).padStart(2, '0')}`,
          zone: zone.id,
          zoneName: zone.name,
          row,
          column,
          number,
          type: index === 2 || index === 9 ? 'ev' : index === 14 ? 'accessible' : 'standard',
          occupied,
          sensorOnline: random() > 0.03,
          vehicle: occupied ? PLATES[Math.floor(random() * PLATES.length)] : null,
          updatedAt: new Date().toISOString()
        });
      }
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    spots,
    zones: summarize(spots),
    stats: computeStats(spots),
    activity: spots.filter((spot) => spot.occupied).slice(0, 6).map((spot, index) => ({
      id: `demo-seed-${index}`,
      spotId: spot.id,
      zone: spot.zone,
      kind: 'occupied',
      message: `Vehicle detected at ${spot.id}`,
      time: new Date(Date.now() - index * 38000).toISOString()
    }))
  };
}

export function stepFallback(previous, command = null) {
  const spots = previous.spots.map((spot) => ({ ...spot }));
  let event = null;
  let target = null;

  if (command?.id) {
    target = spots.find((spot) => spot.id === command.id);
    if (target) {
      target.occupied = command.type === 'reserve';
      target.vehicle = target.occupied ? 'RESERVED' : null;
      target.updatedAt = new Date().toISOString();
      event = {
        id: `demo-${Date.now()}`,
        spotId: target.id,
        zone: target.zone,
        kind: command.type === 'reserve' ? 'reserved' : 'released',
        message: `${target.id} ${command.type === 'reserve' ? 'reserved' : 'released'} from web dashboard`,
        time: new Date().toISOString()
      };
    }
  } else {
    target = spots[Math.floor(Math.random() * spots.length)];
    target.updatedAt = new Date().toISOString();
    if (Math.random() < 0.06) {
      target.sensorOnline = !target.sensorOnline;
      event = {
        id: `demo-${Date.now()}`,
        spotId: target.id,
        zone: target.zone,
        kind: target.sensorOnline ? 'online' : 'offline',
        message: `Sensor ${target.id} ${target.sensorOnline ? 'back online' : 'needs attention'}`,
        time: new Date().toISOString()
      };
    } else {
      target.occupied = !target.occupied;
      target.vehicle = target.occupied ? PLATES[Math.floor(Math.random() * PLATES.length)] : null;
      event = {
        id: `demo-${Date.now()}`,
        spotId: target.id,
        zone: target.zone,
        kind: target.occupied ? 'occupied' : 'available',
        message: target.occupied ? `Vehicle detected at ${target.id}` : `Space ${target.id} is now available`,
        time: new Date().toISOString()
      };
    }
  }

  return {
    ...previous,
    generatedAt: new Date().toISOString(),
    spots,
    zones: summarize(spots),
    stats: computeStats(spots),
    activity: event ? [event, ...previous.activity].slice(0, 14) : previous.activity
  };
}
