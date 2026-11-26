import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float, OrbitControls, RoundedBox, Sparkles } from '@react-three/drei';
import { useRef } from 'react';

const CAR_COLORS = ['#22d3ee', '#8b5cf6', '#f472b6', '#34d399'];

function SensorNode({ position, phase, alert }) {
  const ring = useRef();
  const orb = useRef();

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (ring.current) {
      ring.current.rotation.z = time * 0.8 + phase;
      ring.current.rotation.x = Math.PI / 2 + Math.sin(time + phase) * 0.25;
    }
    if (orb.current) {
      const pulse = 1 + Math.sin(time * 2.6 + phase) * 0.18;
      orb.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      <mesh ref={orb}>
        <sphereGeometry args={[0.075, 12, 12]} />
        <meshBasicMaterial color={alert ? '#f59e0b' : '#67e8f9'} toneMapped={false} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.012, 6, 28]} />
        <meshBasicMaterial color={alert ? '#f59e0b' : '#22d3ee'} transparent opacity={0.75} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.32, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.6, 6]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.35} toneMapped={false} />
      </mesh>
    </group>
  );
}

function ParkingBay({ position, index, occupied }) {
  const carColor = CAR_COLORS[index % CAR_COLORS.length];

  return (
    <group position={position}>
      <RoundedBox args={[1.62, 0.035, 1.02]} radius={0.015} smoothness={3} position={[0, 0.03, 0]}>
        <meshStandardMaterial color={occupied ? '#141b35' : '#0a1328'} metalness={0.4} roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.44, 0.86]} />
        <meshBasicMaterial color={occupied ? carColor : '#22d3ee'} transparent opacity={occupied ? 0.16 : 0.1} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.06, 0.5]}>
        <boxGeometry args={[1.44, 0.012, 0.018]} />
        <meshBasicMaterial color={occupied ? carColor : '#22d3ee'} transparent opacity={0.85} toneMapped={false} />
      </mesh>

      {occupied && (
        <Float speed={1.4} rotationIntensity={0.03} floatIntensity={0.12}>
          <group position={[0, 0.2, 0]}>
            <RoundedBox args={[0.92, 0.22, 0.52]} radius={0.09} smoothness={4}>
              <meshStandardMaterial color={carColor} metalness={0.65} roughness={0.28} emissive={carColor} emissiveIntensity={0.16} />
            </RoundedBox>
            <RoundedBox args={[0.46, 0.19, 0.44]} radius={0.07} smoothness={4} position={[-0.04, 0.19, 0]}>
              <meshStandardMaterial color="#0a1024" metalness={0.8} roughness={0.2} />
            </RoundedBox>
            <mesh position={[0.47, 0.09, 0.18]}>
              <boxGeometry args={[0.02, 0.06, 0.1]} />
              <meshBasicMaterial color="#fff7d6" toneMapped={false} />
            </mesh>
            <mesh position={[0.47, 0.09, -0.18]}>
              <boxGeometry args={[0.02, 0.06, 0.1]} />
              <meshBasicMaterial color="#fff7d6" toneMapped={false} />
            </mesh>
          </group>
        </Float>
      )}

      <SensorNode position={[0.62, 0.72, -0.38]} phase={index * 0.7} alert={index === 11} />
    </group>
  );
}

function Deck() {
  return (
    <group rotation={[0, -0.28, 0]}>
      <RoundedBox args={[8.4, 0.16, 5.2]} radius={0.12} smoothness={4} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#0b1228" metalness={0.75} roughness={0.35} />
      </RoundedBox>
      <mesh position={[0, -0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9.2, 6]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.045} toneMapped={false} />
      </mesh>
      {Array.from({ length: 16 }, (_, index) => {
        const column = index % 4;
        const row = Math.floor(index / 4);
        return (
          <ParkingBay
            key={index}
            index={index}
            occupied={![2, 5, 8, 9, 13, 15].includes(index)}
            position={[(column - 1.5) * 1.92, 0, (row - 1.5) * 1.22]}
          />
        );
      })}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.07, 4.7]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.55} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [8.4, 6.2, 8.8], fov: 34 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[6, 9, 5]} intensity={2.2} color="#d8f4ff" />
      <pointLight position={[-5, 3, -4]} intensity={18} color="#8b5cf6" distance={16} />
      <pointLight position={[5, 2, 4]} intensity={14} color="#22d3ee" distance={14} />
      <Deck />
      <Sparkles count={70} scale={[15, 8, 12]} size={2.2} speed={0.35} color="#67e8f9" />
      <ContactShadows position={[0, -0.5, 0]} opacity={0.55} scale={16} blur={2.8} far={3} color="#02040c" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.55}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 0.3, 0]}
      />
    </Canvas>
  );
}
