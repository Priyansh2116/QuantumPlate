"use client";
import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function FloatingSphere({ position, color, size, speed }: {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const initial = useRef(position[1]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = initial.current + Math.sin(state.clock.elapsedTime * speed) * 0.3;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[size, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.2}
        metalness={0.8}
        wireframe
      />
    </mesh>
  );
}

function DataRings() {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {[1.5, 2.2, 3.0].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + (i * 0.3), 0, 0]}>
          <torusGeometry args={[r, 0.02, 16, 100]} />
          <meshStandardMaterial
            color={i === 0 ? "#10b981" : i === 1 ? "#3b82f6" : "#8b5cf6"}
            emissive={i === 0 ? "#10b981" : i === 1 ? "#3b82f6" : "#8b5cf6"}
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

function CoreSphere() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color="#0d4a35"
        emissive="#10b981"
        emissiveIntensity={0.3}
        roughness={0.5}
        metalness={0.6}
        wireframe={false}
      />
    </mesh>
  );
}

export default function GlobeHero() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#10b981" />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#3b82f6" />

        <CoreSphere />
        <DataRings />

        <FloatingSphere position={[3.5, 1, 0]} color="#10b981" size={0.25} speed={1.2} />
        <FloatingSphere position={[-3, 0.5, 1]} color="#3b82f6" size={0.2} speed={0.9} />
        <FloatingSphere position={[2.5, -1.5, -1]} color="#8b5cf6" size={0.18} speed={1.5} />
        <FloatingSphere position={[-2.5, -1, 2]} color="#f59e0b" size={0.15} speed={1.1} />
        <FloatingSphere position={[0, 3, -1]} color="#ef4444" size={0.22} speed={0.8} />
      </Suspense>
    </Canvas>
  );
}
