// scripts/seed-sample-data.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedSampleData() {
  try {
    console.log('🌱 Seeding sample data for admin dashboard...\n');

    // Create categories
    console.log('1. Creating categories...');
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'العلاج الطبيعي',
          description: 'دورات في العلاج الطبيعي وإعادة التأهيل',
          slug: 'physical-therapy',
          iconUrl: '🏥',
          isActive: true
        }
      }),
      prisma.category.create({
        data: {
          name: 'التغذية الرياضية',
          description: 'دورات في التغذية والمكملات الغذائية',
          slug: 'sports-nutrition',
          iconUrl: '🥗',
          isActive: true
        }
      }),
      prisma.category.create({
        data: {
          name: 'السباحة والغوص',
          description: 'دورات في السباحة والغوص الآمن',
          slug: 'swimming-diving',
          iconUrl: '🏊‍♂️',
          isActive: true
        }
      })
    ]);
    console.log(`   ✅ Created ${categories.length} categories\n`);

    // Create professors
    console.log('2. Creating professors...');
    const professors = await Promise.all([
      prisma.user.create({
        data: {
          name: 'د. أحمد محمد',
          email: 'ahmed@platform.com',
          phone: '01111111111',
          password: await bcrypt.hash('professor123', 12),
          role: 'PROFESSOR',
          isActive: true,
          bio: 'أخصائي علاج طبيعي معتمد مع خبرة 10 سنوات',
          expertise: ['العلاج الطبيعي', 'إعادة التأهيل', 'الإصابات الرياضية']
        }
      }),
      prisma.user.create({
        data: {
          name: 'د. فاطمة علي',
          email: 'fatima@platform.com',
          phone: '01222222222',
          password: await bcrypt.hash('professor123', 12),
          role: 'PROFESSOR',
          isActive: true,
          bio: 'خبيرة تغذية رياضية معتمدة',
          expertise: ['التغذية الرياضية', 'المكملات الغذائية', 'الحميات الصحية']
        }
      }),
      prisma.user.create({
        data: {
          name: 'كابتن محمود',
          email: 'mahmoud@platform.com',
          phone: '01333333333',
          password: await bcrypt.hash('professor123', 12),
          role: 'PROFESSOR',
          isActive: true,
          bio: 'مدرب سباحة وغوص محترف',
          expertise: ['السباحة', 'الغوص', 'الإنقاذ المائي']
        }
      })
    ]);
    console.log(`   ✅ Created ${professors.length} professors\n`);

    // Create students
    console.log('3. Creating students...');
    const students = await Promise.all([
      prisma.user.create({
        data: {
          name: 'محمد أحمد',
          email: 'mohamed@student.com',
          phone: '01444444444',
          password: await bcrypt.hash('student123', 12),
          role: 'STUDENT',
          isActive: true
        }
      }),
      prisma.user.create({
        data: {
          name: 'سارة محمد',
          email: 'sara@student.com',
          phone: '01555555555',
          password: await bcrypt.hash('student123', 12),
          role: 'STUDENT',
          isActive: true
        }
      }),
      prisma.user.create({
        data: {
          name: 'أحمد علي',
          email: 'ahmed.ali@student.com',
          phone: '01666666666',
          password: await bcrypt.hash('student123', 12),
          role: 'STUDENT',
          isActive: true
        }
      }),
      prisma.user.create({
        data: {
          name: 'نور حسن',
          email: 'nour@student.com',
          phone: '01777777777',
          password: await bcrypt.hash('student123', 12),
          role: 'STUDENT',
          isActive: true
        }
      }),
      prisma.user.create({
        data: {
          name: 'يوسف محمود',
          email: 'youssef@student.com',
          phone: '01888888888',
          password: await bcrypt.hash('student123', 12),
          role: 'STUDENT',
          isActive: true
        }
      })
    ]);
    console.log(`   ✅ Created ${students.length} students\n`);

    // Create courses
    console.log('4. Creating courses...');
    const courses = await Promise.all([
      prisma.course.create({
        data: {
          title: 'أساسيات العلاج الطبيعي',
          description: 'دورة شاملة في أساسيات العلاج الطبيعي وتقنيات إعادة التأهيل',
          thumbnailUrl: 'https://example.com/pt-basics.jpg',
          price: 299,
          currency: 'EGP',
          isPublished: true,
          bunnyLibraryId: 'lib123',
          categoryId: categories[0].id,
          professorId: professors[0].id
        }
      }),
      prisma.course.create({
        data: {
          title: 'التغذية للرياضيين',
          description: 'دليل شامل للتغذية الصحيحة للرياضيين والمكملات الغذائية',
          thumbnailUrl: 'https://example.com/nutrition.jpg',
          price: 199,
          currency: 'EGP',
          isPublished: true,
          bunnyLibraryId: 'lib124',
          categoryId: categories[1].id,
          professorId: professors[1].id
        }
      }),
      prisma.course.create({
        data: {
          title: 'تعلم السباحة للمبتدئين',
          description: 'دورة تعليم السباحة من الصفر للمبتدئين',
          thumbnailUrl: 'https://example.com/swimming.jpg',
          price: 0, // Free course
          currency: 'EGP',
          isPublished: true,
          bunnyLibraryId: 'lib125',
          categoryId: categories[2].id,
          professorId: professors[2].id
        }
      }),
      prisma.course.create({
        data: {
          title: 'الغوص الآمن',
          description: 'تعلم أساسيات الغوص الآمن والمعدات المطلوبة',
          thumbnailUrl: 'https://example.com/diving.jpg',
          price: 399,
          currency: 'EGP',
          isPublished: false, // Draft course
          bunnyLibraryId: 'lib126',
          categoryId: categories[2].id,
          professorId: professors[2].id
        }
      })
    ]);
    console.log(`   ✅ Created ${courses.length} courses\n`);

    // Create enrollments
    console.log('5. Creating enrollments...');
    const enrollments = await Promise.all([
      prisma.enrollment.create({
        data: {
          userId: students[0].id,
          courseId: courses[0].id,
          progressPercent: 75
        }
      }),
      prisma.enrollment.create({
        data: {
          userId: students[1].id,
          courseId: courses[0].id,
          progressPercent: 45
        }
      }),
      prisma.enrollment.create({
        data: {
          userId: students[0].id,
          courseId: courses[1].id,
          progressPercent: 90
        }
      }),
      prisma.enrollment.create({
        data: {
          userId: students[2].id,
          courseId: courses[2].id,
          progressPercent: 100
        }
      }),
      prisma.enrollment.create({
        data: {
          userId: students[3].id,
          courseId: courses[2].id,
          progressPercent: 30
        }
      }),
      prisma.enrollment.create({
        data: {
          userId: students[4].id,
          courseId: courses[1].id,
          progressPercent: 60
        }
      })
    ]);
    console.log(`   ✅ Created ${enrollments.length} enrollments\n`);

    // Create payments
    console.log('6. Creating payments...');
    const payments = await Promise.all([
      prisma.payment.create({
        data: {
          amount: 299,
          currency: 'EGP',
          status: 'COMPLETED',
          paymentMethod: 'Credit Card',
          userId: students[0].id,
          courseId: courses[0].id,
          paymobOrderId: 'order_001'
        }
      }),
      prisma.payment.create({
        data: {
          amount: 299,
          currency: 'EGP',
          status: 'COMPLETED',
          paymentMethod: 'Credit Card',
          userId: students[1].id,
          courseId: courses[0].id,
          paymobOrderId: 'order_002'
        }
      }),
      prisma.payment.create({
        data: {
          amount: 199,
          currency: 'EGP',
          status: 'COMPLETED',
          paymentMethod: 'Debit Card',
          userId: students[0].id,
          courseId: courses[1].id,
          paymobOrderId: 'order_003'
        }
      }),
      prisma.payment.create({
        data: {
          amount: 199,
          currency: 'EGP',
          status: 'COMPLETED',
          paymentMethod: 'Credit Card',
          userId: students[4].id,
          courseId: courses[1].id,
          paymobOrderId: 'order_004'
        }
      })
    ]);
    console.log(`   ✅ Created ${payments.length} payments\n`);

    console.log('🎉 Sample data seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${categories.length} Categories`);
    console.log(`   - ${professors.length} Professors`);
    console.log(`   - ${students.length} Students`);
    console.log(`   - ${courses.length} Courses (3 published, 1 draft)`);
    console.log(`   - ${enrollments.length} Enrollments`);
    console.log(`   - ${payments.length} Payments (${payments.reduce((sum, p) => sum + Number(p.amount), 0)} EGP total)`);

    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@alostaz.edu / admin123');
    console.log('Professor: ahmed@platform.com / professor123');
    console.log('Student: mohamed@student.com / student123');

  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSampleData();