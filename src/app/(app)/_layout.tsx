import { Slot } from 'expo-router';

import { AppShell } from '@/components/layout/app-shell';

export default function AppLayout() {
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
