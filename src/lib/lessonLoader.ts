// Pre-import all lesson MDX files to avoid dynamic import issues
import Lesson01 from '../../content/lessons/01-understanding-stocks-index-funds.mdx';
import Lesson02 from '../../content/lessons/02-reading-performance-charts.mdx';
import Lesson03 from '../../content/lessons/03-comparing-investments.mdx';
import Lesson04 from '../../content/lessons/04-research-before-you-buy.mdx';
import Lesson05 from '../../content/lessons/05-keeping-emotions-in-check.mdx';
import Lesson06 from '../../content/lessons/06-understanding-risk.mdx';

/**
 * Static mapping of lesson IDs to their MDX components
 * This avoids dynamic import issues that can cause re-rendering loops
 */
export const LESSON_COMPONENTS = {
  '01-understanding-stocks-index-funds': Lesson01,
  '02-reading-performance-charts': Lesson02,
  '03-comparing-investments': Lesson03,
  '04-research-before-you-buy': Lesson04,
  '05-keeping-emotions-in-check': Lesson05,
  '06-understanding-risk': Lesson06,
} as const;

/**
 * Get the MDX component for a specific lesson
 */
export function getLessonComponent(lessonId: string) {
  return LESSON_COMPONENTS[lessonId as keyof typeof LESSON_COMPONENTS];
}