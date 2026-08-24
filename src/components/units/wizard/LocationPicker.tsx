'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Loader2, MapPin, Minus, Plus, Search } from 'lucide-react';
import { useT } from '@/i18n';
import { useUiStore } from '@/stores/uiStore';
import { isInsideSaudi, isValidLatLng, roundCoord, SAUDI_BOUNDS } from '@/lib/units/geo';
import type { LatLng } from '@/types';

/**
 * A pin on a map, built from raw OpenStreetMap tiles.
 *
 * The partner dashboard reaches for Leaflet here. This console does not: the whole
 * requirement is pan, zoom and one draggable marker, which is a hundred lines of
 * Web-Mercator arithmetic and no new dependency — and the coordinates it produces
 * cannot even be stored yet (see `ADMIN_UNIT_CREATE_ACCEPTS_FULL_DRAFT`). Two packages
 * to carry a value the API discards is the wrong trade; the maths is below and stays.
 *
 * Tiles come from openstreetmap.org under its usage policy — fine for an internal
 * console at this volume, and the one line to change if it ever needs a keyed provider.
 */

const TILE = 256;
const MIN_ZOOM = 4;
const MAX_ZOOM = 18;
/** Street level once a point exists; country level while it does not. */
const PINNED_ZOOM = 14;
const COUNTRY_ZOOM = 5;

const lngToTileX = (lng: number, zoom: number) => ((lng + 180) / 360) * 2 ** zoom;

const latToTileY = (lat: number, zoom: number) => {
  const sin = Math.sin((lat * Math.PI) / 180);
  return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * 2 ** zoom;
};

const tileXToLng = (x: number, zoom: number) => (x / 2 ** zoom) * 360 - 180;

const tileYToLat = (y: number, zoom: number) => {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** zoom;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export interface LocationPickerProps {
  value: LatLng | null;
  /** `address` is null when the pin lands outside Saudi Arabia or the lookup fails. */
  onChange: (point: LatLng, address: string | null) => void;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const t = useT();
  const locale = useUiStore((state) => state.locale);

  const point = isValidLatLng(value) ? value : null;

  const [center, setCenter] = useState<LatLng>(point ?? SAUDI_BOUNDS.center);
  const [zoom, setZoom] = useState(point ? PINNED_ZOOM : COUNTRY_ZOOM);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [noMatch, setNoMatch] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; center: LatLng; moved: boolean } | null>(null);
  const pinDragRef = useRef(false);

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const measure = () => setSize({ width: node.clientWidth, height: node.clientHeight });

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const outsideBounds = point !== null && !isInsideSaudi(point);

  /** World-pixel coordinate of the viewport's top-left corner. */
  const originX = lngToTileX(center.lng, zoom) * TILE - size.width / 2;
  const originY = latToTileY(center.lat, zoom) * TILE - size.height / 2;

  const toScreen = (target: LatLng) => ({
    x: lngToTileX(target.lng, zoom) * TILE - originX,
    y: latToTileY(target.lat, zoom) * TILE - originY,
  });

  const toLatLng = (screenX: number, screenY: number): LatLng => ({
    lat: roundCoord(tileYToLat((originY + screenY) / TILE, zoom)),
    lng: roundCoord(tileXToLng((originX + screenX) / TILE, zoom)),
  });

  const commit = useCallback(
    async (next: LatLng) => {
      setNoMatch(false);
      onChange(next, null);

      if (!isInsideSaudi(next)) return;

      setReverseLoading(true);
      try {
        const url =
          'https://nominatim.openstreetmap.org/reverse?format=json' +
          `&lat=${next.lat}&lon=${next.lng}&addressdetails=1&accept-language=${locale}`;
        const response = await fetch(url);
        const data = (await response.json()) as { display_name?: string };
        if (data.display_name) onChange(next, data.display_name);
      } catch {
        // A failed reverse lookup is not a failed pin — the admin types the address.
      } finally {
        setReverseLoading(false);
      }
    },
    [locale, onChange],
  );

  async function search() {
    const term = query.trim();
    if (!term) return;

    setSearching(true);
    setSearchError(false);
    setNoMatch(false);
    try {
      const url =
        'https://nominatim.openstreetmap.org/search?format=json' +
        `&q=${encodeURIComponent(term)}&countrycodes=sa&limit=5&addressdetails=1&accept-language=${locale}`;
      const response = await fetch(url);
      const data = (await response.json()) as NominatimResult[];
      setResults(data);
      setNoMatch(data.length === 0);
    } catch {
      setSearchError(true);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function choose(result: NominatimResult) {
    const next = { lat: roundCoord(Number(result.lat)), lng: roundCoord(Number(result.lon)) };
    setResults([]);
    setQuery(result.display_name);
    setCenter(next);
    setZoom((current) => Math.max(current, PINNED_ZOOM));
    onChange(next, result.display_name);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (pinDragRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, center, moved: false };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;

    // While the pin is being dragged the map stays still and the pin follows.
    if (pinDragRef.current) return;

    const baseX = lngToTileX(drag.center.lng, zoom) * TILE;
    const baseY = latToTileY(drag.center.lat, zoom) * TILE;
    setCenter({
      lat: tileYToLat((baseY - dy) / TILE, zoom),
      lng: tileXToLng((baseX - dx) / TILE, zoom),
    });
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const next = toLatLng(event.clientX - rect.left, event.clientY - rect.top);

    if (pinDragRef.current) {
      pinDragRef.current = false;
      void commit(next);
      return;
    }

    // A drag pans the map; only a clean click moves the pin.
    if (!drag.moved) void commit(next);
  }

  const screen = point ? toScreen(point) : null;

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                void search();
              }}
              placeholder={t.unitWizard.searchPh}
              className="h-10 w-full rounded-xl border border-hairline bg-white ps-9 pe-3 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            />
          </div>
          <button
            type="button"
            onClick={() => void search()}
            disabled={searching}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-50"
          >
            {searching && <Loader2 className="h-4 w-4 animate-spin" />}
            {searching ? t.unitWizard.searching : t.unitWizard.searchBtn}
          </button>
        </div>

        {results.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border border-hairline bg-white shadow-pop">
            {results.map((result) => (
              <li key={`${result.lat},${result.lon}`}>
                <button
                  type="button"
                  onClick={() => choose(result)}
                  className="flex w-full items-start gap-2 px-4 py-2.5 text-start text-sm text-slate-700 transition hover:bg-surface-muted"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1">{result.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {searchError && <p className="text-xs text-status-red">{t.unitWizard.geocodeError}</p>}

      {noMatch && (
        <div className="rounded-2xl border border-hairline bg-surface-muted/70 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">{t.unitWizard.noMatchTitle}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{t.unitWizard.noMatchHint}</p>
        </div>
      )}

      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragRef.current = null;
          pinDragRef.current = false;
        }}
        className="relative h-72 touch-none select-none overflow-hidden rounded-2xl border border-hairline bg-surface-muted"
        role="application"
        aria-label={t.unitWizard.enterAddressToPin}
      >
        {size.width > 0 && <Tiles originX={originX} originY={originY} zoom={zoom} size={size} />}

        {screen && (
          <button
            type="button"
            onPointerDown={(event) => {
              event.stopPropagation();
              pinDragRef.current = true;
              dragRef.current = { x: event.clientX, y: event.clientY, center, moved: false };
              containerRef.current?.setPointerCapture(event.pointerId);
            }}
            aria-label={t.unitWizard.locationConfirmed}
            className="absolute z-10 -translate-x-1/2 -translate-y-full cursor-grab active:cursor-grabbing"
            style={{ left: screen.x, top: screen.y }}
          >
            <svg width="34" height="44" viewBox="0 0 34 44" aria-hidden>
              <path
                d="M17 43S32 26.4 32 16A15 15 0 1 0 2 16c0 10.4 15 27 15 27Z"
                fill={outsideBounds ? '#DC2626' : '#1E4034'}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <circle cx="17" cy="16" r="5.5" fill="#FFFFFF" />
            </svg>
          </button>
        )}

        {!point && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center p-4">
            <div className="rounded-2xl bg-white/95 px-4 py-3 text-center shadow-card">
              <p className="text-sm font-medium text-slate-700">{t.unitWizard.enterAddressToPin}</p>
              <p className="text-xs text-slate-500">{t.unitWizard.saudiOnly}</p>
            </div>
          </div>
        )}

        <div className="absolute end-3 top-3 z-10 flex flex-col overflow-hidden rounded-xl border border-hairline bg-white shadow-card">
          <ZoomButton
            label={t.unitWizard.zoomIn}
            onClick={() => setZoom((current) => Math.min(MAX_ZOOM, current + 1))}
          >
            <Plus className="h-4 w-4" />
          </ZoomButton>
          <ZoomButton
            label={t.unitWizard.zoomOut}
            onClick={() => setZoom((current) => Math.max(MIN_ZOOM, current - 1))}
          >
            <Minus className="h-4 w-4" />
          </ZoomButton>
        </div>

        <p className="absolute bottom-1 start-2 z-10 text-[10px] text-slate-500" dir="ltr">
          (c) OpenStreetMap contributors
        </p>
      </div>

      <p className="text-xs text-slate-500">{t.unitWizard.clickMapHint}</p>

      {outsideBounds && (
        <p className="rounded-2xl border border-status-red/30 bg-status-redSoft px-4 py-3 text-sm text-status-red">
          {t.unitWizard.outsideSaudi}
        </p>
      )}

      {point && !outsideBounds && (
        <div className="rounded-2xl bg-brand-soft px-4 py-3">
          <p className="text-sm font-medium text-brand">
            {reverseLoading ? t.unitWizard.searching : t.unitWizard.locationConfirmed}
          </p>
          <p className="text-xs text-slate-600">{t.unitWizard.saudiArabia}</p>
          <p className="mt-1 text-xs tabular-nums text-slate-500" dir="ltr">
            {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center text-slate-600 transition hover:bg-surface-muted"
    >
      {children}
    </button>
  );
}

/** The tile grid covering the viewport, one image per 256px square. */
function Tiles({
  originX,
  originY,
  zoom,
  size,
}: {
  originX: number;
  originY: number;
  zoom: number;
  size: { width: number; height: number };
}) {
  const span = 2 ** zoom;
  const firstX = Math.floor(originX / TILE);
  const firstY = Math.floor(originY / TILE);
  const lastX = Math.floor((originX + size.width) / TILE);
  const lastY = Math.floor((originY + size.height) / TILE);

  const tiles: React.ReactNode[] = [];
  for (let x = firstX; x <= lastX; x += 1) {
    for (let y = firstY; y <= lastY; y += 1) {
      // Longitude wraps around the world; latitude does not, so a row outside it is
      // simply absent rather than clamped onto the poles.
      if (y < 0 || y >= span) continue;
      const wrappedX = ((x % span) + span) % span;

      tiles.push(
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${zoom}/${x}/${y}`}
          src={`https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`}
          alt=""
          width={TILE}
          height={TILE}
          draggable={false}
          className="absolute max-w-none"
          style={{ left: x * TILE - originX, top: y * TILE - originY }}
        />,
      );
    }
  }

  return <>{tiles}</>;
}
