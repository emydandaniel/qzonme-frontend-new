import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Quiz, Question, QuestionAnswer } from "@/lib/schema";
import QuizAnswer from "@/components/quiz/QuizAnswer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/common/Layout";
import MetaTags from "@/components/common/MetaTags";
import { isQuizExpired, QUIZ_EXPIRY_MESSAGES } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AnswerQuizProps {
  params: {
    accessCode?: string;
    creatorSlug?: string;
  };
}

interface QuizAttempt {
  quizId: string | number;
  userAnswerId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  answers: QuestionAnswer[];
  completedAt?: string;
}

const AnswerQuiz: React.FC<AnswerQuizProps> = ({ params }) => {
  const { accessCode, creatorSlug } = params;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Try both possible keys to maintain compatibility
  const userName = sessionStorage.getItem("userName") || sessionStorage.getItem("username") || "";
  const userId = parseInt(sessionStorage.getItem("userId") || "0");
  
  // Verify user session exists
  React.useEffect(() => {
    if (!userName || !userId) {
      // Save the quiz params to session storage and redirect to home
      if (accessCode) {
        sessionStorage.setItem("pendingQuizCode", accessCode);
      } else if (creatorSlug) {
        sessionStorage.setItem("pendingQuizSlug", creatorSlug);
      }
      navigate("/");
      return;
    }
  }, [accessCode, creatorSlug, userName, userId, navigate]);

  // Determine API endpoint
  const isUsingAccessCode = !!accessCode && !creatorSlug;
  const identifier = isUsingAccessCode ? accessCode : creatorSlug;
  const endpoint = isUsingAccessCode ? `/api/quizzes/code/${identifier}` : `/api/quizzes/slug/${identifier}`;

  // Generate unique cache key per attempt
  const cacheKey = React.useMemo(() => `quiz-${identifier}-${Date.now()}`, [identifier]);

  // Fetch quiz with better error handling
  const { data: quiz, isLoading: isLoadingQuiz, error: quizError } = useQuery<Quiz>({
    queryKey: [endpoint, cacheKey],
    enabled: !!identifier && !!userName && !!userId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", endpoint);
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error);
        }
        const quizData = await response.json();
        
        // Check if quiz has expired
        if (quizData.expiresAt && isQuizExpired(quizData.expiresAt)) {
          throw new Error(QUIZ_EXPIRY_MESSAGES.expired);
        }
        
        return quizData;
      } catch (error) {
        console.error("Quiz loading error:", error);
        throw error;
      }
    }
  });
  
  console.log("AnswerQuiz - quiz data:", { 
    quizId: quiz?.id, 
    creatorName: quiz?.creatorName,
    accessCode: quiz?.accessCode
  });

  // Fetch questions with proper error handling
  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery<Question[]>({
    queryKey: [`/api/quizzes/${quiz?.id}/questions`, cacheKey],
    enabled: !!quiz?.id,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/quizzes/${quiz?.id}/questions`);
      if (!response.ok) {
        throw new Error("Failed to load questions");
      }
      return response.json();
    }
  });

  // Submit attempt mutation
  const submitAttemptMutation = useMutation<void, Error, QuizAttempt>({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/quiz-attempts", {
        quizId: quiz?.id,
        userAnswerId: userId.toString(),
        userName: userName,
        score: Math.min(data.score, questions.length),
        totalQuestions: questions.length,
        answers: data.answers.map(answer => ({
          ...answer,
          questionId: answer.questionId.toString()
        }))
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your answers have been submitted successfully!",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit answers",
        variant: "destructive",
      });
    }
  });

  const handleQuizComplete = (answers: QuestionAnswer[], score: number) => {
    submitAttemptMutation.mutate({
      quizId: quiz?.id || 0,
      userAnswerId: userId.toString(),
      userName,
      score,
      totalQuestions: questions.length,
      answers
    });
  };

  // Show loading state
  if (isLoadingQuiz || isLoadingQuestions) {
    return (
      <Layout>
        <Card className="w-full max-w-2xl mx-auto mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  // Show error state
  if (quizError || !quiz) {
    return (
      <Layout>
        <Card className="w-full max-w-2xl mx-auto mt-8">
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              {quizError instanceof Error ? quizError.message : "Failed to load quiz"}
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  // Check if the quiz has expired
  if (quiz.expiresAt && isQuizExpired(quiz.expiresAt)) {
    return (
      <Layout>
        <MetaTags 
          title="Quiz Expired | QzonMe"
          description="This quiz has expired after the 7-day limit and is no longer accessible."
        />
        
        <h1 className="text-3xl font-bold mb-6">Quiz Expired</h1>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <img src="/favicon.png" alt="QzonMe Logo" className="h-16 w-16" />
              </div>
              <p className="mb-4">
                {QUIZ_EXPIRY_MESSAGES.expired}
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate("/")}
                  variant="outline"
                >
                  Back to Home
                </Button>
                
                <Button 
                  onClick={() => navigate("/find-quiz")}
                  className="btn-primary"
                >
                  Find a Quiz
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <MetaTags 
        title={`${quiz.creatorName}'s Quiz | QzonMe`}
        description={`Take ${quiz.creatorName}'s personalized quiz and see how well you really know them!`}
      />
      
      <QuizAnswer
        quizId={quiz.id}
        quizCreator={quiz.creatorName}
        questions={questions}
        onComplete={handleQuizComplete}
      />
    </Layout>
  );
};

export default AnswerQuiz;
