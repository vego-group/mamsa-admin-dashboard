'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck, KeyRound, Loader2, LogOut, Shield, Smartphone } from 'lucide-react';
import {
  ConfirmDialog,
  ErrorState,
  LtrText,
  PageHeader,
  RichText,
  StatusBadge,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/i18n';
import { profileApi } from '@/lib/api';
import { OTP_LENGTH } from '@/lib/constants';
import { formatDate, formatPhone } from '@/lib/utils/format';
import { useAuthStore, useUiStore, type Locale } from '@/stores';
import type { AdminProfile, AdminSession, ID } from '@/types';

export default function ProfilePage() {
  const t = useT();
  const router = useRouter();
  const locale = useUiStore((state) => state.locale);
  const setLocale = useUiStore((state) => state.setLocale);
  const setAdmin = useAuthStore((state) => state.setAdmin);
  const logout = useAuthStore((state) => state.logout);

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [error, setError] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailUnlocked, setEmailUnlocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(0);

  const [revoking, setRevoking] = useState<AdminSession | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const load = useCallback(() => {
    setError(false);
    setProfile(null);

    Promise.all([profileApi.get(), profileApi.sessions()])
      .then(([profileResponse, sessionsResponse]) => {
        setProfile(profileResponse);
        setSessions(sessionsResponse);
        setName(profileResponse.name);
        setEmail(profileResponse.email);
        setPhone(profileResponse.phone);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(load, [load]);

  const dirty =
    Boolean(profile) &&
    (name !== profile?.name || email !== profile?.email || phone !== profile?.phone);

  async function save() {
    if (!profile) return;

    setSaving(true);
    try {
      const updated = await profileApi.update({ name: name.trim(), email: email.trim(), phone });
      setProfile(updated);
      setAdmin(updated);
      setEmailUnlocked(false);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  async function changeLocale(next: Locale) {
    setLocale(next);
    if (!profile) return;
    // Persist the choice too — the store only remembers it on this browser.
    const updated = await profileApi.update({ preferredLocale: next });
    setProfile(updated);
    setAdmin(updated);
  }

  async function revoke(id: ID) {
    await profileApi.revokeSession(id);
    setSessions((current) => current.filter((session) => session.id !== id));
    setRevoking(null);
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title={t.profile.title} subtitle={t.profile.subtitle} />
        <Card>
          <ErrorState onRetry={load} />
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeader title={t.profile.title} subtitle={t.profile.subtitle} />
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="space-y-3 p-5" aria-busy>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-24 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={t.profile.title} subtitle={t.profile.subtitle} />

      <Card className="p-6">
        <div className="flex flex-wrap items-start gap-5">
          <span className="relative">
            <span className="grid h-20 w-20 place-items-center rounded-2xl bg-sidebar text-3xl font-semibold text-white">
              {profile.name[0]}
            </span>
            {profile.verified && (
              <BadgeCheck
                className="absolute -bottom-1 -end-1 h-6 w-6 rounded-full bg-white text-status-green"
                aria-hidden
              />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-semibold text-slate-900">{profile.name}</h2>
            <LtrText className="mt-0.5 block text-slate-500">{profile.email}</LtrText>

            <p className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-muted px-2.5 py-1 text-sm font-medium text-slate-700">
                <Shield className="h-4 w-4" aria-hidden />
                {t.profile.superAdmin}
              </span>
              {profile.verified && <StatusBadge status="verified" dot={false} />}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-hairline pt-5 sm:grid-cols-3">
          <Stat value={profile.totalReviews.toLocaleString('en-US')} label={t.profile.totalReviews} />
          <Stat value={String(profile.actionsToday)} label={t.profile.actionsToday} />
          <Stat value={formatDate(profile.memberSince)} label={t.profile.memberSince} />
        </dl>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900">{t.profile.personalInformation}</h3>

        <div className="mt-5 space-y-4">
          <Field label={t.profile.fullName} htmlFor="profile-name">
            <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} />
          </Field>

          <Field label={t.profile.email} htmlFor="profile-email">
            <div className="flex items-stretch gap-2">
              <Input
                id="profile-email"
                type="email"
                dir="ltr"
                value={email}
                disabled={!emailUnlocked}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Button
                variant="secondary"
                onClick={() => setEmailUnlocked((open) => !open)}
                aria-pressed={emailUnlocked}
              >
                {t.profile.edit}
              </Button>
            </div>
          </Field>

          {/* The phone is the credential on an OTP-only platform — changing it needs
              its own verification flow, so it is shown but not edited here. */}
          <Field label={t.profile.phone} htmlFor="profile-phone">
            <Input id="profile-phone" dir="ltr" value={formatPhone(phone)} disabled readOnly />
          </Field>

          <Field label={t.profile.preferredLanguage} htmlFor="profile-locale">
            <select
              id="profile-locale"
              value={locale}
              onChange={(event) => void changeLocale(event.target.value as Locale)}
              className="h-10 w-full rounded-xl border border-hairline bg-white px-3 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </Field>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          {savedAt > 0 && !dirty && (
            <span className="text-sm text-status-green">{t.profile.saved}</span>
          )}
          <Button onClick={() => void save()} disabled={!dirty || saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.common.save}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900">{t.profile.security}</h3>

        <div className="mt-5 space-y-3">
          <div className="flex items-start gap-4 rounded-2xl border border-hairline p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-muted text-brand">
              <Smartphone className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{t.profile.signInMethod}</p>
              <p className="mt-0.5 text-sm text-slate-500">
                {t.profile.signInMethodBody(OTP_LENGTH)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-hairline p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-muted text-brand">
              <KeyRound className="h-5 w-5" aria-hidden />
            </span>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{t.profile.activeSessions}</p>
              <p className="mt-0.5 text-sm text-slate-500">
                {t.profile.sessionCount(sessions.length)}
              </p>

              <ul className="mt-4 space-y-3">
                {sessions.map((session) => (
                  <li key={session.id} className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-800">
                        {session.device} — {session.browser}
                        {session.current && (
                          <span className="rounded-full bg-status-greenSoft px-2 py-0.5 text-xs font-medium text-status-green">
                            {t.profile.current}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-500">
                        {t.cities[session.city as keyof typeof t.cities] ?? session.city}, SA
                      </p>
                    </div>

                    {!session.current && (
                      <button
                        type="button"
                        onClick={() => setRevoking(session)}
                        className="text-sm font-medium text-status-red transition-opacity hover:opacity-75"
                      >
                        {t.profile.revoke}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-status-red/30 p-6">
        <h3 className="text-lg font-semibold text-status-red">{t.profile.dangerZone}</h3>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-medium text-slate-900">{t.profile.signOutAll}</p>
            <p className="mt-0.5 text-sm text-slate-500">{t.profile.signOutAllBody}</p>
          </div>

          <Button variant="destructive" onClick={() => setLoggingOut(true)}>
            <LogOut className="h-4 w-4 rtl:rotate-180" />
            {t.profile.logout}
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(revoking)}
        onOpenChange={(open) => !open && setRevoking(null)}
        title={t.profile.revokeTitle}
        variant="destructive"
        description={
          <RichText
            template={t.profile.revokeQuestion}
            values={{ device: revoking ? `${revoking.device} — ${revoking.browser}` : '' }}
          />
        }
        confirmLabel={t.profile.revoke}
        onConfirm={() => revoke(revoking!.id)}
      />

      <ConfirmDialog
        open={loggingOut}
        onOpenChange={setLoggingOut}
        title={t.profile.logoutTitle}
        icon={LogOut}
        variant="destructive"
        description={
          <>
            <span className="block font-semibold text-slate-900">{t.profile.logoutQuestion}</span>
            <span className="mt-1 block text-sm">{t.profile.logoutBody}</span>
          </>
        }
        confirmLabel={t.profile.confirmLogout}
        onConfirm={async () => {
          await logout();
          router.push('/login');
        }}
      />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="block text-2xl font-semibold tabular-nums text-slate-900">{value}</span>
        <span className="mt-0.5 block text-sm text-slate-500">{label}</span>
      </dd>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

