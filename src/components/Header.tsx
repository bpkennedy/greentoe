'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Home, Users } from 'lucide-react';

interface HeaderProps {
  showFullNavigation?: boolean;
  currentPage?: 'home' | 'lessons' | 'parent';
  className?: string;
}

/**
 * GreenToe application header with logo and navigation
 */
export function Header({ 
  showFullNavigation = true, 
  currentPage = 'home',
  className = ''
}: HeaderProps) {
  return (
    <header 
      className={`border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}
      role="banner"
      id="navigation"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link 
            href="/" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
            aria-label="GreenToe - Return to homepage"
          >
            <div className="relative">
              <Image
                src="/logo-horizontal.svg"
                alt="GreenToe Logo"
                width={160}
                height={40}
                priority
                className="h-8 w-auto transition-transform group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Navigation */}
          {showFullNavigation && (
            <nav role="navigation" aria-label="Site navigation">
              <div className="flex items-center gap-6">
                {/* Main Navigation Links */}
                <div className="hidden sm:flex items-center gap-4">
                  <Link 
                    href="/"
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                      currentPage === 'home' 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`}
                    aria-label="Home - Interactive financial tools"
                    aria-current={currentPage === 'home' ? 'page' : undefined}
                  >
                    <Home className="h-4 w-4" />
                    <span className="hidden md:inline">Home</span>
                  </Link>
                  
                  <Link 
                    href="/lessons"
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                      currentPage === 'lessons' 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`}
                    aria-label="Lessons - Financial education courses"
                    aria-current={currentPage === 'lessons' ? 'page' : undefined}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden md:inline">Lessons</span>
                  </Link>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-4 bg-border" aria-hidden="true" />

                {/* Parent Dashboard Link */}
                <Link 
                  href="/parent" 
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    currentPage === 'parent' 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`}
                  aria-label="Parent Dashboard - Monitor learning progress"
                  aria-current={currentPage === 'parent' ? 'page' : undefined}
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Parent Dashboard</span>
                </Link>

                {/* Status Badges */}
                <div className="flex items-center gap-2" role="group" aria-label="App status">
                  <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                    Alpha
                  </Badge>
                  <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
                    Live
                  </Badge>
                </div>
              </div>
            </nav>
          )}

          {/* Minimal Navigation for pages that need custom navigation */}
          {!showFullNavigation && (
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Return to homepage"
              >
                ← Back to Home
              </Link>
              <Badge variant="outline" className="text-xs">
                Alpha
              </Badge>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Simple header for lesson pages with minimal navigation
 */
export function LessonHeader({ 
  lessonTitle, 
  className = '' 
}: { 
  lessonTitle?: string; 
  className?: string; 
}) {
  return (
    <header 
      className={`border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}
      role="banner"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="GreenToe - Return to homepage"
          >
            <Image
              src="/logo.svg"
              alt="GreenToe"
              width={120}
              height={32}
              priority
              className="h-6 w-auto"
            />
          </Link>

          {/* Lesson Title */}
          {lessonTitle && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">{lessonTitle}</span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <Link 
              href="/lessons"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              aria-label="Back to all lessons"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">All Lessons</span>
            </Link>
            <Link 
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              aria-label="Return to homepage"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}