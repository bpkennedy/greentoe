'use client';

/**
 * Structured data components for SEO enhancement
 * Provides JSON-LD structured data for search engines
 */

interface WebsiteStructuredDataProps {
  url?: string;
}

export function WebsiteStructuredData({ url = "https://greentoe.app" }: WebsiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GreenToe",
    "alternateName": "GreenToe Financial Education",
    "url": url,
    "description": "Interactive financial education platform for young investors to learn about investing, index funds, and market analysis.",
    "inLanguage": "en-US",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${url}/lessons/{search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "GreenToe",
      "url": url,
      "logo": {
        "@type": "ImageObject",
        "url": `${url}/logo-horizontal.svg`,
        "width": 160,
        "height": 40
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface EducationalOrganizationDataProps {
  url?: string;
}

export function EducationalOrganizationData({ url = "https://greentoe.app" }: EducationalOrganizationDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "GreenToe",
    "url": url,
    "description": "Financial education platform teaching young investors about investing, index funds, and market analysis through interactive lessons.",
    "logo": {
      "@type": "ImageObject",
      "url": `${url}/logo-horizontal.svg`,
      "width": 160,
      "height": 40
    },
    "sameAs": [
      // Add social media URLs when available
      // "https://twitter.com/greentoe_edu",
      // "https://linkedin.com/company/greentoe"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "educationalCredentialAwarded": "Financial Literacy Certificate",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Financial Education Courses",
      "itemListElement": [
        {
          "@type": "Course",
          "name": "Understanding Stocks and Index Funds",
          "description": "Learn the basics of stocks and index funds for young investors",
          "provider": {
            "@type": "Organization",
            "name": "GreenToe"
          }
        },
        {
          "@type": "Course", 
          "name": "Reading Performance Charts",
          "description": "Master the art of reading and interpreting stock performance charts",
          "provider": {
            "@type": "Organization",
            "name": "GreenToe"
          }
        },
        {
          "@type": "Course",
          "name": "Investment Research and Analysis", 
          "description": "Learn how to research investments before making decisions",
          "provider": {
            "@type": "Organization",
            "name": "GreenToe"
          }
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface CourseStructuredDataProps {
  courseName: string;
  courseDescription: string;
  courseUrl: string;
  estimatedTime?: string;
  courseOrder?: number;
}

export function CourseStructuredData({
  courseName,
  courseDescription,
  courseUrl,
  estimatedTime = "15 minutes",
  courseOrder = 1
}: CourseStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": courseName,
    "description": courseDescription,
    "url": courseUrl,
    "timeRequired": estimatedTime,
    "courseCode": `LESSON-${courseOrder.toString().padStart(2, '0')}`,
    "educationalLevel": "Beginner",
    "inLanguage": "en-US",
    "provider": {
      "@type": "EducationalOrganization",
      "name": "GreenToe",
      "url": "https://greentoe.app"
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "courseSchedule": {
        "@type": "Schedule",
        "repeatFrequency": "P1D",
        "scheduleTimezone": "America/New_York"
      }
    },
    "about": [
      "Financial Education",
      "Investment Basics",
      "Index Funds",
      "Stock Market Education"
    ],
    "teaches": [
      "Financial literacy",
      "Investment fundamentals", 
      "Market analysis",
      "Risk management"
    ],
    "audience": {
      "@type": "EducationalAudience",
      "audienceType": "Young Adults",
      "educationalRole": "student"
    },
    "learningResourceType": "Interactive Lesson",
    "isAccessibleForFree": true,
    "license": "https://creativecommons.org/licenses/by-nc-sa/4.0/"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}