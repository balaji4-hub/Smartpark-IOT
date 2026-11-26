import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls, RoundedBox, Sparkles } from '@react-three/drei';
import { useRef, useState } from 'react';

export const ZONE_OFFSETS = { A: -5.3, B: 0, C: 5.3 };

function spotColor(spot) {
  if (!spot.sensorOnline) return '#f59e0b';
  if (spot.vehicle === 'RESERVED') return '#8b5cf6';
  return spot.occupied ? '#fb7185' : '#22d3ee';
}

function SensorPulse({ color, phase, selected }) {
  const ring = useRef();

  useFrame(({ clock }) => {
    if (!ring.current) return;
    const time = clock.getElapsedTime();
    ring.current.rotation.z = time * 0.6 + phase;
    const scale = selected ? 1.25 + Math.sin(time * 4 + phase) * 0.18 : 1;
    ring.current.scale.setScalar(scale);
  });

  return (
    <group position={[0, 0.62, 0]}>
      <mesh>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.17, 0.012, 6, 24]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 1 : 0.55} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.48, 5]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} toneMapped={false} />
      </mesh>
    </group>
  );
}

function LotSpot({ spot, x, z, selected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const color = spotColor(spot);

  return (
    <group
      position={[x, 0, z]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(spot.id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[1.12, 0.06, 1.12]} />
        <meshStandardMaterial
          color={selected ? '#e0f2fe' : color}
          emissive={color}
          emissiveIntensity={selected ? 1.1 : hovered ? 0.6 : 0.18}
          metalness={0.45}
          roughness={0.45}
          transparent
          opacity={spot.occupied ? 0.92 : 0.6}
        />
      </mesh>

      <mesh position={[0, 0.105, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.94, 0.94]} />
        <meshBasicMaterial color={color} transparent opacity={spot.occupied ? 0.14 : 0.24} toneMapped={false} />
      </mesh>

      {selected && (
        <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.68, 0.75, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} toneMapped={false} />
        </mesh>
      )}

      {spot.occupied && (
        <group position={[0, 0.24, 0]}>
          <RoundedBox args={[0.7, 0.2, 0.42]} radius={0.07} smoothness={3}>
            <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} emissive={color} emissiveIntensity={0.22} />
          </RoundedBox>
          <RoundedBox args={[0.36, 0.16, 0.35]} radius={0.05} smoothness={3} position={[-0.03, 0.16, 0]}>
            <meshStandardMaterial color="#0b1124" metalness={0.8} roughness={0.2} />
          </RoundedBox>
        </group>
      )}

      <SensorPulse color={color} phase={Number(spot.number) * 0.5} selected={selected} />
    </group>
  );
}

export default function LiveMap({ spots, selectedId, onSelect, zoneFilter }) {
  const visible = zoneFilter === 'all' ? spots : spots.filter((spot) => spot.zone === zoneFilter);
  const zones = zoneFilter === 'all' ? ['A', 'B', 'C'] : [zoneFilter];
  const focusX = zoneFilter === 'all' ? 0 : ZONE_OFFSETS[zoneFilter];

  return (
    <Canvas
      camera={{ position: [focusX, 10.5, 13.5], fov: 42 }}
      dpr={[1, 1.7]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => onSelect(null)}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 12, 6]} intensity={2.1} color="#e0f7ff" />
      <pointLight position={[-7, 3, -4]} intensity={22} color="#8b5cf6" distance={18} />
      <pointLight position={[7, 3, 4]} intensity={18} color="#22d3ee" distance={18} />

      {zones.map((zone) => (
        <group key={zone} position={[ZONE_OFFSETS[zone], 0, 0]}>
          <RoundedBox args={[5.6, 0.12, 5.7]} radius={0.1} smoothness={3} position={[0, -0.06, 0]}>
            <meshStandardMaterial color="#0b1329" metalness={0.7} roughness={0.4} />
          </RoundedBox>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.06, 5.3]} />
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0.5} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {visible.map((spot) => (
        <LotSpot
          key={spot.id}
          spot={spot}
          x={ZONE_OFFSETS[spot.zone] + (spot.column - 1.5) * 1.28}
          z={(spot.row - 1.5) * 1.28}
          selected={spot.id === selectedId}
          onSelect={onSelect}
        />
      ))}

      <Sparkles count={55} scale={[20, 8, 14]} size={1.8} speed={0.3} color="#67e8f9" />
      <ContactShadows position={[0, -0.35, 0]} opacity={0.5} scale={24} blur={2.6} far={3} color="#02040c" />
      <OrbitControls
        makeDefault
        target={[focusX, 0.3, 0]}
        enablePan={false}
        minDistance={8}
        maxDistance={26}
        minPolarAngle={0.25}
        maxPolarAngle={1.25}
      />
    </Canvas>
  );
}
