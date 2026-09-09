import { create } from "zustand";
import { getPlace, type Place } from "./places";

type GlobeState = {
  selectedId: string | null;
  hoveredId: string | null;
  autoRotate: boolean;
  interacting: boolean;
  flying: boolean;
  listOpen: boolean;
  cameraLat: number;
  cameraLng: number;
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  setAutoRotate: (value: boolean) => void;
  setInteracting: (value: boolean) => void;
  setFlying: (value: boolean) => void;
  setListOpen: (value: boolean) => void;
  setCameraCoord: (lat: number, lng: number) => void;
  selectedPlace: () => Place | null;
};

export const useGlobeStore = create<GlobeState>((set, get) => ({
  selectedId: null,
  hoveredId: null,
  autoRotate: true,
  interacting: false,
  flying: false,
  listOpen: false,
  cameraLat: 28,
  cameraLng: 18,
  select: (id) =>
    set({
      selectedId: id,
      autoRotate: id ? false : get().autoRotate,
      listOpen: false,
    }),
  hover: (id) => set({ hoveredId: id }),
  setAutoRotate: (value) => set({ autoRotate: value }),
  setInteracting: (value) => set({ interacting: value }),
  setFlying: (value) => set({ flying: value }),
  setListOpen: (value) => set({ listOpen: value }),
  setCameraCoord: (lat, lng) => {
    const current = get();
    if (Math.abs(current.cameraLat - lat) < 0.12 && Math.abs(current.cameraLng - lng) < 0.12) {
      return;
    }
    set({ cameraLat: lat, cameraLng: lng });
  },
  selectedPlace: () => getPlace(get().selectedId),
}));
