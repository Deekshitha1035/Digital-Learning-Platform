import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-db5fc770/health", (c) => {
  return c.json({ status: "ok" });
});

// ============= STUDENT PROGRESS ENDPOINTS =============

// Register new user
app.post("/make-server-db5fc770/register", async (c) => {
  try {
    const userData = await c.req.json();
    const userId = userData.id;
    
    // Save user data
    await kv.set(`user:${userId}`, userData);
    
    // If student, initialize progress
    if (userData.role === 'student') {
      await kv.set(`progress:${userId}`, {
        userId,
        lessonsCompleted: [],
        lessonsWatched: [],
        quizzesCompleted: [],
        totalScore: 0,
        lastActive: new Date().toISOString(),
        streakDays: 0,
      });
    }
    
    // Add to role-specific index
    if (userData.role === 'teacher') {
      const teachers = await kv.get('teachers:list') || [];
      teachers.push(userId);
      await kv.set('teachers:list', teachers);
    }
    
    return c.json({ success: true, userId });
  } catch (error) {
    console.log(`Error registering user: ${error}`);
    return c.json({ error: "Failed to register user" }, 500);
  }
});

// Login/Get user
app.post("/make-server-db5fc770/login", async (c) => {
  try {
    const { email, role } = await c.req.json();
    
    // In real app, verify credentials
    // For now, search for user by email
    const users = await kv.getByPrefix('user:');
    const user = users.find((u: any) => u.email === email && u.role === role);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    return c.json(user);
  } catch (error) {
    console.log(`Error during login: ${error}`);
    return c.json({ error: "Login failed" }, 500);
  }
});

// Get student progress
app.get("/make-server-db5fc770/progress/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const progress = await kv.get(`progress:${userId}`);
    
    if (!progress) {
      return c.json({
        lessonsCompleted: [],
        quizzesCompleted: [],
        totalScore: 0,
        lastActive: new Date().toISOString(),
        activityDates: [],
      });
    }
    
    return c.json(progress);
  } catch (error) {
    console.log(`Error fetching progress for user: ${error}`);
    return c.json({ error: "Failed to fetch progress" }, 500);
  }
});

// Save/Update student progress
app.post("/make-server-db5fc770/progress/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const progressData = await c.req.json();
    
    // Add timestamp
    progressData.lastSync = new Date().toISOString();
    
    await kv.set(`progress:${userId}`, progressData);
    
    return c.json({ success: true, data: progressData });
  } catch (error) {
    console.log(`Error saving progress for user: ${error}`);
    return c.json({ error: "Failed to save progress" }, 500);
  }
});

// ============= ACTIVITY TRACKING ENDPOINTS =============

// Record activity (for streak tracking)
app.post("/make-server-db5fc770/activity/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const { date, type, data } = await c.req.json();
    
    // Get existing activity dates
    const activityKey = `activity:${userId}`;
    const existingActivity = await kv.get(activityKey) || { dates: [], activities: [] };
    
    // Add new date if not already present
    const dateStr = new Date(date).toISOString().split('T')[0];
    if (!existingActivity.dates.includes(dateStr)) {
      existingActivity.dates.push(dateStr);
    }
    
    // Add activity detail
    existingActivity.activities.push({
      date: new Date().toISOString(),
      type,
      data,
    });
    
    // Keep only last 100 activities
    if (existingActivity.activities.length > 100) {
      existingActivity.activities = existingActivity.activities.slice(-100);
    }
    
    await kv.set(activityKey, existingActivity);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error recording activity for user: ${error}`);
    return c.json({ error: "Failed to record activity" }, 500);
  }
});

// Get activity history
app.get("/make-server-db5fc770/activity/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const activity = await kv.get(`activity:${userId}`) || { dates: [], activities: [] };
    
    return c.json(activity);
  } catch (error) {
    console.log(`Error fetching activity for user: ${error}`);
    return c.json({ error: "Failed to fetch activity" }, 500);
  }
});

// ============= ACHIEVEMENTS ENDPOINTS =============

// Get user achievements
app.get("/make-server-db5fc770/achievements/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const achievements = await kv.get(`achievements:${userId}`) || { unlocked: [], progress: {} };
    
    return c.json(achievements);
  } catch (error) {
    console.log(`Error fetching achievements for user: ${error}`);
    return c.json({ error: "Failed to fetch achievements" }, 500);
  }
});

// Update achievements
app.post("/make-server-db5fc770/achievements/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const achievementData = await c.req.json();
    
    await kv.set(`achievements:${userId}`, achievementData);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error updating achievements for user: ${error}`);
    return c.json({ error: "Failed to update achievements" }, 500);
  }
});

// ============= TEACHER DASHBOARD ENDPOINTS =============

// Get all students for a teacher
app.get("/make-server-db5fc770/teacher/:teacherId/students", async (c) => {
  try {
    const teacherId = c.req.param("teacherId");
    const students = await kv.getByPrefix(`student:teacher:${teacherId}:`);
    
    return c.json(students || []);
  } catch (error) {
    console.log(`Error fetching students for teacher: ${error}`);
    return c.json({ error: "Failed to fetch students" }, 500);
  }
});

// Add student to teacher's class
app.post("/make-server-db5fc770/teacher/:teacherId/students", async (c) => {
  try {
    const teacherId = c.req.param("teacherId");
    const studentData = await c.req.json();
    
    const studentId = studentData.id || `student-${Date.now()}`;
    await kv.set(`student:teacher:${teacherId}:${studentId}`, {
      ...studentData,
      id: studentId,
      teacherId,
      createdAt: new Date().toISOString(),
    });
    
    return c.json({ success: true, studentId });
  } catch (error) {
    console.log(`Error adding student for teacher: ${error}`);
    return c.json({ error: "Failed to add student" }, 500);
  }
});

// Get class analytics
app.get("/make-server-db5fc770/teacher/:teacherId/analytics", async (c) => {
  try {
    const teacherId = c.req.param("teacherId");
    
    // Get all students for this teacher
    const students = await kv.getByPrefix(`student:teacher:${teacherId}:`);
    
    // Get progress for each student
    const analytics = {
      totalStudents: students.length,
      activeStudents: 0,
      averageProgress: 0,
      averageScore: 0,
      recentActivity: [],
    };
    
    let totalProgress = 0;
    let totalScore = 0;
    
    for (const student of students) {
      const progress = await kv.get(`progress:${student.id}`);
      if (progress) {
        const lastActive = new Date(progress.lastActive);
        const daysDiff = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff <= 7) {
          analytics.activeStudents++;
        }
        
        totalProgress += progress.lessonsCompleted?.length || 0;
        totalScore += progress.totalScore || 0;
      }
    }
    
    if (students.length > 0) {
      analytics.averageProgress = Math.round(totalProgress / students.length);
      analytics.averageScore = Math.round(totalScore / students.length);
    }
    
    return c.json(analytics);
  } catch (error) {
    console.log(`Error fetching analytics for teacher: ${error}`);
    return c.json({ error: "Failed to fetch analytics" }, 500);
  }
});

// ============= VIDEO LESSON ENDPOINTS =============

// Upload video lesson
app.post("/make-server-db5fc770/lessons", async (c) => {
  try {
    const lessonData = await c.req.json();
    const lessonId = lessonData.id || `lesson-${Date.now()}`;
    
    await kv.set(`lesson:${lessonId}`, {
      ...lessonData,
      id: lessonId,
      createdAt: new Date().toISOString(),
    });
    
    // Add to teacher's lessons list
    const teacherLessons = await kv.get(`teacher:lessons:${lessonData.uploadedBy}`) || [];
    teacherLessons.push(lessonId);
    await kv.set(`teacher:lessons:${lessonData.uploadedBy}`, teacherLessons);
    
    return c.json({ success: true, lessonId });
  } catch (error) {
    console.log(`Error uploading lesson: ${error}`);
    return c.json({ error: "Failed to upload lesson" }, 500);
  }
});

// Get lessons by grade and subject
app.get("/make-server-db5fc770/lessons/:grade/:subject", async (c) => {
  try {
    const grade = c.req.param("grade");
    const subject = c.req.param("subject");
    
    // Get all lessons
    const allLessons = await kv.getByPrefix('lesson:');
    
    // Filter by grade and subject
    const filteredLessons = allLessons.filter((lesson: any) => 
      lesson.grade === grade && lesson.subject === subject
    );
    
    return c.json(filteredLessons);
  } catch (error) {
    console.log(`Error fetching lessons: ${error}`);
    return c.json({ error: "Failed to fetch lessons" }, 500);
  }
});

// Get lesson by ID
app.get("/make-server-db5fc770/lessons/:lessonId", async (c) => {
  try {
    const lessonId = c.req.param("lessonId");
    const lesson = await kv.get(`lesson:${lessonId}`);
    
    if (!lesson) {
      return c.json({ error: "Lesson not found" }, 404);
    }
    
    return c.json(lesson);
  } catch (error) {
    console.log(`Error fetching lesson: ${error}`);
    return c.json({ error: "Failed to fetch lesson" }, 500);
  }
});

// ============= ADMIN ENDPOINTS =============

// Get system stats
app.get("/make-server-db5fc770/admin/stats", async (c) => {
  try {
    const students = await kv.getByPrefix('user:');
    const studentCount = students.filter((u: any) => u.role === 'student').length;
    const teacherCount = students.filter((u: any) => u.role === 'teacher').length;
    const lessons = await kv.getByPrefix('lesson:');
    
    // Calculate unique schools
    const schools = new Set(students.map((u: any) => u.schoolName).filter(Boolean));
    
    // Calculate active users (last 24 hours)
    const now = Date.now();
    const activeUsers = students.filter((u: any) => {
      const lastActive = new Date(u.lastActive || 0).getTime();
      return (now - lastActive) < 24 * 60 * 60 * 1000;
    }).length;
    
    return c.json({
      totalStudents: studentCount,
      totalTeachers: teacherCount,
      totalSchools: schools.size,
      totalLessons: lessons.length,
      activeUsers,
      systemHealth: 100,
    });
  } catch (error) {
    console.log(`Error fetching system stats: ${error}`);
    return c.json({ error: "Failed to fetch system stats" }, 500);
  }
});

// ============= SYNC ENDPOINTS =============

// Sync offline data to server
app.post("/make-server-db5fc770/sync", async (c) => {
  try {
    const { userId, progress, activity, achievements } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: "userId is required" }, 400);
    }
    
    // Get existing data from server
    const serverProgress = await kv.get(`progress:${userId}`);
    const serverActivity = await kv.get(`activity:${userId}`);
    const serverAchievements = await kv.get(`achievements:${userId}`);
    
    // Merge data (client data takes precedence if newer)
    const mergedProgress = mergeProgressData(serverProgress, progress);
    const mergedActivity = mergeActivityData(serverActivity, activity);
    const mergedAchievements = mergeAchievementsData(serverAchievements, achievements);
    
    // Save merged data
    if (mergedProgress) {
      await kv.set(`progress:${userId}`, mergedProgress);
    }
    if (mergedActivity) {
      await kv.set(`activity:${userId}`, mergedActivity);
    }
    if (mergedAchievements) {
      await kv.set(`achievements:${userId}`, mergedAchievements);
    }
    
    return c.json({
      success: true,
      data: {
        progress: mergedProgress,
        activity: mergedActivity,
        achievements: mergedAchievements,
      },
    });
  } catch (error) {
    console.log(`Error syncing data: ${error}`);
    return c.json({ error: "Failed to sync data" }, 500);
  }
});

// Helper functions for data merging
function mergeProgressData(server: any, client: any) {
  if (!server && !client) return null;
  if (!server) return client;
  if (!client) return server;
  
  // Use the data with the most recent lastActive timestamp
  const serverTime = new Date(server.lastActive || 0).getTime();
  const clientTime = new Date(client.lastActive || 0).getTime();
  
  if (clientTime > serverTime) {
    return {
      ...client,
      lessonsCompleted: [...new Set([...(server.lessonsCompleted || []), ...(client.lessonsCompleted || [])])],
      quizzesCompleted: mergeQuizResults(server.quizzesCompleted || [], client.quizzesCompleted || []),
    };
  }
  
  return server;
}

function mergeActivityData(server: any, client: any) {
  if (!server && !client) return null;
  if (!server) return client;
  if (!client) return server;
  
  return {
    dates: [...new Set([...(server.dates || []), ...(client.dates || [])])],
    activities: [...(server.activities || []), ...(client.activities || [])].slice(-100),
  };
}

function mergeAchievementsData(server: any, client: any) {
  if (!server && !client) return null;
  if (!server) return client;
  if (!client) return server;
  
  return {
    unlocked: [...new Set([...(server.unlocked || []), ...(client.unlocked || [])])],
    progress: { ...(server.progress || {}), ...(client.progress || {}) },
  };
}

function mergeQuizResults(serverQuizzes: any[], clientQuizzes: any[]) {
  const quizMap = new Map();
  
  // Add server quizzes
  serverQuizzes.forEach(quiz => {
    quizMap.set(quiz.quizId, quiz);
  });
  
  // Add or update with client quizzes (keeping best scores)
  clientQuizzes.forEach(quiz => {
    const existing = quizMap.get(quiz.quizId);
    if (!existing || quiz.score > existing.score) {
      quizMap.set(quiz.quizId, quiz);
    }
  });
  
  return Array.from(quizMap.values());
}

Deno.serve(app.fetch);