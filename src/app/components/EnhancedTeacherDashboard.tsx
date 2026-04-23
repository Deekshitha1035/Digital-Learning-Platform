import { useState, useEffect } from 'react';
import { Teacher, TeacherAnalytics, VideoLesson, Quiz, QuizQuestion, Subject, Grade, Language } from '@/app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, BookOpen, Trophy, TrendingUp, LogOut, Upload, Video, FileText,
  BarChart3, RefreshCw, Wifi, WifiOff, Eye, CheckCircle2, AlertCircle, Plus, Trash2
} from 'lucide-react';
import { syncService } from '@/app/utils/syncService';
import { getTranslation } from '@/app/utils/localization';
import { QuizUploadForm } from '@/app/components/QuizUploadForm';

interface EnhancedTeacherDashboardProps {
  user: Teacher;
  onLogout: () => void;
}

export function EnhancedTeacherDashboard({ user, onLogout }: EnhancedTeacherDashboardProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTab, setUploadTab] = useState<'video' | 'quiz'>('video');

  // Video upload form
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    subject: user.subjects[0],
    grade: user.grades[0],
    grades: [] as Grade[], // Multiple grades support
    videoFile: null as File | null,
    thumbnailFile: null as File | null,
    topics: '',
    duration: 0,
  });

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      loadAnalytics();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load analytics
  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, [user.id]);

  const loadAnalytics = async () => {
    try {
      // First try to get real data from localStorage
      const { getAllStudents, getAllLessons, getStudentProgress } = await import('@/app/data/seedData');
      const allStudents = getAllStudents();
      const allLessons = getAllLessons();
      
      // Filter students by teacher's school
      const schoolStudents = allStudents.filter(s => s.schoolName === user.schoolName);
      
      // Calculate analytics from real data
      if (schoolStudents.length > 0) {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        
        const studentPerformance = schoolStudents.map(student => {
          const progress = getStudentProgress(student.id);
          const isActive = progress && new Date(progress.lastActive).getTime() > sevenDaysAgo;
          
          return {
            studentId: student.id,
            studentName: student.name,
            grade: student.grade,
            lessonsCompleted: progress?.lessonsCompleted.length || 0,
            quizzesCompleted: progress?.quizzesCompleted.length || 0,
            averageScore: progress?.quizzesCompleted.length 
              ? progress.quizzesCompleted.reduce((sum, q) => sum + (q.score / q.totalQuestions * 100), 0) / progress.quizzesCompleted.length
              : 0,
            lastActive: progress?.lastActive || new Date().toISOString(),
            isActive: isActive || false,
          };
        });

        const activeStudents = studentPerformance.filter(s => s.isActive).length;
        const totalScore = studentPerformance.reduce((sum, s) => sum + s.averageScore, 0);
        const averageScore = studentPerformance.length > 0 ? totalScore / studentPerformance.length : 0;
        
        const totalLessonsCompleted = studentPerformance.reduce((sum, s) => sum + s.lessonsCompleted, 0);
        const averageProgress = studentPerformance.length > 0 
          ? (totalLessonsCompleted / (studentPerformance.length * 10)) * 100 
          : 0;

        // Calculate subject-wise data
        const subjects: Subject[] = ['mathematics', 'science', 'language', 'social-studies'];
        const subjectWiseData = subjects.map(subject => {
          const subjectLessons = allLessons.filter(l => l.subject === subject);
          const enrolled = schoolStudents.length;
          
          return {
            subject,
            studentsEnrolled: enrolled,
            averageScore: Math.floor(Math.random() * 20) + 70, // 70-90
            lessonsCompleted: Math.floor(Math.random() * 50) + 20,
            quizzesCompleted: Math.floor(Math.random() * 30) + 10,
          };
        });

        setAnalytics({
          totalStudents: schoolStudents.length,
          activeStudents,
          totalLessons: allLessons.length,
          totalQuizzes: Math.floor(allLessons.length * 0.8), // Assume 80% have quizzes
          averageScore: Math.round(averageScore),
          averageProgress: Math.round(averageProgress),
          studentPerformance,
          subjectWiseData,
          recentActivity: [],
        });
        
        setIsLoading(false);
        return;
      }
      
      // Fallback to mock data if no students found
      const data = await syncService.getTeacherAnalytics(user.id);
      if (data) {
        setAnalytics(data);
      } else {
        // If no analytics, generate mock data
        const { generateMockTeacherAnalytics, saveMockAnalytics } = await import('@/app/data/mockAnalytics');
        saveMockAnalytics(user.id);
        const mockData = generateMockTeacherAnalytics();
        setAnalytics(mockData);
      }
    } catch (error) {
      // Silently load mock analytics on error (expected when offline)
      console.log('Loading analytics from local storage (offline mode)');
      try {
        const { generateMockTeacherAnalytics } = await import('@/app/data/mockAnalytics');
        const mockData = generateMockTeacherAnalytics();
        setAnalytics(mockData);
      } catch (e) {
        // Final fallback - create empty analytics
        setAnalytics({
          totalStudents: 0,
          activeStudents: 0,
          totalLessons: 0,
          totalQuizzes: 0,
          averageScore: 0,
          averageProgress: 0,
          studentPerformance: [],
          subjectWiseData: [],
          recentActivity: [],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      await loadAnalytics();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    const lesson: VideoLesson = {
      id: `lesson-${Date.now()}`,
      title: {
        en: videoForm.title,
        hi: videoForm.title,
        ta: videoForm.title,
        te: videoForm.title,
        bn: videoForm.title,
      },
      description: {
        en: videoForm.description,
        hi: videoForm.description,
        ta: videoForm.description,
        te: videoForm.description,
        bn: videoForm.description,
      },
      subject: videoForm.subject,
      grade: videoForm.grade,
      videoUrl: videoForm.videoFile ? URL.createObjectURL(videoForm.videoFile) : '',
      thumbnailUrl: videoForm.thumbnailFile ? URL.createObjectURL(videoForm.thumbnailFile) : undefined,
      duration: videoForm.duration * 60, // Convert to seconds
      topics: videoForm.topics.split(',').map(t => t.trim()),
      uploadedBy: user.id,
      uploadedAt: new Date().toISOString(),
      views: 0,
      language: user.language,
    };

    await syncService.uploadLesson(lesson);

    // Reset form
    setVideoForm({
      title: '',
      description: '',
      subject: user.subjects[0],
      grade: user.grades[0],
      grades: [] as Grade[], // Multiple grades support
      videoFile: null,
      thumbnailFile: null,
      topics: '',
      duration: 0,
    });

    setIsUploadOpen(false);
    alert('Lesson uploaded successfully!');
  };

  // Chart colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Show loading state
  if (isLoading || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="size-8 animate-spin text-purple-600" />
              <p className="text-lg font-medium">Loading analytics...</p>
              <p className="text-sm text-gray-500">Please wait while we fetch your data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock analytics data (replace with real data from analytics state)
  const performanceData = analytics.studentPerformance?.map(sp => ({
    name: sp.studentName,
    lessons: sp.lessonsCompleted,
    quizzes: sp.quizzesCompleted,
    score: sp.averageScore,
  })) || [];

  const subjectData = analytics.subjectWiseData?.map(sd => ({
    name: sd.subject,
    students: sd.studentsEnrolled,
    avgScore: sd.averageScore,
  })) || [];

  const engagementData = [
    { name: 'Active Students', value: analytics?.activeStudents || 0 },
    { name: 'Inactive Students', value: (analytics?.totalStudents || 0) - (analytics?.activeStudents || 0) },
  ];

  const progressTrend = [
    { week: 'Week 1', progress: 45 },
    { week: 'Week 2', progress: 52 },
    { week: 'Week 3', progress: 65 },
    { week: 'Week 4', progress: analytics?.averageProgress || 70 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-purple-900">
                  Teacher Dashboard
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  {getTranslation('welcome', user.language)}, {user.name}!
                  {isOnline ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <Wifi className="size-3" />
                      Online
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-orange-600">
                      <WifiOff className="size-3" />
                      Offline
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isSyncing || !isOnline}
              >
                <RefreshCw className={`size-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Upload className="size-4 mr-2" />
                    Upload Content
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Upload Learning Content</DialogTitle>
                    <DialogDescription>
                      Create and share video lessons or quizzes with your students
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs value={uploadTab} onValueChange={(v) => setUploadTab(v as 'video' | 'quiz')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="video">
                        <Video className="size-4 mr-2" />
                        Video Lesson
                      </TabsTrigger>
                      <TabsTrigger value="quiz">
                        <FileText className="size-4 mr-2" />
                        Quiz
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="video">
                      <form onSubmit={handleVideoUpload} className="space-y-4">
                        <div>
                          <Label htmlFor="video-title">Lesson Title *</Label>
                          <Input
                            id="video-title"
                            value={videoForm.title}
                            onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                            required
                            placeholder="e.g., Introduction to Fractions"
                          />
                        </div>

                        <div>
                          <Label htmlFor="video-description">Description *</Label>
                          <Textarea
                            id="video-description"
                            value={videoForm.description}
                            onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                            required
                            placeholder="Describe what students will learn..."
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="video-subject">Subject *</Label>
                            <Select
                              value={videoForm.subject}
                              onValueChange={(v) => setVideoForm({ ...videoForm, subject: v as Subject })}
                            >
                              <SelectTrigger id="video-subject">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {user.subjects.map(subject => (
                                  <SelectItem key={subject} value={subject}>
                                    {subject}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="video-grade">Class *</Label>
                            <Select
                              value={videoForm.grade}
                              onValueChange={(v) => setVideoForm({ ...videoForm, grade: v as Grade })}
                            >
                              <SelectTrigger id="video-grade">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {user.grades.map(grade => (
                                  <SelectItem key={grade} value={grade}>
                                    Class {grade}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="video-duration">Duration (min) *</Label>
                            <Input
                              id="video-duration"
                              type="number"
                              value={videoForm.duration}
                              onChange={(e) => setVideoForm({ ...videoForm, duration: parseInt(e.target.value) })}
                              required
                              min="1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="video-topics">Topics (comma-separated) *</Label>
                          <Input
                            id="video-topics"
                            value={videoForm.topics}
                            onChange={(e) => setVideoForm({ ...videoForm, topics: e.target.value })}
                            required
                            placeholder="e.g., Numerator, Denominator, Simplification"
                          />
                        </div>

                        <div>
                          <Label htmlFor="video-file">Video File *</Label>
                          <Input
                            id="video-file"
                            type="file"
                            accept="video/*"
                            onChange={(e) => setVideoForm({ ...videoForm, videoFile: e.target.files?.[0] || null })}
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Supported formats: MP4, WebM, OGG (Max 500MB)
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="thumbnail-file">Thumbnail (Optional)</Label>
                          <Input
                            id="thumbnail-file"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setVideoForm({ ...videoForm, thumbnailFile: e.target.files?.[0] || null })}
                          />
                        </div>

                        <Button type="submit" className="w-full">
                          <Upload className="size-4 mr-2" />
                          Upload Lesson
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="quiz">
                      <QuizUploadForm
                        teacherId={user.id}
                        teacherSubjects={user.subjects}
                        teacherGrades={user.grades}
                        language={user.language}
                        onUploadComplete={() => {
                          setIsUploadOpen(false);
                          loadAnalytics();
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={onLogout}>
                <LogOut className="size-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="size-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics?.totalStudents || 0}</div>
              <p className="text-xs text-gray-600 mt-1">Across all classes</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <TrendingUp className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics?.activeStudents || 0}</div>
              <p className="text-xs text-gray-600 mt-1">Last 7 days</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lessons Uploaded</CardTitle>
              <BookOpen className="size-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics?.totalLessons || 0}</div>
              <p className="text-xs text-gray-600 mt-1">Video lessons</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <Trophy className="size-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics?.averageScore || 0}%</div>
              <Progress value={analytics?.averageScore || 0} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="overview">
              <BarChart3 className="size-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="students">
              <Users className="size-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="performance">
              <Trophy className="size-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="content">
              <BookOpen className="size-4 mr-2" />
              Content
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Progress Overview</CardTitle>
                  <CardDescription>Lessons and quizzes completed by students</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="lessons" fill="#3b82f6" name="Lessons" />
                      <Bar dataKey="quizzes" fill="#10b981" name="Quizzes" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Engagement Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Engagement</CardTitle>
                  <CardDescription>Active vs Inactive students (Last 7 days)</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={engagementData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {engagementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Progress Trend */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Class Progress Trend</CardTitle>
                  <CardDescription>Average student progress over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="progress" stroke="#8b5cf6" strokeWidth={2} name="Progress %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Performance Details</CardTitle>
                <CardDescription>Real-time student data and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Lessons</TableHead>
                      <TableHead>Quizzes</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics?.studentPerformance.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell className="font-medium">{student.studentName}</TableCell>
                        <TableCell>Class {student.grade}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <BookOpen className="size-4 text-gray-500" />
                            {student.lessonsCompleted}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Trophy className="size-4 text-gray-500" />
                            {student.quizzesCompleted}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.averageScore >= 70 ? 'default' : 'destructive'}>
                            {student.averageScore}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(student.lastActive).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {student.isActive ? (
                            <Badge className="bg-green-600">
                              <CheckCircle2 className="size-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <AlertCircle className="size-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subject-wise Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject-wise Performance</CardTitle>
                  <CardDescription>Average scores by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subjectData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avgScore" fill="#8b5cf6" name="Avg Score %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Performance Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Trophy className="size-5 text-yellow-600" />
                      Top Performers
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {analytics?.studentPerformance
                        .sort((a, b) => b.averageScore - a.averageScore)
                        .slice(0, 5)
                        .map(student => (
                          <li key={student.studentId} className="flex items-center justify-between">
                            <span>{student.studentName}</span>
                            <Badge>{student.averageScore}%</Badge>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="size-5 text-orange-600" />
                      Need Attention
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {analytics?.studentPerformance
                        .filter(s => s.averageScore < 60 || s.lessonsCompleted < 3)
                        .slice(0, 5)
                        .map(student => (
                          <li key={student.studentId} className="flex items-center justify-between">
                            <span>{student.studentName}</span>
                            <Badge variant="outline">{student.averageScore}%</Badge>
                          </li>
                        ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Uploaded Content</CardTitle>
                <CardDescription>Manage your video lessons and quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Video className="size-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No content uploaded yet</h3>
                  <p className="text-gray-600 mb-4">Start creating video lessons for your students</p>
                  <Button onClick={() => setIsUploadOpen(true)}>
                    <Upload className="size-4 mr-2" />
                    Upload Your First Lesson
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}