import { RequireSession } from '@/components/auth';
import { AppShell } from '@/components/layout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireSession>
      <AppShell>{children}</AppShell>
    </RequireSession>
  );
}
