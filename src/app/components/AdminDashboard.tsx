import { useState, useEffect } from "react";
import { Admin, Language } from "@/app/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/components/ui/dialog";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  GraduationCap,
  BookOpen,
  School,
  TrendingUp,
  LogOut,
  Search,
  Filter,
  Download,
  RefreshCw,
  Shield,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Mail,
  MapPin,
} from "lucide-react";
import { syncService } from "@/app/utils/syncService";
import { getAllStudents, getAllLessons, getStudentProgress } from "@/app/data/seedData";
import { toast } from "sonner";

interface AdminDashboardProps {
  user: Admin;
  onLogout: () => void;
}

export function AdminDashboard({
  user,
  onLogout,
}: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [systemStats, setSystemStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalSchools: 0,
    totalLessons: 0,
    activeUsers: 0,
    systemHealth: 100,
  });
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [schoolsData, setSchoolsData] = useState<any[]>([]);

  useEffect(() => {
    loadSystemStats();
    loadAllUsers();
    loadSchoolsData();
    const interval = setInterval(loadSystemStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm.trim() === "") {
      setFilteredUsers(allUsers);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.role.toLowerCase().includes(term) ||
          (u.school && u.school.toLowerCase().includes(term)),
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, allUsers]);

  const loadAllUsers = () => {
    try {
      const students = getAllStudents();
      
      // Also load teachers and admins from localStorage
      const users: any[] = [...students];
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith('user-')) {
          try {
            const user = JSON.parse(localStorage.getItem(key) || '{}');
            // Only add teachers and admins (students already added above)
            if (user.role === 'teacher' || user.role === 'admin') {
              users.push(user);
            }
          } catch (error) {
            console.error(`Error parsing user data for ${key}:`, error);
          }
        }
      }
      
      setAllUsers(users);
      setFilteredUsers(users);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadSystemStats = async () => {
    try {
      // Load real data from localStorage
      const allStudents = getAllStudents();
      const allLessons = getAllLessons();
      
      // Count teachers and admins
      let teacherCount = 0;
      let adminCount = 0;
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith('user-')) {
          try {
            const user = JSON.parse(localStorage.getItem(key) || '{}');
            if (user.role === 'teacher') teacherCount++;
            if (user.role === 'admin') adminCount++;
          } catch (error) {
            // Skip invalid entries
          }
        }
      }
      
      // Count unique schools
      const schools = new Set(allStudents.map(s => s.schoolName).filter(Boolean));
      
      // Calculate active users (active in last 7 days)
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const activeUsers = allStudents.filter(student => {
        const progress = getStudentProgress(student.id);
        if (progress) {
          return new Date(progress.lastActive).getTime() > sevenDaysAgo;
        }
        return false;
      }).length;

      setSystemStats({
        totalStudents: allStudents.length,
        totalTeachers: teacherCount,
        totalSchools: schools.size,
        totalLessons: allLessons.length,
        activeUsers,
        systemHealth: 100,
      });
    } catch (error) {
      console.error('Failed to load system stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSchoolsData = () => {
    try {
      const schools = Array.from({ length: 6 }).map((_, idx) => ({
        id: idx + 1,
        name: `Government High School ${idx + 1}`,
        district: "District Name",
        state: "State",
        students: 45,
        teachers: 5,
        lessons: 12,
      }));
      setSchoolsData(schools);
    } catch (error) {
      console.error('Failed to load schools data:', error);
    }
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    try {
      await loadSystemStats();
      await loadAllUsers();
      toast.success("Data refreshed successfully");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    try {
      // Remove user data from localStorage
      localStorage.removeItem(`user-${userId}`);
      
      // Also remove student progress if it exists
      localStorage.removeItem(`progress-${userId}`);
      
      // Remove quiz results if they exist
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(`quiz-result-${userId}`)) {
          localStorage.removeItem(key);
        }
      });
      
      // Reload users and stats
      loadAllUsers();
      loadSystemStats();
      
      toast.success(`User \"${userName}\" deleted successfully`);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Failed to delete user");
    }
  };

  const generateReport = (reportType: string) => {
    try {
      const allStudents = getAllStudents();
      const allLessons = getAllLessons();
      
      let reportData: any = {};
      
      switch (reportType) {
        case "User Activity Report":
          reportData = {
            title: "User Activity Report",
            generatedAt: new Date().toISOString(),
            totalUsers: allUsers.length,
            activeUsers: systemStats.activeUsers,
            students: systemStats.totalStudents,
            teachers: systemStats.totalTeachers,
            userActivity: allStudents.map(student => {
              const progress = getStudentProgress(student.id);
              return {
                name: student.name,
                email: student.email,
                grade: student.grade,
                lessonsCompleted: progress?.lessonsCompleted.length || 0,
                quizzesCompleted: progress?.quizzesCompleted.length || 0,
                lastActive: progress?.lastActive || "N/A",
              };
            }),
          };
          break;
        
        case "Content Usage Report":
          reportData = {
            title: "Content Usage Report",
            generatedAt: new Date().toISOString(),
            totalLessons: allLessons.length,
            totalViews: allStudents.reduce((sum, student) => {
              const progress = getStudentProgress(student.id);
              return sum + (progress?.lessonsWatched.length || 0);
            }, 0),
            lessonsBySubject: {
              mathematics: allLessons.filter(l => l.subject === "mathematics").length,
              science: allLessons.filter(l => l.subject === "science").length,
              language: allLessons.filter(l => l.subject === "language").length,
              socialStudies: allLessons.filter(l => l.subject === "social-studies").length,
            },
          };
          break;
        
        case "Performance Metrics":
          reportData = {
            title: "Performance Metrics",
            generatedAt: new Date().toISOString(),
            systemHealth: systemStats.systemHealth,
            activeUsers: systemStats.activeUsers,
            averageQuizScore: allStudents.reduce((sum, student) => {
              const progress = getStudentProgress(student.id);
              if (progress && progress.quizzesCompleted.length > 0) {
                const avgScore = progress.quizzesCompleted.reduce((s, q) => s + (q.score / q.totalQuestions) * 100, 0) / progress.quizzesCompleted.length;
                return sum + avgScore;
              }
              return sum;
            }, 0) / allStudents.length,
            completionRate: (allStudents.filter(student => {
              const progress = getStudentProgress(student.id);
              return progress && progress.lessonsCompleted.length > 0;
            }).length / allStudents.length) * 100,
          };
          break;
        
        case "Geographic Distribution":
          const schoolCounts: Record<string, number> = {};
          allStudents.forEach(student => {
            if (student.schoolName) {
              schoolCounts[student.schoolName] = (schoolCounts[student.schoolName] || 0) + 1;
            }
          });
          reportData = {
            title: "Geographic Distribution",
            generatedAt: new Date().toISOString(),
            totalSchools: Object.keys(schoolCounts).length,
            schoolDistribution: schoolCounts,
            stateDistribution: stateDistribution,
          };
          break;
        
        case "Teacher Performance":
          const teachers = allUsers.filter(u => u.role === "teacher");
          reportData = {
            title: "Teacher Performance",
            generatedAt: new Date().toISOString(),
            totalTeachers: teachers.length,
            teachers: teachers.map(teacher => ({
              name: teacher.name,
              email: teacher.email,
              school: teacher.school || "N/A",
              subject: teacher.subject || "N/A",
            })),
          };
          break;
        
        default:
          reportData = {
            title: reportType,
            generatedAt: new Date().toISOString(),
            message: "Report data not available",
          };
      }
      
      // Download as JSON
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportType.replace(/\s+/g, "_")}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`${reportType} downloaded successfully`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error("Failed to generate report");
    }
  };

  const getUserProgress = (userId: string) => {
    const progress = getStudentProgress(userId);
    return progress;
  };

  // Mock data for visualizations
  const userGrowthData = [
    { month: "Jan", students: 120, teachers: 15, id: "jan-2024" },
    { month: "Feb", students: 180, teachers: 18, id: "feb-2024" },
    { month: "Mar", students: 245, teachers: 22, id: "mar-2024" },
    { month: "Apr", students: 320, teachers: 28, id: "apr-2024" },
  ];

  const stateDistribution = [
    { name: "Uttar Pradesh", value: 45, id: "up" },
    { name: "Bihar", value: 38, id: "bihar" },
    { name: "Maharashtra", value: 32, id: "maha" },
    { name: "Tamil Nadu", value: 28, id: "tn" },
    { name: "Others", value: 67, id: "others" },
  ];

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="size-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Control Panel
                </h1>
                <p className="text-sm text-gray-600">
                  System Administration - {user.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isSyncing}
              >
                <RefreshCw
                  className={`size-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="size-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <GraduationCap className="size-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {systemStats.totalStudents}
              </div>
              <p className="text-xs text-green-600 mt-1">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Teachers
              </CardTitle>
              <Users className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {systemStats.totalTeachers}
              </div>
              <p className="text-xs text-green-600 mt-1">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Schools Registered
              </CardTitle>
              <School className="size-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {systemStats.totalSchools}
              </div>
              <p className="text-xs text-green-600 mt-1">
                +5 new this month
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Lessons
              </CardTitle>
              <BookOpen className="size-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {systemStats.totalLessons}
              </div>
              <p className="text-xs text-green-600 mt-1">
                +24 uploaded this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="schools">Schools</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent
            value="overview"
            className="space-y-6 mt-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>User Growth Trend</CardTitle>
                  <CardDescription>
                    Students and teachers registration over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        id="line-students"
                        type="monotone"
                        dataKey="students"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Students"
                      />
                      <Line
                        id="line-teachers"
                        type="monotone"
                        dataKey="teachers"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Teachers"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* State Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>
                    Users by state
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >
                    <PieChart>
                      <Pie
                        data={stateDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) =>
                          `${name}: ${value}`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stateDistribution.map(
                          (entry) => (
                            <Cell
                              key={`cell-${entry.id}`}
                              fill={
                                COLORS[stateDistribution.indexOf(entry) % COLORS.length]
                              }
                            />
                          ),
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    System Health & Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-4xl font-bold text-green-600">
                        {systemStats.systemHealth}%
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        System Uptime
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-4xl font-bold text-blue-600">
                        {systemStats.activeUsers}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Active Users (24h)
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-4xl font-bold text-purple-600">
                        98.5%
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Success Rate
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage students and teachers
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 size-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) =>
                          setSearchTerm(e.target.value)
                        }
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="size-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="size-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge>
                            {user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.school || "N/A"}
                        </TableCell>
                        <TableCell>
                          {user.joined || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-600">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedUser(user)}
                                >
                                  <Eye className="size-4 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>User Details</DialogTitle>
                                  <DialogDescription>
                                    Complete information about {user.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  {/* Basic Information */}
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                      <Users className="size-4" />
                                      Basic Information
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <p className="text-gray-600">Name</p>
                                        <p className="font-medium">{user.name}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Email</p>
                                        <p className="font-medium">{user.email}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Role</p>
                                        <Badge>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge>
                                      </div>
                                      {user.grade && (
                                        <div>
                                          <p className="text-gray-600">Grade</p>
                                          <p className="font-medium">Class {user.grade}</p>
                                        </div>
                                      )}
                                      {user.section && (
                                        <div>
                                          <p className="text-gray-600">Section</p>
                                          <p className="font-medium">{user.section}</p>
                                        </div>
                                      )}
                                      {user.subject && (
                                        <div>
                                          <p className="text-gray-600">Subject</p>
                                          <p className="font-medium capitalize">{user.subject}</p>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-gray-600">School</p>
                                        <p className="font-medium">{user.school || user.schoolName || "N/A"}</p>
                                      </div>
                                      {user.language && (
                                        <div>
                                          <p className="text-gray-600">Language</p>
                                          <p className="font-medium">{user.language === 'en' ? 'English' : user.language === 'hi' ? 'Hindi' : user.language === 'ta' ? 'Tamil' : user.language === 'te' ? 'Telugu' : user.language === 'bn' ? 'Bengali' : user.language}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Student Progress */}
                                  {user.role === 'student' && (() => {
                                    const progress = getUserProgress(user.id);
                                    return progress ? (
                                      <div className="space-y-3 border-t pt-4">
                                        <h4 className="font-semibold text-sm flex items-center gap-2">
                                          <TrendingUp className="size-4" />
                                          Learning Progress
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                          <div className="p-3 bg-blue-50 rounded-lg">
                                            <p className="text-gray-600 text-xs">Lessons Completed</p>
                                            <p className="text-2xl font-bold text-blue-600">{progress.lessonsCompleted.length}</p>
                                          </div>
                                          <div className="p-3 bg-green-50 rounded-lg">
                                            <p className="text-gray-600 text-xs">Quizzes Completed</p>
                                            <p className="text-2xl font-bold text-green-600">{progress.quizzesCompleted.length}</p>
                                          </div>
                                          <div className="p-3 bg-purple-50 rounded-lg">
                                            <p className="text-gray-600 text-xs">Streak Days</p>
                                            <p className="text-2xl font-bold text-purple-600">{progress.streakDays}</p>
                                          </div>
                                          <div className="p-3 bg-yellow-50 rounded-lg">
                                            <p className="text-gray-600 text-xs">Total Score</p>
                                            <p className="text-2xl font-bold text-yellow-600">{progress.totalScore}</p>
                                          </div>
                                        </div>
                                        <div className="text-sm">
                                          <p className="text-gray-600">Last Active</p>
                                          <p className="font-medium">{new Date(progress.lastActive).toLocaleString()}</p>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="border-t pt-4">
                                        <p className="text-sm text-gray-600">No progress data available</p>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </DialogContent>
                            </Dialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="size-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete User
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete{" "}
                                    <strong className="font-semibold text-gray-900">
                                      {user.name}
                                    </strong>
                                    ? This will permanently remove their account, progress data, and quiz results. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteUser(user.id, user.name)
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schools Tab */}
          <TabsContent value="schools" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Registered Schools</CardTitle>
                <CardDescription>
                  Schools using the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schoolsData.map((school) => (
                    <Card key={school.id} className="border-2">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {school.name}
                        </CardTitle>
                        <CardDescription>
                          {school.district}, {school.state}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Students:
                          </span>
                          <span className="font-semibold">
                            {school.students}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Teachers:
                          </span>
                          <span className="font-semibold">
                            {school.teachers}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Lessons:
                          </span>
                          <span className="font-semibold">
                            {school.lessons}
                          </span>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => setSelectedSchool(school.name)}
                            >
                              <Eye className="size-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{school.name}</DialogTitle>
                              <DialogDescription>
                                Complete information about the school
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-3">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                  <School className="size-4" />
                                  School Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-600">School Name</p>
                                    <p className="font-medium">{school.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Location</p>
                                    <p className="font-medium">{school.district}, {school.state}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Type</p>
                                    <p className="font-medium">Government School</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Established</p>
                                    <p className="font-medium">1985</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-3 border-t pt-4">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                  <Users className="size-4" />
                                  Statistics
                                </h4>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                                    <p className="text-3xl font-bold text-blue-600">{school.students}</p>
                                    <p className="text-xs text-gray-600 mt-1">Students</p>
                                  </div>
                                  <div className="p-3 bg-green-50 rounded-lg text-center">
                                    <p className="text-3xl font-bold text-green-600">{school.teachers}</p>
                                    <p className="text-xs text-gray-600 mt-1">Teachers</p>
                                  </div>
                                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                                    <p className="text-3xl font-bold text-purple-600">{school.lessons}</p>
                                    <p className="text-xs text-gray-600 mt-1">Lessons</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-3 border-t pt-4">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                  <BookOpen className="size-4" />
                                  Performance Overview
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Average Attendance</span>
                                    <span className="font-semibold text-green-600">87%</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Completion Rate</span>
                                    <span className="font-semibold text-blue-600">92%</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Average Quiz Score</span>
                                    <span className="font-semibold text-purple-600">78/100</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>
                  Monitor and moderate platform content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            124
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Video Lessons
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">
                            89
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Quizzes
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600">
                            2.4k
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Total Views
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Pending Reviews
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        3 lessons waiting for approval
                      </p>
                      <Button size="sm" className="mt-3">
                        Review Content
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Reports</CardTitle>
                <CardDescription>
                  Download comprehensive system reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "User Activity Report",
                    "Content Usage Report",
                    "Performance Metrics",
                    "Financial Summary",
                    "Geographic Distribution",
                    "Teacher Performance",
                  ].map((report, idx) => (
                    <Card
                      key={idx}
                      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => generateReport(report)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">
                            {report}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Last updated: Today
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="size-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}