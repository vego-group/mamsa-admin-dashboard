'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bath,
  BedDouble,
  ChevronLeft,
  CircleCheck,
  CircleX,
  ExternalLink,
  MapPin,
  Maximize,
  Star,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ErrorState, LtrText, PdfViewer, StatusBadge } from '@/components/common';
import { ImageGallery } from '@/components/approvals/ImageGallery';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { unitsApi } from '@/lib/api';
import { UNIT_STATUS } from '@/lib/constants';
import { formatPercent, formatSAR } from '@/lib/utils/format';
import type { UnitDetail } from '@/types';

export default function UnitDetailPage({ params }: { params: { id: string } }) {
  const t = useT();

  const [detail, setDetail] = useState<UnitDetail | null>(null);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let stale = false;
    setError(false);
    setDetail(null);
    unitsApi
      .get(params.id)
      .then((result) => !stale && setDetail(result))
      .catch(() => !stale && setError(true));
    return () => {
      stale = true;
    };
  }, [params.id, reloadToken]);

  if (error) {
    return (
      <Card>
        <ErrorState onRetry={() => setReloadToken((token) => token + 1)} />
      </Card>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-6" aria-busy>
        <Skeleton className="h-5 w-64" />
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
            <Card className="space-y-3 p-5">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-24 w-full" />
            </Card>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} className="space-y-3 p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const city = t.cities[detail.city as keyof typeof t.cities] ?? detail.city;

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-3 text-sm">
        <Link
          href="/units"
          className="inline-flex items-center gap-1.5 font-medium text-slate-600 transition-colors hover:text-brand"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
          {t.nav.units}
        </Link>
        <span className="text-slate-300">/</span>
        <LtrText className="font-semibold text-slate-900">{detail.code}</LtrText>
        {/* One lifecycle badge — an approved unit is published by definition. */}
        <StatusBadge status={detail.status} />
        {detail.mamsaOwned && <StatusBadge status="mamsa_owned" dot={false} />}
      </nav>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <ImageGallery images={detail.images} alt={detail.name} />

          <Card className="p-5">
            <h1 className="text-xl font-semibold text-slate-900">{detail.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden />
                {detail.district}, {city}
              </span>
              <span aria-hidden>·</span>
              <StatusBadge status={detail.type} dot={false} />
              <span aria-hidden>·</span>
              {detail.partnerName}
            </p>

            {detail.status === UNIT_STATUS.REJECTED && detail.rejectionReason && (
              <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-status-redSoft px-3.5 py-3 text-sm text-status-red">
                <CircleX className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  <span className="block font-semibold">{t.approvalDetail.rejectionReason}</span>
                  <span className="mt-0.5 block">{detail.rejectionReason}</span>
                </span>
              </p>
            )}

            <p className="mt-4 leading-relaxed text-slate-600">{detail.description}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FactTile icon={BedDouble} value={String(detail.bedrooms)} label={t.units.bedrooms} />
              <FactTile icon={Bath} value={String(detail.bathrooms)} label={t.units.bathrooms} />
              <FactTile icon={Users} value={String(detail.capacity)} label={t.units.capacity} />
              <FactTile icon={Maximize} value={`${detail.sizeSqm} m²`} label={t.units.size} />
            </div>

            {detail.amenities.length === 0 ? (
              <p className="mt-5 py-4 text-center text-sm text-slate-500">
                {t.approvalDetail.noAmenities}
              </p>
            ) : (
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {detail.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-center gap-2.5 rounded-xl bg-surface-page px-3.5 py-2.5 text-sm text-slate-700"
                  >
                    <CircleCheck className="h-4 w-4 shrink-0 text-status-green" aria-hidden />
                    {amenity}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-semibold text-slate-900">
              {t.approvalDetail.tabs.documents}
            </h2>
            <dl className="mt-4 divide-y divide-hairline rounded-2xl border border-hairline px-4">
              <DetailRow label={t.approvalDetail.tourismPermit} value={detail.tourismPermitNo} />
              <DetailRow label={t.approvalDetail.ownerId} value={detail.ownerIdNumber} />
            </dl>
            <PdfViewer
              url={detail.permitFileUrl}
              title={t.approvalDetail.permitFile}
              className="mt-4"
            />
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-base font-semibold text-slate-900">{t.units.pricePerNight}</h2>
            <p className="mt-3 flex flex-wrap items-baseline gap-2">
              <LtrText className="text-4xl font-semibold tabular-nums text-slate-900">
                {formatSAR(detail.pricePerNight)}
              </LtrText>
              <span className="text-slate-500">{t.approvalDetail.perNight}</span>
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-semibold text-slate-900">{t.units.occupancy}</h2>
            <dl className="mt-2 divide-y divide-hairline">
              <DetailRow label={t.units.occupancy} value={formatPercent(detail.occupancyRate, 0)} ltr />
              <DetailRow
                label={t.units.revenue}
                value={formatSAR(detail.revenue, { compact: true })}
                ltr
              />
              <DetailRow
                label={t.units.rating}
                value={
                  detail.reviewsCount > 0 ? (
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Star
                        className="h-4 w-4 fill-status-amber text-status-amber"
                        aria-hidden
                      />
                      {detail.rating.toFixed(1)} ({detail.reviewsCount})
                    </span>
                  ) : (
                    '—'
                  )
                }
              />
            </dl>

            {detail.publicUrl && (
              <a
                href={detail.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                <LtrText>{detail.publicUrl}</LtrText>
              </a>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}

function FactTile({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-surface-page px-4 py-4 text-center">
      <Icon className="mx-auto h-5 w-5 text-slate-400" aria-hidden />
      <p className="mt-2 font-semibold tabular-nums text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  ltr,
}: {
  label: string;
  value: React.ReactNode | null;
  ltr?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className="text-sm font-semibold tabular-nums text-slate-900">
        {value ? ltr && typeof value === 'string' ? <LtrText>{value}</LtrText> : value : '—'}
      </dd>
    </div>
  );
}
