import { useState } from 'react';
import { Lesson, Language } from '@/app/types';
import { getTranslation } from '@/app/utils/localization';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

interface LessonViewerProps {
  lesson: Lesson;
  language: Language;
  onComplete: () => void;
  onBack: () => void;
}

export function LessonViewer({ lesson, language, onComplete, onBack }: LessonViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = lesson.content.length;
  const progressPercentage = ((currentSlide + 1) / totalSlides) * 100;

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const currentContent = lesson.content[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="size-4 mr-2" />
              {getTranslation('previous', language)}
            </Button>
            <div className="flex-1 mx-4">
              <h1 className="text-xl font-bold text-center mb-2">
                {lesson.title[language]}
              </h1>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-center text-gray-600 mt-1">
                {currentSlide + 1} / {totalSlides}
              </p>
            </div>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="min-h-[400px] flex flex-col justify-center">
                {currentContent.type === 'text' && (
                  <div className="prose prose-lg max-w-none">
                    <p className="text-xl leading-relaxed">
                      {currentContent.content[language]}
                    </p>
                  </div>
                )}

                {currentContent.type === 'interactive' && (
                  <div className="text-center space-y-6">
                    <div className="text-4xl md:text-6xl font-bold text-blue-600 tracking-wider">
                      {currentContent.content[language]}
                    </div>
                    <p className="text-gray-600">
                      Practice counting along!
                    </p>
                  </div>
                )}

                {currentContent.type === 'image' && currentContent.imageUrl && (
                  <div className="space-y-4">
                    <img 
                      src={currentContent.imageUrl} 
                      alt="Lesson content"
                      className="w-full rounded-lg shadow-md"
                    />
                    <p className="text-lg text-center">
                      {currentContent.content[language]}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-8 pt-8 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentSlide === 0}
                >
                  <ArrowLeft className="size-4 mr-2" />
                  {getTranslation('previous', language)}
                </Button>

                <div className="flex gap-2">
                  {Array.from({ length: totalSlides }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 w-2 rounded-full ${
                        idx === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <Button onClick={handleNext}>
                  {currentSlide === totalSlides - 1 ? (
                    <>
                      <CheckCircle className="size-4 mr-2" />
                      {getTranslation('finish', language)}
                    </>
                  ) : (
                    <>
                      {getTranslation('next', language)}
                      <ArrowRight className="size-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
