'use client';

import { Edges, Grid, Html, Line } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { memo, useMemo, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { palette } from '@/lib/palette';
import { setCursor } from '@/lib/cursor';

type StopKind = 'job' | 'education' | 'cta';

type Props = {
  progress: MutableRefObject<number>;
  kinds: StopKind[];
  names: string[];
  branchFrom: number;
  branches: { id: string; name: string; color: string }[];
  mobile: boolean;
  /** Client building hovered (with pointer position) or left (null). */
  onClientHover?: (id: string | null, x?: number, y?: number) => void;
  onClientOpen?: (id: string) => void;
  /** Which client building is highlighted; owned by the parent so it can be cleared from anywhere. */
  hoveredClient?: string | null;
};

/** Distance between stops along the avenue. */
const SPACING = 15;
/** Landmark towers sit this far off the avenue's centre line. */
const PLOT_X = 3.8;
/** Lot pitch for the filler city; regular rows/columns are left open as streets. */
const LOT = 3;

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

function buildLayout(kinds: StopKind[], branchFrom: number, clientCount: number) {
  const n = kinds.length;
  // The avenue wiggles gently so the trail reads as a route, not a ruler.
  const pts: THREE.Vector3[] = [new THREE.Vector3(0, 0, 12)];
  for (let i = 0; i < n; i++) pts.push(new THREE.Vector3(i % 2 ? 0.7 : -0.7, 0, -i * SPACING));
  pts.push(new THREE.Vector3(0, 0, -(n - 1) * SPACING - 12));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);

  const samples = 3000;
  const stopsT = pts.slice(1, n + 1).map((p) => {
    let best = 0;
    let bestD = Infinity;
    for (let s = 0; s <= samples; s++) {
      const d = curve.getPointAt(s / samples).distanceToSquared(p);
      if (d < bestD) {
        bestD = d;
        best = s / samples;
      }
    }
    return best;
  });

  // Newest role is tallest; heights step down going back in time.
  const towers = kinds.map((kind, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const height = kind === 'cta' ? 6.5 : Math.max(3.2, 8 - i * 1.15);
    return { kind, side, height, pos: new THREE.Vector3(side * PLOT_X, 0, -i * SPACING) };
  });

  // Client buildings cluster around the Lusso Labs tower, away from the avenue.
  const hub = towers[branchFrom];
  // Behind the hub (further down the avenue) so the district sits above the tower in frame.
  const offsets: [number, number][] = [
    [0.2, -5.0],
    [4.2, -2.6],
    [2.4, -8.8],
    [6.8, -6.4],
    [5.2, -12.0],
  ];
  const clientsAt = offsets.slice(0, clientCount).map(([dx, dz], i) => ({
    pos: new THREE.Vector3(hub.pos.x + hub.side * dx, 0, hub.pos.z + dz),
    height: 2.6 + (i % 3) * 0.5,
  }));

  return { curve, stopsT, towers, clientsAt };
}

const ease = (s: number) => (s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2);

/** Scroll progress → curve position, easing so the camera lingers at each stop. */
function progressToT(p: number, stopsT: number[]) {
  const n = stopsT.length;
  const anchorsP = [0, ...stopsT.map((_, k) => (k + 0.5) / n), 1];
  const anchorsT = [0.0, ...stopsT, stopsT[n - 1] + 0.02];
  for (let i = 0; i < anchorsP.length - 1; i++) {
    if (p <= anchorsP[i + 1]) {
      const s = (p - anchorsP[i]) / (anchorsP[i + 1] - anchorsP[i]);
      return anchorsT[i] + (anchorsT[i + 1] - anchorsT[i]) * ease(Math.max(0, Math.min(1, s)));
    }
  }
  return anchorsT[anchorsT.length - 1];
}

// ---------------------------------------------------------------------------
// Building shader: dark facades with a procedural grid of lit windows
// ---------------------------------------------------------------------------

const buildingVertex = /* glsl */ `
  attribute float aRand;
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying float vRand;
  varying float vFog;
  void main() {
    vec4 local = vec4(position, 1.0);
    vec3 n = normal;
    #ifdef USE_INSTANCING
      local = instanceMatrix * local;
      n = mat3(instanceMatrix) * n;
    #endif
    vec4 world = modelMatrix * local;
    vWorld = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * n);
    vRand = aRand;
    vec4 mv = viewMatrix * world;
    vFog = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const buildingFragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uWindow;
  uniform float uLit;
  uniform float uTime;
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying float vRand;
  varying float vFog;

  float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }

  void main() {
    float side = 1.0 - step(0.5, abs(vNormalW.y));
    float u = abs(vNormalW.x) > 0.5 ? vWorld.z : vWorld.x;
    vec2 cell = vec2(u * 3.0, vWorld.y * 3.4);
    vec2 f = fract(cell);
    float win = step(0.22, f.x) * step(f.x, 0.78) * step(0.28, f.y) * step(f.y, 0.78);
    float h = hash(vec3(floor(cell), vRand * 97.0));
    float lit = step(1.0 - uLit, h);
    float flicker = 0.8 + 0.2 * sin(uTime * (1.0 + h * 2.0) + h * 40.0);

    vec3 col = uBase * (0.75 + 0.35 * smoothstep(0.0, 8.0, vWorld.y));
    col += uWindow * win * lit * side * flicker * (0.5 + h);
    col = mix(col, uBase * 1.8, 1.0 - side);
    float fog = smoothstep(uFogNear, uFogFar, vFog);
    gl_FragColor = vec4(mix(col, uFogColor, fog), 1.0);
  }
`;

function buildingUniforms(base: string, windowColor: THREE.Color, lit: number) {
  return {
    uBase: { value: new THREE.Color(base) },
    uWindow: { value: windowColor },
    uLit: { value: lit },
    uTime: { value: 0 },
    uFogColor: { value: new THREE.Color(palette.ink) },
    uFogNear: { value: 14 },
    uFogFar: { value: 48 },
  };
}

/** A unit box (base at y=0) with a constant aRand attribute, for non-instanced buildings. */
function boxWithRand(seed: number) {
  const g = new THREE.BoxGeometry(1, 1, 1);
  g.translate(0, 0.5, 0);
  g.setAttribute('aRand', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(seed), 1));
  return g;
}

// ---------------------------------------------------------------------------
// Filler city + traffic
// ---------------------------------------------------------------------------

function City({ curve, reserved, zMin, zMax, half }: { curve: THREE.CatmullRomCurve3; reserved: THREE.Vector3[]; zMin: number; zMax: number; half: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { matrices, rands, count } = useMemo(() => {
    const m: THREE.Matrix4[] = [];
    const r: number[] = [];
    const o = new THREE.Object3D();
    const avenue = (z: number) => {
      let best = 0;
      let bd = Infinity;
      for (let s = 0; s <= 200; s++) {
        const p = curve.getPointAt(s / 200);
        const d = Math.abs(p.z - z);
        if (d < bd) {
          bd = d;
          best = p.x;
        }
      }
      return best;
    };
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let iz = Math.floor(zMin / LOT); iz <= Math.ceil(zMax / LOT); iz++) {
      if (((iz % 4) + 4) % 4 === 0) continue; // cross street
      const z = iz * LOT;
      const ax = avenue(z);
      for (let ix = -Math.ceil(half / LOT); ix <= Math.ceil(half / LOT); ix++) {
        if (((ix % 5) + 5) % 5 === 0) continue; // parallel street
        const x = ix * LOT;
        if (Math.abs(x - ax) < 2.6) continue; // the avenue itself
        if (reserved.some((p) => Math.abs(p.x - x) < 2.8 && Math.abs(p.z - z) < 2.8)) continue;
        if (rnd() < 0.12) continue; // the odd empty lot
        const w = 1.5 + rnd() * 0.9;
        const d = 1.5 + rnd() * 0.9;
        const far = Math.min(1, Math.abs(x - ax) / 18);
        const h = 0.6 + Math.pow(rnd(), 2.2) * (3.5 + far * 4);
        o.position.set(x + (rnd() - 0.5) * 0.4, 0, z + (rnd() - 0.5) * 0.4);
        o.scale.set(w, h, d);
        o.updateMatrix();
        m.push(o.matrix.clone());
        r.push(rnd());
      }
    }
    return { matrices: m, rands: r, count: m.length };
  }, [curve, reserved, zMin, zMax, half]);

  const geometry = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    g.translate(0, 0.5, 0);
    g.setAttribute('aRand', new THREE.InstancedBufferAttribute(new Float32Array(rands), 1));
    return g;
  }, [rands]);

  const uniforms = useMemo(() => buildingUniforms('#0d0c0b', new THREE.Color(palette.gold).multiplyScalar(0.55), 0.22), []);

  useFrame((s) => {
    uniforms.uTime.value = s.clock.elapsedTime;
    if (mesh.current && mesh.current.userData.count !== count) {
      matrices.forEach((mat, i) => mesh.current!.setMatrixAt(i, mat));
      mesh.current.instanceMatrix.needsUpdate = true;
      mesh.current.userData.count = count;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, count]} frustumCulled={false}>
      <shaderMaterial vertexShader={buildingVertex} fragmentShader={buildingFragment} uniforms={uniforms} />
    </instancedMesh>
  );
}

/** Head- and tail-light streaks running along the streets. */
function Traffic({ count, zMin, zMax, half }: { count: number; zMin: number; zMax: number; half: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const cars = useMemo(() => {
    let seed = 29;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const lanesX = [-1.2, 1.2];
    for (let ix = -Math.ceil(half / LOT); ix <= Math.ceil(half / LOT); ix++) if (((ix % 5) + 5) % 5 === 0 && ix !== 0) lanesX.push(ix * LOT);
    return Array.from({ length: count }, () => {
      const lane = lanesX[Math.floor(rnd() * lanesX.length)];
      const dir = rnd() < 0.5 ? 1 : -1;
      return { x: lane + dir * 0.35, dir, speed: 3 + rnd() * 5, offset: rnd() * (zMax - zMin), warm: dir > 0 };
    });
  }, [count, zMin, zMax, half]);
  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const warm = new THREE.Color('#ffe2b0').multiplyScalar(2.2);
    const red = new THREE.Color('#ff4d3d').multiplyScalar(1.8);
    cars.forEach((c, i) => (c.warm ? warm : red).toArray(arr, i * 3));
    return arr;
  }, [cars, count]);
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame((s) => {
    if (!mesh.current) return;
    const span = zMax - zMin;
    cars.forEach((c, i) => {
      const z = zMin + ((((c.offset + s.clock.elapsedTime * c.speed * c.dir) % span) + span) % span);
      o.position.set(c.x, 0.08, z);
      o.scale.set(0.07, 0.04, 0.9);
      o.updateMatrix();
      mesh.current!.setMatrixAt(i, o.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry>
        <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
      </boxGeometry>
      <meshBasicMaterial vertexColors toneMapped={false} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}

// ---------------------------------------------------------------------------
// Landmarks
// ---------------------------------------------------------------------------

/** Rises out of the ground when the camera reaches its stop. */
function useRise(curT: MutableRefObject<number>, tStop: number, speed = 2.2) {
  const rise = useRef(0.04);
  const lit = useRef(0);
  useFrame((_, delta) => {
    const reached = curT.current >= tStop - 0.03 ? 1 : 0;
    rise.current += ((reached ? 1 : 0.04) - rise.current) * Math.min(1, delta * speed);
    lit.current += (reached - lit.current) * Math.min(1, delta * 3);
  });
  return { rise, lit };
}

type TowerData = { kind: StopKind; side: number; height: number; pos: THREE.Vector3 };

function Tower({ index, tower, tStop, curT, name, mobile }: {
  index: number;
  tower: TowerData;
  tStop: number;
  curT: MutableRefObject<number>;
  name: string;
  mobile: boolean;
}) {
  const body = useRef<THREE.Group>(null);
  const beacon = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const { rise, lit } = useRise(curT, tStop);
  const [showLabel, setShowLabel] = useState(false);
  const geometry = useMemo(() => boxWithRand(index * 0.137 + 0.21), [index]);
  const gold = useMemo(() => new THREE.Color(palette.gold), []);
  const uniforms = useMemo(() => buildingUniforms('#15130f', new THREE.Color(palette.gold).multiplyScalar(1.4), 0.15), []);
  const w = tower.kind === 'education' ? 3 : 2.2;

  useFrame((s) => {
    uniforms.uTime.value = s.clock.elapsedTime;
    uniforms.uLit.value = 0.15 + lit.current * 0.6;
    if (body.current) body.current.scale.y = rise.current;
    if (beacon.current) {
      beacon.current.position.y = (tower.height + 0.6) * rise.current + 0.35;
      beacon.current.scale.setScalar(0.6 + lit.current * (0.8 + Math.sin(s.clock.elapsedTime * 3 + index) * 0.25));
    }
    if (halo.current) {
      (halo.current.material as THREE.MeshBasicMaterial).opacity = 0.05 + lit.current * 0.35;
      halo.current.scale.setScalar(1 + lit.current * 0.4 + Math.sin(s.clock.elapsedTime * 2 + index) * 0.05);
    }
    const want = lit.current > 0.6;
    if (want !== showLabel) setShowLabel(want);
  });

  return (
    <group position={tower.pos}>
      <mesh ref={halo} rotation-x={-Math.PI / 2} position-y={0.02}>
        <ringGeometry args={[w * 0.85, w * 0.95, 64]} />
        <meshBasicMaterial color={gold.clone().multiplyScalar(2)} transparent toneMapped={false} />
      </mesh>
      <group ref={body}>
        <mesh geometry={geometry} scale={[w, tower.height, w]}>
          <shaderMaterial vertexShader={buildingVertex} fragmentShader={buildingFragment} uniforms={uniforms} />
          <Edges threshold={15} color={gold.clone().multiplyScalar(1.6)} />
        </mesh>
        {tower.kind === 'job' && (
          <mesh position-y={tower.height} scale={[w * 0.6, 0.6, w * 0.6]} geometry={geometry}>
            <shaderMaterial vertexShader={buildingVertex} fragmentShader={buildingFragment} uniforms={uniforms} />
            <Edges threshold={15} color={gold.clone().multiplyScalar(1.6)} />
          </mesh>
        )}
      </group>
      {tower.kind === 'education' ? (
        <GradCap y={() => tower.height * rise.current + 0.55} />
      ) : (
        <mesh ref={beacon}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial color={gold.clone().multiplyScalar(3)} toneMapped={false} />
        </mesh>
      )}
      {showLabel && !mobile && (
        <Html position={[0, tower.height + 1.5, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-full border border-gold/40 bg-ink/80 px-3 py-1 font-display text-xs font-semibold uppercase tracking-[0.18em] text-gold-300 backdrop-blur">
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}

/** The last plot: a holographic tower outline under construction, waiting for "your team". */
function FutureTower({ tower, tStop, curT, name }: { tower: TowerData; tStop: number; curT: MutableRefObject<number>; name: string }) {
  const scan = useRef<THREE.Mesh>(null);
  const frame = useRef<THREE.Group>(null);
  const { lit } = useRise(curT, tStop);
  const [showLabel, setShowLabel] = useState(false);
  const gold = useMemo(() => new THREE.Color(palette.gold), []);
  const h = tower.height;
  useFrame((s) => {
    if (scan.current) {
      scan.current.position.y = ((s.clock.elapsedTime * 1.4) % h) + 0.05;
      (scan.current.material as THREE.MeshBasicMaterial).opacity = 0.1 + lit.current * 0.3;
    }
    if (frame.current) frame.current.scale.y = 0.3 + lit.current * 0.7;
    const want = lit.current > 0.6;
    if (want !== showLabel) setShowLabel(want);
  });
  return (
    <group position={tower.pos}>
      <group ref={frame}>
        <mesh position-y={h / 2}>
          <boxGeometry args={[2.4, h, 2.4]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          <Edges color={gold.clone().multiplyScalar(2.2)} />
        </mesh>
        {[0.25, 0.5, 0.75].map((f) => (
          <mesh key={f} position-y={h * f}>
            <boxGeometry args={[2.4, 0.02, 2.4]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            <Edges color={gold.clone().multiplyScalar(1.2)} />
          </mesh>
        ))}
      </group>
      <mesh ref={scan} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2.4, 2.4]} />
        <meshBasicMaterial color={gold.clone().multiplyScalar(2)} transparent side={THREE.DoubleSide} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
        <ringGeometry args={[1.9, 2.05, 64]} />
        <meshBasicMaterial color={gold.clone().multiplyScalar(2.5)} toneMapped={false} />
      </mesh>
      {showLabel && (
        <Html position={[0, h + 1, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-full border border-dashed border-gold/60 bg-ink/80 px-3 py-1 font-display text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}

function GradCap({ y }: { y: () => number }) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    g.current.rotation.y = state.clock.elapsedTime * 0.6;
    g.current.position.y = y() + Math.sin(state.clock.elapsedTime * 2) * 0.08;
  });
  return (
    <group ref={g}>
      <mesh rotation-y={Math.PI / 4}>
        <boxGeometry args={[1.1, 0.06, 1.1]} />
        <meshStandardMaterial color="#1a1712" emissive={palette.gold} emissiveIntensity={0.5} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position-y={-0.18}>
        <cylinderGeometry args={[0.32, 0.36, 0.3, 24]} />
        <meshStandardMaterial color="#1a1712" emissive={palette.gold} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.38, -0.3, 0.38]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color={new THREE.Color(palette.gold).multiplyScalar(3)} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Client buildings around the Lusso Labs tower, linked to its roof by arcs of light. */
function ClientDistrict({ hub, hubHeight, clientsAt, branches, tStop, curT, mobile, onClientHover, onClientOpen, hovered = null }: {
  hub: THREE.Vector3;
  hubHeight: number;
  clientsAt: { pos: THREE.Vector3; height: number }[];
  branches: Props['branches'];
  tStop: number;
  curT: MutableRefObject<number>;
  mobile: boolean;
  onClientHover?: Props['onClientHover'];
  onClientOpen?: Props['onClientOpen'];
  hovered?: string | null;
}) {
  const enter = (id: string, x: number, y: number) => {
    setCursor('hover');
    if (!mobile) onClientHover?.(id, x, y);
  };
  const leave = () => {
    setCursor('default');
    onClientHover?.(null);
  };
  const { rise, lit } = useRise(curT, tStop, 1.6);
  const group = useRef<THREE.Group>(null);
  const arcs = useRef<THREE.Group>(null);
  const [labels, setLabels] = useState(false);
  const data = useMemo(
    () =>
      clientsAt.map((c, i) => {
        const roof = c.pos.clone().setY(c.height + 0.1);
        const start = hub.clone().setY(hubHeight + 0.6);
        const mid = start.clone().lerp(roof, 0.5).add(new THREE.Vector3(0, 2.4, 0));
        return {
          ...c,
          id: branches[i].id,
          color: branches[i].color,
          name: branches[i].name,
          arc: new THREE.QuadraticBezierCurve3(start, mid, roof).getPoints(40),
          geometry: boxWithRand(0.5 + i * 0.11),
          uniforms: buildingUniforms('#100f0d', new THREE.Color(branches[i].color).multiplyScalar(1.3), 0.45),
        };
      }),
    [clientsAt, hub, hubHeight, branches],
  );

  useFrame((s) => {
    if (group.current) group.current.scale.y = rise.current;
    data.forEach((d) => {
      d.uniforms.uTime.value = s.clock.elapsedTime;
      d.uniforms.uLit.value = (0.1 + lit.current * 0.55) * (hovered === d.id ? 1.6 : 1);
    });
    if (arcs.current) arcs.current.visible = lit.current > 0.5;
    const want = lit.current > 0.6;
    if (want !== labels) setLabels(want);
  });

  return (
    <>
      <group ref={group}>
        {data.map((d) => (
          <mesh
            key={d.name}
            geometry={d.geometry}
            position={d.pos}
            scale={[1.7, d.height, 1.7]}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              if (lit.current < 0.6) return;
              e.stopPropagation();
              enter(d.id, e.nativeEvent.clientX, e.nativeEvent.clientY);
            }}
            onPointerOut={leave}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              if (lit.current < 0.6) return;
              e.stopPropagation();
              leave();
              onClientOpen?.(d.id);
            }}
          >
            <shaderMaterial vertexShader={buildingVertex} fragmentShader={buildingFragment} uniforms={d.uniforms} />
            <Edges threshold={15} color={new THREE.Color(d.color).multiplyScalar(1.4)} />
          </mesh>
        ))}
      </group>
      <group ref={arcs} visible={false}>
        {data.map((d) => (
          <Line key={d.name} points={d.arc} color={d.color} lineWidth={1.6} transparent opacity={0.9} toneMapped={false} />
        ))}
      </group>
      {labels &&
        data.map((d) => (
          <Html key={d.name} position={[d.pos.x, d.height + 0.7, d.pos.z]} center zIndexRange={[6, 0]}>
            <button
              type="button"
              onMouseEnter={(e) => enter(d.id, e.clientX, e.clientY)}
              onMouseLeave={leave}
              onFocus={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                enter(d.id, r.right, r.bottom);
              }}
              onBlur={leave}
              onClick={() => {
                leave();
                onClientOpen?.(d.id);
              }}
              className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] text-white backdrop-blur transition-all ${
                hovered === d.id ? 'scale-110 border-white/40 bg-white/15' : 'border-white/10 bg-ink/80'
              }`}
            >
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: d.color }} />
              {d.name}
            </button>
          </Html>
        ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Route trail
// ---------------------------------------------------------------------------

const trailVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const trailFragment = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform vec3 uDim;
  uniform vec3 uLit;
  varying vec2 vUv;
  void main() {
    float lit = step(vUv.x, uProgress);
    float dash = smoothstep(0.5, 0.56, fract(vUv.x * 160.0 - uTime * 1.2));
    vec3 col = mix(uDim * (0.4 + dash * 0.6), uLit * (1.3 + dash * 0.9), lit);
    float head = smoothstep(0.01, 0.0, abs(vUv.x - uProgress));
    col += vec3(1.0, 0.9, 0.7) * head * 3.0;
    gl_FragColor = vec4(col, mix(0.5, 1.0, lit));
  }
`;

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

function RouteScene({ progress, kinds, names, branchFrom, branches, mobile, onClientHover, onClientOpen, hoveredClient }: Props) {
  const { curve, stopsT, towers, clientsAt } = useMemo(
    () => buildLayout(kinds, branchFrom, branches.length),
    [kinds, branchFrom, branches.length],
  );
  const trail = useMemo(() => {
    const g = new THREE.TubeGeometry(curve, 700, 0.07, 6, false);
    g.scale(1, 0.25, 1);
    g.translate(0, 0.03, 0);
    return g;
  }, [curve]);
  const reserved = useMemo(() => [...towers.map((t) => t.pos), ...clientsAt.map((c) => c.pos)], [towers, clientsAt]);
  const zMax = 22;
  const zMin = -(kinds.length - 1) * SPACING - 30;
  const half = mobile ? 20 : 34;

  const curT = useRef(0);
  const look = useMemo(() => new THREE.Vector3(0, 2, 0), []);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const lookWant = useMemo(() => new THREE.Vector3(), []);
  const traveler = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uDim: { value: new THREE.Color(palette.bronze).multiplyScalar(0.7) },
      uLit: { value: new THREE.Color(palette.gold) },
    }),
    [],
  );

  useFrame((state, delta) => {
    const target = progressToT(progress.current, stopsT);
    curT.current += (target - curT.current) * Math.min(1, delta * 3.5);
    const t = Math.min(0.999, Math.max(0, curT.current));
    uniforms.uProgress.value = t;
    uniforms.uTime.value = state.clock.elapsedTime;

    const p = curve.getPointAt(t);
    // Follow the active tower's side of the avenue, blending between stops.
    let k = 0;
    while (k < stopsT.length - 1 && t > stopsT[k + 1]) k++;
    const span = k < stopsT.length - 1 ? stopsT[k + 1] - stopsT[k] : 1;
    const f = t <= stopsT[0] ? 0 : Math.min(1, Math.max(0, (t - stopsT[k]) / span));
    const x0 = towers[k].pos.x;
    const x1 = towers[Math.min(k + 1, towers.length - 1)].pos.x;
    const cx = THREE.MathUtils.lerp(x0, x1, ease(f)) * (mobile ? 0.85 : 0.75);
    // Drone shot: high and behind; on desktop the tower sits left of the info card.
    camPos.set(cx + (mobile ? 0 : 0.6), mobile ? 15 : 12.5, p.z + (mobile ? 19 : 16));
    state.camera.position.lerp(camPos, 0.08);
    lookWant.set(cx + (mobile ? 0 : 2.4), mobile ? -1.5 : 2.8, p.z - (mobile ? 1 : 3));
    look.lerp(lookWant, 0.1);
    state.camera.lookAt(look);
    traveler.current?.position.set(p.x, 0.12, p.z);
  });

  return (
    <>
      <color attach="background" args={[palette.ink]} />
      <fog attach="fog" args={[palette.ink, 14, 48]} />
      <hemisphereLight args={['#f3e2bf', '#0a0a0b', 0.35]} />
      <pointLight position={[0, 10, 0]} intensity={15} color={palette.gold} />
      <Grid
        position={[0, 0, -30]}
        args={[120, 160]}
        cellSize={LOT}
        cellThickness={0.5}
        cellColor="#16130f"
        sectionSize={LOT * 4}
        sectionThickness={0.9}
        sectionColor="#3a3022"
        fadeDistance={55}
        fadeStrength={1.4}
        infiniteGrid
      />
      <City curve={curve} reserved={reserved} zMin={zMin} zMax={zMax} half={half} />
      <Traffic count={mobile ? 40 : 110} zMin={zMin} zMax={zMax} half={half} />
      <mesh geometry={trail}>
        <shaderMaterial vertexShader={trailVertex} fragmentShader={trailFragment} uniforms={uniforms} transparent toneMapped={false} />
      </mesh>
      <mesh ref={traveler}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color={new THREE.Color('#f3e2bf').multiplyScalar(3)} toneMapped={false} />
      </mesh>
      {towers.map((tw, i) =>
        tw.kind === 'cta' ? (
          <FutureTower key={i} tower={tw} tStop={stopsT[i]} curT={curT} name={names[i]} />
        ) : (
          <Tower key={i} index={i} tower={tw} tStop={stopsT[i]} curT={curT} name={names[i]} mobile={mobile} />
        ),
      )}
      <ClientDistrict
        hub={towers[branchFrom].pos}
        hubHeight={towers[branchFrom].height + 0.6}
        clientsAt={clientsAt}
        branches={branches}
        tStop={stopsT[branchFrom]}
        curT={curT}
        mobile={mobile}
        onClientHover={onClientHover}
        onClientOpen={onClientOpen}
        hovered={hoveredClient}
      />
      {!mobile && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.1} luminanceThreshold={0.35} mipmapBlur radius={0.65} />
        </EffectComposer>
      )}
    </>
  );
}

// Memoised so pointer-tracking state in the parent doesn't re-render the city.
export default memo(RouteScene);
