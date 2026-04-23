import { useState } from 'react';
import { Quiz, Language } from '@/app/types';
import { getTranslation } from '@/app/utils/localization';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { ArrowLeft, CheckCircle, XCircle, Trophy } from 'lucide-react';

interface QuizViewerProps {
  quiz: Quiz;
  language: Language;
  onComplete: (quizId: string, score: number, totalQuestions: number) => void;
  onBack: () => void;
}

export function QuizViewer({ quiz, language, onComplete, onBack }: QuizViewerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Validate quiz has questions
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Quiz Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">This quiz has no questions.</p>
            <Button onClick={onBack} className="w-full">
              <ArrowLeft className="size-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalQuestions = quiz.questions.length;
  const currentQ = quiz.questions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score and show results
      const correctCount = selectedAnswers.reduce((count, answer, idx) => {
        return count + (answer === quiz.questions[idx].correctAnswer ? 1 : 0);
      }, 0);
      setShowResults(true);
    }
  };

  const handleFinish = () => {
    const correctCount = selectedAnswers.reduce((count, answer, idx) => {
      return count + (answer === quiz.questions[idx].correctAnswer ? 1 : 0);
    }, 0);
    onComplete(quiz.id, correctCount, totalQuestions);
  };

  if (showResults) {
    const correctCount = selectedAnswers.reduce((count, answer, idx) => {
      return count + (answer === quiz.questions[idx].correctAnswer ? 1 : 0);
    }, 0);
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= quiz.passingScore;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="size-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className={`border-2 ${passed ? 'border-green-500' : 'border-orange-500'}`}>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full ${passed ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <Trophy className={`size-12 ${passed ? 'text-green-600' : 'text-orange-600'}`} />
                  </div>
                </div>
                <CardTitle className="text-2xl">
                  {passed ? 'Congratulations! 🎉' : 'Good Effort! 💪'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <div className="text-5xl font-bold mb-2">{scorePercentage}%</div>
                  <p className="text-gray-600">
                    {correctCount} out of {totalQuestions} correct
                  </p>
                </div>
                <Progress value={scorePercentage} className="h-3" />
                <p className="text-sm text-gray-600">
                  {passed 
                    ? 'You passed the quiz! Keep up the great work!' 
                    : 'Review the lesson and try again to improve your score.'}
                </p>
              </CardContent>
            </Card>

            {/* Review Answers */}
            <Card>
              <CardHeader>
                <CardTitle>Review Your Answers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {quiz.questions.map((question, idx) => {
                  const userAnswer = selectedAnswers[idx];
                  const isCorrect = userAnswer === question.correctAnswer;

                  return (
                    <div key={question.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start gap-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="size-5 text-red-600 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-2">
                            {idx + 1}. {question.question?.[language] || question.question?.en || 'Question'}
                          </p>
                          <div className="space-y-1 text-sm">
                            <p className={userAnswer === question.correctAnswer ? 'text-green-600' : 'text-red-600'}>
                              Your answer: {question.options?.[language]?.[userAnswer] || 'N/A'}
                            </p>
                            {!isCorrect && (
                              <p className="text-green-600">
                                Correct answer: {question.options?.[language]?.[question.correctAnswer] || 'N/A'}
                              </p>
                            )}
                            {question.explanation?.[language] && (
                              <p className="text-gray-600 italic mt-2">
                                {question.explanation[language]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack} className="flex-1">
                Back to Dashboard
              </Button>
              <Button onClick={handleFinish} className="flex-1">
                {getTranslation('finish', language)}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="size-4 mr-2" />
              Cancel
            </Button>
            <div className="flex-1 mx-4">
              <h1 className="text-xl font-bold text-center mb-2">
                {quiz.title?.[language] || quiz.title?.en || 'Quiz'}
              </h1>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-center text-gray-600 mt-1">
                Question {currentQuestion + 1} / {totalQuestions}
              </p>
            </div>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {currentQ.question?.[language] || currentQ.question?.en || 'Question'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={selectedAnswers[currentQuestion]?.toString()}
                onValueChange={(value) => handleAnswerSelect(parseInt(value))}
              >
                <div className="space-y-3">
                  {(currentQ.options?.[language] || currentQ.options?.en || []).map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer text-base">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQuestion] === undefined}
                >
                  {currentQuestion === totalQuestions - 1
                    ? getTranslation('submit', language)
                    : getTranslation('next', language)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
