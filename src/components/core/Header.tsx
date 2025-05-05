'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <Link href="/dashboard">
            <Image
              src="/logo.svg"
              alt="Social Media App Logo"
              width={40}
              height={40}
              className="hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}