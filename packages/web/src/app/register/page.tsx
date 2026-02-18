'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Registration is invite-only. Redirect to login.
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-gold animate-spin" />
    </div>
  );
}
