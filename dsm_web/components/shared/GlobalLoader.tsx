"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Loader2 } from 'lucide-react';

export default function GlobalLoader() {
  const [mounted, setMounted] = useState(false);
  const isLoading = useSelector((state: RootState) => {
    // Check if any Redux slice has loading set to true
    return Object.values(state).some((slice: any) => slice?.loading === true);
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoading) return null;

  return (
    <div className="fixed inset-0 z-[99999] w-screen h-screen flex flex-col items-center justify-center bg-white transition-all duration-300 pt-[80px]">
      <Loader2 className="h-14 w-14 animate-spin text-[#EE9C24]" />
    </div>
  );
}
