import { Compass, MapPin, Pause, Play, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatLat, formatLng } from "@/lib/globe/geo";
import { PLACES } from "@/lib/globe/places";
import { useGlobeStore } from "@/lib/globe/store";
import { cn } from "@/lib/utils";

export function Overlay() {
  const selectedId = useGlobeStore((s) => s.selectedId);
  const select = useGlobeStore((s) => s.select);
  const autoRotate = useGlobeStore((s) => s.autoRotate);
  const setAutoRotate = useGlobeStore((s) => s.setAutoRotate);
  const listOpen = useGlobeStore((s) => s.listOpen);
  const setListOpen = useGlobeStore((s) => s.setListOpen);
  const cameraLat = useGlobeStore((s) => s.cameraLat);
  const cameraLng = useGlobeStore((s) => s.cameraLng);
  const selected = PLACES.find((place) => place.id === selectedId) ?? null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-fg">
      <div className="vignette" />

      <header className="pointer-events-none absolute top-0 left-0 p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-6">
        <div className="stagger-in">
          <p className="font-display text-3xl leading-none tracking-display text-fg sm:text-4xl">
            Meridian
          </p>
          <p className="mt-1 text-xs tracking-widest text-muted uppercase">寰宇 · 三维地球仪</p>
        </div>
      </header>

      <div className="pointer-events-auto absolute top-4 right-4 hidden h-[calc(100dvh-2rem)] w-80 flex-col gap-3 overflow-hidden sm:top-6 sm:right-6 md:flex">
        <PlaceList selectedId={selectedId} onSelect={select} />
        {selected ? <PlaceDetail place={selected} onClose={() => select(null)} /> : null}
      </div>

      <div className="pointer-events-auto absolute right-0 bottom-0 left-0 flex flex-col gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
        {selected ? <PlaceDetail place={selected} onClose={() => select(null)} compact /> : null}
        <Button
          variant="subtle"
          className="h-12 w-full justify-between rounded-xl px-4"
          onClick={() => setListOpen(true)}
        >
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-accent" />
            精选地点
          </span>
          <span className="text-muted tabular-nums">{PLACES.length}</span>
        </Button>
      </div>

      {listOpen ? (
        <div className="pointer-events-auto absolute inset-0 z-20 flex flex-col justify-end bg-bg/70 md:hidden">
          <div className="flex max-h-[78dvh] flex-col rounded-t-xl bg-surface p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[var(--shadow-border)]">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm font-medium">精选地点</p>
              <Button variant="ghost" size="icon-sm" onClick={() => setListOpen(false)} aria-label="关闭列表">
                <X className="size-4" />
              </Button>
            </div>
            <PlaceList selectedId={selectedId} onSelect={select} />
          </div>
        </div>
      ) : null}

      <div className="pointer-events-auto absolute bottom-4 left-4 hidden items-end gap-3 md:flex md:bottom-6 md:left-6">
        <div className="flex items-center gap-1 rounded-xl bg-surface p-1 shadow-[var(--shadow-border)]">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={autoRotate ? "暂停巡航" : "开始巡航"}
            onClick={() => {
              if (selectedId) select(null);
              setAutoRotate(!autoRotate);
            }}
          >
            {autoRotate ? <Pause className="size-4" /> : <Play className="size-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="复位视角"
            onClick={() => {
              select(null);
              setAutoRotate(true);
            }}
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
        <div className="rounded-xl bg-surface px-3 py-2 shadow-[var(--shadow-border)]">
          <p className="flex items-center gap-2 text-xs tracking-wide text-muted uppercase">
            <Compass className="size-3" />
            视角
          </p>
          <p className="mt-0.5 font-mono text-xs tabular-nums text-fg">
            {formatLat(cameraLat)} {formatLng(cameraLng)}
          </p>
        </div>
        <p className="mb-2 text-xs text-subtle">
          {autoRotate && !selectedId ? "拖动旋转 · 自动巡航中" : "拖动旋转 · 巡航已暂停"}
        </p>
      </div>
    </div>
  );
}

function PlaceList({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <section className="flex min-h-0 max-h-72 flex-1 flex-col overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)] md:max-h-none">
      <div className="flex items-baseline justify-between px-4 pt-4 pb-2">
        <h2 className="text-sm font-medium">精选地点</h2>
        <span className="text-xs tabular-nums text-muted">{PLACES.length}</span>
      </div>
      <ul className="flex-1 overflow-y-auto px-2 pb-2">
        {PLACES.map((place) => {
          const active = place.id === selectedId;
          return (
            <li key={place.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(active ? null : place.id)}
                className={cn(
                  "flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left transition-[background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
                  active ? "bg-elevated text-fg" : "text-fg hover:bg-surface-hover",
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm">{place.name}</span>
                  <span className="block truncate text-xs text-muted">{place.nameEn}</span>
                </span>
                <span className="shrink-0 text-xs text-subtle">{place.region}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PlaceDetail({
  place,
  onClose,
  compact = false,
}: {
  place: (typeof PLACES)[number];
  onClose: () => void;
  compact?: boolean;
}) {
  return (
    <article className="shrink-0 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl leading-tight tracking-tight text-fg">{place.name}</p>
          <p className="mt-0.5 text-xs tracking-wide text-muted">
            {place.nameEn} · {place.region}
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="取消聚焦">
          <X className="size-4" />
        </Button>
      </div>
      {compact ? null : <p className="mt-3 text-sm leading-normal text-pretty text-muted">{place.summary}</p>}
      <p className="mt-3 font-mono text-xs tabular-nums text-subtle">
        {formatLat(place.lat)} {formatLng(place.lng)}
      </p>
    </article>
  );
}
