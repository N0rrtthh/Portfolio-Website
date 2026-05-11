"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";

function ScrollRig({ progress }: { progress?: MotionValue<number> }) {
  const { camera } = useThree();

  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    const p = progress?.get() ?? 0;
    camera.position.z = 8.5 - p * 5.5;
    camera.position.y = p * -1.2;
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 42 + p * 16;
      camera.updateProjectionMatrix();
    }
  });
  /* eslint-enable react-hooks/immutability */

  return null;
}

/** Multi-Layered Particle Swarm: Foreground, Midground, Background */
function LayeredParticleSwarm({ progress }: { progress?: MotionValue<number> }) {
  const { mode, design } = useTheme();
  const bgPointsRef = useRef<THREE.Points>(null);
  const midPointsRef = useRef<THREE.Points>(null);
  const fgPointsRef = useRef<THREE.Points>(null);
  const mouse = useRef({ x: 0, y: 0 });

  const isEva = design === "eva";

  // Layer 1: Background (500 distant fine particles)
  const bgPositions = useMemo(() => {
    const arr = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      const r = 5.0 + Math.random() * 5.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  // Layer 2: Midground (250 responsive particles)
  const midPositions = useMemo(() => {
    const arr = new Float32Array(250 * 3);
    for (let i = 0; i < 250; i++) {
      const r = 3.0 + Math.random() * 3.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  // Layer 3: Foreground (75 large floating ambient dust particles)
  const fgPositions = useMemo(() => {
    const arr = new Float32Array(75 * 3);
    for (let i = 0; i < 75; i++) {
      const r = 1.5 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  // Theme-aware particle colors
  const particleColor = useMemo(() => {
    if (isEva) return mode === "dark" ? "#39ff14" : "#ff6a00";
    return mode === "dark" ? "#818cf8" : "#4361ee";
  }, [isEva, mode]);

  // Material refs for smooth color interpolation
  const bgMatRef = useRef<THREE.PointsMaterial>(null);
  const midMatRef = useRef<THREE.PointsMaterial>(null);
  const fgMatRef = useRef<THREE.PointsMaterial>(null);

  // Target Color
  const targetColor = useMemo(() => new THREE.Color(particleColor), [particleColor]);

  useFrame(({ clock, pointer }) => {
    mouse.current.x += (pointer.x - mouse.current.x) * 0.02;
    mouse.current.y += (pointer.y - mouse.current.y) * 0.02;

    const t = clock.getElapsedTime();
    const p = progress?.get() ?? 0;

    // Smoothly interpolate particle colors during theme transition
    if (bgMatRef.current) bgMatRef.current.color.lerp(targetColor, 0.08);
    if (midMatRef.current) midMatRef.current.color.lerp(targetColor, 0.08);

    // Background Layer — slow drift
    if (bgPointsRef.current) {
      bgPointsRef.current.rotation.y = t * 0.015 + mouse.current.x * 0.1 + p * 0.5;
      bgPointsRef.current.rotation.x = mouse.current.y * 0.05 + p * 0.2;
    }

    // Midground Layer — medium parallax
    if (midPointsRef.current) {
      midPointsRef.current.rotation.y = t * 0.035 + mouse.current.x * 0.25 + p * 1.0;
      midPointsRef.current.rotation.x = mouse.current.y * 0.15 + p * 0.4;
    }

    // Foreground Layer — fast floating dust
    if (fgPointsRef.current) {
      fgPointsRef.current.rotation.y = -t * 0.06 + mouse.current.x * 0.4 + p * 1.5;
      fgPointsRef.current.rotation.x = -mouse.current.y * 0.25;
    }
  });

  return (
    <group>
      {/* Background Layer */}
      <points ref={bgPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[bgPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={bgMatRef}
          size={0.025}
          color={particleColor}
          transparent
          opacity={0.3}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Midground Layer */}
      <points ref={midPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[midPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={midMatRef}
          size={0.04}
          color={particleColor}
          transparent
          opacity={0.5}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Foreground Layer */}
      <points ref={fgPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[fgPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color={isEva ? "#7a00ff" : "#fbbf24"}
          transparent
          opacity={0.65}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

function WireframeIcosahedron({ progress }: { progress?: MotionValue<number> }) {
  const { mode, design } = useTheme();
  const ref = useRef<THREE.Mesh>(null);

  const isEva = design === "eva";
  const wireColor = isEva ? (mode === "dark" ? "#39ff14" : "#ff3333") : "#4361ee";

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const p = progress?.get() ?? 0;
    ref.current.rotation.x = t * 0.06 + p * 0.6;
    ref.current.rotation.y = t * 0.09 + p * 1.0;
    ref.current.position.y = Math.sin(t * 0.5) * 0.25 - p * 0.6;
    ref.current.position.z = -1 + p * 2.2;
    const scale = 1 + p * 1.4;
    ref.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={ref} position={[2.6, 0.3, -1]}>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshBasicMaterial color={wireColor} wireframe transparent opacity={0.25} />
    </mesh>
  );
}

export default function ParticleField({
  scrollProgress,
}: {
  scrollProgress?: MotionValue<number>;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8.5], fov: 42 }}
      dpr={1}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      className="absolute! inset-0"
    >
      <ScrollRig progress={scrollProgress} />
      <LayeredParticleSwarm progress={scrollProgress} />
      <WireframeIcosahedron progress={scrollProgress} />
    </Canvas>
  );
}
