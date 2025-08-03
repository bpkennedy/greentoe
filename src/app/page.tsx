'use client';

import Link from 'next/link';
import { SkipLinks } from "@/components/SkipLinks";
import { Header } from "@/components/Header";
import { BookOpen } from "lucide-react";
import { WatchList } from "@/components/WatchList";



export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SkipLinks />
      
      {/* Header with Logo */}
      <Header currentPage="home" />

      <main 
        className="container-page space-section" 
        id="main-content"
        role="main"
      >
        {/* Hero Section */}
        <section className="text-center space-component" aria-labelledby="hero-title">
          <h2 id="hero-title" className="heading-hero text-foreground">
            Learn Investing Through Interactive Experience
          </h2>
          <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
            Build your watch-list, analyze stock charts, and learn about investing with real market data. 
            All designed specifically for young investors taking their first steps into financial literacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/lessons" 
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 rounded-md btn-text transition-colors touch-target focus-visible"
              aria-label="Start learning with 6 financial education lessons"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              Start Learning Journey
            </Link>
            <span className="text-caption text-muted-foreground" role="note">
              6 lessons • 85 minutes • Beginner friendly
            </span>
          </div>
        </section>

        {/* Main Content */}
        <div className="container-narrow" role="region" aria-labelledby="interactive-tools-title">
          <h2 id="interactive-tools-title" className="sr-only">Interactive Financial Tools</h2>
          
          {/* Watch List */}
          <section aria-labelledby="watchlist-section">
            <h3 id="watchlist-section" className="sr-only">Stock Watch List</h3>
            <WatchList />
          </section>
        </div>




      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Green Thumb - Educational platform for learning about investing and financial literacy.</p>
            <p className="mt-2">Built with Next.js, React, and real market data. Not financial advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
