import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { latLngToVector3 } from "@/lib/globe/geo";
import { PLACES, type Place } from "@/lib/globe/places";
import { useGlobeStore } from "@/lib/globe/store";

function createGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.18, "rgba(210,230,255,0.7)");
  gradient.addColorStop(0.42, "rgba(126,175,212,0.28)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const up = new THREE.Vector3(0, 1, 0);
const skipRaycast = () => {};

function Marker({ place, glow }: { place: Place; glow: THREE.Texture }) {
  const selected = useGlobeStore((s) => s.selectedId === place.id);
  const hovered = useGlobeStore((s) => s.hoveredId === place.id);
  const select = useGlobeStore((s) => s.select);
  const hover = useGlobeStore((s) => s.hover);
  const glowRef = useRef<THREE.Sprite>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  const { position, quaternion } = useMemo(() => {
    const position = latLngToVector3(place.lat, place.lng, 1.018);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, position.clone().normalize());
    return { position, quaternion };
  }, [place.lat, place.lng]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    phase.current += dt * (selected ? 2.8 : 2.0);
    const pulse = 1 + 0.2 * Math.sin(phase.current);
    if (glowRef.current) {
      const scale = (selected ? 0.38 : hovered ? 0.3 : 0.24) * pulse;
      glowRef.current.scale.setScalar(scale);
    }
    if (coreRef.current) {
      const s = selected ? 1.4 : hovered ? 1.18 : 1;
      coreRef.current.scale.setScalar(s);
    }
  });

  const active = selected || hovered;

  const pick = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    select(place.id);
  };

  const enter = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    hover(place.id);
    document.body.style.cursor = "pointer";
  };

  const leave = () => {
    hover(null);
    document.body.style.cursor = "auto";
  };

  return (
    <group position={position} quaternion={quaternion}>
      <mesh rotation={[Math.PI / 2, 0, 0]} raycast={skipRaycast}>
        <torusGeometry args={[selected ? 0.048 : 0.036, 0.0022, 8, 48]} />
        <meshBasicMaterial
          color={selected ? "#e8f1ff" : "#9eb8d0"}
          transparent
          opacity={selected ? 0.95 : 0.7}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={coreRef} position={[0, 0.006, 0]} raycast={skipRaycast}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshBasicMaterial color={selected ? "#f4f8ff" : "#d0e4f6"} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.006, 0]} onClick={pick} onPointerOver={enter} onPointerOut={leave}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <sprite ref={glowRef} position={[0, 0.008, 0]} raycast={skipRaycast}>
        <spriteMaterial
          map={glow}
          color={selected ? "#e4f0ff" : "#9ec4e4"}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      {active ? (
        <Html position={[0, 0.09, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[20, 0]}>
          <div className="marker-label">
            <span className="marker-label-name">{place.name}</span>
            <span className="marker-label-en">{place.nameEn}</span>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

export function Markers() {
  const glow = useMemo(() => createGlowTexture(), []);
  return (
    <group>
      {PLACES.map((place) => (
        <Marker key={place.id} place={place} glow={glow} />
      ))}
    </group>
  );
}
