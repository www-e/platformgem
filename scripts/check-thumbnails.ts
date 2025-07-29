// scripts/check-thumbnails.ts
// Check thumbnail URLs in the database

import prisma from '../src/lib/prisma';

async function checkThumbnails() {
  console.log('🔍 Checking course thumbnail URLs...\n');
  
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        isPublished: true
      },
      take: 10
    });

    console.log(`Found ${courses.length} courses:\n`);
    
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   ID: ${course.id}`);
      console.log(`   Published: ${course.isPublished}`);
      console.log(`   Thumbnail: ${course.thumbnailUrl}`);
      console.log('');
    });

    // Check for problematic URLs
    const problematicUrls = courses.filter(course => 
      course.thumbnailUrl.includes('example.com') || 
      !course.thumbnailUrl.startsWith('http')
    );

    if (problematicUrls.length > 0) {
      console.log('⚠️ Found problematic thumbnail URLs:');
      problematicUrls.forEach(course => {
        console.log(`   - ${course.title}: ${course.thumbnailUrl}`);
      });
    } else {
      console.log('✅ All thumbnail URLs look good!');
    }

  } catch (error) {
    console.error('❌ Error checking thumbnails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkThumbnails();