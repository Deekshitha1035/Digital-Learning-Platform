import { useState, useEffect } from 'react';
import { Student, VideoLesson, Quiz, StudentProgress, Language } from '@/app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { BookOpen, Trophy, CheckCircle2, PlayCircle, LogOut, Wifi, WifiOff, RefreshCw, Video, Clock, Eye } from 'lucide-react';
import { VideoLessonViewer } from './VideoLessonViewer';
import { QuizViewer } from './QuizViewer';
import { syncService } from '@/app/utils/syncService';
import { getTranslation } from '@/app/utils/localization';
import { mockVideoLessons } from '@/app/data/mockVideoLessons';

interface EnhancedStudentDashboardProps {
  user: Student;
  onLogout: () => void;
}

export function EnhancedStudentDashboard({ user, onLogout }: EnhancedStudentDashboardProps) {
  const [selectedLesson, setSelectedLesson] = useState<VideoLesson | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [videoLessons, setVideoLessons] = useState<VideoLesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progress, setProgress] = useState<StudentProgress>({
    userId: user.id,
    lessonsCompleted: [],
    lessonsWatched: [],
    quizzesCompleted: [],
    totalScore: 0,
    lastActive: new Date().toISOString(),
    streakDays: 0,
  });

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

  // Load progress and lessons on mount
  useEffect(() => {
    loadProgress();
    loadLessons();
    loadQuizzes();
  }, [user.id, user.grade, user.subject]);

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
        // Ensure all required fields exist with defaults
        setProgress({
          userId: data.userId || user.id,
          lessonsCompleted: data.lessonsCompleted || [],
          lessonsWatched: data.lessonsWatched || [],
          quizzesCompleted: data.quizzesCompleted || [],
          totalScore: data.totalScore || 0,
          lastActive: data.lastActive || new Date().toISOString(),
          streakDays: data.streakDays || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const loadLessons = async () => {
    try {
      const lessons = await syncService.getLessons(user.grade, user.subject);
      setVideoLessons(lessons);
    } catch (error) {
      console.error('Failed to load lessons:', error);
    }
  };

  const loadQuizzes = async () => {
    try {
      const loadedQuizzes = await syncService.getQuizzes(user.grade, user.subject);
      // Filter out invalid quizzes
      const validQuizzes = loadedQuizzes.filter(q =>
        q.id && q.questions && Array.isArray(q.questions) && q.questions.length > 0
      );
      setQuizzes(validQuizzes);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
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
      await loadLessons();
      await loadQuizzes();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLessonComplete = async () => {
    if (!selectedLesson) return;

    // Ensure progress has all required fields with safe defaults
    const currentProgress = {
      ...progress,
      lessonsCompleted: progress.lessonsCompleted || [],
      lessonsWatched: progress.lessonsWatched || [],
      quizzesCompleted: progress.quizzesCompleted || [],
    };

    const newProgress = {
      ...currentProgress,
      lessonsCompleted: [...new Set([...currentProgress.lessonsCompleted, selectedLesson.id])],
      lessonsWatched: [
        ...(currentProgress.lessonsWatched || []).filter(l => l.lessonId !== selectedLesson.id),
        {
          lessonId: selectedLesson.id,
          watchTime: selectedLesson.duration,
          completedAt: new Date().toISOString(),
        },
      ],
      lastActive: new Date().toISOString(),
    };
    
    setProgress(newProgress);
    
    // Record activity
    await syncService.recordActivity(user.id, 'lesson_complete', { lessonId: selectedLesson.id });
    
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
          timeTaken: 0,
        },
      ],
      totalScore: Math.round((score / totalQuestions) * 100),
      lastActive: new Date().toISOString(),
    };
    
    setProgress(newProgress);
    
    // Record activity
    await syncService.recordActivity(user.id, 'quiz_complete', { quizId, score, totalQuestions });
    
    setSelectedQuiz(null);
  };

  const isLessonCompleted = (lessonId: string) => progress.lessonsCompleted.includes(lessonId);
  const getQuizScore = (quizId: string) => progress.quizzesCompleted.find(q => q.quizId === quizId);

  const completionPercentage = videoLessons.length > 0
    ? Math.round((progress.lessonsCompleted.length / videoLessons.length) * 100)
    : 0;

  const pendingSyncCount = syncService.getPendingSyncCount();

  if (selectedLesson) {
    return (
      <VideoLessonViewer
        lesson={selectedLesson}
        language={user.language}
        onComplete={handleLessonComplete}
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
                {getTranslation('grade', user.language)} {user.grade} • {user.subject}
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
              <Video className="size-4 mr-2" />
              {getTranslation('lessons', user.language)}
            </TabsTrigger>
            <TabsTrigger value="quizzes">
              <Trophy className="size-4 mr-2" />
              {getTranslation('quizzes', user.language)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-4 mt-6">
            {videoLessons.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <Video className="size-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No lessons available yet</h3>
                  <p className="text-gray-600">
                    Your teacher will upload video lessons soon. {!isOnline && 'Connect to internet to sync.'}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videoLessons.map((lesson) => (
                  <Card key={lesson.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-video bg-gray-900">
                      {lesson.thumbnailUrl ? (
                        <img src={lesson.thumbnailUrl} alt={lesson.title[user.language]} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="size-12 text-gray-600" />
                        </div>
                      )}
                      {isLessonCompleted(lesson.id) && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-600">
                            <CheckCircle2 className="size-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {Math.round(lesson.duration / 60)} min
                      </div>
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-2">
                        {lesson.title[user.language]}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {lesson.description[user.language]}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {lesson.topics.slice(0, 3).map((topic, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye className="size-3" />
                          <span>{lesson.views} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="size-3" />
                          <span>{Math.round(lesson.duration / 60)} min</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => setSelectedLesson(lesson)}
                        className="w-full"
                        variant={isLessonCompleted(lesson.id) ? 'outline' : 'default'}
                      >
                        <PlayCircle className="size-4 mr-2" />
                        {isLessonCompleted(lesson.id)
                          ? 'Watch Again'
                          : getTranslation('startLesson', user.language)}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4 mt-6">
            {quizzes.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <Trophy className="size-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No quizzes available yet</h3>
                  <p className="text-gray-600">
                    Your teacher will upload quizzes soon. {!isOnline && 'Connect to internet to sync.'}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map((quiz) => {
                  const quizScore = getQuizScore(quiz.id);

                  return (
                    <Card key={quiz.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg line-clamp-2">
                          {quiz.title?.[user.language] || quiz.title?.en || 'Quiz'}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {quiz.questions?.length || 0} questions • {quiz.duration || 30} minutes
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
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}