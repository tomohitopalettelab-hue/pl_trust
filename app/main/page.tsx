import { Suspense } from 'react';
import OwnerDashboard from '../admin/page';

export default function MainPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full" />}>
      <OwnerDashboard />
    </Suspense>
  );
}
