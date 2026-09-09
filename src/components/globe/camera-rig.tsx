import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type ComponentRef } from "react";
import * as THREE from "three";
import {
  DEFAULT_CAMERA_DISTANCE,
  FOCUS_CAMERA_DISTANCE,
  easeInOutCubic,
  latLngToVector3,
  lerpSpherical,
  prefersReducedMotion,
  vector3ToLatLng,
} from "@/lib/globe/geo";
import { getPlace } from "@/lib/globe/places";
import { useGlobeStore } from "@/lib/globe/store";

const fromSpherical = new THREE.Spherical();
const toSpherical = new THREE.Spherical();
const tmpSpherical = new THREE.Spherical();
const fromTarget = new THREE.Vector3();
const toTarget = new THREE.Vector3();
const tmpTarget = new THREE.Vector3();
const lookOffset = new THREE.Vector3();

type Flight = {
  active: boolean;
  elapsed: number;
  duration: number;
  fromRadius: number;
  toRadius: number;
  fromPhi: number;
  toPhi: number;
  fromTheta: number;
  toTheta: number;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
};

export function CameraRig() {
  const selectedId = useGlobeStore((s) => s.selectedId);
  const autoRotate = useGlobeStore((s) => s.autoRotate);
  const interacting = useGlobeStore((s) => s.interacting);
  const flying = useGlobeStore((s) => s.flying);
  const setFlying = useGlobeStore((s) => s.setFlying);
  const setInteracting = useGlobeStore((s) => s.setInteracting);
  const setAutoRotate = useGlobeStore((s) => s.setAutoRotate);
  const setCameraCoord = useGlobeStore((s) => s.setCameraCoord);
  const { camera } = useThree();
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const flight = useRef<Flight | null>(null);
  const hudAcc = useRef(0);
  const reduced = useRef(false);
  const skipInitial = useRef(true);

  useEffect(() => {
    reduced.current = prefersReducedMotion();
    camera.position.copy(latLngToVector3(28, 18, DEFAULT_CAMERA_DISTANCE));
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useEffect(() => {
    if (skipInitial.current) {
      skipInitial.current = false;
      if (!selectedId) return;
    }
    const controls = controlsRef.current;
    if (!controls) return;
    const place = getPlace(selectedId);
    fromSpherical.setFromVector3(camera.position);
    fromTarget.copy(controls.target);

    if (place) {
      lookOffset.copy(latLngToVector3(place.lat, place.lng, 1));
      toSpherical.setFromVector3(lookOffset.clone().setLength(FOCUS_CAMERA_DISTANCE));
      toTarget.copy(lookOffset).multiplyScalar(0.14);
    } else {
      toSpherical.set(DEFAULT_CAMERA_DISTANCE, fromSpherical.phi, fromSpherical.theta);
      toTarget.set(0, 0, 0);
    }

    if (reduced.current) {
      camera.position.setFromSpherical(toSpherical);
      controls.target.copy(toTarget);
      controls.update();
      setFlying(false);
      flight.current = null;
      return;
    }

    flight.current = {
      active: true,
      elapsed: 0,
      duration: place ? 1.35 : 0.9,
      fromRadius: fromSpherical.radius,
      toRadius: toSpherical.radius,
      fromPhi: fromSpherical.phi,
      toPhi: toSpherical.phi,
      fromTheta: fromSpherical.theta,
      toTheta: toSpherical.theta,
      fromTarget: fromTarget.clone(),
      toTarget: toTarget.clone(),
    };
    setFlying(true);
    controls.enabled = false;
  }, [selectedId, camera, setFlying]);

  useEffect(() => {
    if (interacting || selectedId || flying) return;
    if (reduced.current) return;
    const timer = window.setTimeout(() => setAutoRotate(true), 2600);
    return () => window.clearTimeout(timer);
  }, [interacting, selectedId, flying, setAutoRotate]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const controls = controlsRef.current;
    const current = flight.current;

    if (current?.active && controls) {
      current.elapsed += dt;
      const t = easeInOutCubic(Math.min(1, current.elapsed / current.duration));
      fromSpherical.set(current.fromRadius, current.fromPhi, current.fromTheta);
      toSpherical.set(current.toRadius, current.toPhi, current.toTheta);
      lerpSpherical(fromSpherical, toSpherical, t, tmpSpherical);
      camera.position.setFromSpherical(tmpSpherical);
      tmpTarget.lerpVectors(current.fromTarget, current.toTarget, t);
      controls.target.copy(tmpTarget);
      controls.update();
      if (t >= 1) {
        current.active = false;
        controls.enabled = true;
        setFlying(false);
      }
    }

    hudAcc.current += dt;
    if (hudAcc.current > 0.14) {
      hudAcc.current = 0;
      const { lat, lng } = vector3ToLatLng(state.camera.position);
      setCameraCoord(lat, lng);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.075}
      minDistance={1.52}
      maxDistance={5.4}
      minPolarAngle={0.18}
      maxPolarAngle={Math.PI - 0.18}
      autoRotate={autoRotate && !interacting && !selectedId && !flying && !reduced.current}
      autoRotateSpeed={0.32}
      rotateSpeed={0.52}
      zoomSpeed={0.72}
      onStart={() => {
        setInteracting(true);
        setAutoRotate(false);
      }}
      onEnd={() => setInteracting(false)}
    />
  );
}
