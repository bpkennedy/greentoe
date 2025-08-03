'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  BarChart3, 
  GitCompare, 
  Search, 
  Brain, 
  Shield,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  BookOpen
} from 'lucide-react';
import { LessonHeader } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import type { Lesson } from '@/lib/lessons';

// Icon mapping for lessons
const LESSON_ICONS = {
  'TrendingUp': TrendingUp,
  'BarChart3': BarChart3,
  'GitCompare': GitCompare,
  'Search': Search,
  'Brain': Brain,
  'Shield': Shield,
} as const;

interface LessonLayoutProps {
  lesson: Lesson;
  nextLesson: Lesson | null;
  previousLesson: Lesson | null;
  scrollProgress: number;
  isCompleted: boolean;
  children: ReactNode;
}

/**
 * Layout component for lesson pages with navigation and progress tracking
 */
export default function LessonLayout({
  lesson,
  nextLesson,
  previousLesson,
  scrollProgress,
  isCompleted,
  children,
}: LessonLayoutProps) {
  const IconComponent = LESSON_ICONS[lesson.icon as keyof typeof LESSON_ICONS] || BookOpen;
  const progressPercentage = Math.round(scrollProgress * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo */}
      <LessonHeader lessonTitle={lesson.title} />
      
      {/* Progress Bar */}
      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Lesson {lesson.order}</span>
              <span>•</span>
              <span>{lesson.estimatedTime} read</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isCompleted ? "default" : "secondary"} className="flex items-center gap-1">
                {isCompleted ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {isCompleted ? 'Completed' : `${progressPercentage}% read`}
              </Badge>
            </div>
          </div>
          
          {/* Progress bar */}
          <Progress value={progressPercentage} className="h-1.5" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Lesson header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <IconComponent className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <span>Lesson {lesson.order}</span>
                  <span>•</span>
                  <span>{lesson.estimatedTime}</span>
                  <span>•</span>
                  <Badge variant="outline">{lesson.difficulty}</Badge>
                </div>
                <h1 className="text-3xl font-bold text-foreground">{lesson.title}</h1>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground mb-6">{lesson.summary}</p>

            {/* Learning objectives */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  What you&apos;ll learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {lesson.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Lesson content */}
                      <div className="prose prose-gray max-w-none">
            {children}
          </div>

          <Separator className="my-8" />

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {previousLesson && (
                <Link href={`/lessons/${previousLesson.slug}`}>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    <div className="text-left">
                      <div className="text-xs text-muted-foreground">Previous</div>
                      <div className="font-medium">{previousLesson.title}</div>
                    </div>
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex-shrink-0 mx-4">
              <Badge variant="secondary">
                Lesson {lesson.order} of 6
              </Badge>
            </div>

            <div className="flex-1 flex justify-end">
              {nextLesson && (
                <Link href={`/lessons/${nextLesson.slug}`}>
                  <Button className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs opacity-90">Next</div>
                      <div className="font-medium">{nextLesson.title}</div>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Completion message */}
          {isCompleted && (
            <Card className="mt-8 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">
                      Lesson completed!
                    </h3>
                    <p className="text-sm text-green-700">
                      Great job finishing &quot;{lesson.title}&quot;. 
                      {nextLesson ? " Ready for the next lesson?" : " You've completed all lessons!"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}