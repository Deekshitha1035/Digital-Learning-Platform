import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Role, Language, Grade, Subject, Student, Teacher, Admin } from '@/app/types';
import { GraduationCap, Users, Shield, BookOpen } from 'lucide-react';
import { syncService } from '@/app/utils/syncService';

interface RegistrationPageProps {
  onRegister: (user: Student | Teacher | Admin) => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
];

const SUBJECTS: { value: Subject; label: string }[] = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'language', label: 'Language Arts' },
  { value: 'social-studies', label: 'Social Studies' },
];

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'ta', label: 'தமிழ் (Tamil)' },
  { value: 'te', label: 'తెలుగు (Telugu)' },
  { value: 'bn', label: 'বাংলা (Bengali)' },
];

export function RegistrationPage({ onRegister }: RegistrationPageProps) {
  const [activeTab, setActiveTab] = useState<Role>('student');
  const [isLogin, setIsLogin] = useState(false);
  
  // Student form
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    password: '',
    schoolName: '',
    state: '',
    district: '',
    grade: '' as Grade,
    section: '',
    subject: '' as Subject,
    language: 'en' as Language,
  });

  // Teacher form
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    password: '',
    schoolName: '',
    state: '',
    district: '',
    subjects: [] as Subject[],
    grades: [] as Grade[],
    language: 'en' as Language,
  });

  // Admin form
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    adminCode: '',
    language: 'en' as Language,
  });

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const student: Student = {
      id: `student-${Date.now()}`,
      name: studentForm.name,
      email: studentForm.email,
      role: 'student',
      language: studentForm.language,
      schoolName: studentForm.schoolName,
      grade: studentForm.grade,
      subject: studentForm.subject,
      section: studentForm.section,
      createdAt: new Date().toISOString(),
    };

    // Save to database
    await syncService.registerUser(student);
    onRegister(student);
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const teacher: Teacher = {
      id: `teacher-${Date.now()}`,
      name: teacherForm.name,
      email: teacherForm.email,
      role: 'teacher',
      language: teacherForm.language,
      schoolName: teacherForm.schoolName,
      subjects: teacherForm.subjects,
      grades: teacherForm.grades,
      createdAt: new Date().toISOString(),
    };

    // Save to database
    await syncService.registerUser(teacher);
    onRegister(teacher);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adminForm.adminCode !== 'ADMIN2024') {
      alert('Invalid admin code');
      return;
    }

    const admin: Admin = {
      id: `admin-${Date.now()}`,
      name: adminForm.name,
      email: adminForm.email,
      role: 'admin',
      language: adminForm.language,
      createdAt: new Date().toISOString(),
    };

    // Save to database
    await syncService.registerUser(admin);
    onRegister(admin);
  };

  const toggleSubject = (subject: Subject) => {
    setTeacherForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const toggleGrade = (grade: Grade) => {
    setTeacherForm(prev => ({
      ...prev,
      grades: prev.grades.includes(grade)
        ? prev.grades.filter(g => g !== grade)
        : [...prev.grades, grade],
    }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Gamified Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
        
        {/* Soft gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-yellow-50/50"></div>
        
        {/* Gamified elements */}
        <div className="absolute inset-0 overflow-hidden">
          
          {/* Achievement Badges - Fewer on mobile */}
          <div className="game-badge badge-gold absolute hidden md:block" style={{ top: '8%', left: '10%' }}>
            <div className="badge-ribbon"></div>
            <div className="badge-circle">
              <div className="badge-star">⭐</div>
            </div>
          </div>
          <div className="game-badge badge-silver absolute" style={{ top: '15%', right: '12%' }}>
            <div className="badge-ribbon"></div>
            <div className="badge-circle">
              <div className="badge-icon">🏆</div>
            </div>
          </div>
          <div className="game-badge badge-bronze absolute" style={{ bottom: '20%', left: '8%' }}>
            <div className="badge-ribbon"></div>
            <div className="badge-circle">
              <div className="badge-icon">👑</div>
            </div>
          </div>
          <div className="game-badge badge-purple absolute hidden md:block" style={{ bottom: '15%', right: '10%' }}>
            <div className="badge-ribbon"></div>
            <div className="badge-circle">
              <div className="badge-icon">💎</div>
            </div>
          </div>
          
          {/* Floating Coins - Responsive positioning */}
          <div className="game-coin absolute" style={{ top: '25%', left: '5%', animationDelay: '0s' }}>
            <div className="coin-face coin-gold">
              <div className="coin-value">100</div>
            </div>
          </div>
          <div className="game-coin absolute hidden sm:block" style={{ top: '60%', right: '8%', animationDelay: '1s' }}>
            <div className="coin-face coin-gold">
              <div className="coin-value">50</div>
            </div>
          </div>
          <div className="game-coin absolute hidden lg:block" style={{ top: '40%', left: '8%', animationDelay: '2s' }}>
            <div className="coin-face coin-silver">
              <div className="coin-value">25</div>
            </div>
          </div>
          <div className="game-coin absolute" style={{ bottom: '30%', right: '6%', animationDelay: '1.5s' }}>
            <div className="coin-face coin-silver">
              <div className="coin-value">10</div>
            </div>
          </div>
          <div className="game-coin absolute hidden sm:block" style={{ top: '70%', left: '10%', animationDelay: '0.5s' }}>
            <div className="coin-face coin-bronze">
              <div className="coin-value">5</div>
            </div>
          </div>
          
          {/* Progress Bars - Responsive positioning */}
          <div className="game-progress-bar absolute hidden lg:block" style={{ top: '18%', left: '25%' }}>
            <div className="progress-container">
              <div className="progress-fill" style={{ width: '75%', background: 'linear-gradient(90deg, #10b981, #059669)' }}></div>
            </div>
            <div className="progress-label">Level 5</div>
          </div>
          <div className="game-progress-bar absolute hidden xl:block" style={{ top: '50%', right: '25%' }}>
            <div className="progress-container">
              <div className="progress-fill" style={{ width: '60%', background: 'linear-gradient(90deg, #3b82f6, #2563eb)' }}></div>
            </div>
            <div className="progress-label">Math</div>
          </div>
          <div className="game-progress-bar absolute hidden lg:block" style={{ bottom: '25%', left: '28%' }}>
            <div className="progress-container">
              <div className="progress-fill" style={{ width: '85%', background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}></div>
            </div>
            <div className="progress-label">Science</div>
          </div>
          
          {/* Achievement Icons - Responsive */}
          <div className="achievement-icon icon-complete absolute hidden md:block" style={{ top: '35%', right: '8%' }}>
            <div className="achievement-bg">
              <div className="achievement-symbol">✓</div>
            </div>
          </div>
          <div className="achievement-icon icon-streak absolute" style={{ top: '55%', left: '5%' }}>
            <div className="achievement-bg">
              <div className="achievement-symbol">🔥</div>
            </div>
          </div>
          <div className="achievement-icon icon-perfect absolute hidden lg:block" style={{ bottom: '12%', right: '25%' }}>
            <div className="achievement-bg">
              <div className="achievement-symbol">💯</div>
            </div>
          </div>
          <div className="achievement-icon icon-brain absolute hidden md:block" style={{ top: '12%', left: '40%' }}>
            <div className="achievement-bg">
              <div className="achievement-symbol">🧠</div>
            </div>
          </div>
          
          {/* Floating Stars - Fewer on mobile */}
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={`star-${i}`}
              className={`game-star absolute ${i > 12 ? 'hidden md:block' : ''}`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 15 + 12}px`,
                animationDelay: `${Math.random() * 3}s`,
                color: ['#fbbf24', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 5)],
              }}
            >
              ⭐
            </div>
          ))}
          
          {/* Level Up Indicators - Desktop only */}
          <div className="level-up-indicator absolute hidden xl:block" style={{ top: '28%', right: '30%' }}>
            <div className="level-badge">
              <div className="level-number">7</div>
            </div>
            <div className="level-text">LEVEL</div>
          </div>
          <div className="level-up-indicator absolute hidden xl:block" style={{ bottom: '35%', left: '35%' }}>
            <div className="level-badge">
              <div className="level-number">12</div>
            </div>
            <div className="level-text">LEVEL</div>
          </div>
          
          {/* XP Points Floating - Fewer on mobile */}
          <div className="xp-point absolute hidden md:block" style={{ top: '45%', left: '22%', animationDelay: '0s' }}>
            <span className="xp-value">+50</span>
            <span className="xp-label">XP</span>
          </div>
          <div className="xp-point absolute hidden lg:block" style={{ top: '65%', right: '28%', animationDelay: '1s' }}>
            <span className="xp-value">+100</span>
            <span className="xp-label">XP</span>
          </div>
          <div className="xp-point absolute hidden md:block" style={{ top: '22%', left: '55%', animationDelay: '2s' }}>
            <span className="xp-value">+25</span>
            <span className="xp-label">XP</span>
          </div>
          
          {/* Rank Icons - Desktop only */}
          <div className="rank-icon absolute hidden lg:block" style={{ bottom: '8%', left: '15%' }}>
            <div className="rank-shield">
              <div className="rank-tier">A+</div>
            </div>
          </div>
          <div className="rank-icon absolute hidden xl:block" style={{ top: '8%', right: '25%' }}>
            <div className="rank-shield">
              <div className="rank-tier">S</div>
            </div>
          </div>
          
          {/* Combo Multiplier - Mobile friendly */}
          <div className="combo-badge absolute" style={{ bottom: '8%', right: '5%' }}>
            <div className="combo-number">x3</div>
            <div className="combo-text">COMBO</div>
          </div>
          
          {/* Mini Trophy Icons - Responsive */}
          <div className="mini-trophy absolute hidden sm:block" style={{ top: '75%', right: '12%' }}>🏆</div>
          <div className="mini-trophy absolute hidden md:block" style={{ top: '32%', left: '28%' }}>🎯</div>
          <div className="mini-trophy absolute hidden lg:block" style={{ bottom: '28%', left: '18%' }}>🎖️</div>
          
          {/* Decorative Particles - Fewer on mobile */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className={`game-particle absolute rounded-full ${i > 10 ? 'hidden md:block' : ''}`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                background: ['#fbbf24', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
        
        {/* Clean overlay for readability */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>
      </div>

      {/* Content Container - Responsive */}
      <div className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3">
              Digital Learning Platform
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Empowering Rural Education in India 🇮🇳
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Role)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <GraduationCap className="size-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="teacher" className="flex items-center gap-2">
                <Users className="size-4" />
                Teacher
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="size-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            {/* Student Registration */}
            <TabsContent value="student">
              <form onSubmit={handleStudentSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="student-name">Full Name *</Label>
                    <Input
                      id="student-name"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      required
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="student-email">Email</Label>
                    <Input
                      id="student-email"
                      type="email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="student-school">School Name *</Label>
                    <Input
                      id="student-school"
                      value={studentForm.schoolName}
                      onChange={(e) => setStudentForm({ ...studentForm, schoolName: e.target.value })}
                      required
                      placeholder="Your school name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="student-state">State *</Label>
                    <Select value={studentForm.state} onValueChange={(v) => setStudentForm({ ...studentForm, state: v })}>
                      <SelectTrigger id="student-state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="student-grade">Class/Grade *</Label>
                    <Select value={studentForm.grade} onValueChange={(v) => setStudentForm({ ...studentForm, grade: v as Grade })} required>
                      <SelectTrigger id="student-grade">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => (i + 1).toString()).map(grade => (
                          <SelectItem key={grade} value={grade}>Class {grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="student-section">Section</Label>
                    <Input
                      id="student-section"
                      value={studentForm.section}
                      onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                      placeholder="A, B, C..."
                      maxLength={1}
                    />
                  </div>
                  <div>
                    <Label htmlFor="student-subject">Subject *</Label>
                    <Select value={studentForm.subject} onValueChange={(v) => setStudentForm({ ...studentForm, subject: v as Subject })} required>
                      <SelectTrigger id="student-subject">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map(subject => (
                          <SelectItem key={subject.value} value={subject.value}>{subject.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="student-language">Preferred Language *</Label>
                  <Select value={studentForm.language} onValueChange={(v) => setStudentForm({ ...studentForm, language: v as Language })} required>
                    <SelectTrigger id="student-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Register as Student
                </Button>
              </form>
            </TabsContent>

            {/* Teacher Registration */}
            <TabsContent value="teacher">
              <form onSubmit={handleTeacherSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teacher-name">Full Name *</Label>
                    <Input
                      id="teacher-name"
                      value={teacherForm.name}
                      onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                      required
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teacher-email">Email *</Label>
                    <Input
                      id="teacher-email"
                      type="email"
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teacher-school">School Name *</Label>
                    <Input
                      id="teacher-school"
                      value={teacherForm.schoolName}
                      onChange={(e) => setTeacherForm({ ...teacherForm, schoolName: e.target.value })}
                      required
                      placeholder="Your school name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teacher-state">State *</Label>
                    <Select value={teacherForm.state} onValueChange={(v) => setTeacherForm({ ...teacherForm, state: v })}>
                      <SelectTrigger id="teacher-state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Subjects You Teach * (Select multiple)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {SUBJECTS.map(subject => (
                      <Button
                        key={subject.value}
                        type="button"
                        variant={teacherForm.subjects.includes(subject.value) ? 'default' : 'outline'}
                        onClick={() => toggleSubject(subject.value)}
                        className="w-full"
                      >
                        {subject.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Classes You Teach * (Select multiple)</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {Array.from({ length: 10 }, (_, i) => (i + 1).toString() as Grade).map(grade => (
                      <Button
                        key={grade}
                        type="button"
                        variant={teacherForm.grades.includes(grade) ? 'default' : 'outline'}
                        onClick={() => toggleGrade(grade)}
                        size="sm"
                      >
                        {grade}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="teacher-language">Preferred Language *</Label>
                  <Select value={teacherForm.language} onValueChange={(v) => setTeacherForm({ ...teacherForm, language: v as Language })} required>
                    <SelectTrigger id="teacher-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={teacherForm.subjects.length === 0 || teacherForm.grades.length === 0}
                >
                  Register as Teacher
                </Button>
              </form>
            </TabsContent>

            {/* Admin Registration */}
            <TabsContent value="admin">
              <form onSubmit={handleAdminSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="admin-name">Full Name *</Label>
                    <Input
                      id="admin-name"
                      value={adminForm.name}
                      onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                      required
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-email">Email *</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      required
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="admin-code">Admin Code *</Label>
                  <Input
                    id="admin-code"
                    type="password"
                    value={adminForm.adminCode}
                    onChange={(e) => setAdminForm({ ...adminForm, adminCode: e.target.value })}
                    required
                    placeholder="Enter admin access code"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contact system administrator for access code</p>
                </div>

                <div>
                  <Label htmlFor="admin-language">Preferred Language *</Label>
                  <Select value={adminForm.language} onValueChange={(v) => setAdminForm({ ...adminForm, language: v as Language })} required>
                    <SelectTrigger id="admin-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Register as Admin
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}