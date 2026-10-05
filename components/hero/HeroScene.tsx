'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { palette } from '@/lib/palette';
import { introMs } from '@/lib/intro';

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uIntro;
  uniform float uMorph;
  uniform vec3 uMouse;
  uniform float uMouseStrength;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  attribute vec3 aTorus;
  attribute vec3 aWave;
  attribute vec3 aScatter;
  attribute float aRand;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float m1 = smoothstep(0.0, 1.0, clamp(uMorph, 0.0, 1.0));
    float m2 = smoothstep(0.0, 1.0, clamp(uMorph - 1.0, 0.0, 1.0));
    vec3 shape = mix(mix(position, aTorus, m1), aWave, m2);

    // Wave shape keeps rolling.
    shape.y += m2 * sin(shape.x * 1.4 + uTime * 1.2) * cos(shape.z * 1.1 + uTime) * 0.35;

    float intro = smoothstep(0.0, 1.0, clamp(uIntro * 1.6 - aRand * 0.6, 0.0, 1.0));
    vec3 p = mix(aScatter, shape, intro);

    // Breathing.
    p += normalize(p + 0.0001) * sin(uTime * 1.5 + aRand * 6.2831) * 0.025;

    vec4 world = modelMatrix * vec4(p, 1.0);
    vec3 d = world.xyz - uMouse;
    float dist = length(d);
    float push = smoothstep(1.4, 0.0, dist) * uMouseStrength;
    world.xyz += normalize(d + 0.0001) * push * 0.55;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.45 + aRand * 0.9) * uPixelRatio * (1.0 / -mv.z) * (1.0 + push * 1.5);

    float accent = step(0.93, aRand);
    vColor = mix(mix(uColorA, uColorB, smoothstep(-1.5, 1.5, p.y + p.x * 0.3)), uColorC, accent);
    vColor += push * vec3(0.9, 0.6, 0.2);
    vAlpha = mix(0.35, 1.0, intro) * (0.55 + aRand * 0.45);
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a = pow(a, 1.8);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

function buildGeometry(count: number) {
  const sphere = new Float32Array(count * 3);
  const torus = new Float32Array(count * 3);
  const wave = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const rand = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const side = Math.ceil(Math.sqrt(count));

  for (let i = 0; i < count; i++) {
    // Fibonacci sphere, slightly jittered shell.
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const R = 1.75 + (Math.random() - 0.5) * 0.08;
    sphere.set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], i * 3);

    // Torus knot (2,3) with a thin tube.
    const t = (i / count) * Math.PI * 2;
    const tube = Math.random() * Math.PI * 2;
    const p = 2;
    const q = 3;
    const rr = 1.1 + 0.45 * Math.cos(q * t);
    const cx = rr * Math.cos(p * t);
    const cy = rr * Math.sin(p * t);
    const cz = 0.45 * Math.sin(q * t);
    const tr = 0.18 * Math.sqrt(Math.random());
    torus.set([cx + Math.cos(tube) * tr, cy + Math.sin(tube) * tr, cz + Math.cos(tube + 1) * tr], i * 3);

    // Rolling plane grid.
    const gx = (i % side) / side - 0.5;
    const gz = Math.floor(i / side) / side - 0.5;
    wave.set([gx * 7, -0.4, gz * 5], i * 3);

    // Scattered start for the intro.
    const s = 6 + Math.random() * 6;
    const u = Math.random() * Math.PI * 2;
    const v = Math.acos(2 * Math.random() - 1);
    scatter.set([s * Math.sin(v) * Math.cos(u), s * Math.sin(v) * Math.sin(u), s * Math.cos(v) - 2], i * 3);

    rand[i] = Math.random();
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(sphere, 3));
  g.setAttribute('aTorus', new THREE.BufferAttribute(torus, 3));
  g.setAttribute('aWave', new THREE.BufferAttribute(wave, 3));
  g.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3));
  g.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);
  return g;
}

export type HeroProgress = MutableRefObject<number>;

function Particles({ count, progress, reduced, offsetX }: { count: number; progress: HeroProgress; reduced: boolean; offsetX: number }) {
  const points = useRef<THREE.Points>(null);
  const { gl, camera, pointer } = useThree();
  const geometry = useMemo(() => buildGeometry(count), [count]);
  const start = useRef<number | null>(null);
  const mouseWorld = useMemo(() => new THREE.Vector3(99, 99, 99), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const strength = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntro: { value: reduced ? 1 : 0 },
      uMorph: { value: 0 },
      uMouse: { value: new THREE.Vector3(99, 99, 99) },
      uMouseStrength: { value: 0 },
      uSize: { value: count > 3000 ? 42 : 56 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uColorA: { value: new THREE.Color(palette.bronze) },
      uColorB: { value: new THREE.Color(palette.bronzeLight) },
      uColorC: { value: new THREE.Color(palette.gold) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (start.current === null) start.current = t;
    uniforms.uTime.value = t;
    if (!reduced) uniforms.uIntro.value = Math.min(1, (t - start.current) / ((introMs() + 700) / 1000));

    const target = reduced ? 0 : progress.current * 2;
    uniforms.uMorph.value += (target - uniforms.uMorph.value) * Math.min(1, delta * 4);

    ray.setFromCamera(pointer, camera);
    ray.ray.intersectPlane(plane, mouseWorld);
    uniforms.uMouse.value.lerp(mouseWorld, 0.2);
    const moving = Math.abs(pointer.x) < 1 && Math.abs(pointer.y) < 1 ? 1 : 0;
    strength.current += (moving - strength.current) * 0.05;
    uniforms.uMouseStrength.value = reduced ? 0 : strength.current;

    if (points.current) {
      const g = points.current;
      const m = uniforms.uMorph.value;
      g.rotation.y += delta * (reduced ? 0 : 0.08 + m * 0.04);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, pointer.y * 0.2 + (m > 1 ? (m - 1) * 0.35 : 0), 0.05);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -pointer.x * 0.1, 0.05);
      // Drift from the right column toward the center as the user scrolls.
      g.position.x = THREE.MathUtils.lerp(g.position.x, offsetX * (1 - Math.min(1, m)), 0.08);
    }
  });

  return (
    <points ref={points} geometry={geometry}>
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function HeroScene({ progress, mobile, reduced }: { progress: HeroProgress; mobile: boolean; reduced: boolean }) {
  return (
    <>
      <Particles count={mobile ? 2000 : 5000} progress={progress} reduced={reduced} offsetX={mobile ? 0 : 1.9} />
      {!mobile && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.1} luminanceThreshold={0.15} luminanceSmoothing={0.6} mipmapBlur radius={0.7} />
        </EffectComposer>
      )}
    </>
  );
}
