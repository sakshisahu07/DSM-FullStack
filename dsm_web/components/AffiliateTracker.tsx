'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BASE_URL } from '@/redux/slices/apiConfig';

function TrackerInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const affiliateCode = searchParams.get('aff');
    
    if (affiliateCode) {
      // 1. Save code in localStorage to attribute future purchases
      localStorage.setItem('affiliateCode', affiliateCode);
      localStorage.setItem('affiliateCodeTimestamp', Date.now().toString());

      // 2. Fire the Click Tracking API
      const trackClick = async () => {
        try {
          await fetch(`${BASE_URL}/affiliate/click/${affiliateCode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: window.location.href,
              userAgent: navigator.userAgent
            })
          });
        } catch (error) {
          console.error('Failed to track affiliate click', error);
        }
      };

      trackClick();
    }
  }, [searchParams]);

  return null;
}

export default function AffiliateTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  );
}
