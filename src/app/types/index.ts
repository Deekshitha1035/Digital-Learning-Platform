export type UserRole = 'student' | 'teacher';

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  language: Language;
  grade?: number; // For students
  classId?: string; // For students
}

export interface Student {
  id: string;
  name: string;
  grade: number;
  classId: string;
  language: Language;
  progress: StudentProgress;
}

export interface StudentProgress {
  lessonsCompleted: string[];
  quizzesCompleted: QuizResult[];
  totalScore: number;
  lastActive: string;
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  attempts: number;
}

export interface Lesson {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  subject: string;
  grade: number;
  content: LessonContent[];
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
}

export interface LessonContent {
  type: 'text' | 'image' | 'video' | 'interactive';
  content: Record<Language, string>;
  imageUrl?: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: Record<Language, string>;
  questions: Question[];
  passingScore: number;
}

export interface Question {
  id: string;
  question: Record<Language, string>;
  options: Record<Language, string[]>;
  correctAnswer: number; // index of correct option
  explanation: Record<Language, string>;
}

export interface Class {
  id: string;
  name: string;
  grade: number;
  teacherId: string;
  students: string[];
}
