import { useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import { Atmosphere, Earth, Lights, Starfield } from "./earth";
import { CameraRig } from "./camera-rig";
import { Markers } from "./markers";

function Loader() {
  const { progress, active, loaded, total } = useProgress();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const done = !active && (loaded > 0 || progress >= 100);
    if (!done) return;
    const timer = window.setTimeout(() => setVisible(false), 380);
    return () => window.clearTimeout(timer);
  }, [active, loaded, progress]);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 7000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const width = total > 0 ? Math.min(100, (loaded / total) * 100) : Math.min(100, progress);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-24 z-[5] flex justify-center md:bottom-8"
      style={{ opacity: !active && loaded > 0 ? 0 : 1 }}
    >
      <div className="rounded-xl bg-surface px-4 py-2 shadow-[var(--shadow-border)]">
        <p className="text-xs tracking-widest text-muted uppercase">正在展开地球</p>
        <div className="mt-2 h-px w-32 overflow-hidden bg-elevated">
          <div
            className="h-full bg-accent transition-[width] duration-[var(--motion-fast)] ease-[var(--ease-out)]"
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function Scene() {
  return (
    <>
      <Starfield />
      <Lights />
      <Suspense fallback={null}>
        <Earth />
      </Suspense>
      <Atmosphere />
      <Markers />
      <CameraRig />
    </>
  );
}

export function GlobeCanvas() {
  return (
    <>
      <Canvas
        className="globe-canvas"
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
        camera={{ fov: 42, near: 0.1, far: 80, position: [0, 0.4, 2.85] }}
        onCreated={({ gl }) => {
          gl.setClearColor("#07080c", 1);
          gl.domElement.style.touchAction = "none";
        }}
      >
        <color attach="background" args={["#07080c"]} />
        <Scene />
      </Canvas>
      <Loader />
    </>
  );
}
