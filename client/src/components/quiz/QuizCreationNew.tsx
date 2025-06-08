import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { X, Image, Loader2 } from 'lucide-react';
import axios from 'axios';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoCircledIcon } from '@radix-ui/react-icons';

import MultipleChoiceEditor from './MultipleChoiceEditor';
import QuestionList from './QuestionList';
import AdPlaceholder from '../ads/AdPlaceholder';

// Types
interface Question {
  id?: string;
  text: string;
  imageUrl?: string;
  type: 'multiple-choice';
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
}

const QuizCreation: React.FC<{ username: string }> = ({ username }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for current question being edited
  const [questionText, setQuestionText] = useState('');
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [questionImagePreview, setQuestionImagePreview] = useState<string | null>(null);
  const [options, setOptions] = useState(['', '']);
  const [correctOption, setCorrectOption] = useState<number | null>(null);
  
  // State for all questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // For ad refresh
  const [adRefreshCounter, setAdRefreshCounter] = useState(0);
  
  // Keeping the original 5 question minimum as per user request
  const requiredQuestionsCount = 5;
  const questionsNeeded = Math.max(0, requiredQuestionsCount - questions.length);

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axios.post('/api/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.imageUrl;
    }
  });
  
  // Create quiz mutation
  const createQuizMutation = useMutation({
    mutationFn: async (quizData: { creatorName: string, questions: Question[] }) => {
      const response = await axios.post('/api/quizzes', quizData);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Quiz created successfully!');
      navigate(`/share/${data.urlSlug}`, { 
        state: { 
          accessCode: data.accessCode,
          dashboardToken: data.dashboardToken
        } 
      });
    },
    onError: (error) => {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz. Please try again.');
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }
    
    setQuestionImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setQuestionImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveImage = () => {
    setQuestionImage(null);
    setQuestionImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const validateQuestion = (): boolean => {
    // Validate question text
    if (!questionText.trim()) {
      toast.error('Please enter a question');
      return false;
    }
    
    // Validate options
    const filledOptions = options.filter(opt => opt.trim() !== '');
    if (filledOptions.length < 2) {
      toast.error('Please add at least 2 options');
      return false;
    }
    
    // Validate correct answer selection
    if (correctOption === null) {
      toast.error('Please select a correct answer');
      return false;
    }
    
    return true;
  };
  
  const handleAddQuestion = async () => {
    if (!validateQuestion()) return;
    
    let imageUrl = '';
    
    // Upload image if present
    if (questionImage) {
      try {
        imageUrl = await uploadImageMutation.mutateAsync(questionImage);
      } catch (error) {
        toast.error('Failed to upload image. Please try again.');
        return;
      }
    }
    
    // Create question object
    const newQuestion: Question = {
      text: questionText,
      imageUrl: imageUrl || undefined,
      type: 'multiple-choice',
      options: options.map((text, index) => ({
        text,
        isCorrect: index === correctOption
      })).filter(opt => opt.text.trim() !== '')
    };
    
    // Add or update question
    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = newQuestion;
      setQuestions(updatedQuestions);
      setEditingIndex(null);
      toast.success('Question updated');
    } else {
      setQuestions([...questions, newQuestion]);
      toast({
        title: 'Question added',
        description: `${questions.length + 1} of ${requiredQuestionsCount} questions added`,
      });
    }
    
    // Reset form
    setQuestionText('');
    setQuestionImage(null);
    setQuestionImagePreview(null);
    setOptions(['', '']);
    setCorrectOption(null);
    
    // Refresh ad
    setAdRefreshCounter(prev => prev + 1);
  };
  
  const handleEditQuestion = (index: number) => {
    const question = questions[index];
    
    setQuestionText(question.text);
    setQuestionImagePreview(question.imageUrl || null);
    
    const questionOptions = question.options.map(opt => opt.text);
    setOptions(questionOptions.length >= 2 ? questionOptions : [...questionOptions, '']);
    
    const correctIndex = question.options.findIndex(opt => opt.isCorrect);
    setCorrectOption(correctIndex >= 0 ? correctIndex : null);
    
    setEditingIndex(index);
  };
  
  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    toast.success('Question deleted');
  };
  
  const handleFinishQuiz = () => {
    if (questions.length < requiredQuestionsCount) {
      toast.error(`Please add at least ${requiredQuestionsCount} questions`);
      return;
    }
    
    const quizData = {
      creatorName: username,
      questions: questions
    };
    
    createQuizMutation.mutate(quizData);
  };
  
  return (
    <>
      {/* Important notice */}
      {questions.length < requiredQuestionsCount && (
        <Alert className="mb-6">
          <InfoCircledIcon className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
          Your quiz requires at least {requiredQuestionsCount} questions. You have {questions.length} so far.
          {questions.length < requiredQuestionsCount && ` Please add ${questionsNeeded} more.`}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Question Editor Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* Question Editor */}
          <div className="question-container">
            <div className="mb-4">
              <Label htmlFor="question-text" className="block text-sm font-medium mb-1">
                Question
              </Label>
              <input
                type="text"
                id="question-text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Ask something about yourself..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
            </div>
            
            {/* Image upload area */}
            <div className="mb-6">
              <Label className="block text-sm font-medium mb-2">
                Question Image (Optional)
              </Label>
              
              {questionImagePreview ? (
                <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden mb-2">
                  <img 
                    src={questionImagePreview} 
                    alt="Question preview" 
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors mb-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center">
                    <Image className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-600 mb-1">Click to upload an image</p>
                    <p className="text-xs text-gray-500">PNG, JPG or GIF (max. 10MB)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              )}
            </div>
            
            {/* Multiple choice editor */}
            <MultipleChoiceEditor
              options={options}
              setOptions={setOptions}
              correctOption={correctOption}
              setCorrectOption={setCorrectOption}
            />
          </div>
          
          <Button 
            type="button" 
            className="w-full mt-6" 
            onClick={handleAddQuestion}
            disabled={uploadImageMutation.isPending}
          >
            {uploadImageMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              questions.length > 0 ? "Add Question" : "Add First Question"
            )}
          </Button>
        </CardContent>
      </Card>
      
      {/* Questions List */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-3">Your Questions</h3>
          
          <QuestionList 
            questions={questions} 
            onEdit={handleEditQuestion}
            onDelete={handleDeleteQuestion}
          />
          
          {/* Finalize and Share section */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {questions.length} of {requiredQuestionsCount} questions added
              </span>
              <Button
                type="button"
                className={questions.length >= requiredQuestionsCount ? "btn-primary" : "opacity-50 cursor-not-allowed"}
                disabled={questions.length < requiredQuestionsCount || createQuizMutation.isPending}
                onClick={handleFinishQuiz}
              >
                {createQuizMutation.isPending ? "Creating..." : "Finish & Share"}
              </Button>
            </div>
          </div>
          {/* Ad Placeholder with refresh key to ensure ads reload when questions are added */}
          <AdPlaceholder refreshKey={adRefreshCounter} />
        </CardContent>
      </Card>
    </>
  );
};

export default QuizCreation;
