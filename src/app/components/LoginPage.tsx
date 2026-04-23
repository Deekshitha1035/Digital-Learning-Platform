import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { UserRole, Language } from '@/app/types';
import { languages, getTranslation } from '@/app/utils/localization';
import { BookOpen, GraduationCap, Wifi, WifiOff } from 'lucide-react';

interface LoginPageProps {
  onLogin: (name: string, role: UserRole, language: Language, grade?: number) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [language, setLanguage] = useState<Language>('en');
  const [grade, setGrade] = useState<number>(1);
  const [isOnline] = useState(navigator.onLine);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name, role, language, role === 'student' ? grade : undefined);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <BookOpen className="size-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">Digital Learning Platform</CardTitle>
          <CardDescription>
            Empowering Rural Education in India
          </CardDescription>
          <div className="flex items-center justify-center gap-2 mt-2">
            {isOnline ? (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <Wifi className="size-4" />
                <span>Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-orange-600 text-sm">
                <WifiOff className="size-4" />
                <span>{getTranslation('offline', language)}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name / नाम</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">{getTranslation('language', language)}</Label>
              <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languages).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role / भूमिका</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={role === 'student' ? 'default' : 'outline'}
                  onClick={() => setRole('student')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <GraduationCap className="size-6" />
                  <span>{getTranslation('student', language)}</span>
                </Button>
                <Button
                  type="button"
                  variant={role === 'teacher' ? 'default' : 'outline'}
                  onClick={() => setRole('teacher')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <BookOpen className="size-6" />
                  <span>{getTranslation('teacher', language)}</span>
                </Button>
              </div>
            </div>

            {role === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="grade">{getTranslation('grade', language)}</Label>
                <Select value={grade.toString()} onValueChange={(value) => setGrade(parseInt(value))}>
                  <SelectTrigger id="grade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                      <SelectItem key={g} value={g.toString()}>
                        Grade {g} / कक्षा {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full">
              {getTranslation('login', language)}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
