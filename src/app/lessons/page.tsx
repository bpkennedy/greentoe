import Link from 'next/link';
import { 
  TrendingUp, 
  BarChart3, 
  GitCompare, 
  Search, 
  Brain, 
  Shield,
  BookOpen,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getAllLessons, getLessonProgress, getTotalEstimatedTime } from '@/lib/lessons';

// Icon mapping for lessons
const LESSON_ICONS = {
  'TrendingUp': TrendingUp,
  'BarChart3': BarChart3,
  'GitCompare': GitCompare,
  'Search': Search,
  'Brain': Brain,
  'Shield': Shield,
} as const;

/**
 * Lessons index page showing all available lessons
 */
export default function LessonsPage() {
  // TODO: Get completed lessons from user context
  const completedLessons: string[] = [];
  const lessons = getAllLessons(completedLessons);
  const progress = getLessonProgress(completedLessons);
  const totalTime = getTotalEstimatedTime();

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="lessons" />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="heading-page text-foreground mb-4">
              Financial Education Lessons
            </h1>
            <p className="text-body-large text-muted-foreground mb-6">
              Master investing fundamentals with our comprehensive lesson series designed specifically for young investors.
            </p>
            
            {/* Overall progress */}
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="data-label">Your Progress</span>
                  <span className="text-body-small text-muted-foreground">
                    {progress.completed}/{progress.total} lessons
                  </span>
                </div>
                <Progress value={progress.percentage} className="mb-2" />
                <div className="flex items-center justify-between text-caption text-muted-foreground">
                  <span className="financial-percentage">{progress.percentage}% complete</span>
                  <span>{totalTime} total</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lessons grid */}
          <div className="grid gap-6">
            {lessons.map((lesson, index) => {
              const IconComponent = LESSON_ICONS[lesson.icon as keyof typeof LESSON_ICONS] || BookOpen;
              const isCompleted = lesson.completed;
              const isNext = !isCompleted && lessons.slice(0, index).every(l => l.completed);
              
              return (
                <Card 
                  key={lesson.id} 
                  className={`transition-all hover:shadow-md ${
                    isCompleted ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50' : 
                    isNext ? 'border-primary/50 shadow-sm' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                          isCompleted ? 'bg-green-100 dark:bg-green-900' : 'bg-primary/10'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <IconComponent className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary">Lesson {lesson.order}</Badge>
                            <Badge variant="outline">{lesson.difficulty}</Badge>
                            {isNext && (
                              <Badge className="bg-primary text-primary-foreground">Next</Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl mb-2">{lesson.title}</CardTitle>
                          <CardDescription className="text-base">
                            {lesson.summary}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{lesson.estimatedTime}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Learning objectives preview */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">What you&apos;ll learn:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {lesson.learningObjectives.slice(0, 2).map((objective, objIndex) => (
                          <li key={objIndex} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{objective}</span>
                          </li>
                        ))}
                        {lesson.learningObjectives.length > 2 && (
                          <li className="text-xs text-muted-foreground ml-4">
                            +{lesson.learningObjectives.length - 2} more objectives
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      
                      <Link href={`/lessons/${lesson.slug}`}>
                        <Button className="flex items-center gap-2">
                          {isCompleted ? 'Review' : 'Start Lesson'}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center mt-12 p-6 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">Ready to start your investing journey?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These lessons will give you the foundation you need to make informed investment decisions.
            </p>
            <Link href="/lessons/01-understanding-stocks-index-funds">
              <Button size="lg" className="flex items-center gap-2 mx-auto">
                <BookOpen className="w-4 h-4" />
                Start with Lesson 1
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Generate metadata for the lessons index page
 */
export const metadata = {
  title: 'Financial Education Lessons | Green Thumb',
  description: 'Learn investing fundamentals with our comprehensive lesson series designed for teenagers. Master stocks, index funds, charts, and more.',
  openGraph: {
    title: 'Financial Education Lessons',
    description: 'Master investing fundamentals with lessons designed specifically for teenagers.',
    type: 'website',
  },
};