'use client';

import Link from 'next/link';

/**
 * Skip links component for keyboard navigation accessibility
 * Allows users to jump directly to main content, bypassing navigation
 */
export function SkipLinks() {
  return (
    <div className="skip-links">
      <Link
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-foreground"
      >
        Skip to main content
      </Link>
      <Link
        href="#navigation"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-36 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-foreground"
      >
        Skip to navigation
      </Link>
    </div>
  );
}