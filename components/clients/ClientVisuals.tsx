'use client';

import { Edges, Float, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { ClientVisual } from '@/data/content';
import { palette } from '@/lib/palette';

const glow = (c: string, k = 2.2) => new THREE.Color(c).multiplyScalar(k);

/** Fintech: a card travels through signed gateway rings that light up as it passes. */
function Gateway({ color }: { color: string }) {
  const card = useRef<THREE.Mesh>(null);
  const gates = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const trail = useRef<THREE.Points>(null);
  const gateX = [-2.4, -0.8, 0.8, 2.4];
  const trailGeo = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(60 * 3), 3)), []);
  const lit = useMemo(() => glow(palette.gold, 2.6), []);
  const dim = useMemo(() => new THREE.Color(color).multiplyScalar(0.9), [color]);
  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.35) % 1;
    const x = -4 + t * 8;
    if (card.current) {
      card.current.position.set(x, Math.sin(t * Math.PI * 4) * 0.08, 0);
      card.current.rotation.set(0.3, Math.sin(t * 6) * 0.2, 0);
    }
    gates.current.forEach((m, i) => {
      if (!m) return;
      const passed = x > gateX[i];
      const near = Math.max(0, 1 - Math.abs(x - gateX[i]) * 1.5);
      m.color.copy(passed ? lit : dim).multiplyScalar(1 + near * 1.5);
    });
    const arr = trailGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < 60; i++) {
      arr[i * 3] = x - i * 0.05;
      arr[i * 3 + 1] = Math.sin(i * 1.7 + state.clock.elapsedTime * 8) * 0.04 * (i / 60);
      arr[i * 3 + 2] = Math.cos(i * 1.3) * 0.04;
    }
    trailGeo.attributes.position.needsUpdate = true;
  });
  return (
    <group rotation={[0.25, -0.5, 0]}>
      {gateX.map((x, i) => (
        <mesh key={i} position-x={x} rotation-y={Math.PI / 2}>
          <torusGeometry args={[0.75, 0.04, 12, 64]} />
          <meshBasicMaterial ref={(m) => { gates.current[i] = m; }} toneMapped={false} />
        </mesh>
      ))}
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.01, 0.01, 9, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      <mesh ref={card}>
        <boxGeometry args={[0.7, 0.44, 0.03]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} metalness={0.6} roughness={0.2} toneMapped={false} />
      </mesh>
      <points ref={trail} geometry={trailGeo}>
        <pointsMaterial size={0.05} color={glow(palette.gold, 2)} transparent opacity={0.8} toneMapped={false} />
      </points>
    </group>
  );
}

/** Healthcare: bars rising into a growth curve. */
function Growth({ color }: { color: string }) {
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const heights = [0.4, 0.55, 0.7, 0.95, 1.2, 1.55, 1.95, 2.5];
  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.3) % 1.4;
    bars.current.forEach((b, i) => {
      if (!b) return;
      const k = THREE.MathUtils.clamp((t - i * 0.06) * 2.2, 0, 1);
      const e = 1 - Math.pow(1 - k, 3);
      b.scale.y = Math.max(0.001, e * heights[i]);
      b.position.y = (e * heights[i]) / 2 - 1;
    });
  });
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(heights.map((h, i) => new THREE.Vector3(-2.1 + i * 0.6, h - 1 + 0.25, 0))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 80, 0.025, 6, false), [curve]);
  return (
    <group rotation={[0.2, -0.45, 0]}>
      {heights.map((_, i) => (
        <mesh key={i} ref={(m) => { bars.current[i] = m; }} position={[-2.1 + i * 0.6, -1, 0]}>
          <boxGeometry args={[0.36, 1, 0.36]} />
          <meshStandardMaterial
            color={i === heights.length - 1 ? palette.gold : color}
            emissive={i === heights.length - 1 ? palette.gold : color}
            emissiveIntensity={0.5 + i * 0.12}
            metalness={0.3}
            roughness={0.3}
            transparent
            opacity={0.92}
          />
        </mesh>
      ))}
      <mesh geometry={tube}>
        <meshBasicMaterial color={glow(palette.gold, 2.5)} toneMapped={false} />
      </mesh>
      <gridHelper args={[6, 12, '#3a3022', '#1c1813']} position-y={-1} />
    </group>
  );
}

/** Luxury: a low-poly supercar silhouette on a glowing turntable. */
function Supercar({ color }: { color: string }) {
  const g = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    // Side profile, nose on the right.
    s.moveTo(-2.1, 0.15);
    s.lineTo(-2.15, 0.55);
    s.lineTo(-1.7, 0.72);
    s.lineTo(-0.9, 0.82);
    s.lineTo(-0.35, 1.18);
    s.lineTo(0.45, 1.2);
    s.lineTo(1.05, 0.78);
    s.lineTo(2.05, 0.55);
    s.lineTo(2.2, 0.3);
    s.lineTo(2.1, 0.15);
    s.lineTo(-2.1, 0.15);
    const geom = new THREE.ExtrudeGeometry(s, { depth: 1.7, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.12, bevelSegments: 1 });
    geom.translate(0, 0, -0.85);
    return geom;
  }, []);
  useFrame((_, d) => {
    if (g.current) g.current.rotation.y += d * 0.5;
  });
  const wheels: [number, number][] = [
    [-1.25, 0.95],
    [1.3, 0.95],
    [-1.25, -0.95],
    [1.3, -0.95],
  ];
  return (
    <group position-y={-0.6} scale={0.85}>
      <group ref={g}>
        <mesh geometry={geo}>
          <meshStandardMaterial color="#161616" metalness={0.9} roughness={0.25} flatShading />
          <Edges threshold={20} color={glow(color, 2.4)} />
        </mesh>
        {wheels.map(([x, z], i) => (
          <mesh key={i} position={[x, 0.2, z]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.36, 0.36, 0.26, 10]} />
            <meshStandardMaterial color="#0b0b0b" metalness={0.5} roughness={0.5} flatShading />
          </mesh>
        ))}
      </group>
      <mesh position-y={-0.2}>
        <cylinderGeometry args={[2.9, 3, 0.18, 64]} />
        <meshStandardMaterial color="#121212" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position-y={-0.1} rotation-x={-Math.PI / 2}>
        <torusGeometry args={[2.95, 0.03, 8, 96]} />
        <meshBasicMaterial color={glow(color, 3)} toneMapped={false} />
      </mesh>
    </group>
  );
}

const paintingFragment = /* glsl */ `
  uniform vec3 uA; uniform vec3 uB; uniform float uSeed; uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv * 3.0 + uSeed;
    float n = sin(p.x * 2.1 + sin(p.y * 3.3 + uTime * 0.3)) * cos(p.y * 1.7 + uSeed);
    vec3 col = mix(uA, uB, smoothstep(-0.8, 0.8, n));
    col *= 0.75 + 0.35 * smoothstep(0.0, 0.6, 1.0 - distance(vUv, vec2(0.5)));
    gl_FragColor = vec4(col, 1.0);
  }
`;
const paintingVertex = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;

function Frame({ position, size, a, b, seed }: { position: [number, number, number]; size: [number, number]; a: string; b: string; seed: number }) {
  const uniforms = useMemo(
    () => ({ uA: { value: new THREE.Color(a) }, uB: { value: new THREE.Color(b) }, uSeed: { value: seed }, uTime: { value: 0 } }),
    [a, b, seed],
  );
  useFrame((s) => {
    uniforms.uTime.value = s.clock.elapsedTime;
  });
  return (
    <Float speed={1.2 + seed * 0.2} rotationIntensity={0.5} floatIntensity={0.8} position={position}>
      <mesh>
        <boxGeometry args={[size[0] + 0.16, size[1] + 0.16, 0.08]} />
        <meshStandardMaterial color="#b8924a" metalness={0.9} roughness={0.3} emissive="#6b4a12" emissiveIntensity={0.4} />
      </mesh>
      <mesh position-z={0.045}>
        <planeGeometry args={size} />
        <shaderMaterial vertexShader={paintingVertex} fragmentShader={paintingFragment} uniforms={uniforms} />
      </mesh>
    </Float>
  );
}

/** Fine art: framed canvases drifting in space. */
function Gallery() {
  return (
    <group>
      <Frame position={[-1.9, 0.5, -0.5]} size={[1.1, 1.4]} a="#B08D57" b="#D4B483" seed={1} />
      <Frame position={[0, 0.2, 0.3]} size={[1.6, 1.1]} a="#C77DFF" b="#0A0A0B" seed={2.4} />
      <Frame position={[1.95, 0.6, -0.4]} size={[1, 1]} a="#FF5C7A" b="#EBD9B4" seed={3.7} />
      <Frame position={[-1, -1, -1]} size={[0.9, 0.7]} a="#2EC4A6" b="#B08D57" seed={5.1} />
      <Frame position={[1.3, -1, 0]} size={[0.8, 1.05]} a="#D4B483" b="#C77DFF" seed={6.6} />
    </group>
  );
}

/** Telecom affiliate: a phone rotating beside a conversion funnel. */
function Funnel({ color }: { color: string }) {
  const phone = useRef<THREE.Group>(null);
  const dots = useRef<THREE.InstancedMesh>(null);
  const count = 80;
  const seeds = useMemo(() => Array.from({ length: count }, () => [Math.random(), Math.random() * Math.PI * 2, Math.random()]), []);
  const m = useMemo(() => new THREE.Object3D(), []);
  const rings = [1.1, 0.82, 0.56, 0.32];
  useFrame((state, d) => {
    if (phone.current) phone.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.6 - 0.3;
    if (!dots.current) return;
    seeds.forEach(([s, a, keep], i) => {
      const t = (state.clock.elapsedTime * 0.25 + s) % 1;
      const y = 1.4 - t * 3;
      const level = Math.min(3, Math.floor(t * 4));
      // Particles drop out as they go down: conversion narrows.
      const alive = keep > level * 0.25;
      const r = THREE.MathUtils.lerp(1.0, 0.25, t) * (0.4 + (i % 5) * 0.12);
      m.position.set(1.4 + Math.cos(a + t * 3) * r, y, Math.sin(a + t * 3) * r);
      m.scale.setScalar(alive ? 0.05 : 0.0001);
      m.updateMatrix();
      dots.current!.setMatrixAt(i, m.matrix);
    });
    dots.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group position-x={-0.3}>
      <group ref={phone} position-x={-1.3}>
        <RoundedBox args={[1.25, 2.5, 0.12]} radius={0.12} smoothness={4}>
          <meshStandardMaterial color="#121212" metalness={0.8} roughness={0.25} />
        </RoundedBox>
        <mesh position-z={0.065}>
          <planeGeometry args={[1.1, 2.3]} />
          <meshBasicMaterial color={new THREE.Color(color).multiplyScalar(0.5)} toneMapped={false} />
        </mesh>
        {[0.6, 0.25, -0.1].map((y, i) => (
          <mesh key={i} position={[0, y, 0.07]}>
            <planeGeometry args={[0.85 - i * 0.12, 0.18]} />
            <meshBasicMaterial color={i === 2 ? glow(palette.gold, 2.2) : new THREE.Color('#ffffff').multiplyScalar(0.8)} toneMapped={false} />
          </mesh>
        ))}
      </group>
      {rings.map((r, i) => (
        <mesh key={i} position={[1.4, 1 - i * 0.75, 0]} rotation-x={-Math.PI / 2}>
          <torusGeometry args={[r, 0.025, 8, 64]} />
          <meshBasicMaterial color={i === 3 ? glow(palette.gold, 3) : glow(color, 1.5 + i * 0.3)} toneMapped={false} />
        </mesh>
      ))}
      <instancedMesh ref={dots} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={glow('#ffffff', 1.6)} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

export default function ClientVisualScene({ kind, color, bloom = true }: { kind: ClientVisual; color: string; bloom?: boolean }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={2} />
      <pointLight position={[-4, 2, 3]} intensity={25} color={palette.bronze} />
      {kind === 'gateway' && <Gateway color={color} />}
      {kind === 'growth' && <Growth color={color} />}
      {kind === 'supercar' && <Supercar color={color} />}
      {kind === 'gallery' && <Gallery />}
      {kind === 'funnel' && <Funnel color={color} />}
      {bloom && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.9} luminanceThreshold={0.3} mipmapBlur radius={0.6} />
        </EffectComposer>
      )}
    </>
  );
}
