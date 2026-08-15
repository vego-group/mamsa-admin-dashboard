'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LtrText } from '@/components/common';
import { useT } from '@/i18n';
import { ApiError, authApi } from '@/lib/api';
import { postLoginRoute } from '@/lib/auth/routes';
import { OTP_LENGTH, OTP_RESEND_SECONDS, PHONE_PREFIX } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import { formatPhone } from '@/lib/utils/format';
import { useAuthStore } from '@/stores';

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const t = useT();
  const router = useRouter();
  const setAdmin = useAuthStore((state) => state.setAdmin);

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const phoneValid = /^5\d{8}$/.test(phone);

  async function sendOtp() {
    if (!phoneValid) {
      setError(t.auth.errors.invalidPhone);
      return;
    }

    setPending(true);
    setError(null);
    try {
      await authApi.requestOtp(`${PHONE_PREFIX}${phone}`);
      setStep('otp');
      setCountdown(OTP_RESEND_SECONDS);
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.auth.errors.network);
    } finally {
      setPending(false);
    }
  }

  async function verify(value = code.join('')) {
    if (value.length !== OTP_LENGTH) return;

    setPending(true);
    setError(null);
    try {
      const result = await authApi.verifyOtp(`${PHONE_PREFIX}${phone}`, value);
      setAdmin(result.admin);
      // Read the query here rather than with useSearchParams: the hook would force
      // this page into a Suspense bailout at build time.
      const next = new URLSearchParams(window.location.search).get('next');
      router.push(postLoginRoute(result.admin, next));
    } catch (err) {
      setCode(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
      setError(err instanceof ApiError ? err.message : t.auth.errors.network);
    } finally {
      setPending(false);
    }
  }

  function handleOtpChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      setCode((prev) => prev.map((char, i) => (i === index ? '' : char)));
      return;
    }

    setCode((prev) => {
      const next = [...prev];
      // Support pasting the whole code into any box.
      for (let offset = 0; offset < digits.length && index + offset < OTP_LENGTH; offset += 1) {
        next[index + offset] = digits[offset];
      }
      const filled = next.join('');
      if (filled.length === OTP_LENGTH && !filled.includes('')) setTimeout(() => void verify(filled), 80);
      return next;
    });

    const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
    inputsRef.current[nextIndex]?.focus();
  }

  function handleOtpKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-sidebar lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=70')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/70 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 font-semibold">
              M
            </span>
            <div>
              <p className="font-semibold">Mamsa</p>
              <p className="text-xs uppercase tracking-wide text-white/70">{t.auth.portal}</p>
            </div>
          </div>
          <p className="max-w-sm text-sm text-white/80">
            {t.auth.subtitle}
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-2xl border border-hairline bg-white p-8 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {t.auth.portal}
          </p>

          {step === 'phone' ? (
            <>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">{t.auth.welcome}</h1>
              <p className="mt-1 text-sm text-slate-500">{t.auth.subtitle}</p>

              <div className="mt-8 space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                  {t.auth.mobile}
                </label>

                <div dir="ltr" className="flex items-stretch gap-2">
                  <span className="inline-flex select-none items-center gap-2 rounded-xl border border-hairline bg-surface-muted px-3 text-sm font-medium text-slate-600">
                    🇸🇦 {PHONE_PREFIX}
                  </span>
                  <input
                    id="phone"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={9}
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value.replace(/\D/g, '').slice(0, 9));
                      setError(null);
                    }}
                    onKeyDown={(event) => event.key === 'Enter' && void sendOtp()}
                    placeholder="5X XXX XXXX"
                    className="h-11 flex-1 rounded-xl border border-hairline px-3 text-sm tabular-nums text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                  />
                </div>
              </div>

              {error && <p className="mt-3 text-sm text-status-red">{error}</p>}

              <Button
                size="lg"
                className="mt-6 w-full"
                onClick={() => void sendOtp()}
                disabled={pending || !phoneValid}
              >
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.auth.sendOtp}
              </Button>
            </>
          ) : (
            <>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">{t.auth.verifyTitle}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {t.auth.verifySubtitle(OTP_LENGTH)}{' '}
                <LtrText className="font-medium text-slate-700">
                  {formatPhone(`${PHONE_PREFIX}${phone}`)}
                </LtrText>
              </p>

              <div dir="ltr" className="mt-8 flex justify-between gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputsRef.current[index] = element;
                    }}
                    value={digit}
                    inputMode="numeric"
                    maxLength={OTP_LENGTH}
                    onChange={(event) => handleOtpChange(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    className={cn(
                      'h-14 w-full rounded-2xl border text-center text-lg font-semibold tabular-nums text-slate-900',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
                      error ? 'border-status-red' : 'border-hairline bg-surface-muted',
                    )}
                  />
                ))}
              </div>

              {error && <p className="mt-3 text-sm text-status-red">{error}</p>}

              <Button
                size="lg"
                className="mt-6 w-full"
                onClick={() => void verify()}
                disabled={pending || code.join('').length !== OTP_LENGTH}
              >
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.auth.verify}
              </Button>

              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setCode(Array(OTP_LENGTH).fill(''));
                    setError(null);
                  }}
                  className="text-slate-500 transition-colors hover:text-slate-700"
                >
                  {t.auth.changeNumber}
                </button>

                {countdown > 0 ? (
                  <span className="tabular-nums text-slate-400">
                    {t.auth.resendIn} {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void sendOtp()}
                    className="font-medium text-brand transition-colors hover:text-brand-hover"
                  >
                    {t.auth.resend}
                  </button>
                )}
              </div>
            </>
          )}

          <p className="mt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Mamsa · Privacy · Terms
          </p>
        </div>
      </main>
    </div>
  );
}
