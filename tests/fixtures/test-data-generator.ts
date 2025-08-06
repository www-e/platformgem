/**
 * Test Data Generator for Student Journey Tests
 * 
 * This utility generates realistic test data for comprehensive testing
 */

import { faker } from 'faker';

export interface GeneratedTestUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  studentId: string;
  parentPhone: string;
  role: 'STUDENT' | 'PROFESSOR' | 'ADMIN';
  isActive: boolean;
  createdAt: Date;
}

export interface GeneratedTestCourse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  currency: string;
  isPublished: boolean;
  categoryId: string;
  professorId: string;
  lessons: GeneratedTestLesson[];
  createdAt: Date;
}

export interface GeneratedTestLesson {
  id: string;
  title: string;
  order: number;
  duration: number;
  bunnyVideoId: string;
  materials: any[];
}

export interface GeneratedTestCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  iconUrl: string;
  isActive: boolean;
}

export interface GeneratedTestPayment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  paymentMethod: string;
  userId: string;
  courseId: string;
  createdAt: Date;
}

export class TestDataGenerator {
  private static arabicNames = [
    'أحمد محمد علي', 'فاطمة أحمد حسن', 'محمد عبدالله سالم', 'عائشة محمود إبراهيم',
    'عمر خالد يوسف', 'زينب علي محمد', 'يوسف أحمد عبدالرحمن', 'مريم حسن علي',
    'علي محمد أحمد', 'خديجة عبدالله حسن', 'حسن علي محمود', 'نور الدين يوسف',
    'سارة أحمد علي', 'محمود حسن إبراهيم', 'ليلى محمد عبدالله', 'كريم أحمد سالم'
  ];

  private static courseCategories = [
    { name: 'البرمجة', slug: 'programming', description: 'دورات البرمجة وتطوير البرمجيات' },
    { name: 'تصميم الويب', slug: 'web-design', description: 'دورات تصميم وتطوير المواقع' },
    { name: 'علوم البيانات', slug: 'data-science', description: 'دورات تحليل البيانات والذكاء الاصطناعي' },
    { name: 'التسويق الرقمي', slug: 'digital-marketing', description: 'دورات التسويق الإلكتروني ووسائل التواصل' },
    { name: 'إدارة الأعمال', slug: 'business', description: 'دورات إدارة الأعمال والريادة' },
    { name: 'التصميم الجرافيكي', slug: 'graphic-design', description: 'دورات التصميم والإبداع البصري' },
    { name: 'اللغات', slug: 'languages', description: 'دورات تعلم اللغات المختلفة' },
    { name: 'الرياضيات', slug: 'mathematics', description: 'دورات الرياضيات والإحصاء' }
  ];

  private static courseTitles = [
    'أساسيات البرمجة بـ JavaScript',
    'تصميم المواقع بـ HTML و CSS',
    'مقدمة في علوم البيانات',
    'التسويق الرقمي للمبتدئين',
    'إدارة المشاريع الحديثة',
    'تصميم الجرافيك بـ Photoshop',
    'تعلم اللغة الإنجليزية',
    'الرياضيات التطبيقية',
    'تطوير تطبيقات الهاتف',
    'أمن المعلومات والشبكات',
    'التجارة الإلكترونية',
    'إنتاج المحتوى الرقمي'
  ];

  /**
   * Generate a realistic test user
   */
  static generateUser(role: 'STUDENT' | 'PROFESSOR' | 'ADMIN' = 'STUDENT'): GeneratedTestUser {
    const name = faker.helpers.arrayElement(this.arabicNames);
    const phonePrefix = faker.helpers.arrayElement(['010', '011', '012', '015']);
    const phone = `${phonePrefix}${faker.datatype.number({ min: 10000000, max: 99999999 })}`;
    
    return {
      id: faker.datatype.uuid(),
      name,
      phone,
      email: faker.internet.email(),
      password: 'TestPassword123!',
      studentId: faker.datatype.number({ min: 100000, max: 999999 }).toString(),
      parentPhone: `011${faker.datatype.number({ min: 10000000, max: 99999999 })}`,
      role,
      isActive: true,
      createdAt: faker.date.past(1)
    };
  }

  /**
   * Generate multiple test users
   */
  static generateUsers(count: number, role: 'STUDENT' | 'PROFESSOR' | 'ADMIN' = 'STUDENT'): GeneratedTestUser[] {
    return Array.from({ length: count }, () => this.generateUser(role));
  }

  /**
   * Generate a test category
   */
  static generateCategory(): GeneratedTestCategory {
    const category = faker.helpers.arrayElement(this.courseCategories);
    
    return {
      id: faker.datatype.uuid(),
      name: category.name,
      description: category.description,
      slug: category.slug,
      iconUrl: `https://via.placeholder.com/64x64?text=${encodeURIComponent(category.name)}`,
      isActive: true
    };
  }

  /**
   * Generate multiple test categories
   */
  static generateCategories(count: number = 8): GeneratedTestCategory[] {
    return this.courseCategories.slice(0, count).map(category => ({
      id: faker.datatype.uuid(),
      name: category.name,
      description: category.description,
      slug: category.slug,
      iconUrl: `https://via.placeholder.com/64x64?text=${encodeURIComponent(category.name)}`,
      isActive: true
    }));
  }

  /**
   * Generate test lessons for a course
   */
  static generateLessons(count: number = 5): GeneratedTestLesson[] {
    return Array.from({ length: count }, (_, index) => ({
      id: faker.datatype.uuid(),
      title: `الدرس ${index + 1}: ${faker.lorem.words(3)}`,
      order: index + 1,
      duration: faker.datatype.number({ min: 600, max: 3600 }), // 10 minutes to 1 hour
      bunnyVideoId: faker.datatype.uuid(),
      materials: [
        {
          title: `ملف الدرس ${index + 1}`,
          url: `https://example.com/materials/lesson-${index + 1}.pdf`
        }
      ]
    }));
  }

  /**
   * Generate a test course
   */
  static generateCourse(categoryId: string, professorId: string): GeneratedTestCourse {
    const title = faker.helpers.arrayElement(this.courseTitles);
    const isFree = faker.datatype.boolean();
    
    return {
      id: faker.datatype.uuid(),
      title,
      description: `${title} - دورة شاملة تغطي جميع الأساسيات والمفاهيم المتقدمة. ستتعلم من خلال هذه الدورة المهارات العملية والنظرية اللازمة للتميز في هذا المجال.`,
      thumbnailUrl: `https://picsum.photos/400/300?random=${faker.datatype.number()}`,
      price: isFree ? 0 : faker.datatype.number({ min: 99, max: 999 }),
      currency: 'EGP',
      isPublished: true,
      categoryId,
      professorId,
      lessons: this.generateLessons(faker.datatype.number({ min: 3, max: 8 })),
      createdAt: faker.date.past(1)
    };
  }

  /**
   * Generate multiple test courses
   */
  static generateCourses(count: number, categories: GeneratedTestCategory[], professors: GeneratedTestUser[]): GeneratedTestCourse[] {
    return Array.from({ length: count }, () => {
      const category = faker.helpers.arrayElement(categories);
      const professor = faker.helpers.arrayElement(professors);
      return this.generateCourse(category.id, professor.id);
    });
  }

  /**
   * Generate a test payment
   */
  static generatePayment(userId: string, courseId: string): GeneratedTestPayment {
    const statuses: Array<'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'> = 
      ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'];
    
    return {
      id: faker.datatype.uuid(),
      amount: faker.datatype.number({ min: 99, max: 999 }),
      currency: 'EGP',
      status: faker.helpers.arrayElement(statuses),
      paymentMethod: faker.helpers.arrayElement(['CARD', 'WALLET']),
      userId,
      courseId,
      createdAt: faker.date.past(1)
    };
  }

  /**
   * Generate multiple test payments
   */
  static generatePayments(count: number, users: GeneratedTestUser[], courses: GeneratedTestCourse[]): GeneratedTestPayment[] {
    return Array.from({ length: count }, () => {
      const user = faker.helpers.arrayElement(users);
      const course = faker.helpers.arrayElement(courses.filter(c => c.price > 0)); // Only paid courses
      return this.generatePayment(user.id, course.id);
    });
  }

  /**
   * Generate a complete test dataset
   */
  static generateCompleteDataset() {
    // Generate users
    const students = this.generateUsers(50, 'STUDENT');
    const professors = this.generateUsers(10, 'PROFESSOR');
    const admins = this.generateUsers(2, 'ADMIN');
    
    // Generate categories
    const categories = this.generateCategories();
    
    // Generate courses
    const courses = this.generateCourses(30, categories, professors);
    
    // Generate payments
    const payments = this.generatePayments(100, students, courses);
    
    return {
      users: {
        students,
        professors,
        admins,
        all: [...students, ...professors, ...admins]
      },
      categories,
      courses,
      payments,
      summary: {
        totalUsers: students.length + professors.length + admins.length,
        totalStudents: students.length,
        totalProfessors: professors.length,
        totalAdmins: admins.length,
        totalCategories: categories.length,
        totalCourses: courses.length,
        totalPayments: payments.length,
        freeCourses: courses.filter(c => c.price === 0).length,
        paidCourses: courses.filter(c => c.price > 0).length
      }
    };
  }

  /**
   * Generate test data for specific scenarios
   */
  static generateScenarioData(scenario: 'enrollment' | 'payment' | 'learning' | 'dashboard') {
    const baseData = this.generateCompleteDataset();
    
    switch (scenario) {
      case 'enrollment':
        return {
          ...baseData,
          enrollmentScenarios: {
            freeCoursesForTesting: baseData.courses.filter(c => c.price === 0).slice(0, 5),
            paidCoursesForTesting: baseData.courses.filter(c => c.price > 0).slice(0, 5),
            testStudent: baseData.users.students[0]
          }
        };
        
      case 'payment':
        return {
          ...baseData,
          paymentScenarios: {
            successfulPayments: baseData.payments.filter(p => p.status === 'COMPLETED'),
            failedPayments: baseData.payments.filter(p => p.status === 'FAILED'),
            pendingPayments: baseData.payments.filter(p => p.status === 'PENDING'),
            testStudent: baseData.users.students[0]
          }
        };
        
      case 'learning':
        return {
          ...baseData,
          learningScenarios: {
            coursesWithMultipleLessons: baseData.courses.filter(c => c.lessons.length >= 5),
            coursesWithMaterials: baseData.courses.filter(c => 
              c.lessons.some(l => l.materials && l.materials.length > 0)
            ),
            testStudent: baseData.users.students[0]
          }
        };
        
      case 'dashboard':
        return {
          ...baseData,
          dashboardScenarios: {
            activeStudent: {
              ...baseData.users.students[0],
              enrolledCourses: baseData.courses.slice(0, 5),
              completedPayments: baseData.payments.filter(p => p.status === 'COMPLETED').slice(0, 3),
              recentActivity: this.generateRecentActivity()
            }
          }
        };
        
      default:
        return baseData;
    }
  }

  /**
   * Generate recent activity data
   */
  private static generateRecentActivity() {
    const activityTypes = [
      'lesson_complete',
      'course_enroll',
      'certificate_earned',
      'quiz_passed'
    ];
    
    return Array.from({ length: 10 }, () => ({
      id: faker.datatype.uuid(),
      type: faker.helpers.arrayElement(activityTypes),
      courseName: faker.helpers.arrayElement(this.courseTitles),
      lessonName: `الدرس ${faker.datatype.number({ min: 1, max: 10 })}`,
      timestamp: faker.date.recent(30),
      progress: faker.datatype.number({ min: 10, max: 100 })
    }));
  }

  /**
   * Export test data to JSON files
   */
  static exportToFiles(outputDir: string = './test-data') {
    const fs = require('fs');
    const path = require('path');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const completeDataset = this.generateCompleteDataset();
    
    // Export complete dataset
    fs.writeFileSync(
      path.join(outputDir, 'complete-dataset.json'),
      JSON.stringify(completeDataset, null, 2)
    );
    
    // Export individual collections
    fs.writeFileSync(
      path.join(outputDir, 'users.json'),
      JSON.stringify(completeDataset.users, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'categories.json'),
      JSON.stringify(completeDataset.categories, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'courses.json'),
      JSON.stringify(completeDataset.courses, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'payments.json'),
      JSON.stringify(completeDataset.payments, null, 2)
    );
    
    // Export scenario-specific data
    const scenarios = ['enrollment', 'payment', 'learning', 'dashboard'];
    scenarios.forEach(scenario => {
      const scenarioData = this.generateScenarioData(scenario as any);
      fs.writeFileSync(
        path.join(outputDir, `${scenario}-scenario.json`),
        JSON.stringify(scenarioData, null, 2)
      );
    });
    
    console.log(`✅ Test data exported to ${outputDir}`);
    console.log(`📊 Generated: ${completeDataset.summary.totalUsers} users, ${completeDataset.summary.totalCourses} courses, ${completeDataset.summary.totalPayments} payments`);
    
    return completeDataset;
  }
}

// Export data if this script is run directly
if (require.main === module) {
  TestDataGenerator.exportToFiles();
}