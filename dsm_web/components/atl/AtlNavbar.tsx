"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AtlNavbar = () => {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About ATL', href: '/atl-kits#about-atl' },
    { name: 'Lab Setup', href: '/atl-kits#lab-setup' },
    { name: 'Process', href: '/atl-kits#process' },
  ];

  return (
    <nav className="w-full bg-white py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-[100] shadow-sm">
      <Link href="/" className="flex items-center">
        <Image src="/logo.png" alt="DSM ELECTRO" width={120} height={40} className="h-10 w-auto" />
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="text-gray-700 font-bold hover:text-[#EE9C24] transition-colors text-[15px]"
          >
            {link.name}
          </Link>
        ))}
        <Link
          href="/atl-kits/inquiry"
          className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white px-8 py-2.5 rounded-lg font-bold shadow-md hover:opacity-90 transition-opacity"
        >
          Enquiry
        </Link>
      </div>

      {/* Mobile Toggle would go here if needed, but following the desktop design from image */}
      <div className="md:hidden">
        <Link
          href="/atl-kits/inquiry"
          className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md"
        >
          Enquiry
        </Link>
      </div>
    </nav>
  );
};

export default AtlNavbar;
