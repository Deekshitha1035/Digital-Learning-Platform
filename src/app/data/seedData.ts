import { Student, Teacher, VideoLesson, StudentProgress, Grade, Subject, Language, QuizResult } from '@/app/types';

/**
 * Comprehensive data seeding system for offline-first learning platform
 * This creates default students, lessons, and progress data
 * All data is stored in localStorage for offline access
 */

// Generate 25 default students with realistic Indian names
export const generateDefaultStudents = (teacherSchool: string = 'Government High School'): Student[] => {
  const indianNames = [
    { name: 'Rahul Kumar', grade: '8' as Grade },
    { name: 'Priya Sharma', grade: '9' as Grade },
    { name: 'Amit Patel', grade: '7' as Grade },
    { name: 'Sneha Reddy', grade: '10' as Grade },
    { name: 'Vikram Singh', grade: '8' as Grade },
    { name: 'Ananya Iyer', grade: '9' as Grade },
    { name: 'Rohan Gupta', grade: '6' as Grade },
    { name: 'Kavya Nair', grade: '7' as Grade },
    { name: 'Arjun Desai', grade: '10' as Grade },
    { name: 'Divya Menon', grade: '8' as Grade },
    { name: 'Karan Malhotra', grade: '9' as Grade },
    { name: 'Riya Kapoor', grade: '6' as Grade },
    { name: 'Aditya Verma', grade: '7' as Grade },
    { name: 'Pooja Reddy', grade: '8' as Grade },
    { name: 'Sahil Khan', grade: '9' as Grade },
    { name: 'Meera Pandey', grade: '10' as Grade },
    { name: 'Nikhil Joshi', grade: '6' as Grade },
    { name: 'Shreya Agarwal', grade: '7' as Grade },
    { name: 'Varun Choudhary', grade: '8' as Grade },
    { name: 'Tanvi Saxena', grade: '9' as Grade },
    { name: 'Akash Rao', grade: '10' as Grade },
    { name: 'Isha Thakur', grade: '6' as Grade },
    { name: 'Manish Kumar', grade: '7' as Grade },
    { name: 'Nisha Pillai', grade: '8' as Grade },
    { name: 'Sanjay Mehta', grade: '9' as Grade },
  ];

  return indianNames.map((student, index) => ({
    id: `student-${index + 1}`,
    name: student.name,
    email: `${student.name.toLowerCase().replace(' ', '.')}@student.edu`,
    role: 'student' as const,
    schoolName: teacherSchool,
    grade: student.grade,
    subject: 'all' as Subject,
    section: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
    language: ['en', 'hi', 'ta'][Math.floor(Math.random() * 3)] as Language,
    createdAt: new Date(2024, 0, index + 1).toISOString(),
  }));
};

// Generate realistic progress data for each student
export const generateStudentProgress = (studentId: string, grade: Grade): StudentProgress => {
  const lessonsPerSubject = Math.floor(Math.random() * 10) + 5; // 5-15 lessons
  const quizzesCompleted = Math.floor(Math.random() * 8) + 2; // 2-10 quizzes
  
  const lessonsCompleted: string[] = [];
  const subjects: Subject[] = ['mathematics', 'science', 'language', 'social-studies'];
  
  // Generate completed lesson IDs
  subjects.forEach(subject => {
    const count = Math.floor(Math.random() * lessonsPerSubject);
    for (let i = 0; i < count; i++) {
      lessonsCompleted.push(`lesson-${subject}-${grade}-${i + 1}`);
    }
  });

  // Generate quiz results
  const quizzesCompletedData: QuizResult[] = [];
  for (let i = 0; i < quizzesCompleted; i++) {
    const score = Math.floor(Math.random() * 40) + 60; // 60-100%
    const totalQuestions = 10;
    quizzesCompletedData.push({
      quizId: `quiz-${i + 1}`,
      score: Math.floor((score / 100) * totalQuestions),
      totalQuestions,
      completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      attempts: Math.floor(Math.random() * 3) + 1,
      timeTaken: Math.floor(Math.random() * 600) + 300, // 5-15 minutes
    });
  }

  const totalScore = quizzesCompletedData.reduce((sum, quiz) => sum + quiz.score, 0);
  const lastActiveDays = Math.floor(Math.random() * 7); // Active within last 7 days

  return {
    userId: studentId,
    lessonsCompleted,
    lessonsWatched: lessonsCompleted.map(lessonId => ({
      lessonId,
      watchTime: Math.floor(Math.random() * 900) + 300, // 5-20 minutes
      completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })),
    quizzesCompleted: quizzesCompletedData,
    totalScore,
    lastActive: new Date(Date.now() - lastActiveDays * 24 * 60 * 60 * 1000).toISOString(),
    streakDays: Math.floor(Math.random() * 30),
  };
};

// Generate comprehensive video lessons for all grades and subjects
export const generateVideoLessons = (): VideoLesson[] => {
  const lessons: VideoLesson[] = [];
  const grades: Grade[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const subjects: Subject[] = ['mathematics', 'science', 'language', 'social-studies'];
  
  const lessonTemplates = {
    mathematics: [
      'Introduction to Numbers',
      'Addition and Subtraction',
      'Multiplication Tables',
      'Division Basics',
      'Fractions Fundamentals',
      'Decimals and Percentages',
      'Algebra Basics',
      'Geometry Introduction',
      'Measurement and Units',
      'Data and Graphs',
    ],
    science: [
      'Living and Non-Living Things',
      'Plants and Animals',
      'Human Body Systems',
      'States of Matter',
      'Light and Sound',
      'Force and Motion',
      'Energy and Power',
      'Earth and Space',
      'Chemical Reactions',
      'Electricity and Magnetism',
    ],
    language: [
      'Alphabet and Phonics',
      'Reading Comprehension',
      'Grammar Basics',
      'Sentence Formation',
      'Story Writing',
      'Poetry and Literature',
      'Essay Writing',
      'Vocabulary Building',
      'Public Speaking',
      'Advanced Grammar',
    ],
    'social-studies': [
      'Our Community',
      'Maps and Directions',
      'Indian History',
      'World Geography',
      'Government and Democracy',
      'Indian Constitution',
      'Economic Systems',
      'Cultural Heritage',
      'Environmental Studies',
      'Global Issues',
    ],
  };

  let lessonCounter = 1;

  subjects.forEach(subject => {
    grades.forEach(grade => {
      const templates = lessonTemplates[subject];
      const lessonsForGrade = Math.min(templates.length, parseInt(grade) + 2); // More lessons for higher grades
      
      for (let i = 0; i < lessonsForGrade; i++) {
        const title = templates[i] || `${subject} Lesson ${i + 1}`;
        const lessonId = `lesson-${subject}-${grade}-${i + 1}`;
        
        lessons.push({
          id: lessonId,
          title: {
            en: `Grade ${grade} - ${title}`,
            hi: `कक्षा ${grade} - ${title}`,
            ta: `வகுப்பு ${grade} - ${title}`,
            te: `తరగతి ${grade} - ${title}`,
            bn: `শ্রেণী ${grade} - ${title}`,
          },
          description: {
            en: `Learn ${title.toLowerCase()} for grade ${grade}. This lesson covers fundamental concepts with examples and practice problems.`,
            hi: `कक्षा ${grade} के लिए ${title} सीखें। यह पाठ उदाहरणों और अभ्यास समस्याओं के साथ मौलिक अवधारणाओं को शामिल करता है।`,
            ta: `வகுப்பு ${grade}-க்கான ${title}-ஐ கற்றுக்கொள்ளுங்கள். இந்த பாடம் எடுத்துக்காட்டுகள் மற்றும் பயிற்சி சிக்கல்களுடன் அடிப்படை கருத்துகளை உள்ளடக்கியது.`,
            te: `తరగతి ${grade} కోసం ${title} నేర్చుకోండి। ఈ పాఠం ఉదాహరణలు మరియు అభ్యాస సమస్యలతో ప్రాథమిక భావనలను కవర్ చేస్తుంది.`,
            bn: `শ্রেণী ${grade} এর জন্য ${title} শিখুন। এই পাঠটি উদাহరণ এবং অনুশীলন সমস্যা সহ মৌলিক ধারণাগুলি কভার করে।`,
          },
          subject,
          grade,
          videoUrl: '', // Empty URL prevents video load errors - teachers can upload real videos
          thumbnailUrl: undefined,
          duration: Math.floor(Math.random() * 900) + 600, // 10-25 minutes
          topics: [title, `${subject} basics`, `Grade ${grade} curriculum`],
          uploadedBy: 'teacher-default',
          uploadedAt: new Date(2024, Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1).toISOString(),
          views: Math.floor(Math.random() * 500) + 50,
          language: 'en',
        });
        
        lessonCounter++;
      }
    });
  });

  return lessons;
};

// Initialize the database with all default data
export const seedDatabase = (teacherId?: string, teacherSchool?: string) => {
  try {
    console.log('🌱 Seeding database with default data...');

    // Check if data already exists
    const existingData = localStorage.getItem('data-seeded');
    if (existingData) {
      console.log('✅ Database already seeded');
      return;
    }

    // Generate and store students
    const students = generateDefaultStudents(teacherSchool);
    students.forEach(student => {
      localStorage.setItem(`user-${student.id}`, JSON.stringify(student));
      
      // Generate and store progress for each student
      const progress = generateStudentProgress(student.id, student.grade);
      localStorage.setItem(`progress-${student.id}`, JSON.stringify(progress));
    });

    // Generate and store video lessons
    const lessons = generateVideoLessons();
    lessons.forEach(lesson => {
      localStorage.setItem(`lesson-${lesson.id}`, JSON.stringify(lesson));
    });

    // Store metadata
    localStorage.setItem('data-seeded', 'true');
    localStorage.setItem('data-seeded-at', new Date().toISOString());
    localStorage.setItem('total-students', students.length.toString());
    localStorage.setItem('total-lessons', lessons.length.toString());

    console.log(`✅ Successfully seeded:`);
    console.log(`   📚 ${lessons.length} video lessons`);
    console.log(`   👨‍🎓 ${students.length} students`);
    console.log(`   📊 ${students.length} progress records`);
    
    return {
      students: students.length,
      lessons: lessons.length,
      success: true,
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return {
      students: 0,
      lessons: 0,
      success: false,
      error,
    };
  }
};

// Get all students from localStorage
export const getAllStudents = (): Student[] => {
  const students: Student[] = [];
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (key.startsWith('user-')) {
      try {
        const user = JSON.parse(localStorage.getItem(key) || '{}');
        if (user.role === 'student') {
          students.push(user);
        }
      } catch (error) {
        console.error(`Error parsing student data for ${key}:`, error);
      }
    }
  });
  
  return students;
};

// Get all lessons from localStorage
export const getAllLessons = (): VideoLesson[] => {
  const lessons: VideoLesson[] = [];
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (key.startsWith('lesson-')) {
      try {
        const lesson = JSON.parse(localStorage.getItem(key) || '{}');
        lessons.push(lesson);
      } catch (error) {
        console.error(`Error parsing lesson data for ${key}:`, error);
      }
    }
  });
  
  return lessons;
};

// Get student progress
export const getStudentProgress = (studentId: string): StudentProgress | null => {
  try {
    const progressData = localStorage.getItem(`progress-${studentId}`);
    if (progressData) {
      return JSON.parse(progressData);
    }
  } catch (error) {
    console.error(`Error getting progress for ${studentId}:`, error);
  }
  return null;
};

// Update student progress in real-time
export const updateStudentProgress = (studentId: string, updates: Partial<StudentProgress>): boolean => {
  try {
    const currentProgress = getStudentProgress(studentId);
    if (!currentProgress) {
      console.error(`No progress found for student ${studentId}`);
      return false;
    }

    const updatedProgress = {
      ...currentProgress,
      ...updates,
      lastActive: new Date().toISOString(),
    };

    localStorage.setItem(`progress-${studentId}`, JSON.stringify(updatedProgress));
    console.log(`✅ Updated progress for student ${studentId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating progress for ${studentId}:`, error);
    return false;
  }
};

// Reset database (for testing)
export const resetDatabase = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('user-') || key.startsWith('lesson-') || key.startsWith('progress-') || key.startsWith('data-seeded')) {
      localStorage.removeItem(key);
    }
  });
  console.log('🔄 Database reset complete');
};