export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn';
export type Role = 'student' | 'teacher' | 'admin';
export type Grade = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';
export type Subject = 'mathematics' | 'science' | 'language' | 'social-studies' | 'all';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  language: Language;
  createdAt: string;
}

export interface Student extends User {
  role: 'student';
  schoolName: string;
  grade: Grade;
  subject: Subject;
  section?: string;
}

export interface Teacher extends User {
  role: 'teacher';
  schoolName: string;
  subjects: Subject[];
  grades: Grade[];
}

export interface Admin extends User {
  role: 'admin';
}

export interface School {
  id: string;
  name: string;
  location: string;
  state: string;
  district: string;
}

export interface VideoLesson {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  subject: Subject;
  grade: Grade;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number; // in seconds
  topics: string[];
  uploadedBy: string; // teacher ID
  uploadedAt: string;
  views: number;
  language: Language;
}

export interface Quiz {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  subject: Subject;
  grade: Grade;
  lessonId?: string;
  questions: QuizQuestion[];
  duration: number; // in minutes
  passingScore: number;
  createdBy: string; // teacher ID
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: Record<Language, string>;
  options: Record<Language, string[]>;
  correctAnswer: number;
  explanation?: Record<Language, string>;
}

export interface StudentProgress {
  userId: string;
  lessonsCompleted: string[];
  lessonsWatched: { lessonId: string; watchTime: number; completedAt: string }[];
  quizzesCompleted: QuizResult[];
  totalScore: number;
  lastActive: string;
  streakDays: number;
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  attempts: number;
  timeTaken: number; // in seconds
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: 'lesson_start' | 'lesson_complete' | 'quiz_start' | 'quiz_complete' | 'login';
  data: any;
  timestamp: string;
}

export interface TeacherAnalytics {
  totalStudents: number;
  activeStudents: number;
  totalLessons: number;
  totalQuizzes: number;
  averageScore: number;
  averageProgress: number;
  studentPerformance: StudentPerformance[];
  subjectWiseData: SubjectData[];
  recentActivity: ActivityLog[];
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  grade: Grade;
  lessonsCompleted: number;
  quizzesCompleted: number;
  averageScore: number;
  lastActive: string;
  isActive: boolean;
}

export interface SubjectData {
  subject: Subject;
  studentsEnrolled: number;
  averageScore: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
}
