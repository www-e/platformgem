import { faker } from '@faker-js/faker';

export const TEST_USERS = {
  STUDENT: {
    name: 'أحمد محمد الطالب',
    phone: '01012345678',
    email: 'student@test.com',
    password: 'TestPassword123!',
    studentId: '123456',
    parentPhone: '01123456789'
  },
  PROFESSOR: {
    name: 'د. محمد أحمد الأستاذ',
    phone: '01087654321',
    email: 'professor@test.com',
    password: 'TestPassword123!',
    role: 'PROFESSOR'
  },
  ADMIN: {
    name: 'مدير النظام',
    phone: '01055555555',
    email: 'admin@test.com',
    password: 'TestPassword123!',
    role: 'ADMIN'
  }
};

export const TEST_COURSES = [
  {
    title: 'أساسيات البرمجة بـ JavaScript',
    description: 'تعلم أساسيات البرمجة باستخدام لغة JavaScript من الصفر حتى الاحتراف',
    price: 299,
    currency: 'EGP',
    category: 'البرمجة',
    lessons: [
      { title: 'مقدمة في JavaScript', duration: 1800 },
      { title: 'المتغيرات والثوابت', duration: 2400 },
      { title: 'الدوال والكائنات', duration: 3000 },
      { title: 'التعامل مع DOM', duration: 2700 },
      { title: 'مشروع تطبيقي', duration: 3600 }
    ]
  },
  {
    title: 'تصميم المواقع بـ HTML و CSS',
    description: 'تعلم تصميم المواقع الحديثة باستخدام HTML5 و CSS3',
    price: 199,
    currency: 'EGP',
    category: 'تصميم الويب',
    lessons: [
      { title: 'مقدمة في HTML', duration: 1500 },
      { title: 'تنسيق النصوص والصور', duration: 2000 },
      { title: 'CSS والتنسيق المتقدم', duration: 2800 },
      { title: 'التصميم المتجاوب', duration: 3200 },
      { title: 'مشروع موقع كامل', duration: 4000 }
    ]
  },
  {
    title: 'مقدمة في علوم البيانات',
    description: 'تعلم أساسيات علوم البيانات والتحليل الإحصائي',
    price: 0, // Free course
    currency: 'EGP',
    category: 'علوم البيانات',
    lessons: [
      { title: 'ما هي علوم البيانات؟', duration: 1200 },
      { title: 'أدوات التحليل الأساسية', duration: 2100 },
      { title: 'تنظيف البيانات', duration: 2500 },
      { title: 'التصور البياني', duration: 2800 }
    ]
  }
];

export const TEST_CATEGORIES = [
  { name: 'البرمجة', slug: 'programming', description: 'دورات البرمجة وتطوير البرمجيات' },
  { name: 'تصميم الويب', slug: 'web-design', description: 'دورات تصميم وتطوير المواقع' },
  { name: 'علوم البيانات', slug: 'data-science', description: 'دورات تحليل البيانات والذكاء الاصطناعي' },
  { name: 'التسويق الرقمي', slug: 'digital-marketing', description: 'دورات التسويق الإلكتروني ووسائل التواصل' },
  { name: 'إدارة الأعمال', slug: 'business', description: 'دورات إدارة الأعمال والريادة' }
];

export const PAYMENT_TEST_DATA = {
  VALID_CARD: {
    number: '4111111111111111',
    expiry: '12/25',
    cvv: '123',
    name: 'Test User'
  },
  INVALID_CARD: {
    number: '4000000000000002',
    expiry: '12/25',
    cvv: '123',
    name: 'Test User'
  },
  EXPIRED_CARD: {
    number: '4111111111111111',
    expiry: '12/20',
    cvv: '123',
    name: 'Test User'
  }
};

export const SEARCH_TERMS = [
  'JavaScript',
  'HTML',
  'CSS',
  'Python',
  'React',
  'Node.js',
  'تصميم',
  'برمجة',
  'تطوير',
  'ويب'
];

export const FILTER_OPTIONS = {
  PRICE_RANGES: [
    { label: 'مجاني', value: 'free' },
    { label: 'أقل من 100 جنيه', value: '0-100' },
    { label: '100-300 جنيه', value: '100-300' },
    { label: '300-500 جنيه', value: '300-500' },
    { label: 'أكثر من 500 جنيه', value: '500+' }
  ],
  SORT_OPTIONS: [
    { label: 'الأحدث', value: 'newest' },
    { label: 'الأقدم', value: 'oldest' },
    { label: 'الأعلى تقييماً', value: 'rating' },
    { label: 'الأقل سعراً', value: 'price-low' },
    { label: 'الأعلى سعراً', value: 'price-high' }
  ]
};

export const ERROR_MESSAGES = {
  INVALID_LOGIN: 'معرف الطالب أو رقم الهاتف أو كلمة المرور غير صحيحة',
  REQUIRED_FIELD: 'هذا الحقل مطلوب',
  INVALID_EMAIL: 'البريد الإلكتروني غير صحيح',
  WEAK_PASSWORD: 'كلمة المرور ضعيفة',
  PHONE_EXISTS: 'رقم الهاتف مستخدم بالفعل',
  PAYMENT_FAILED: 'فشل في معالجة الدفع',
  NETWORK_ERROR: 'خطأ في الاتصال بالشبكة'
};

export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'تم إنشاء الحساب بنجاح',
  LOGIN_SUCCESS: 'تم تسجيل الدخول بنجاح',
  ENROLLMENT_SUCCESS: 'تم التسجيل في الدورة بنجاح',
  PAYMENT_SUCCESS: 'تم الدفع بنجاح',
  PROFILE_UPDATED: 'تم تحديث الملف الشخصي'
};

export const NAVIGATION_ITEMS = {
  MAIN_MENU: [
    { label: 'الرئيسية', href: '/' },
    { label: 'الدورات', href: '/courses' },
    { label: 'عن المنصة', href: '/about' },
    { label: 'اتصل بنا', href: '/contact' }
  ],
  STUDENT_MENU: [
    { label: 'لوحة التحكم', href: '/dashboard' },
    { label: 'دوراتي', href: '/dashboard?tab=courses' },
    { label: 'التقدم', href: '/dashboard?tab=progress' },
    { label: 'المدفوعات', href: '/dashboard?tab=payments' },
    { label: 'الشهادات', href: '/dashboard?tab=certificates' },
    { label: 'الملف الشخصي', href: '/profile' }
  ]
};

export const RESPONSIVE_BREAKPOINTS = {
  MOBILE: { width: 375, height: 667 },
  TABLET: { width: 768, height: 1024 },
  DESKTOP: { width: 1920, height: 1080 },
  LARGE_DESKTOP: { width: 2560, height: 1440 }
};

export function generateRandomUser() {
  return {
    name: faker.person.fullName(),
    phone: `010${faker.number.int({ min: 10000000, max: 99999999 })}`,
    email: faker.internet.email(),
    password: 'TestPassword123!',
    studentId: faker.number.int({ min: 100000, max: 999999 }).toString()
  };
}