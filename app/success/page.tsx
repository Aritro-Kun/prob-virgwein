'use client'

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Success() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const pid = searchParams.get('pid');
  const name = searchParams.get('name');
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pid && name) {
        router.push(`/pdash?pid=${pid}&name=${encodeURIComponent(name)}`);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [pid, name, router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Signup Successful 🎉</h1>
        <p className="mt-2 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
