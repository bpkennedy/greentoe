'use client';

import { useWatchList, useProgress } from '@/lib/contexts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Target,
  Calendar,
  Lightbulb,
  MessageCircle
} from 'lucide-react';
import { getAllLessons, getLessonProgress, getTotalEstimatedTime } from '@/lib/lessons';

/**
 * Activity summary component for parent dashboard
 * Shows teen's learning progress and engagement metrics
 */
export function ActivitySummary() {
  const { watchList } = useWatchList();
  const { completedLessons } = useProgress();
  
  // Calculate lesson progress
  const lessons = getAllLessons(completedLessons);
  const progress = getLessonProgress(completedLessons);
  const totalTime = getTotalEstimatedTime();
  
  // Calculate estimated time spent
  const completedTime = lessons
    .filter(lesson => lesson.completed)
    .reduce((total, lesson) => {
      const minutes = parseInt(lesson.estimatedTime.split(' ')[0]);
      return total + minutes;
    }, 0);

  // Get last activity (mock data for now)
  const lastActivity = new Date().toLocaleDateString();
  
  // Conversation starters based on activity
  const conversationStarters = [
    "Ask about their favorite company on their watch-list and why they chose it",
    "Discuss what they learned about risk vs. reward in investing",
    "Talk about their thoughts on index funds vs. individual stocks",
    "Ask them to explain a stock chart they've been analyzing",
    "Discuss how emotions can affect investment decisions",
    "Ask about their long-term financial goals"
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.completed}/{progress.total}</div>
            <p className="text-xs text-muted-foreground">
              {progress.percentage}% of curriculum
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watch-List Items</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{watchList.length}</div>
            <p className="text-xs text-muted-foreground">
              Stocks being tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTime}m</div>
            <p className="text-xs text-muted-foreground">
              Of {totalTime} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Today</div>
            <p className="text-xs text-muted-foreground">
              {lastActivity}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Learning Progress
            </CardTitle>
            <CardDescription>
              Track your teen&apos;s journey through financial education
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Progress</span>
                <span>{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Recent Completions</h4>
              {lessons
                .filter(lesson => lesson.completed)
                .slice(-3)
                .map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">{lesson.estimatedTime}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {lesson.difficulty}
                    </Badge>
                  </div>
                ))}
              
              {progress.completed === 0 && (
                <p className="text-sm text-muted-foreground">
                  No lessons completed yet. Encourage them to start!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Watch-List Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Investment Interest
            </CardTitle>
            <CardDescription>
              Companies and stocks your teen is tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {watchList.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Current Watch-List</h4>
                <div className="grid grid-cols-2 gap-2">
                  {watchList.slice(0, 6).map((symbol) => (
                    <Badge key={symbol} variant="outline" className="justify-center">
                      {symbol}
                    </Badge>
                  ))}
                  {watchList.length > 6 && (
                    <Badge variant="secondary" className="justify-center">
                      +{watchList.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No stocks being tracked yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Encourage them to add some companies they&apos;re interested in!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversation Starters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Conversation Starters
          </CardTitle>
          <CardDescription>
            Use these prompts to engage with your teen about their learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conversationStarters.map((starter, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">{starter}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips for Parents */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-primary">Tips for Supporting Learning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Encourage Exploration</h4>
              <p className="text-muted-foreground">
                Let them research companies they know and use in daily life. This makes investing more relatable and interesting.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Discuss Real Examples</h4>
              <p className="text-muted-foreground">
                Talk about current market events and how they relate to the concepts they&apos;re learning.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Emphasize Long-Term Thinking</h4>
              <p className="text-muted-foreground">
                Help them understand that investing is about patience and long-term wealth building, not quick gains.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Make it Interactive</h4>
              <p className="text-muted-foreground">
                Review their watch-list together and discuss why they chose certain companies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}