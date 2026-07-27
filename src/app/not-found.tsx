import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-surface-page px-6">
      <div className="text-center">
        <p className="text-sm font-medium text-brand">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-1 text-sm text-slate-500">
          The page you are looking for does not exist or has moved.
        </p>
        <Button asChild className="mt-6">
          <Link href="/overview">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
