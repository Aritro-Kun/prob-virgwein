'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('Invalid verification link.');
        return;
      }

      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.message || 'Verification failed.');
        return;
      }

      setStatus('Email verified! Redirecting...');

      const { patientId, name } = data;

      setTimeout(() => {
        router.push(`/success?pid=${patientId}&name=${encodeURIComponent(name)}`);
      }, 2000);
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <h1 className="text-xl font-bold">{status}</h1>
    </div>
  );
}
