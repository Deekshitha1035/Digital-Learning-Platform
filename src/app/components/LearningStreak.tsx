import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Language } from '@/app/types';
import { getTranslation } from '@/app/utils/localization';
import { Calendar, Flame } from 'lucide-react';

interface LearningStreakProps {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  language: Language;
}

export function LearningStreak({ currentStreak, longestStreak, lastActiveDate, language }: LearningStreakProps) {
  const today = new Date().toDateString();
  const lastActive = new Date(lastActiveDate).toDateString();
  const isActiveToday = today === lastActive;

  // Calculate last 7 days activity
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const last7Days = getLast7Days();

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="size-5 text-orange-600" />
          {getTranslation('learningStreak', language)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-around">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{currentStreak}</div>
            <p className="text-xs text-gray-600 mt-1">
              {getTranslation('currentStreak', language)}
            </p>
          </div>
          <div className="h-12 w-px bg-gray-300" />
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{longestStreak}</div>
            <p className="text-xs text-gray-600 mt-1">
              {getTranslation('bestStreak', language)}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center gap-1 mb-2">
            <Calendar className="size-4 text-gray-600" />
            <span className="text-xs text-gray-600">
              {getTranslation('last7Days', language)}
            </span>
          </div>
          <div className="flex gap-1 justify-between">
            {last7Days.map((date, idx) => {
              const dayName = date.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1);
              const isToday = date.toDateString() === today;
              const wasActive = idx >= (7 - currentStreak) || isToday && isActiveToday;

              return (
                <div key={idx} className="flex-1 text-center">
                  <div
                    className={`h-8 rounded-md mb-1 transition-colors ${
                      wasActive
                        ? 'bg-orange-500'
                        : 'bg-gray-200'
                    }`}
                  />
                  <span className="text-xs text-gray-600">{dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {isActiveToday && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-green-800">
              🎉 {getTranslation('streakActive', language)}!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
