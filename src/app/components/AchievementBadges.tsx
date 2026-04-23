import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Language } from '@/app/types';
import { getTranslation } from '@/app/utils/localization';
import { Award, BookOpen, Flame, Star, Target, Trophy, Zap } from 'lucide-react';

export interface Achievement {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  icon: 'star' | 'trophy' | 'flame' | 'target' | 'zap' | 'award' | 'book';
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  language: Language;
}

const iconMap = {
  star: Star,
  trophy: Trophy,
  flame: Flame,
  target: Target,
  zap: Zap,
  award: Award,
  book: BookOpen,
};

export function AchievementBadges({ achievements, language }: AchievementBadgesProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="size-5 text-yellow-600" />
          {getTranslation('achievements', language)}
        </CardTitle>
        <CardDescription>
          {unlockedCount} / {achievements.length} {getTranslation('unlocked', language)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {achievements.map((achievement) => {
            const Icon = iconMap[achievement.icon];
            return (
              <div
                key={achievement.id}
                className={`p-4 border rounded-lg text-center transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className={`mx-auto mb-2 p-3 rounded-full w-fit ${
                  achievement.unlocked ? 'bg-yellow-100' : 'bg-gray-200'
                }`}>
                  <Icon className={`size-6 ${
                    achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'
                  }`} />
                </div>
                <h4 className="font-semibold text-sm mb-1">
                  {achievement.title[language]}
                </h4>
                <p className="text-xs text-gray-600 mb-2">
                  {achievement.description[language]}
                </p>
                {achievement.maxProgress && achievement.progress !== undefined && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">
                      {achievement.progress} / {achievement.maxProgress}
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 transition-all"
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
