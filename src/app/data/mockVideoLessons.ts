import { VideoLesson, Language } from '@/app/types';

// Using empty video URLs to prevent load errors
// Teachers can upload real videos which will replace these placeholders
const SAMPLE_VIDEO_URL = ''; // Empty to prevent NotSupportedError
const SAMPLE_THUMBNAIL = undefined;

export const mockVideoLessons: VideoLesson[] = [
  {
    id: 'video-lesson-1',
    title: {
      en: 'Introduction to Numbers',
      hi: 'संख्याओं का परिचय',
      ta: 'எண்களின் அறிமுகம்',
      te: 'సంఖ్యల పరిచయం',
      bn: 'সংখ্যার পরিচয়',
    },
    description: {
      en: 'Learn about numbers from 1 to 100 with fun examples and exercises',
      hi: 'मजेदार उदाहरणों और अभ्यासों के साथ 1 से 100 तक की संख्याएँ सीखें',
      ta: 'வேடிக்கையான எடுத்துக்காட்டுகள் மற்றும் பயிற்சிகளுடன் 1 முதல் 100 வரை எண்களைக் கற்றுக்கொள்ளுங்கள்',
      te: 'సరదా ఉదాహరణలు మరియు వ్యాయామాలతో 1 నుండి 100 వరకు సంఖ్యలను నేర్చుకోండి',
      bn: 'মজাদার উদাহরণ এবং অনুশীলন সহ 1 থেকে 100 পর্যন্ত সংখ্যা শিখুন',
    },
    subject: 'mathematics',
    grade: '1',
    videoUrl: SAMPLE_VIDEO_URL,
    thumbnailUrl: SAMPLE_THUMBNAIL,
    duration: 300, // 5 minutes
    topics: ['Numbers', 'Counting', 'Basic Math'],
    uploadedBy: 'teacher-1',
    uploadedAt: '2024-01-15T10:00:00Z',
    views: 45,
    language: 'en',
  },
  {
    id: 'video-lesson-2',
    title: {
      en: 'Addition Made Easy',
      hi: 'जोड़ना आसान बना',
      ta: 'கூட்டல் எளிதாக்கப்பட்டது',
      te: 'కూడిక సులభతరం చేయబడింది',
      bn: 'যোগ সহজ করা হয়েছে',
    },
    description: {
      en: 'Master addition with simple tricks and techniques. Learn to add numbers quickly!',
      hi: 'सरल तरकीबों और तकनीकों के साथ जोड़ में महारत हासिल करें। जल्दी से संख्याएँ जोड़ना सीखें!',
      ta: 'எளிய தந்திரங்கள் மற்றும் நுட்பங்களுடன் கூட்டலை மாஸ்டர் செய்யுங்கள். எண்களை விரைவாக சேர்க்க கற்றுக்கொள்ளுங்கள்!',
      te: 'సాధారణ ట్రిక్స్ మరియు టెక్నిక్స్‌తో కూడికలో నైపుణ్యం పొందండి. సంఖ్యలను త్వరగా జోడించడం నేర్చుకోండి!',
      bn: 'সাধারণ কৌশল এবং কৌশল দিয়ে যোগ মাস্টার করুন। দ্রুত সংখ্যা যোগ করতে শিখুন!',
    },
    subject: 'mathematics',
    grade: '1',
    videoUrl: SAMPLE_VIDEO_URL,
    thumbnailUrl: SAMPLE_THUMBNAIL,
    duration: 420, // 7 minutes
    topics: ['Addition', 'Math Operations', 'Problem Solving'],
    uploadedBy: 'teacher-1',
    uploadedAt: '2024-01-20T14:30:00Z',
    views: 38,
    language: 'en',
  },
  {
    id: 'video-lesson-3',
    title: {
      en: 'The Water Cycle',
      hi: 'जल चक्र',
      ta: 'நீர் சுழற்சி',
      te: 'నీటి చక్రం',
      bn: 'জল চক্র',
    },
    description: {
      en: 'Explore how water moves through evaporation, condensation, and precipitation',
      hi: 'जानें कि कैसे पानी वाष्पीकरण, संघनन और वर्षा के माध्यम से चलता है',
      ta: 'ஆவியாதல், ஒடுக்கம் மற்றும் மழைப்பொழிவு மூலம் நீர் எவ்வாறு நகर்கிறது என்பதை ஆராயுங்கள்',
      te: 'ఆవిరి, ఘనీభవనం మరియు వర్షపాతం ద్వారా నీరు ఎలా కదులుతుంది అనేది అన్వేషించండి',
      bn: 'বাষ্পীভবন, ঘনীভবন এবং বৃষ্টিপাতের মাধ্যমে জল কীভাবে চলে তা অন্বেষণ করুন',
    },
    subject: 'science',
    grade: '2',
    videoUrl: SAMPLE_VIDEO_URL,
    thumbnailUrl: SAMPLE_THUMBNAIL,
    duration: 480, // 8 minutes
    topics: ['Water Cycle', 'Weather', 'Nature'],
    uploadedBy: 'teacher-2',
    uploadedAt: '2024-01-22T09:15:00Z',
    views: 52,
    language: 'en',
  },
  {
    id: 'video-lesson-4',
    title: {
      en: 'Plant Parts and Functions',
      hi: 'पौधे के भाग और कार्य',
      ta: 'தாவர பாகங்கள் மற்றும் செயல்பாடுகள்',
      te: 'మొక్క భాగాలు మరియు ఫంక్షన్స్',
      bn: 'উদ্ভিদের অংশ এবং কার্যাবলী',
    },
    description: {
      en: 'Discover the different parts of plants - roots, stem, leaves, flowers, and their functions',
      hi: 'पौधों के विभिन्न भागों को जानें - जड़, तना, पत्ते, फूल और उनके कार्य',
      ta: 'தாவரங்களின் வெவ்வேறு பாகங்களைக் கண்டறியுங்கள் - வேர்கள், தண்டு, இலைகள், பூக்கள் மற்றும் அவற்றின் செயல்பாடுகள்',
      te: 'మొక్కల యొక్క వివిధ భాగాలను కనుగొనండి - వేర్లు, కాండం, ఆకులు, పూలు మరియు వాటి ఫంక్షన్స్',
      bn: 'উদ্ভিদের বিভিন্ন অংশ আবিষ্কার করুন - শিকড়, কান্ড, পাতা, ফুল এবং তাদের কার্যাবলী',
    },
    subject: 'science',
    grade: '2',
    videoUrl: SAMPLE_VIDEO_URL,
    thumbnailUrl: SAMPLE_THUMBNAIL,
    duration: 360, // 6 minutes
    topics: ['Plants', 'Biology', 'Life Science'],
    uploadedBy: 'teacher-2',
    uploadedAt: '2024-01-25T11:00:00Z',
    views: 41,
    language: 'en',
  },
  {
    id: 'video-lesson-5',
    title: {
      en: 'Hindi Alphabets - Vowels',
      hi: 'हिंदी वर्णमाला - स्वर',
      ta: 'இந்தி எழுத்துகள் - உயிரெழுத்துக்கள்',
      te: 'హిందీ వర్ణమాల - అచ్చులు',
      bn: 'হিন্দি বর্ণমালা - স্বরবর্ণ',
    },
    description: {
      en: 'Learn all Hindi vowels (swar) with pronunciation and writing practice',
      hi: 'उच्चारण और लेखन अभ्यास के साथ सभी हिंदी स्वर (स्वर) सीखें',
      ta: 'உச்சரிப்பு மற்றும் எழுதும் பயிற்சியுடன் அனைத்து இந்தி உயிரெழுத்துக்களையும் (ஸ்வர்) கற்றுக்கொள்ளுங்கள்',
      te: 'ఉచ్చారణ మరియు రాయడం అభ్యాసంతో అన్ని హిందీ అచ్చులను (స్వర్) నేర్చుకోండి',
      bn: 'উচ্চারণ এবং লেখার অনুশীলন সহ সমস্ত হিন্দি স্বরবর্ণ (স্বর) শিখুন',
    },
    subject: 'language',
    grade: '1',
    videoUrl: SAMPLE_VIDEO_URL,
    thumbnailUrl: SAMPLE_THUMBNAIL,
    duration: 540, // 9 minutes
    topics: ['Hindi', 'Alphabets', 'Vowels', 'Language'],
    uploadedBy: 'teacher-3',
    uploadedAt: '2024-01-28T08:45:00Z',
    views: 67,
    language: 'hi',
  },
  {
    id: 'video-lesson-6',
    title: {
      en: 'Subtraction Basics',
      hi: 'घटाव की मूल बातें',
      ta: 'கழித்தல் அடிப்படைகள்',
      te: 'తీసివేత ప్రాథమికాలు',
      bn: 'বিয়োগের মৌলিক বিষয়',
    },
    description: {
      en: 'Understand subtraction with real-life examples and practice problems',
      hi: 'वास्तविक जीवन के उदाहरणों और अभ्यास समस्याओं के साथ घटाव को समझें',
      ta: 'நிஜ வாழ்க்கை எடுத்துக்காட்டுகள் மற்றும் பயிற்சி சிக்கல்களுடன் கழித்தலை புரிந்து கொள்ளுங்கள்',
      te: 'నిజ జీవిత ఉదాహరణలు మరియు అభ్యాస సమస్యలతో తీసివేతను అర్థం చేసుకోండి',
      bn: 'বাস্তব জীবনের উদাহরণ এবং অনুশীলনের সমস্যা দিয়ে বিয়োগ বুঝুন',
    },
    subject: 'mathematics',
    grade: '1',
    videoUrl: SAMPLE_VIDEO_URL,
    thumbnailUrl: SAMPLE_THUMBNAIL,
    duration: 390, // 6.5 minutes
    topics: ['Subtraction', 'Math Operations', 'Problem Solving'],
    uploadedBy: 'teacher-1',
    uploadedAt: '2024-02-01T13:20:00Z',
    views: 29,
    language: 'en',
  },
];

// Function to get lessons by grade and subject
export function getLessonsByGradeAndSubject(grade: string, subject: string): VideoLesson[] {
  return mockVideoLessons.filter(
    lesson => lesson.grade === grade && lesson.subject === subject
  );
}

// Function to save lesson locally (for offline usage)
export function saveLessonLocally(lesson: VideoLesson): void {
  const key = `lesson-${lesson.id}`;
  localStorage.setItem(key, JSON.stringify(lesson));
}

// Function to initialize mock lessons in localStorage
export function initializeMockLessons(): void {
  mockVideoLessons.forEach(lesson => {
    saveLessonLocally(lesson);
  });
}