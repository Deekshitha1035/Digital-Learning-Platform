import { useState, useEffect } from 'react';
import { User } from '@/app/types';
import { getTranslation } from '@/app/utils/localization';
import { mockStudents, mockClasses, mockLessons } from '@/app/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, Trophy, TrendingUp, LogOut, GraduationCap, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { syncService } from '@/app/utils/syncService';

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
}

export function TeacherDashboard({ user, onLogout }: TeacherDashboardProps) {
  const [selectedClass, setSelectedClass] = useState(mockClasses[0]?.id);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [students, setStudents] = useState(mockStudents);

  const teacherClasses = mockClasses.filter(c => c.teacherId === 'teacher-1');
  const currentClass = teacherClasses.find(c => c.id === selectedClass);
  const classStudents = students.filter(s => s.classId === selectedClass);

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

  // Load analytics on mount
  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [user.id]);

  const loadAnalytics = async () => {
    try {
      const data = await syncService.getAnalytics(user.id);
      if (data) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
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

  // Analytics Data
  const totalStudents = mockStudents.length;
  const activeStudents = mockStudents.filter(s => {
    const lastActive = new Date(s.progress.lastActive);
    const daysDiff = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  }).length;

  const averageProgress = classStudents.length > 0
    ? Math.round(
        classStudents.reduce((sum, s) => {
          const completionRate = (s.progress.lessonsCompleted.length / mockLessons.filter(l => l.grade === s.grade).length) * 100;
          return sum + completionRate;
        }, 0) / classStudents.length
      )
    : 0;

  const averageScore = classStudents.length > 0
    ? Math.round(
        classStudents.reduce((sum, s) => sum + s.progress.totalScore, 0) / classStudents.length
      )
    : 0;

  // Chart Data
  const studentProgressData = classStudents.map(student => ({
    name: student.name,
    lessons: student.progress.lessonsCompleted.length,
    quizzes: student.progress.quizzesCompleted.length,
    score: student.progress.totalScore,
  }));

  const engagementData = [
    { name: 'Active (7 days)', value: activeStudents },
    { name: 'Inactive', value: totalStudents - activeStudents },
  ];

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-purple-900">
                {getTranslation('teacher', user.language)} {getTranslation('dashboard', user.language)}
              </h1>
              <p className="text-sm text-gray-600">
                {getTranslation('welcome', user.language)}, {user.name}!
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
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total {getTranslation('students', user.language)}
              </CardTitle>
              <Users className="size-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-gray-600">Across all classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <TrendingUp className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeStudents}</div>
              <p className="text-xs text-gray-600">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <BookOpen className="size-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageProgress}%</div>
              <Progress value={averageProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <Trophy className="size-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore}%</div>
              <p className="text-xs text-gray-600">Quiz performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="students">
              {getTranslation('students', user.language)}
            </TabsTrigger>
            <TabsTrigger value="analytics">
              {getTranslation('analytics', user.language)}
            </TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Performance</CardTitle>
                    <CardDescription>
                      {currentClass?.name}
                    </CardDescription>
                  </div>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    {teacherClasses.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classStudents.map((student) => {
                      const lastActive = new Date(student.progress.lastActive);
                      const daysSinceActive = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
                      const isActive = daysSinceActive <= 7;

                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.grade}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <BookOpen className="size-4 text-gray-500" />
                              {student.progress.lessonsCompleted.length}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Trophy className="size-4 text-gray-500" />
                              {student.progress.quizzesCompleted.length}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={student.progress.totalScore >= 70 ? 'default' : 'secondary'}>
                              {student.progress.totalScore}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isActive ? 'default' : 'outline'}>
                              {isActive ? 'Active' : `${daysSinceActive}d ago`}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Progress Overview</CardTitle>
                  <CardDescription>Lessons and quizzes completed</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={studentProgressData}>
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

              <Card>
                <CardHeader>
                  <CardTitle>Student Engagement</CardTitle>
                  <CardDescription>Activity in the last 7 days</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={engagementData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {engagementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Top Performers</h4>
                      <ul className="space-y-1 text-sm">
                        {classStudents
                          .sort((a, b) => b.progress.totalScore - a.progress.totalScore)
                          .slice(0, 3)
                          .map(s => (
                            <li key={s.id} className="flex items-center gap-2">
                              <Trophy className="size-4 text-yellow-600" />
                              {s.name} ({s.progress.totalScore}%)
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Need Attention</h4>
                      <ul className="space-y-1 text-sm">
                        {classStudents
                          .filter(s => s.progress.lessonsCompleted.length === 0)
                          .slice(0, 3)
                          .map(s => (
                            <li key={s.id} className="flex items-center gap-2">
                              <GraduationCap className="size-4 text-orange-600" />
                              {s.name}
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Most Active</h4>
                      <ul className="space-y-1 text-sm">
                        {classStudents
                          .sort((a, b) => b.progress.lessonsCompleted.length - a.progress.lessonsCompleted.length)
                          .slice(0, 3)
                          .map(s => (
                            <li key={s.id} className="flex items-center gap-2">
                              <TrendingUp className="size-4 text-green-600" />
                              {s.name} ({s.progress.lessonsCompleted.length} lessons)
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teacherClasses.map((cls) => {
                const students = mockStudents.filter(s => s.classId === cls.id);
                const avgProgress = students.length > 0
                  ? Math.round(
                      students.reduce((sum, s) => {
                        const rate = (s.progress.lessonsCompleted.length / mockLessons.filter(l => l.grade === s.grade).length) * 100;
                        return sum + rate;
                      }, 0) / students.length
                    )
                  : 0;

                return (
                  <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{cls.name}</CardTitle>
                      <CardDescription>
                        {students.length} students
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Class Progress</span>
                          <span className="text-sm font-medium">{avgProgress}%</span>
                        </div>
                        <Progress value={avgProgress} />
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedClass(cls.id)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}