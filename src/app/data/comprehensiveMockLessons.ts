import { VideoLesson } from '@/app/types';

const SAMPLE_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const SAMPLE_THUMBNAIL = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400';

// Comprehensive mock lessons for ALL classes (1-10) and ALL subjects
export const comprehensiveMockLessons: VideoLesson[] = [
  // ========== MATHEMATICS - CLASS 1 ==========
  {
    id: 'math-1-001',
    title: {
      en: 'Introduction to Numbers 1-100',
      hi: 'संख्याओं का परिचय 1-100',
      ta: 'எண்களின் அறிமுகம் 1-100',
      te: 'సంఖ్యల పరిచయం 1-100',
      bn: 'সংখ্যার পরিচয় 1-100',
    },
    description: {
      en: 'Learn counting from 1 to 100 with fun activities',
      hi: 'मजेदार गतिविधियों के साथ 1 से 100 तक गिनती सीखें',
      ta: 'வேடிக்கையான செயல்பாடுகளுடன் 1 முதல் 100 வரை எண்ணுவதைக் கற்றுக்கொள்ளுங்கள்',
      te: 'సరదా కార్యకలాపాలతో 1 నుండి 100 వరకు లెక్కించడం నేర్చుకోండి',
      bn: 'মজাদার কার্যকলাপের সাথে 1 থেকে 100 পর্যন্ত গণনা শিখুন',
    },
    subject: 'mathematics',
    grade: '1',
    videoUrl: SAMPLE_VIDEO_URL,
    thumbnailUrl: SAMPLE_THUMBNAIL,
    duration: 300,
    topics: ['Numbers', 'Counting', 'Basic Math'],
    uploadedBy: 'teacher-1',
    uploadedAt: '2024-01-15T10:00:00Z',
    views: 156,
    language: 'en',
  },
  {
    id: 'math-1-002',
    title: {
      en: 'Addition for Beginners',
      hi: 'शुरुआती लोगों के लिए जोड़',
      ta: 'ஆரம்பநிலைக்கான கூட்டல்',
      te: 'ప్రారంభకులకు కూడిక',
      bn: 'শিক্ষানবিসদের জন্য যোগ',
    },
    description: {
      en: 'Learn to add numbers up to 20 with examples',
      hi: 'उदाहरणों के साथ 20 तक की संख्याओं को जोड़ना सीखें',
      ta: 'எடுத்துக்காட்டுகளுடன் 20 வரை எண்களை சேர்க்க கற்றுக்கொள்ளுங்கள்',
      te: 'ఉదాహరణలతో 20 వరకు సంఖ్యలను జోడించడం నేర్చుకోండి',
      bn: 'উদাহরণ সহ 20 পর্যন্ত সংখ্যা যোগ করতে শিখুন',
    },
    subject: 'mathematics',
    grade: '1',
    videoUrl: SAMPLE_VIDEO_URL,
    thumbnailUrl: SAMPLE_THUMBNAIL,
    duration: 420,
    topics: ['Addition', 'Math Operations'],
    uploadedBy: 'teacher-1',
    uploadedAt: '2024-01-20T14:30:00Z',
    views: 143,
    language: 'en',
  },

  // ========== MATHEMATICS - CLASS 2 ==========
  {
    id: 'math-2-001',
    title: {
      en: 'Multiplication Tables 2-5',
      hi: 'गुणा तालिका 2-5',
      ta: 'பெருக்கல் அட்டவணைகள் 2-5',
      te: 'గుణకార పట్టికలు 2-5',
      bn: 'গুণ টেবিল 2-5',
    },
    description: {
      en: 'Master multiplication tables from 2 to 5',
      hi: '2 से 5 तक की गुणा तालिका में महारत हासिल करें',
      ta: '2 முதல் 5 வரை பெருக்கல் அட்டவணைகளை மாஸ்டர் செய்யுங்கள்',
      te: '2 నుండి 5 వరకు గుణకార పట్టికలలో నైపుణ్యం పొందండి',
      bn: '2 থেকে 5 পর্যন্ত গুণ টেবিল আয়ত্ত করুন',
    },
    subject: 'mathematics',
    grade: '2',
    videoUrl: SAMPLE_VIDEO_URL,
    thumbnailUrl: SAMPLE_THUMBNAIL,
    duration: 540,
    topics: ['Multiplication', 'Tables', 'Math'],
    uploadedBy: 'teacher-1',
    uploadedAt: '2024-01-18T11:00:00Z',
    views: 198,
    language: 'en',
  },

  // ========== MATHEMATICS - CLASS 3-10 (Sample for each) ==========
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `math-${i + 3}-001`,
    title: {
      en: `Mathematics Class ${i + 3} - Chapter 1`,
      hi: `गणित कक्षा ${i + 3} - अध्याय 1`,
      ta: `கணிதம் வகுப்பு ${i + 3} - அத்தியாயம் 1`,
      te: `గణితం తరగతి ${i + 3} - అధ్యాయం 1`,
      bn: `গণিত শ্রেণী ${i + 3} - অধ্যায় 1`,
    },
    description: {
      en: `Learn key mathematical concepts for Class ${i + 3}`,
      hi: `कक्षा ${i + 3} के लिए महत्वपूर्ण गणितीय अवधारणाएँ सीखें`,
      ta: `வகுப்பு ${i + 3} க்கான முக்கிய கணித கருத்துகளை கற்றுக்கொள்ளுங்கள்`,
      te: `తరగతి ${i + 3} కోసం ముఖ్య గణిత భావనలను నేర్చుకోండి`,
      bn: `শ্রেণী ${i + 3} এর জন্য মূল গাণিতিক ধারণা শিখুন`,
    },
    subject: 'mathematics' as const,
    grade: `${i + 3}` as any,
    videoUrl: SAMPLE_VIDEO_URL,
    thumbnailUrl: SAMPLE_THUMBNAIL,
    duration: 600,
    topics: ['Algebra', 'Geometry', 'Numbers'],
    uploadedBy: 'teacher-1',
    uploadedAt: '2024-02-01T10:00:00Z',
    views: 120 + i * 10,
    language: 'en' as const,
  })),

  // ========== SCIENCE - ALL CLASSES ==========
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `science-${i + 1}-001`,
    title: {
      en: `Science Class ${i + 1} - Introduction`,
      hi: `विज्ञान कक्षा ${i + 1} - परिचय`,
      ta: `அறிவியல் வகுப்பு ${i + 1} - அறிமுகம்`,
      te: `సైన్స్ తరగతి ${i + 1} - పరిచయం`,
      bn: `বিজ্ঞান শ্রেণী ${i + 1} - ভূমিকা`,
    },
    description: {
      en: `Explore fascinating science topics for Class ${i + 1}`,
      hi: `कक्षा ${i + 1} के लिए आकर्षक विज्ञान विषयों का अन्वेषण करें`,
      ta: `வகுப்பு ${i + 1} க்கான கவர்ச்சிகரமான அறிவியல் தலைப்புகளை ஆராயுங்கள்`,
      te: `తరగతి ${i + 1} కోసం ఆకర్షణీయమైన సైన్స్ అంశాలను అన్వేషించండి`,
      bn: `শ্রেণী ${i + 1} এর জন্য মুগ্ধকর বিজ্ঞান বিষয় অন্বেষণ করুন`,
    },
    subject: 'science' as const,
    grade: `${i + 1}` as any,
    videoUrl: SAMPLE_VIDEO_URL,
    thumbnailUrl: SAMPLE_THUMBNAIL,
    duration: 480,
    topics: ['Plants', 'Animals', 'Nature', 'Experiments'],
    uploadedBy: 'teacher-2',
    uploadedAt: '2024-02-05T09:00:00Z',
    views: 140 + i * 8,
    language: 'en' as const,
  })),

  // ========== LANGUAGE - ALL CLASSES ==========
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `language-${i + 1}-001`,
    title: {
      en: `Language Arts Class ${i + 1}`,
      hi: `भाषा कला कक्षा ${i + 1}`,
      ta: `மொழி கலைகள் வகுப்பு ${i + 1}`,
      te: `భాషా కళలు తరగతి ${i + 1}`,
      bn: `ভাষা শিল্প শ্রেণী ${i + 1}`,
    },
    description: {
      en: `Improve your language skills with Class ${i + 1} lessons`,
      hi: `कक्षा ${i + 1} के पाठों से अपनी भाषा कौशल में सुधार करें`,
      ta: `வகுப்பு ${i + 1} பாடங்களுடன் உங்கள் மொழி திறன்களை மேம்படுத்துங்கள்`,
      te: `తరగతి ${i + 1} పాఠాలతో మీ భాషా నైపుణ్యాలను మెరుగుపరచండి`,
      bn: `শ্রেণী ${i + 1} পাঠের সাথে আপনার ভাষা দক্ষতা উন্নত করুন`,
    },
    subject: 'language' as const,
    grade: `${i + 1}` as any,
    videoUrl: SAMPLE_VIDEO_URL,
    thumbnailUrl: SAMPLE_THUMBNAIL,
    duration: 360,
    topics: ['Grammar', 'Vocabulary', 'Reading', 'Writing'],
    uploadedBy: 'teacher-3',
    uploadedAt: '2024-02-08T11:00:00Z',
    views: 110 + i * 12,
    language: 'en' as const,
  })),

  // ========== SOCIAL STUDIES - ALL CLASSES ==========
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `social-${i + 1}-001`,
    title: {
      en: `Social Studies Class ${i + 1}`,
      hi: `सामाजिक अध्ययन कक्षा ${i + 1}`,
      ta: `சமூக ஆய்வுகள் வகுப்பு ${i + 1}`,
      te: `సామాజిక అధ్యయనాలు తరగతి ${i + 1}`,
      bn: `সামাজিক অধ্যয়ন শ্রেণী ${i + 1}`,
    },
    description: {
      en: `Learn about history, geography and civics for Class ${i + 1}`,
      hi: `कक्षा ${i + 1} के लिए इतिहास, भूगोल और नागरिक शास्त्र के बारे में जानें`,
      ta: `வகுப்பு ${i + 1} க்கான வரலாறு, புவியியல் மற்றும் குடிமையியல் பற்றி அறியுங்கள்`,
      te: `తరగతి ${i + 1} కోసం చరిత్ర, భూగోళశాస్త్రం మరియు పౌరశాస్త్రం గురించి తెలుసుకోండి`,
      bn: `শ্রেণী ${i + 1} এর জন্য ইতিহাস, ভূগোল এবং নাগরিকত্ব সম্পর্কে জানুন`,
    },
    subject: 'social-studies' as const,
    grade: `${i + 1}` as any,
    videoUrl: SAMPLE_VIDEO_URL,
    thumbnailUrl: SAMPLE_THUMBNAIL,
    duration: 540,
    topics: ['History', 'Geography', 'Civics', 'Culture'],
    uploadedBy: 'teacher-4',
    uploadedAt: '2024-02-10T10:30:00Z',
    views: 95 + i * 9,
    language: 'en' as const,
  })),
];

// Initialize all lessons in localStorage
export function initializeAllMockLessons(): void {
  comprehensiveMockLessons.forEach(lesson => {
    localStorage.setItem(`lesson-${lesson.id}`, JSON.stringify(lesson));
  });
  console.log(`✅ Initialized ${comprehensiveMockLessons.length} mock lessons for all classes (1-10) and subjects`);
}

// Get lessons by grade and subject
export function getLessonsByGradeAndSubject(grade: string, subject: string): VideoLesson[] {
  return comprehensiveMockLessons.filter(
    lesson => lesson.grade === grade && lesson.subject === subject
  );
}

// Get total lesson count
export function getTotalLessonCount(): number {
  return comprehensiveMockLessons.length;
}
