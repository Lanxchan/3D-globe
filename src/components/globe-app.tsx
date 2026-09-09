import { lazy, Suspense } from "react";
import { Overlay } from "@/components/globe/overlay";

const GlobeCanvas = lazy(() =>
  import("@/components/globe/globe-canvas").then((mod) => ({ default: mod.GlobeCanvas })),
);

export function GlobeApp() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      <Suspense fallback={<div className="absolute inset-0 bg-bg" />}>
        <GlobeCanvas />
      </Suspense>
      <Overlay />
    </main>
  );
}
