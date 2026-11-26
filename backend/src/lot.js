const ZONE_CONFIG = [
  { id: 'A', name: 'North Deck', rows: 4, columns: 4 },
  { id: 'B', name: 'Central Hub', rows: 4, columns: 4 },
  { id: 'C', name: 'South Wing', rows: 4, columns: 4 }
];

const VEHICLES = ['EV-4021', 'MH-8890', 'TX-1174', 'DL-7623', 'PK-3345', 'RJ-9081', 'KA-5510', 'TS-2208'];

export function createLot() {
  const spots = [];

  for (const zone of ZONE_CONFIG) {
    for (let row = 0; row < zone.rows; row += 1) {
      for (let column = 0; column < zone.columns; column += 1) {
        const index = row * zone.columns + column;
        const number = index + 1;
        const occupied = (index * 7 + zone.id.charCodeAt(0)) % 5 < 2;

        spots.push({
          id: `${zone.id}-${String(number).padStart(2, '0')}`,
          zone: zone.id,
          zoneName: zone.name,
          row,
          column,
          number,
          type: index === 2 || index === 9 ? 'ev' : index === 14 ? 'accessible' : 'standard',
          occupied,
          sensorOnline: true,
          vehicle: occupied ? VEHICLES[(index + zone.id.charCodeAt(0)) % VEHICLES.length] : null,
          updatedAt: new Date().toISOString()
        });
      }
    }
  }

  return spots;
}

export function zoneSummaries(spots) {
  return ZONE_CONFIG.map((zone) => {
    const inZone = spots.filter((spot) => spot.zone === zone.id);
    const occupied = inZone.filter((spot) => spot.occupied).length;

    return {
      id: zone.id,
      name: zone.name,
      total: inZone.length,
      occupied,
      available: inZone.length - occupied
    };
  });
}
