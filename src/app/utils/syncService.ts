import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-db5fc770`;

export interface SyncData {
  progress?: any;
  activity?: any;
  achievements?: any;
}

class SyncService {
  private syncQueue: Array<{ userId: string; data: SyncData }> = [];
  private isSyncing = false;
  private isOnline = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Connection restored - syncing data...');
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Connection lost - working offline');
    });

    // Try to sync on page load if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      // Silently fail when offline - this is expected behavior
      // Don't log anything as this clutters console when working offline
      if (!navigator.onLine) {
        return null;
      }
      // Only throw when explicitly online
      throw error;
    }
  }

  // ============= PROGRESS METHODS =============

  async getProgress(userId: string): Promise<any> {
    try {
      if (!this.isOnline) {
        return this.getLocalProgress(userId);
      }

      const data = await this.makeRequest(`/progress/${userId}`);
      
      // Save to localStorage as backup
      this.saveLocalProgress(userId, data);
      
      return data;
    } catch (error) {
      // Silently fall back to local data when offline (expected behavior)
      return this.getLocalProgress(userId);
    }
  }

  async saveProgress(userId: string, progress: any): Promise<void> {
    // Always save to localStorage first
    this.saveLocalProgress(userId, progress);

    // Try to save to server if online
    if (this.isOnline) {
      try {
        await this.makeRequest(`/progress/${userId}`, {
          method: 'POST',
          body: JSON.stringify(progress),
        });
        console.log('Progress synced to server');
      } catch (error) {
        // Silently queue for sync - expected when offline
        this.addToSyncQueue(userId, { progress });
      }
    } else {
      // Add to sync queue for later
      this.addToSyncQueue(userId, { progress });
    }
  }

  // ============= ACTIVITY METHODS =============

  async recordActivity(userId: string, type: string, data: any): Promise<void> {
    const activity = {
      date: new Date().toISOString(),
      type,
      data,
    };

    // Save locally
    this.saveLocalActivity(userId, activity);

    // Try to save to server if online
    if (this.isOnline) {
      try {
        await this.makeRequest(`/activity/${userId}`, {
          method: 'POST',
          body: JSON.stringify(activity),
        });
      } catch (error) {
        // Silently fail - expected when offline
      }
    }
  }

  async getActivity(userId: string): Promise<any> {
    try {
      if (!this.isOnline) {
        return this.getLocalActivity(userId);
      }

      const data = await this.makeRequest(`/activity/${userId}`);
      
      // Save to localStorage as backup
      localStorage.setItem(`activity-${userId}`, JSON.stringify(data));
      
      return data;
    } catch (error) {
      // Silently fall back to local data when offline (expected behavior)
      return this.getLocalActivity(userId);
    }
  }

  // ============= ACHIEVEMENTS METHODS =============

  async getAchievements(userId: string): Promise<any> {
    try {
      if (!this.isOnline) {
        return this.getLocalAchievements(userId);
      }

      const data = await this.makeRequest(`/achievements/${userId}`);
      
      // Save to localStorage as backup
      localStorage.setItem(`achievements-${userId}`, JSON.stringify(data));
      
      return data;
    } catch (error) {
      // Silently fall back to local data when offline (expected behavior)
      return this.getLocalAchievements(userId);
    }
  }

  async saveAchievements(userId: string, achievements: any): Promise<void> {
    // Always save to localStorage first
    localStorage.setItem(`achievements-${userId}`, JSON.stringify(achievements));

    // Try to save to server if online
    if (this.isOnline) {
      try {
        await this.makeRequest(`/achievements/${userId}`, {
          method: 'POST',
          body: JSON.stringify(achievements),
        });
      } catch (error) {
        console.error('Failed to sync achievements:', error);
        this.addToSyncQueue(userId, { achievements });
      }
    } else {
      this.addToSyncQueue(userId, { achievements });
    }
  }

  // ============= TEACHER METHODS =============

  async getStudents(teacherId: string): Promise<any[]> {
    try {
      if (!this.isOnline) {
        return this.getLocalStudents(teacherId);
      }

      const data = await this.makeRequest(`/teacher/${teacherId}/students`);
      
      // Save to localStorage as backup
      localStorage.setItem(`students-${teacherId}`, JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('Error fetching students from server, using local data:', error);
      return this.getLocalStudents(teacherId);
    }
  }

  async getAnalytics(teacherId: string): Promise<any> {
    try {
      if (!this.isOnline) {
        return this.getLocalAnalytics(teacherId);
      }

      const data = await this.makeRequest(`/teacher/${teacherId}/analytics`);
      
      // Save to localStorage as backup
      localStorage.setItem(`analytics-${teacherId}`, JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('Error fetching analytics from server, using local data:', error);
      return this.getLocalAnalytics(teacherId);
    }
  }

  // ============= SYNC QUEUE METHODS =============

  private addToSyncQueue(userId: string, data: SyncData): void {
    // Check if user already in queue
    const existingIndex = this.syncQueue.findIndex(item => item.userId === userId);
    
    if (existingIndex >= 0) {
      // Merge with existing queue item
      this.syncQueue[existingIndex].data = {
        ...this.syncQueue[existingIndex].data,
        ...data,
      };
    } else {
      this.syncQueue.push({ userId, data });
    }

    // Save queue to localStorage
    localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
  }

  async processSyncQueue(): Promise<void> {
    if (this.isSyncing || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;

    // Load queue from localStorage if empty
    if (this.syncQueue.length === 0) {
      const saved = localStorage.getItem('syncQueue');
      if (saved) {
        this.syncQueue = JSON.parse(saved);
      }
    }

    console.log(`Processing sync queue: ${this.syncQueue.length} items`);

    while (this.syncQueue.length > 0 && this.isOnline) {
      const item = this.syncQueue[0];
      
      try {
        await this.syncData(item.userId, item.data);
        
        // Remove from queue on success
        this.syncQueue.shift();
        localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
        
        // Silently log success (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.log(`Successfully synced data for user ${item.userId}`);
        }
      } catch (error) {
        // Silently fail - this is expected when offline
        // The data remains in queue and will sync when connection is restored
        break;
      }
    }

    this.isSyncing = false;
  }

  private async syncData(userId: string, data: SyncData): Promise<void> {
    await this.makeRequest('/sync', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        ...data,
      }),
    });
  }

  // ============= LOCAL STORAGE HELPERS =============

  private getLocalProgress(userId: string): any {
    const saved = localStorage.getItem(`progress-${userId}`);
    return saved ? JSON.parse(saved) : {
      lessonsCompleted: [],
      quizzesCompleted: [],
      totalScore: 0,
      lastActive: new Date().toISOString(),
    };
  }

  private saveLocalProgress(userId: string, progress: any): void {
    localStorage.setItem(`progress-${userId}`, JSON.stringify(progress));
  }

  private getLocalActivity(userId: string): any {
    const saved = localStorage.getItem(`activity-${userId}`);
    return saved ? JSON.parse(saved) : { dates: [], activities: [] };
  }

  private saveLocalActivity(userId: string, activity: any): void {
    const existing = this.getLocalActivity(userId);
    
    const dateStr = new Date(activity.date).toISOString().split('T')[0];
    if (!existing.dates.includes(dateStr)) {
      existing.dates.push(dateStr);
    }
    
    existing.activities.push(activity);
    
    // Keep only last 100 activities
    if (existing.activities.length > 100) {
      existing.activities = existing.activities.slice(-100);
    }
    
    localStorage.setItem(`activity-${userId}`, JSON.stringify(existing));
  }

  private getLocalAchievements(userId: string): any {
    const saved = localStorage.getItem(`achievements-${userId}`);
    return saved ? JSON.parse(saved) : { unlocked: [], progress: {} };
  }

  private getLocalStudents(teacherId: string): any[] {
    const saved = localStorage.getItem(`students-${teacherId}`);
    return saved ? JSON.parse(saved) : [];
  }

  private getLocalAnalytics(teacherId: string): any {
    const saved = localStorage.getItem(`analytics-${teacherId}`);
    
    // If no saved analytics, generate mock data immediately
    if (!saved) {
      // Create basic mock analytics structure
      return {
        totalStudents: 0,
        activeStudents: 0,
        totalLessons: 0,
        totalQuizzes: 0,
        averageScore: 0,
        averageProgress: 0,
        studentPerformance: [],
        subjectWiseData: [],
        recentActivity: [],
      };
    }
    
    return JSON.parse(saved);
  }

  // ============= PUBLIC UTILITIES =============

  // ============= USER REGISTRATION/LOGIN =============

  async registerUser(userData: any): Promise<void> {
    const key = `user-${userData.id}`;
    localStorage.setItem(key, JSON.stringify(userData));

    if (this.isOnline) {
      try {
        await this.makeRequest('/register', {
          method: 'POST',
          body: JSON.stringify(userData),
        });
        console.log('✅ User registered on server');
      } catch (error) {
        // Silently fail - user is already registered locally
        console.log('ℹ️ User registered locally (working offline)');
      }
    } else {
      console.log('ℹ️ User registered locally (offline mode)');
    }
  }

  async loginUser(email: string, role: string): Promise<any> {
    if (this.isOnline) {
      try {
        const user = await this.makeRequest('/login', {
          method: 'POST',
          body: JSON.stringify({ email, role }),
        });
        
        // Cache locally
        localStorage.setItem(`user-${user.id}`, JSON.stringify(user));
        
        return user;
      } catch (error) {
        console.error('Server login failed, checking local storage:', error);
      }
    }

    // Fallback to local storage
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('user-')) {
        const user = JSON.parse(localStorage.getItem(key) || '{}');
        if (user.email === email && user.role === role) {
          return user;
        }
      }
    }

    return null;
  }

  // ============= VIDEO LESSON METHODS =============

  async uploadLesson(lesson: any): Promise<void> {
    // Save locally first
    localStorage.setItem(`lesson-${lesson.id}`, JSON.stringify(lesson));

    if (this.isOnline) {
      try {
        await this.makeRequest('/lessons', {
          method: 'POST',
          body: JSON.stringify(lesson),
        });
        console.log('Lesson uploaded to server');
      } catch (error) {
        console.error('Failed to upload lesson:', error);
      }
    }
  }

  // ============= QUIZ METHODS =============

  async uploadQuiz(quiz: any): Promise<void> {
    // Save locally first
    localStorage.setItem(`quiz-${quiz.id}`, JSON.stringify(quiz));

    // Also add to quizzes list
    const quizzesList = JSON.parse(localStorage.getItem('quizzes-list') || '[]');
    if (!quizzesList.includes(quiz.id)) {
      quizzesList.push(quiz.id);
      localStorage.setItem('quizzes-list', JSON.stringify(quizzesList));
    }

    if (this.isOnline) {
      try {
        await this.makeRequest('/quizzes', {
          method: 'POST',
          body: JSON.stringify(quiz),
        });
        console.log('Quiz uploaded to server');
      } catch (error) {
        console.error('Failed to upload quiz:', error);
      }
    }
  }

  async getQuizzes(grade: string, subject: string): Promise<any[]> {
    try {
      if (!this.isOnline) {
        return this.getLocalQuizzes(grade, subject);
      }

      const data = await this.makeRequest(`/quizzes/${grade}/${subject}`);
      
      // Cache quizzes locally
      data.forEach((quiz: any) => {
        localStorage.setItem(`quiz-${quiz.id}`, JSON.stringify(quiz));
      });
      
      return data;
    } catch (error) {
      // Fall back to local quizzes
      return this.getLocalQuizzes(grade, subject);
    }
  }

  private getLocalQuizzes(grade: string, subject: string): any[] {
    const quizzes = [];
    const keys = Object.keys(localStorage);

    for (const key of keys) {
      if (key.startsWith('quiz-')) {
        try {
          const quiz = JSON.parse(localStorage.getItem(key) || '{}');
          // Validate quiz has required fields
          if (quiz.id && quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0) {
            if (quiz.grade === grade && quiz.subject === subject) {
              quizzes.push(quiz);
            }
          }
        } catch (e) {
          // Skip invalid quiz data
          console.warn('Invalid quiz data for key:', key);
        }
      }
    }

    return quizzes;
  }

  async getAllQuizzes(): Promise<any[]> {
    const quizzes = [];
    const keys = Object.keys(localStorage);

    for (const key of keys) {
      if (key.startsWith('quiz-')) {
        try {
          const quiz = JSON.parse(localStorage.getItem(key) || '{}');
          // Validate quiz has required fields
          if (quiz.id && quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0) {
            quizzes.push(quiz);
          }
        } catch (e) {
          // Skip invalid quiz data
          console.warn('Invalid quiz data for key:', key);
        }
      }
    }

    return quizzes;
  }

  async getLessons(grade: string, subject: string): Promise<any[]> {
    try {
      if (!this.isOnline) {
        return this.getLocalLessons(grade, subject);
      }

      const data = await this.makeRequest(`/lessons/${grade}/${subject}`);
      
      // Cache lessons locally
      data.forEach((lesson: any) => {
        localStorage.setItem(`lesson-${lesson.id}`, JSON.stringify(lesson));
      });
      
      return data;
    } catch (error) {
      // Silently fall back to local lessons when offline (expected behavior)
      return this.getLocalLessons(grade, subject);
    }
  }

  private getLocalLessons(grade: string, subject: string): any[] {
    const lessons = [];
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      if (key.startsWith('lesson-')) {
        const lesson = JSON.parse(localStorage.getItem(key) || '{}');
        if (lesson.grade === grade && lesson.subject === subject) {
          lessons.push(lesson);
        }
      }
    }
    
    // If no lessons found, initialize with comprehensive mock data
    if (lessons.length === 0) {
      // Import comprehensive mock lessons
      import('../data/comprehensiveMockLessons').then(({ initializeAllMockLessons, getLessonsByGradeAndSubject }) => {
        initializeAllMockLessons();
      });
      
      // Return inline mock lessons for immediate use
      const allMockLessons = this.getAllInlineMockLessons();
      return allMockLessons.filter(l => l.grade === grade && l.subject === subject);
    }
    
    return lessons;
  }

  private getAllInlineMockLessons(): any[] {
    const mockLessons: any[] = [];
    const subjects = ['mathematics', 'science', 'language', 'social-studies'];
    const SAMPLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    const SAMPLE_THUMB = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400';

    // Generate lessons for all classes (1-10) and all subjects
    for (let grade = 1; grade <= 10; grade++) {
      subjects.forEach(subject => {
        mockLessons.push({
          id: `${subject}-${grade}-001`,
          title: {
            en: `${subject.charAt(0).toUpperCase() + subject.slice(1)} Class ${grade}`,
            hi: `${subject} कक्षा ${grade}`,
            ta: `${subject} வகுப்பு ${grade}`,
            te: `${subject} తరగతి ${grade}`,
            bn: `${subject} শ্রেণী ${grade}`,
          },
          description: {
            en: `Learn ${subject} concepts for Class ${grade}`,
            hi: `कक्षा ${grade} के लिए ${subject} अवधारणाएँ सीखें`,
            ta: `வகுப்பு ${grade} க்கான ${subject} கருத்துகளை கற்றுக்கொள்ளுங்கள்`,
            te: `తరగతి ${grade} కోసం ${subject} భావనలను నేర్చుకోండి`,
            bn: `শ্রেণী ${grade} এর জন্য ${subject} ধারণা শিখুন`,
          },
          subject,
          grade: grade.toString(),
          videoUrl: SAMPLE_VIDEO,
          thumbnailUrl: SAMPLE_THUMB,
          duration: 480,
          topics: ['Chapter 1', 'Basics', 'Fundamentals'],
          uploadedBy: 'teacher-1',
          uploadedAt: '2024-02-01T10:00:00Z',
          views: Math.floor(Math.random() * 150) + 50,
          language: 'en',
        });
      });
    }

    return mockLessons;
  }

  private getMockLessons(): any[] {
    // Keep existing method for backwards compatibility
    return this.getAllInlineMockLessons();
  }

  // ============= TEACHER ANALYTICS METHODS =============

  async getTeacherAnalytics(teacherId: string): Promise<any> {
    try {
      if (!this.isOnline) {
        return this.getLocalAnalytics(teacherId);
      }

      const data = await this.makeRequest(`/teacher/${teacherId}/analytics`);
      
      // Cache analytics
      localStorage.setItem(`analytics-${teacherId}`, JSON.stringify(data));
      
      return data;
    } catch (error) {
      // Silently fall back to local analytics (expected when offline)
      return this.getLocalAnalytics(teacherId);
    }
  }

  // ============= ADMIN METHODS =============

  async getSystemStats(): Promise<any> {
    try {
      if (!this.isOnline) {
        return this.getLocalSystemStats();
      }

      const data = await this.makeRequest('/admin/stats');
      
      // Cache stats
      localStorage.setItem('system-stats', JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return this.getLocalSystemStats();
    }
  }

  private getLocalSystemStats(): any {
    const saved = localStorage.getItem('system-stats');
    return saved ? JSON.parse(saved) : {
      totalStudents: 0,
      totalTeachers: 0,
      totalSchools: 0,
      totalLessons: 0,
      activeUsers: 0,
      systemHealth: 100,
    };
  }

  // ============= PUBLIC UTILITIES =============

  isConnectionOnline(): boolean {
    return this.isOnline;
  }

  getPendingSyncCount(): number {
    return this.syncQueue.length;
  }
}

// Export singleton instance
export const syncService = new SyncService();