"use client";
import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { Text, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { ZoneRiskData } from "@/lib/types";

const ZONE_POSITIONS: Record<string, [number, number]> = {
  Koramangala: [0, 0],
  Indiranagar: [2.5, 1],
  "HSR Layout": [-1, -2],
  Whitefield: [5, 0.5],
  Marathahalli: [3.5, -1],
  "BTM Layout": [-0.5, -3.5],
};

const RISK_COLORS: Record<string, string> = {
  Low: "#10b981",
  Moderate: "#f59e0b",
  High: "#f97316",
  Elevated: "#ef4444",
};

function ZoneBlock({
  zoneData,
  riskLevel,
  selected,
  onClick,
}: {
  zoneData: ZoneRiskData;
  riskLevel: string;
  selected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const pos = ZONE_POSITIONS[zoneData.zone] || [0, 0];
  const height = Math.max(0.3, zoneData.disruptionProbability * 4);
  const color = RISK_COLORS[riskLevel] || "#10b981";

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle breathing animation for active triggers
      if (zoneData.activeTriggers.length > 0) {
        const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05;
        meshRef.current.scale.y = 1 + pulse;
      }
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = selected ? 0.3 : 0.1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <group position={[pos[0], 0, pos[1]]} onClick={onClick}>
      {/* Base glow */}
      <mesh ref={glowRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>

      {/* Zone block */}
      <mesh ref={meshRef} position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, height, 1.4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 0.8 : 0.3}
          roughness={0.3}
          metalness={0.7}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Top cap (brighter) */}
      <mesh position={[0, height + 0.01, 0]}>
        <boxGeometry args={[1.4, 0.05, 1.4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Zone name label */}
      <Text
        position={[0, height + 0.5, 0]}
        fontSize={0.22}
        color="white"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {zoneData.zone}
      </Text>

      {/* Risk % label */}
      <Text
        position={[0, height + 0.22, 0]}
        fontSize={0.18}
        color={color}
        anchorX="center"
        anchorY="bottom"
      >
        {Math.round(zoneData.disruptionProbability * 100)}% risk
      </Text>

      {/* Active trigger indicator */}
      {zoneData.activeTriggers.length > 0 && (
        <pointLight
          position={[0, height + 1, 0]}
          color={color}
          intensity={2}
          distance={3}
        />
      )}
    </group>
  );
}

function RainParticles({ position }: { position: [number, number, number] }) {
  const points = useRef<THREE.Points>(null!);
  const count = 40;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2;
      pos[i * 3 + 1] = Math.random() * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (points.current) {
      const pos = points.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] -= delta * 2;
        if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 4;
      }
      points.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={points} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#60a5fa" size={0.05} transparent opacity={0.6} />
    </points>
  );
}

function GridFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#0a1628"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      {/* Grid lines */}
      <gridHelper args={[20, 20, "#1e3a5f", "#0d2137"]} position={[0, 0, 0]} />
    </group>
  );
}

function Scene({
  zones,
  selectedZone,
  onSelect,
}: {
  zones: (ZoneRiskData & { riskLevel: string })[];
  selectedZone: string | null;
  onSelect: (zone: string) => void;
}) {
  const lightRef = useRef<THREE.DirectionalLight>(null!);
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 8;
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight
        ref={lightRef}
        position={[5, 10, 5]}
        intensity={1.5}
        castShadow
        color="#ffffff"
      />
      <pointLight position={[0, 8, 0]} intensity={1} color="#10b981" distance={15} />
      <fog attach="fog" args={["#050b15", 15, 35]} />

      <GridFloor />

      {zones.map((z) => (
        <ZoneBlock
          key={z.zone}
          zoneData={z}
          riskLevel={z.riskLevel}
          selected={selectedZone === z.zone}
          onClick={() => onSelect(z.zone)}
        />
      ))}

      {/* Rain particles for high-rainfall zones */}
      {zones
        .filter((z) => z.rainfallMm >= 35)
        .map((z) => {
          const pos = ZONE_POSITIONS[z.zone] || [0, 0];
          return (
            <RainParticles key={`rain-${z.zone}`} position={[pos[0], 0, pos[1]]} />
          );
        })}
    </>
  );
}

export default function ZoneMap3D({
  zones,
  selectedZone,
  onSelect,
}: {
  zones: (ZoneRiskData & { riskLevel: string })[];
  selectedZone: string | null;
  onSelect: (zone: string) => void;
}) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [8, 10, 12], fov: 45, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene zones={zones} selectedZone={selectedZone} onSelect={onSelect} />
          <OrbitControls
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={8}
            maxDistance={22}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
