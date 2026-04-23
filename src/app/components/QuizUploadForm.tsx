import { useState } from 'react';
import { Quiz, QuizQuestion, Subject, Grade, Language } from '@/app/types';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Separator } from '@/app/components/ui/separator';

interface QuizUploadFormProps {
  teacherId: string;
  teacherSubjects: Subject[];
  teacherGrades: Grade[];
  language: Language;
  onUploadComplete: () => void;
}

interface QuestionForm {
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctAnswer: number;
  explanation: string;
}

export function QuizUploadForm({ 
  teacherId, 
  teacherSubjects, 
  teacherGrades,
  language,
  onUploadComplete 
}: QuizUploadFormProps) {
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    subject: teacherSubjects[0],
    grade: teacherGrades[0],
    duration: 30,
    passingScore: 70,
  });

  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswer: 0,
      explanation: '',
    }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswer: 0,
      explanation: '',
    }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: string | number) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that all questions are filled
    const allQuestionsValid = questions.every(q => 
      q.question.trim() && 
      q.option1.trim() && 
      q.option2.trim() && 
      q.option3.trim() && 
      q.option4.trim()
    );

    if (!allQuestionsValid) {
      alert('Please fill in all question fields!');
      return;
    }

    // Create quiz object
    const quiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: {
        en: quizForm.title,
        hi: quizForm.title,
        ta: quizForm.title,
        te: quizForm.title,
        bn: quizForm.title,
      },
      description: {
        en: quizForm.description,
        hi: quizForm.description,
        ta: quizForm.description,
        te: quizForm.description,
        bn: quizForm.description,
      },
      subject: quizForm.subject,
      grade: quizForm.grade,
      questions: questions.map(q => ({
        id: `q-${Date.now()}-${Math.random()}`,
        question: {
          en: q.question,
          hi: q.question,
          ta: q.question,
          te: q.question,
          bn: q.question,
        },
        options: {
          en: [q.option1, q.option2, q.option3, q.option4],
          hi: [q.option1, q.option2, q.option3, q.option4],
          ta: [q.option1, q.option2, q.option3, q.option4],
          te: [q.option1, q.option2, q.option3, q.option4],
          bn: [q.option1, q.option2, q.option3, q.option4],
        },
        correctAnswer: q.correctAnswer,
        explanation: q.explanation ? {
          en: q.explanation,
          hi: q.explanation,
          ta: q.explanation,
          te: q.explanation,
          bn: q.explanation,
        } : undefined,
      })),
      duration: quizForm.duration,
      passingScore: quizForm.passingScore,
      createdBy: teacherId,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem(`quiz-${quiz.id}`, JSON.stringify(quiz));
    
    // Also add to a quizzes list for easier retrieval
    const quizzesList = JSON.parse(localStorage.getItem('quizzes-list') || '[]');
    quizzesList.push(quiz.id);
    localStorage.setItem('quizzes-list', JSON.stringify(quizzesList));

    console.log('✅ Quiz uploaded successfully:', quiz);
    alert(`Quiz "${quizForm.title}" uploaded successfully with ${questions.length} questions!`);
    
    // Reset form
    setQuizForm({
      title: '',
      description: '',
      subject: teacherSubjects[0],
      grade: teacherGrades[0],
      duration: 30,
      passingScore: 70,
    });
    
    setQuestions([{
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswer: 0,
      explanation: '',
    }]);

    onUploadComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quiz Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Information</CardTitle>
          <CardDescription>Basic details about the quiz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="quiz-title">Quiz Title *</Label>
            <Input
              id="quiz-title"
              value={quizForm.title}
              onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
              required
              placeholder="e.g., Fractions and Decimals Quiz"
            />
          </div>

          <div>
            <Label htmlFor="quiz-description">Description *</Label>
            <Textarea
              id="quiz-description"
              value={quizForm.description}
              onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
              required
              placeholder="Describe what this quiz covers..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quiz-subject">Subject *</Label>
              <Select
                value={quizForm.subject}
                onValueChange={(v) => setQuizForm({ ...quizForm, subject: v as Subject })}
              >
                <SelectTrigger id="quiz-subject">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teacherSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quiz-grade">Class *</Label>
              <Select
                value={quizForm.grade}
                onValueChange={(v) => setQuizForm({ ...quizForm, grade: v as Grade })}
              >
                <SelectTrigger id="quiz-grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teacherGrades.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      Class {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quiz-duration">Duration (minutes) *</Label>
              <Input
                id="quiz-duration"
                type="number"
                value={quizForm.duration}
                onChange={(e) => setQuizForm({ ...quizForm, duration: parseInt(e.target.value) })}
                required
                min="5"
                max="180"
              />
            </div>

            <div>
              <Label htmlFor="quiz-passing">Passing Score (%) *</Label>
              <Input
                id="quiz-passing"
                type="number"
                value={quizForm.passingScore}
                onChange={(e) => setQuizForm({ ...quizForm, passingScore: parseInt(e.target.value) })}
                required
                min="0"
                max="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Questions ({questions.length})</CardTitle>
              <CardDescription>Add multiple choice questions for your quiz</CardDescription>
            </div>
            <Button type="button" onClick={addQuestion} size="sm" variant="outline">
              <Plus className="size-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="p-4 border rounded-lg space-y-4 relative">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Question {qIndex + 1}</h4>
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    <Trash2 className="size-4 text-red-600" />
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor={`question-${qIndex}`}>Question Text *</Label>
                <Textarea
                  id={`question-${qIndex}`}
                  value={question.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  required
                  placeholder="Enter your question here..."
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <Label>Answer Options *</Label>
                <RadioGroup
                  value={question.correctAnswer.toString()}
                  onValueChange={(v) => updateQuestion(qIndex, 'correctAnswer', parseInt(v))}
                >
                  {[0, 1, 2, 3].map((optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <RadioGroupItem 
                        value={optionIndex.toString()} 
                        id={`q${qIndex}-opt${optionIndex}`}
                      />
                      <Input
                        value={question[`option${optionIndex + 1}` as keyof QuestionForm] as string}
                        onChange={(e) => updateQuestion(qIndex, `option${optionIndex + 1}` as keyof QuestionForm, e.target.value)}
                        required
                        placeholder={`Option ${optionIndex + 1}`}
                        className="flex-1"
                      />
                      <Label 
                        htmlFor={`q${qIndex}-opt${optionIndex}`}
                        className="text-xs text-gray-500 min-w-[80px]"
                      >
                        {optionIndex === question.correctAnswer ? '✓ Correct' : 'Mark as correct'}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor={`explanation-${qIndex}`}>Explanation (Optional)</Label>
                <Textarea
                  id={`explanation-${qIndex}`}
                  value={question.explanation}
                  onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                  placeholder="Explain why this answer is correct..."
                  rows={2}
                />
              </div>

              {qIndex < questions.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
          <Upload className="size-4 mr-2" />
          Upload Quiz ({questions.length} {questions.length === 1 ? 'Question' : 'Questions'})
        </Button>
      </div>
    </form>
  );
}
