import { TeacherAnalytics, StudentPerformance, SubjectData } from '@/app/types';

// Generate mock student performance data
export function generateMockStudentPerformance(count: number = 20): StudentPerformance[] {
  const names = [
    'Rahul Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Arjun Singh',
    'Kavya Iyer', 'Rohan Gupta', 'Anjali Nair', 'Vikram Shah', 'Pooja Desai',
    'Aditya Rao', 'Divya Menon', 'Karthik Pillai', 'Meera Joshi', 'Sanjay Kumar',
    'Lakshmi Bhat', 'Nikhil Verma', 'Ritu Agarwal', 'Suresh Pillai', 'Deepa Nambiar',
    'Manoj Reddy', 'Swati Kulkarni', 'Praveen Das', 'Nisha Yadav', 'Rajesh Iyer',
  ];

  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  return Array.from({ length: count }, (_, i) => ({
    studentId: `student-${i + 1}`,
    studentName: names[i % names.length],
    grade: grades[Math.floor(Math.random() * grades.length)] as any,
    lessonsCompleted: Math.floor(Math.random() * 15) + 1,
    quizzesCompleted: Math.floor(Math.random() * 10) + 1,
    averageScore: Math.floor(Math.random() * 40) + 60, // 60-100%
    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: Math.random() > 0.3, // 70% active
  }));
}

// Generate mock subject-wise data
export function generateMockSubjectData(): SubjectData[] {
  return [
    {
      subject: 'mathematics',
      studentsEnrolled: 45,
      averageScore: 78,
      lessonsCompleted: 156,
      quizzesCompleted: 98,
    },
    {
      subject: 'science',
      studentsEnrolled: 38,
      averageScore: 82,
      lessonsCompleted: 134,
      quizzesCompleted: 87,
    },
    {
      subject: 'language',
      studentsEnrolled: 52,
      averageScore: 75,
      lessonsCompleted: 189,
      quizzesCompleted: 112,
    },
    {
      subject: 'social-studies',
      studentsEnrolled: 41,
      averageScore: 80,
      lessonsCompleted: 145,
      quizzesCompleted: 94,
    },
  ];
}

// Generate complete mock analytics
export function generateMockTeacherAnalytics(): TeacherAnalytics {
  const studentPerformance = generateMockStudentPerformance(25);
  const activeCount = studentPerformance.filter(s => s.isActive).length;
  const totalScore = studentPerformance.reduce((sum, s) => sum + s.averageScore, 0);
  const totalLessons = studentPerformance.reduce((sum, s) => sum + s.lessonsCompleted, 0);

  return {
    totalStudents: studentPerformance.length,
    activeStudents: activeCount,
    totalLessons: 45,
    totalQuizzes: 28,
    averageScore: Math.round(totalScore / studentPerformance.length),
    averageProgress: Math.round(totalLessons / studentPerformance.length),
    studentPerformance,
    subjectWiseData: generateMockSubjectData(),
    recentActivity: [
      {
        id: 'activity-1',
        userId: 'student-1',
        type: 'lesson_complete',
        data: { lessonId: 'math-1-001' },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'activity-2',
        userId: 'student-2',
        type: 'quiz_complete',
        data: { quizId: 'quiz-1', score: 8, total: 10 },
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'activity-3',
        userId: 'student-3',
        type: 'lesson_complete',
        data: { lessonId: 'science-2-001' },
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };
}

// Save mock analytics to localStorage
export function saveMockAnalytics(teacherId: string): void {
  const analytics = generateMockTeacherAnalytics();
  localStorage.setItem(`analytics-${teacherId}`, JSON.stringify(analytics));
  console.log('✅ Mock analytics saved for teacher:', teacherId);
}
