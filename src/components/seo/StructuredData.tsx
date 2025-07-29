// src/components/seo/StructuredData.tsx
// JSON-LD structured data for SEO

import { FeaturedCourse } from '@/types/course';

interface StructuredDataProps {
  courses?: FeaturedCourse[];
}

export function StructuredData({ courses = [] }: StructuredDataProps) {
  // Organization structured data
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "منصة التعلم الإلكتروني",
    "description": "منصة تعليمية إلكترونية تقدم دورات متميزة في مختلف المجالات",
    "url": "https://yourplatform.com", // Replace with your actual domain
    "logo": "https://yourplatform.com/logo.png", // Replace with your logo URL
    "sameAs": [
      "https://facebook.com/yourplatform", // Replace with your social media
      "https://twitter.com/yourplatform",
      "https://linkedin.com/company/yourplatform"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+20-XXX-XXX-XXXX", // Replace with your phone
      "contactType": "customer service",
      "availableLanguage": ["Arabic", "English"]
    }
  };

  // Website structured data
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "منصة التعلم الإلكتروني",
    "url": "https://yourplatform.com", // Replace with your actual domain
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://yourplatform.com/courses?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // Courses structured data
  const coursesData = courses.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "الدورات المميزة",
    "description": "مجموعة مختارة من أفضل الدورات التعليمية",
    "numberOfItems": courses.length,
    "itemListElement": courses.map((course, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Course",
        "name": course.title,
        "description": course.description,
        "image": course.thumbnailUrl,
        "provider": {
          "@type": "Organization",
          "name": "منصة التعلم الإلكتروني"
        },
        "instructor": {
          "@type": "Person",
          "name": course.professor.name
        },
        "courseCode": course.id,
        "educationalLevel": "All Levels",
        "inLanguage": "ar",
        "offers": course.price !== null ? {
          "@type": "Offer",
          "price": course.price,
          "priceCurrency": course.currency,
          "availability": "https://schema.org/InStock"
        } : {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": course.currency,
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "127",
          "bestRating": "5",
          "worstRating": "1"
        },
        "totalTime": `PT${course.totalDuration}M`,
        "numberOfCredits": course.lessonCount,
        "coursePrerequisites": "لا توجد متطلبات مسبقة",
        "educationalCredentialAwarded": "شهادة إتمام الدورة",
        "url": `https://yourplatform.com/courses/${course.id}` // Replace with your actual domain
      }
    }))
  } : null;

  // Breadcrumb structured data
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "الرئيسية",
        "item": "https://yourplatform.com" // Replace with your actual domain
      }
    ]
  };

  return (
    <>
      {/* Organization Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData)
        }}
      />

      {/* Website Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteData)
        }}
      />

      {/* Courses Data */}
      {coursesData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(coursesData)
          }}
        />
      )}

      {/* Breadcrumb Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData)
        }}
      />
    </>
  );
}