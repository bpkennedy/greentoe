'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useProgress } from '@/lib/contexts';
import LessonLayout from '@/components/LessonLayout';
import type { Lesson } from '@/lib/lessons';

interface LessonRendererProps {
  lesson: Lesson;
  nextLesson: Lesson | null;
  previousLesson: Lesson | null;
}

/**
 * Client-side lesson renderer with scroll tracking and MDX content
 */
export default function LessonRenderer({ lesson, nextLesson, previousLesson }: LessonRendererProps) {
  const { markLessonComplete } = useProgress();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Dynamically import the MDX content
  const LessonContent = dynamic(
    () => import(`../../../../content/lessons/${lesson.id}.mdx`),
    {
      loading: () => (
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground">Loading lesson content...</div>
        </div>
      ),
      ssr: false, // Disable SSR for MDX content to avoid hydration issues
    }
  );

  // Scroll tracking effect
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const element = contentRef.current;
      const windowHeight = window.innerHeight;
      const documentHeight = element.scrollHeight;
      const scrollTop = window.scrollY;
      
      // Calculate scroll progress
      const maxScroll = documentHeight - windowHeight;
      const progress = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 1;
      
      setScrollProgress(progress);

      // Mark lesson complete at 80% scroll
      if (progress >= 0.8 && !isCompleted) {
        setIsCompleted(true);
        markLessonComplete(lesson.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lesson.id, markLessonComplete, isCompleted]);

  return (
    <LessonLayout
      lesson={lesson}
      nextLesson={nextLesson}
      previousLesson={previousLesson}
      scrollProgress={scrollProgress}
      isCompleted={isCompleted}
    >
      <div ref={contentRef} className="lesson-content">
        <LessonContent />
      </div>
    </LessonLayout>
  );
}