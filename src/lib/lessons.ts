/**
 * Lesson Management Utility
 * Handles loading and parsing lesson metadata and content
 */

export interface LessonMeta {
  id: string;
  title: string;
  summary: string;
  learningObjectives: string[];
  icon: string;
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  order: number;
}

export interface Lesson extends LessonMeta {
  slug: string;
  path: string;
  completed?: boolean;
}

/**
 * Static lesson metadata extracted from MDX files
 * This would typically be dynamically imported, but for now we'll define it statically
 * to avoid complex build-time MDX parsing
 */
export const LESSON_METADATA: LessonMeta[] = [
  {
    id: '01-understanding-stocks-index-funds',
    title: 'Understanding Stocks and Index Funds',
    summary: 'Learn the basics of what stocks are and how index funds work as a beginner-friendly investment option.',
    learningObjectives: [
      'Understand what stocks represent',
      'Learn the difference between individual stocks and index funds',
      'Recognize why index funds are often recommended for beginners',
      'Identify the benefits and risks of each investment type'
    ],
    icon: 'TrendingUp',
    estimatedTime: '10 minutes',
    difficulty: 'Beginner',
    order: 1
  },
  {
    id: '02-reading-performance-charts',
    title: 'Reading Performance Charts',
    summary: 'Master the art of reading stock charts and understanding what price movements really mean.',
    learningObjectives: [
      'Understand basic chart components (price, time, volume)',
      'Recognize common chart patterns and trends',
      'Learn to distinguish between short-term noise and long-term trends',
      'Practice reading real stock charts confidently'
    ],
    icon: 'BarChart3',
    estimatedTime: '12 minutes',
    difficulty: 'Beginner',
    order: 2
  },
  {
    id: '03-comparing-investments',
    title: 'Comparing Different Investments',
    summary: 'Learn how to evaluate and compare different investment options using key metrics and criteria.',
    learningObjectives: [
      'Understand key metrics for comparing investments',
      'Learn about risk vs reward trade-offs',
      'Compare stocks, bonds, and index funds effectively',
      'Use practical criteria to make investment decisions'
    ],
    icon: 'GitCompare',
    estimatedTime: '15 minutes',
    difficulty: 'Intermediate',
    order: 3
  },
  {
    id: '04-research-before-you-buy',
    title: 'Research Before You Buy',
    summary: 'Master the essential research skills every investor needs before making any investment decision.',
    learningObjectives: [
      'Learn where to find reliable investment information',
      'Understand key financial metrics and what they mean',
      'Develop a systematic research process',
      'Identify red flags and avoid common research mistakes'
    ],
    icon: 'Search',
    estimatedTime: '18 minutes',
    difficulty: 'Intermediate',
    order: 4
  },
  {
    id: '05-keeping-emotions-in-check',
    title: 'Keeping Emotions in Check',
    summary: 'Learn how to manage emotions and avoid common psychological traps that destroy investment returns.',
    learningObjectives: [
      'Understand common emotional investing mistakes',
      'Learn practical strategies to control emotional decisions',
      'Recognize market psychology and crowd behavior',
      'Develop systems to stay disciplined during volatile markets'
    ],
    icon: 'Brain',
    estimatedTime: '14 minutes',
    difficulty: 'Intermediate',
    order: 5
  },
  {
    id: '06-understanding-risk',
    title: 'Understanding Investment Risk',
    summary: 'Master different types of investment risk and learn how to manage them effectively in your portfolio.',
    learningObjectives: [
      'Identify different types of investment risk',
      'Understand the relationship between risk and return',
      'Learn practical risk management strategies',
      'Assess your personal risk tolerance and capacity'
    ],
    icon: 'Shield',
    estimatedTime: '16 minutes',
    difficulty: 'Intermediate',
    order: 6
  }
];

/**
 * Get all lessons with completion status
 */
export function getAllLessons(completedLessons: string[] = []): Lesson[] {
  return LESSON_METADATA
    .sort((a, b) => a.order - b.order)
    .map(meta => ({
      ...meta,
      slug: meta.id,
      path: `/lessons/${meta.id}`,
      completed: completedLessons.includes(meta.id)
    }));
}

/**
 * Get a specific lesson by ID
 */
export function getLessonById(id: string, completedLessons: string[] = []): Lesson | null {
  const meta = LESSON_METADATA.find(lesson => lesson.id === id);
  if (!meta) return null;

  return {
    ...meta,
    slug: meta.id,
    path: `/lessons/${meta.id}`,
    completed: completedLessons.includes(meta.id)
  };
}

/**
 * Get the next lesson after the given lesson ID
 */
export function getNextLesson(currentId: string, completedLessons: string[] = []): Lesson | null {
  const currentLesson = LESSON_METADATA.find(lesson => lesson.id === currentId);
  if (!currentLesson) return null;

  const nextMeta = LESSON_METADATA.find(lesson => lesson.order === currentLesson.order + 1);
  if (!nextMeta) return null;

  return {
    ...nextMeta,
    slug: nextMeta.id,
    path: `/lessons/${nextMeta.id}`,
    completed: completedLessons.includes(nextMeta.id)
  };
}

/**
 * Get the previous lesson before the given lesson ID
 */
export function getPreviousLesson(currentId: string, completedLessons: string[] = []): Lesson | null {
  const currentLesson = LESSON_METADATA.find(lesson => lesson.id === currentId);
  if (!currentLesson) return null;

  const prevMeta = LESSON_METADATA.find(lesson => lesson.order === currentLesson.order - 1);
  if (!prevMeta) return null;

  return {
    ...prevMeta,
    slug: prevMeta.id,
    path: `/lessons/${prevMeta.id}`,
    completed: completedLessons.includes(prevMeta.id)
  };
}

/**
 * Get lesson progress statistics
 */
export function getLessonProgress(completedLessons: string[] = []) {
  const totalLessons = LESSON_METADATA.length;
  const completedCount = completedLessons.length;
  const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return {
    total: totalLessons,
    completed: completedCount,
    remaining: totalLessons - completedCount,
    percentage
  };
}

/**
 * Get lessons by difficulty level
 */
export function getLessonsByDifficulty(
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced', 
  completedLessons: string[] = []
): Lesson[] {
  return LESSON_METADATA
    .filter(meta => meta.difficulty === difficulty)
    .sort((a, b) => a.order - b.order)
    .map(meta => ({
      ...meta,
      slug: meta.id,
      path: `/lessons/${meta.id}`,
      completed: completedLessons.includes(meta.id)
    }));
}

/**
 * Search lessons by title or summary
 */
export function searchLessons(query: string, completedLessons: string[] = []): Lesson[] {
  const lowercaseQuery = query.toLowerCase();
  
  return LESSON_METADATA
    .filter(meta => 
      meta.title.toLowerCase().includes(lowercaseQuery) ||
      meta.summary.toLowerCase().includes(lowercaseQuery) ||
      meta.learningObjectives.some(obj => obj.toLowerCase().includes(lowercaseQuery))
    )
    .sort((a, b) => a.order - b.order)
    .map(meta => ({
      ...meta,
      slug: meta.id,
      path: `/lessons/${meta.id}`,
      completed: completedLessons.includes(meta.id)
    }));
}

/**
 * Validate lesson ID format
 */
export function isValidLessonId(id: string): boolean {
  return LESSON_METADATA.some(lesson => lesson.id === id);
}

/**
 * Get estimated total time for all lessons
 */
export function getTotalEstimatedTime(): string {
  const totalMinutes = LESSON_METADATA.reduce((total, lesson) => {
    const minutes = parseInt(lesson.estimatedTime.match(/\d+/)?.[0] || '0');
    return total + minutes;
  }, 0);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} minutes`;
  } else if (minutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
  }
}