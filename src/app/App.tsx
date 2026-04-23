import { useState, useEffect } from 'react';
import { Student, Teacher, Admin } from '@/app/types';
import { RegistrationPage } from '@/app/components/RegistrationPage';
import { StudentDashboard } from '@/app/components/StudentDashboard';
import { EnhancedStudentDashboard } from '@/app/components/EnhancedStudentDashboard';
import { EnhancedTeacherDashboard } from '@/app/components/EnhancedTeacherDashboard';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { seedDatabase } from '@/app/data/seedData';
import { Toaster } from '@/app/components/ui/sonner';
import '@/app/utils/cleanupVideoUrls'; // Auto-cleanup invalid video URLs

export default function App() {
  const [currentUser, setCurrentUser] = useState<Student | Teacher | Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Suppress Recharts duplicate key warnings (known issue with the library)
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Encountered two children with the same key') ||
         args[0].includes('Function components cannot be given refs'))
      ) {
        // Suppress Recharts duplicate key warnings and Dialog ref warnings
        return;
      }
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Encountered two children with the same key') ||
         args[0].includes('Function components cannot be given refs'))
      ) {
        // Suppress Recharts duplicate key warnings and Dialog ref warnings
        return;
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Initialize database and check for existing user session on mount
  useEffect(() => {
    // Seed database with default data if not already seeded
    seedDatabase();
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleRegister = (user: Student | Teacher | Admin) => {
    // Save user to localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show registration if no user is logged in
  if (!currentUser) {
    return (
      <>
        <RegistrationPage onRegister={handleRegister} />
        <Toaster />
      </>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (currentUser.role) {
    case 'student':
      return (
        <>
          <EnhancedStudentDashboard user={currentUser as Student} onLogout={handleLogout} />
          <Toaster />
        </>
      );
    
    case 'teacher':
      return (
        <>
          <EnhancedTeacherDashboard user={currentUser as Teacher} onLogout={handleLogout} />
          <Toaster />
        </>
      );
    
    case 'admin':
      return (
        <>
          <AdminDashboard user={currentUser as Admin} onLogout={handleLogout} />
          <Toaster />
        </>
      );
    
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Invalid user role</h1>
            <button
              onClick={handleLogout}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      );
  }
}