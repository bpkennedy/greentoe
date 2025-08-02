import { ParentAuth } from '@/components/ParentAuth';
import { ActivitySummary } from '@/components/ActivitySummary';

/**
 * Parent dashboard page with authentication
 * Provides parents insight into their teen's learning progress
 */
export default function ParentPage() {
  return (
    <ParentAuth>
      <ActivitySummary />
    </ParentAuth>
  );
}

/**
 * Generate metadata for the parent dashboard page
 */
export const metadata = {
  title: 'Parent Dashboard | Green Thumb Financial Education',
  description: 'Monitor your teen\'s financial education progress and access conversation starters for family discussions about investing.',
  robots: 'noindex, nofollow', // Keep parent dashboard private
};