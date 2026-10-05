'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { palette } from '@/lib/palette';

const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;
  attribute float aRand;
  varying float vGlow;
  varying float vRand;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.4 + aRand * 20.0) * 0.25;
    p.x += cos(uTime * 0.3 + aRand * 12.0) * 0.25;
    // Particles lean toward the cursor.
    vec2 d = uMouse - p.xy;
    float f = smoothstep(4.0, 0.0, length(d));
    p.xy += d * f * 0.35;
    p.z += f * 1.2;
    vGlow = f;
    vRand = aRand;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (14.0 + aRand * 22.0 + f * 30.0) * uPixelRatio / -mv.z;
  }
`;
const fragment = /* glsl */ `
  uniform vec3 uA;
  uniform vec3 uB;
  varying float vGlow;
  varying float vRand;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), 1.6);
    vec3 col = mix(uA, uB, vGlow + step(0.92, vRand));
    gl_FragColor = vec4(col * (1.0 + vGlow * 2.0), a * (0.35 + vGlow * 0.65));
  }
`;

export default function ContactScene({ count }: { count: number }) {
  const { viewport, gl } = useThree();
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos.set([(Math.random() - 0.5) * 22, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6], i * 3);
      rnd[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
    return g;
  }, [count]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, -20) },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uA: { value: new THREE.Color(palette.bronze) },
      uB: { value: new THREE.Color(palette.gold) },
    }),
    [gl],
  );
  const target = useRef(new THREE.Vector2());
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    target.current.set((state.pointer.x * viewport.width) / 2, (state.pointer.y * viewport.height) / 2);
    uniforms.uMouse.value.lerp(target.current, 0.08);
  });
  return (
    <points geometry={geo}>
      <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}
