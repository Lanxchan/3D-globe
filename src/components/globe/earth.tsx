import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { SUN_DIRECTION } from "@/lib/globe/geo";
import { useGlobeStore } from "@/lib/globe/store";

const EARTH_VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;

void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const EARTH_FRAG = /* glsl */ `
uniform sampler2D dayMap;
uniform sampler2D nightMap;
uniform sampler2D waterMap;
uniform sampler2D topoMap;
uniform vec3 sunDirection;
uniform vec3 atmosphereColor;

varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;

void main() {
  vec3 normal = normalize(vWorldNormal);
  vec3 dayCol = texture2D(dayMap, vUv).rgb;
  vec3 nightCol = texture2D(nightMap, vUv).rgb;
  float water = texture2D(waterMap, vUv).r;
  float elev = texture2D(topoMap, vUv).r;

  float sun = dot(normal, sunDirection);
  float dayFactor = smoothstep(-0.12, 0.32, sun);

  vec3 color = mix(nightCol * 1.2, dayCol, dayFactor);
  color *= 0.9 + elev * 0.14;

  float twilight = exp(-pow(sun * 3.6, 2.0));
  color += vec3(0.38, 0.2, 0.1) * twilight * 0.22;

  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  vec3 halfV = normalize(sunDirection + viewDir);
  float spec = pow(max(dot(normal, halfV), 0.0), 52.0);
  color += vec3(0.72, 0.84, 1.0) * spec * water * dayFactor * 0.42;

  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.35);
  color += atmosphereColor * fresnel * 0.32;

  gl_FragColor = vec4(color, 1.0);
}
`;

const ATM_VERT = /* glsl */ `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const ATM_FRAG = /* glsl */ `
uniform vec3 glowColor;
uniform float power;
uniform float offset;
varying vec3 vNormal;
void main() {
  float intensity = pow(offset - dot(vNormal, vec3(0.0, 0.0, 1.0)), power);
  gl_FragColor = vec4(glowColor, 1.0) * intensity;
}
`;

const skipRaycast = () => {};

export function Earth() {
  const select = useGlobeStore((s) => s.select);
  const [dayMap, nightMap, waterMap, topoMap] = useTexture([
    "/textures/earth-day.jpg",
    "/textures/earth-night.jpg",
    "/textures/earth-water.png",
    "/textures/earth-topology.png",
  ]);

  dayMap.colorSpace = THREE.SRGBColorSpace;
  nightMap.colorSpace = THREE.SRGBColorSpace;
  dayMap.anisotropy = 8;
  nightMap.anisotropy = 8;
  waterMap.anisotropy = 4;
  topoMap.anisotropy = 4;

  const uniforms = useMemo(
    () => ({
      dayMap: { value: dayMap },
      nightMap: { value: nightMap },
      waterMap: { value: waterMap },
      topoMap: { value: topoMap },
      sunDirection: { value: SUN_DIRECTION.clone() },
      atmosphereColor: { value: new THREE.Color("#7eafd4") },
    }),
    [dayMap, nightMap, waterMap, topoMap],
  );

  return (
    <mesh
      onClick={(event) => {
        event.stopPropagation();
        select(null);
      }}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={EARTH_VERT}
        fragmentShader={EARTH_FRAG}
        toneMapped={false}
      />
    </mesh>
  );
}

export function Atmosphere() {
  const outer = useMemo(
    () => ({
      glowColor: { value: new THREE.Color("#6ea4d4") },
      power: { value: 2.6 },
      offset: { value: 0.64 },
    }),
    [],
  );
  const inner = useMemo(
    () => ({
      glowColor: { value: new THREE.Color("#9ec4e4") },
      power: { value: 3.4 },
      offset: { value: 0.72 },
    }),
    [],
  );

  return (
    <>
      <mesh scale={1.16} raycast={skipRaycast}>
        <sphereGeometry args={[1, 48, 48]} />
        <shaderMaterial
          uniforms={outer}
          vertexShader={ATM_VERT}
          fragmentShader={ATM_FRAG}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh scale={1.02} raycast={skipRaycast}>
        <sphereGeometry args={[1, 48, 48]} />
        <shaderMaterial
          uniforms={inner}
          vertexShader={ATM_VERT}
          fragmentShader={ATM_FRAG}
          side={THREE.FrontSide}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

export function Lights() {
  const sunPos = useMemo(() => SUN_DIRECTION.clone().multiplyScalar(12), []);
  return (
    <>
      <ambientLight intensity={0.16} color="#8ea0b8" />
      <hemisphereLight args={["#8bb0d0", "#0c0a08", 0.32]} />
      <directionalLight position={sunPos} intensity={1.85} color="#fff4e8" />
    </>
  );
}

export function Starfield() {
  const geometry = useMemo(() => {
    const count = 1600;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const radius = 16 + Math.random() * 28;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      const tint = 0.82 + Math.random() * 0.18;
      color.setRGB(tint, tint, 0.92 + Math.random() * 0.08);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <points geometry={geometry} raycast={skipRaycast}>
      <pointsMaterial
        size={0.045}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}
