import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Question, QuestionAnswer } from "@shared/schema";
import { createAvatarPlaceholder, showAdInterstitial } from "@/lib/utils";
import { verifyAnswer } from "@/lib/quizUtils";
import { apiRequest } from "@/lib/queryClient";
import AdPlaceholder from "../common/AdPlaceholder";

interface QuizAnswerProps {
  quizId: number;
  quizCreator: string;
  questions: Question[];
  onComplete: (answers: QuestionAnswer[], score: number) => void;
}

const QuizAnswer: React.FC<QuizAnswerProps> = ({ 
  quizId, 
  quizCreator, 
  questions, 
  onComplete 
}) => {
  // Generate a unique storage key for this quiz session
  const storageKeyPrefix = `qzonme_quiz_${quizId}_`;
  
  // Load from localStorage if available, otherwise start fresh
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(`${storageKeyPrefix}currentIndex`);
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  });
  
  const [userAnswers, setUserAnswers] = useState<QuestionAnswer[]>(() => {
    try {
      const saved = localStorage.getItem(`${storageKeyPrefix}answers`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          console.log("Restored saved answers from local storage:", parsed.length);
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading saved answers:", e);
    }
    return [];
  });
  
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [adRefreshCounter, setAdRefreshCounter] = useState(0);
  const { toast } = useToast();
  
  // Save to localStorage whenever answers or current index changes
  useEffect(() => {
    try {
      if (userAnswers.length > 0) {
        localStorage.setItem(`${storageKeyPrefix}answers`, JSON.stringify(userAnswers));
        localStorage.setItem(`${storageKeyPrefix}currentIndex`, currentQuestionIndex.toString());
        console.log("Saved quiz progress to local storage:", {
          currentQuestionIndex,
          answersCount: userAnswers.length
        });
      }
    } catch (e) {
      console.error("Error saving quiz progress:", e);
    }
  }, [userAnswers, currentQuestionIndex, storageKeyPrefix]);
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  // Calculate progress percentage
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  // Calculate progress dots (maximum 5 dots)
  const progressDots = Array(Math.min(questions.length, 5))
    .fill(null)
    .map((_, i) => i <= currentQuestionIndex);
  
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };
  
  const verifyAnswerMutation = useMutation({
    mutationFn: async (answer: string | string[]) => {
      const result = await verifyAnswer(currentQuestion.id, answer);
      return result;
    }
  });
  
  const handleNext = async () => {
    // Check if an answer is selected
    if (!selectedOption) {
      toast({
        title: "Please select an answer",
        description: "You must select an option to continue",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Verify if the answer is correct
      const isCorrect = await verifyAnswerMutation.mutateAsync(selectedOption);
      
      // Save the answer
      const questionAnswer: QuestionAnswer = {
        questionId: currentQuestion.id,
        userAnswer: selectedOption,
        isCorrect
      };
      
      const updatedAnswers = [...userAnswers, questionAnswer];
      setUserAnswers(updatedAnswers);
      
      // Reset inputs for next question
      setSelectedOption("");
      
      // Increment ad refresh counter to reload ads
      setAdRefreshCounter(prev => prev + 1);
      
      // Show interstitial ad every 5 questions
      if ((currentQuestionIndex + 1) % 5 === 0) {
        showAdInterstitial();
      }
      
      // If this was the last question, complete the quiz
      if (isLastQuestion) {
        // Calculate the score (correct answers count)
        const correctAnswers = updatedAnswers.filter(a => a.isCorrect).length;
        
        // Ensure score cannot exceed total questions
        const validScore = Math.min(correctAnswers, questions.length);
        
        console.log("Quiz completed - calculated score:", {
          correctAnswers,
          totalQuestions: questions.length,
          finalScore: validScore
        });
        
        // Clear saved answers from localStorage when quiz is completed
        localStorage.removeItem(`${storageKeyPrefix}answers`);
        localStorage.removeItem(`${storageKeyPrefix}currentIndex`);
        console.log("Cleared quiz progress from local storage after completion");
        
        onComplete(updatedAnswers, validScore);
      } else {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      // Remove the last answer
      const updatedAnswers = [...userAnswers];
      updatedAnswers.pop();
      setUserAnswers(updatedAnswers);
      
      // Go back to previous question
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  if (questions.length === 0) {
    return (
      <>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center mb-6 justify-center">
              <div 
                className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center text-primary font-semibold"
              >
                {createAvatarPlaceholder(quizCreator)}
              </div>
              <div className="ml-3">
                <h2 className="font-poppins font-semibold">{quizCreator}'s Quiz</h2>
                <p className="text-sm text-muted-foreground">
                  How well do you know {quizCreator}?
                </p>
              </div>
            </div>
            
            <div className="py-8">
              <h3 className="text-xl font-semibold mb-4">This quiz doesn't have any questions yet!</h3>
              <p className="text-muted-foreground mb-6">
                {quizCreator} is still setting up this quiz. Please check back later.
              </p>
              <Button onClick={() => window.location.href = "/"}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }
  
  if (!currentQuestion) {
    return (
      <>
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading questions...</p>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Card>
        <CardContent className="pt-6">
          {/* Quiz Creator Info */}
          <div className="flex items-center mb-6">
            <div 
              className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center text-primary font-semibold"
            >
              {createAvatarPlaceholder(quizCreator)}
            </div>
            <div className="ml-3">
              <h2 className="font-poppins font-semibold">{quizCreator}'s Quiz</h2>
              <p className="text-sm text-muted-foreground">
                Let's see how well you know {quizCreator}
              </p>
            </div>
          </div>
          
          {/* Progress indicator with number */}
          <div className="mb-3 flex justify-between items-center text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progressPercentage)}% complete</span>
          </div>
          
          {/* Progress bar */}
          <div className="mb-6">
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          {/* Question container */}
          <div className="question-container">
            <div className="text-center mb-6">
              <h3 className="text-xl font-poppins font-semibold mb-2">
                {currentQuestion.text}
              </h3>
              
              {/* Display question image if available with loading indicator */}
              {currentQuestion.imageUrl && (
                <div className="mt-3 mb-4 relative">
                  {/* Loading placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="animate-pulse text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Loading image...</p>
                    </div>
                  </div>
                  
                  {/* Actual image with preload */}
                  <img 
                    src={currentQuestion.imageUrl} 
                    alt="Question image" 
                    className="max-w-full max-h-64 mx-auto rounded-lg relative z-10"
                    onLoad={(e) => {
                      // Hide placeholder once image is loaded
                      const target = e.target as HTMLImageElement;
                      const parent = target.parentElement;
                      if (parent && parent.firstElementChild) {
                        parent.firstElementChild.classList.add('hidden');
                      }
                    }}
                    loading="eager" // Force eager loading
                  />
                </div>
              )}
            </div>
            
            {/* Multiple choice options */}
            <div className="space-y-3">
              {(currentQuestion.options as string[]).map((option, index) => (
                <label 
                  key={index}
                  className={`block p-3 bg-white border ${
                    selectedOption === option ? 'border-primary' : 'border-gray-200'
                  } rounded-lg hover:border-primary cursor-pointer transition-colors`}
                  onClick={() => handleOptionSelect(option)}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full ${
                      selectedOption === option ? 'bg-primary' : 'border-2 border-gray-300'
                    } mr-3 flex-shrink-0`}></div>
                    <span>{option}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <Button 
              type="button" 
              className="btn-secondary" 
              onClick={handleBack}
              disabled={currentQuestionIndex === 0 || verifyAnswerMutation.isPending}
            >
              Back
            </Button>
            <Button 
              type="button" 
              className="btn-primary" 
              onClick={handleNext}
              disabled={verifyAnswerMutation.isPending}
            >
              {isLastQuestion ? "Submit" : "Next Question"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Ad Placeholder with refresh key to ensure ads reload when questions are answered */}
      <AdPlaceholder refreshKey={adRefreshCounter} />
    </>
  );
};

export default QuizAnswer;
