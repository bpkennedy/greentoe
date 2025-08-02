import { notFound } from 'next/navigation';
import { getLessonById, getNextLesson, getPreviousLesson } from '@/lib/lessons';
import LessonRenderer from './LessonRenderer';

interface LessonPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Dynamic lesson page that renders MDX content
 * Supports all lesson slugs from our lesson metadata
 */
export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  
  // Get lesson metadata
  const lesson = getLessonById(slug);
  
  if (!lesson) {
    notFound();
  }

  // Get navigation lessons
  const nextLesson = getNextLesson(slug);
  const previousLesson = getPreviousLesson(slug);

  return (
    <LessonRenderer 
      lesson={lesson}
      nextLesson={nextLesson}
      previousLesson={previousLesson}
    />
  );
}

/**
 * Generate static params for all lessons
 * This enables static generation at build time
 */
export async function generateStaticParams() {
  // Import lesson metadata to get all available slugs
  const { LESSON_METADATA } = await import('@/lib/lessons');
  
  return LESSON_METADATA.map((lesson) => ({
    slug: lesson.id,
  }));
}

/**
 * Generate metadata for each lesson page
 */
export async function generateMetadata({ params }: LessonPageProps) {
  const { slug } = await params;
  const lesson = getLessonById(slug);
  
  if (!lesson) {
    return {
      title: 'Lesson Not Found',
    };
  }

  return {
    title: `${lesson.title} | Green Thumb Financial Education`,
    description: lesson.summary,
    openGraph: {
      title: lesson.title,
      description: lesson.summary,
      type: 'article',
    },
  };
}