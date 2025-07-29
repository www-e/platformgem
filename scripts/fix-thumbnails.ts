// scripts/fix-thumbnails.ts
// Fix thumbnail URLs to use proper placeholder images

import prisma from '../src/lib/prisma';

async function fixThumbnails() {
  console.log('🔧 Fixing course thumbnail URLs...\n');
  
  try {
    // Map of course themes to appropriate Unsplash images
    const thumbnailMappings = [
      {
        keywords: ['غوص', 'diving'],
        url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=450&fit=crop&crop=center'
      },
      {
        keywords: ['علاج طبيعي', 'physical therapy', 'pt-basics'],
        url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=450&fit=crop&crop=center'
      },
      {
        keywords: ['تغذية', 'nutrition'],
        url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop&crop=center'
      },
      {
        keywords: ['سباحة', 'swimming'],
        url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=450&fit=crop&crop=center'
      }
    ];

    const courses = await prisma.course.findMany({
      where: {
        thumbnailUrl: {
          contains: 'example.com'
        }
      }
    });

    console.log(`Found ${courses.length} courses with example.com URLs\n`);

    for (const course of courses) {
      // Find appropriate thumbnail based on course title or current URL
      let newThumbnailUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop&crop=center'; // Default education image
      
      for (const mapping of thumbnailMappings) {
        const matchesKeyword = mapping.keywords.some(keyword => 
          course.title.includes(keyword) || course.thumbnailUrl.includes(keyword)
        );
        
        if (matchesKeyword) {
          newThumbnailUrl = mapping.url;
          break;
        }
      }

      // Update the course
      await prisma.course.update({
        where: { id: course.id },
        data: { thumbnailUrl: newThumbnailUrl }
      });

      console.log(`✅ Updated "${course.title}"`);
      console.log(`   Old: ${course.thumbnailUrl}`);
      console.log(`   New: ${newThumbnailUrl}\n`);
    }

    console.log('🎉 All thumbnail URLs have been fixed!');

  } catch (error) {
    console.error('❌ Error fixing thumbnails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixThumbnails();