import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Language } from '@/app/types';
import { getTranslation } from '@/app/utils/localization';
import { CheckCircle2, Circle, Monitor } from 'lucide-react';

export interface DigitalSkill {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  completed: boolean;
  activities: string[]; // lesson/quiz IDs that contribute to this skill
}

interface DigitalLiteracyTrackerProps {
  skills: DigitalSkill[];
  completedActivities: string[];
  language: Language;
}

export function DigitalLiteracyTracker({ skills, completedActivities, language }: DigitalLiteracyTrackerProps) {
  const completedSkills = skills.filter(skill => 
    skill.activities.every(activityId => completedActivities.includes(activityId))
  );

  const overallProgress = skills.length > 0 
    ? Math.round((completedSkills.length / skills.length) * 100) 
    : 0;

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="size-5 text-blue-600" />
          {getTranslation('digitalLiteracy', language)}
        </CardTitle>
        <CardDescription>
          {getTranslation('digitalIndia', language)} - {getTranslation('buildingSkills', language)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {getTranslation('overallProgress', language)}
            </span>
            <span className="text-sm font-bold text-blue-600">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        <div className="space-y-3">
          {skills.map((skill) => {
            const isCompleted = skill.activities.every(activityId => 
              completedActivities.includes(activityId)
            );
            const progress = skill.activities.filter(activityId => 
              completedActivities.includes(activityId)
            ).length;

            return (
              <div key={skill.id} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                {isCompleted ? (
                  <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="size-5 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{skill.name[language]}</h4>
                  <p className="text-xs text-gray-600 mb-2">{skill.description[language]}</p>
                  {!isCompleted && (
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(progress / skill.activities.length) * 100} 
                        className="h-1.5 flex-1" 
                      />
                      <span className="text-xs text-gray-500">
                        {progress}/{skill.activities.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
