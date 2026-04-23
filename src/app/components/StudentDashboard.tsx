import { useState, useEffect } from 'react';
import { User, Lesson, Quiz, StudentProgress } from '@/app/types';
import { getTranslation } from '@/app/utils/localization';
import { mockLessons, mockQuizzes } from '@/app/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { BookOpen, Trophy, Clock, CheckCircle2, PlayCircle, LogOut, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { LessonViewer } from './LessonViewer';
import { QuizViewer } from './QuizViewer';
import { syncService } from '@/app/utils/syncService';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

export function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState<StudentProgress>({
    lessonsCompleted: [],
    quizzesCompleted: [],
    totalScore: 0,
    lastActive: new Date().toISOString(),
  });

  const availableLessons = mockLessons.filter(lesson => lesson.grade === user.grade);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load progress from sync service on mount
  useEffect(() => {
    loadProgress();
  }, [user.id]);

  // Save progress whenever it changes
  useEffect(() => {
    if (progress.lessonsCompleted.length > 0 || progress.quizzesCompleted.length > 0) {
      saveProgress();
    }
  }, [progress]);

  const loadProgress = async () => {
    try {
      const data = await syncService.getProgress(user.id);
      if (data) {
        setProgress(data);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      await syncService.saveProgress(user.id, progress);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handleSync = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    try {
      await syncService.processSyncQueue();
      await loadProgress();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLessonComplete = async (lessonId: string) => {
    const newProgress = {
      ...progress,
      lessonsCompleted: [...new Set([...progress.lessonsCompleted, lessonId])],
      lastActive: new Date().toISOString(),
    };
    
    setProgress(newProgress);
    
    // Record activity
    await syncService.recordActivity(user.id, 'lesson_completed', { lessonId });
    
    setSelectedLesson(null);
  };

  const handleQuizComplete = async (quizId: string, score: number, totalQuestions: number) => {
    const existingQuiz = progress.quizzesCompleted.find(q => q.quizId === quizId);
    const attempts = existingQuiz ? existingQuiz.attempts + 1 : 1;
    
    const newProgress = {
      ...progress,
      quizzesCompleted: [
        ...progress.quizzesCompleted.filter(q => q.quizId !== quizId),
        {
          quizId,
          score,
          totalQuestions,
          completedAt: new Date().toISOString(),
          attempts,
        },
      ],
      totalScore: Math.round((score / totalQuestions) * 100),
      lastActive: new Date().toISOString(),
    };
    
    setProgress(newProgress);
    
    // Record activity
    await syncService.recordActivity(user.id, 'quiz_completed', { quizId, score, totalQuestions });
    
    setSelectedQuiz(null);
  };

  const isLessonCompleted = (lessonId: string) => progress.lessonsCompleted.includes(lessonId);
  const getQuizScore = (quizId: string) => progress.quizzesCompleted.find(q => q.quizId === quizId);

  const completionPercentage = availableLessons.length > 0
    ? Math.round((progress.lessonsCompleted.length / availableLessons.length) * 100)
    : 0;

  const pendingSyncCount = syncService.getPendingSyncCount();

  if (selectedLesson) {
    return (
      <LessonViewer
        lesson={selectedLesson}
        language={user.language}
        onComplete={() => handleLessonComplete(selectedLesson.id)}
        onBack={() => setSelectedLesson(null)}
      />
    );
  }

  if (selectedQuiz) {
    return (
      <QuizViewer
        quiz={selectedQuiz}
        language={user.language}
        onComplete={handleQuizComplete}
        onBack={() => setSelectedQuiz(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">
                {getTranslation('welcome', user.language)}, {user.name}!
              </h1>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                {getTranslation('grade', user.language)} {user.grade}
                {isOnline ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <Wifi className="size-3" />
                    Online
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-orange-600">
                    <WifiOff className="size-3" />
                    {getTranslation('offline', user.language)}
                  </span>
                )}
                {pendingSyncCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSync}
                    disabled={isSyncing || !isOnline}
                    className="h-6 px-2"
                  >
                    <RefreshCw className={`size-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                    {pendingSyncCount} pending
                  </Button>
                )}
              </p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="size-4 mr-2" />
              {getTranslation('logout', user.language)}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {getTranslation('lessons', user.language)} {getTranslation('completed', user.language)}
              </CardTitle>
              <BookOpen className="size-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress.lessonsCompleted.length}</div>
              <p className="text-xs text-gray-600">
                {getTranslation('progress', user.language)}: {completionPercentage}%
              </p>
              <Progress value={completionPercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {getTranslation('quizzes', user.language)} {getTranslation('completed', user.language)}
              </CardTitle>
              <Trophy className="size-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress.quizzesCompleted.length}</div>
              <p className="text-xs text-gray-600">
                Avg {getTranslation('score', user.language)}: {progress.totalScore}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {getTranslation('progress', user.language)}
              </CardTitle>
              <CheckCircle2 className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionPercentage}%</div>
              <p className="text-xs text-gray-600">Overall completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="lessons" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="lessons">
              {getTranslation('lessons', user.language)}
            </TabsTrigger>
            <TabsTrigger value="quizzes">
              {getTranslation('quizzes', user.language)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableLessons.map((lesson) => (
                <Card key={lesson.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">
                        {lesson.title[user.language]}
                      </CardTitle>
                      {isLessonCompleted(lesson.id) && (
                        <CheckCircle2 className="size-5 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {lesson.description[user.language]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="size-4" />
                        <span>{lesson.duration} min</span>
                      </div>
                      <Badge variant={lesson.difficulty === 'easy' ? 'default' : 'secondary'}>
                        {lesson.difficulty}
                      </Badge>
                    </div>
                    <Button 
                      onClick={() => setSelectedLesson(lesson)}
                      className="w-full"
                      variant={isLessonCompleted(lesson.id) ? 'outline' : 'default'}
                    >
                      <PlayCircle className="size-4 mr-2" />
                      {isLessonCompleted(lesson.id)
                        ? 'Review Lesson'
                        : getTranslation('startLesson', user.language)}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockQuizzes.map((quiz) => {
                const quizScore = getQuizScore(quiz.id);
                const relatedLesson = mockLessons.find(l => l.id === quiz.lessonId);
                
                return (
                  <Card key={quiz.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-2">
                        {quiz.title[user.language]}
                      </CardTitle>
                      <CardDescription>
                        {relatedLesson?.title[user.language]}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {quizScore && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Best Score:</span>
                            <span className="text-lg font-bold text-green-600">
                              {quizScore.score}/{quizScore.totalQuestions}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Attempts: {quizScore.attempts}
                          </p>
                        </div>
                      )}
                      <Button 
                        onClick={() => setSelectedQuiz(quiz)}
                        className="w-full"
                      >
                        <Trophy className="size-4 mr-2" />
                        {quizScore ? 'Retake Quiz' : getTranslation('takeQuiz', user.language)}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}</div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
