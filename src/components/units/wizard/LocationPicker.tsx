'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Crosshair, ExternalLink, Loader2, MapPin, Minus, Plus, Search } from 'lucide-react';
import { useT } from '@/i18n';
import { useUiStore } from '@/stores/uiStore';
import { isInsideSaudi, isValidLatLng, roundCoord, SAUDI_BOUNDS } from '@/lib/units/geo';
import { parseLocationInput } from '@/lib/units/parse-location';
import type { LatLng } from '@/types';

/**
 * A pin on a map, built from raw OpenStreetMap tiles.
 *
 * The partner dashboard reaches for Leaflet. This does not: the requirement is pan,
 * zoom and one draggable marker, which is a hundred lines of Web-Mercator arithmetic and
 * no new dependency.
 *
 * The search box matters more than the map does. Nobody finds a Saudi building by typing
 * a district into a geocoder — they find it in Google Maps first. So the box takes a
 * pasted Maps link, a coordinate pair or a Plus Code and resolves them **offline**,
 * falling back to Nominatim only for a plain place name.
 */

const TILE = 256;
const MIN_ZOOM = 4;
/** OSM serves tiles to z19 — street level, individual buildings. */
const MAX_ZOOM = 19;
/** Where a resolved point lands you: close enough to see the building. */
const PINNED_ZOOM = 17;
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
  const [locating, setLocating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; center: LatLng; moved: boolean } | null>(null);
  const pinDragRef = useRef(false);
  const centerRef = useRef(center);
  centerRef.current = center;

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

  /** Drops the pin and brings the map to it. */
  const goTo = useCallback(
    (next: LatLng, address?: string) => {
      setResults([]);
      setNoMatch(false);
      setCenter(next);
      setZoom((current) => Math.max(current, PINNED_ZOOM));
      if (address) onChange(next, address);
      else void commit(next);
    },
    [commit, onChange],
  );

  async function search() {
    const parsed = parseLocationInput(query, centerRef.current);

    // A link, a coordinate pair or a Plus Code already *is* the answer — no request.
    if (parsed.kind === 'point') {
      goTo(parsed.point);
      return;
    }
    if (!parsed.query) return;

    setSearching(true);
    setSearchError(false);
    setNoMatch(false);
    try {
      const url =
        'https://nominatim.openstreetmap.org/search?format=json' +
        `&q=${encodeURIComponent(parsed.query)}&countrycodes=sa&limit=5&addressdetails=1&accept-language=${locale}`;
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

  function locate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        goTo({
          lat: roundCoord(position.coords.latitude),
          lng: roundCoord(position.coords.longitude),
        });
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  /** Zooms about the pointer, so the thing under the cursor stays under the cursor. */
  const zoomAt = useCallback(
    (screenX: number, screenY: number, delta: number) => {
      setZoom((currentZoom) => {
        const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentZoom + delta));
        if (nextZoom === currentZoom) return currentZoom;

        const node = containerRef.current;
        if (node) {
          const width = node.clientWidth;
          const height = node.clientHeight;
          const currentCenter = centerRef.current;
          const anchorX = lngToTileX(currentCenter.lng, currentZoom) * TILE - width / 2 + screenX;
          const anchorY = latToTileY(currentCenter.lat, currentZoom) * TILE - height / 2 + screenY;
          const scale = 2 ** (nextZoom - currentZoom);

          setCenter({
            lat: tileYToLat(
              (anchorY * scale - (screenY - height / 2)) / TILE,
              nextZoom,
            ),
            lng: tileXToLng(
              (anchorX * scale - (screenX - width / 2)) / TILE,
              nextZoom,
            ),
          });
        }

        return nextZoom;
      });
    },
    [],
  );

  // Registered natively, not through React: a passive listener cannot call
  // preventDefault, and without that the wizard scrolls away under the cursor.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = node.getBoundingClientRect();
      zoomAt(event.clientX - rect.left, event.clientY - rect.top, event.deltaY < 0 ? 1 : -1);
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

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

        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{t.unitWizard.searchHint}</p>

        {results.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border border-hairline bg-white shadow-pop">
            {results.map((result) => (
              <li key={`${result.lat},${result.lon}`}>
                <button
                  type="button"
                  onClick={() =>
                    goTo(
                      { lat: roundCoord(Number(result.lat)), lng: roundCoord(Number(result.lon)) },
                      result.display_name,
                    )
                  }
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
        onDoubleClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          zoomAt(event.clientX - rect.left, event.clientY - rect.top, 1);
        }}
        className="relative h-[26rem] cursor-crosshair touch-none select-none overflow-hidden rounded-2xl border border-hairline bg-surface-muted"
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

        <div className="absolute end-3 top-3 z-10 flex flex-col gap-2">
          <div className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-white shadow-card">
            <MapButton
              label={t.unitWizard.zoomIn}
              onClick={() => zoomAt(size.width / 2, size.height / 2, 1)}
            >
              <Plus className="h-4 w-4" />
            </MapButton>
            <MapButton
              label={t.unitWizard.zoomOut}
              onClick={() => zoomAt(size.width / 2, size.height / 2, -1)}
            >
              <Minus className="h-4 w-4" />
            </MapButton>
          </div>

          <div className="overflow-hidden rounded-xl border border-hairline bg-white shadow-card">
            <MapButton label={t.unitWizard.useMyLocation} onClick={locate}>
              {locating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Crosshair className="h-4 w-4" />
              )}
            </MapButton>
          </div>
        </div>

        <span className="absolute bottom-1 start-2 z-10 text-[10px] text-slate-500" dir="ltr">
          (c) OpenStreetMap contributors
        </span>

        <span className="absolute bottom-1 end-2 z-10 rounded bg-white/80 px-1.5 text-[10px] tabular-nums text-slate-500">
          z{zoom}
        </span>
      </div>

      <p className="text-xs text-slate-500">{t.unitWizard.clickMapHint}</p>

      {outsideBounds && (
        <p className="rounded-2xl border border-status-red/30 bg-status-redSoft px-4 py-3 text-sm text-status-red">
          {t.unitWizard.outsideSaudi}
        </p>
      )}

      {point && !outsideBounds && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-soft px-4 py-3">
          <div>
            <p className="text-sm font-medium text-brand">
              {reverseLoading ? t.unitWizard.searching : t.unitWizard.locationConfirmed}
            </p>
            <p className="mt-1 text-xs tabular-nums text-slate-600" dir="ltr">
              {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
            </p>
          </div>

          {/* The admin found the place in Google Maps; let them check it landed there. */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand/30 bg-white px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-white/70"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t.unitWizard.verifyOnGoogle}
          </a>
        </div>
      )}
    </div>
  );
}

function MapButton({
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
      className="grid h-9 w-9 place-items-center text-slate-600 transition hover:bg-surface-muted"
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
