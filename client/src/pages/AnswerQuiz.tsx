import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { questionAnswerSchema, QuestionAnswer, Quiz, Question } from "@shared/schema";
import QuizAnswer from "@/components/quiz/QuizAnswer";
import { calculateScore } from "@/lib/quizUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/common/Layout";
import MetaTags from "@/components/common/MetaTags";

interface AnswerQuizProps {
  params: {
    accessCode?: string;
    creatorSlug?: string;
  };
}

const AnswerQuiz: React.FC<AnswerQuizProps> = ({ params }) => {
  const { accessCode, creatorSlug } = params;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Try both possible keys to maintain compatibility
  const userName = sessionStorage.getItem("userName") || sessionStorage.getItem("username") || "";
  const userId = parseInt(sessionStorage.getItem("userId") || "0");

  // Check if user is logged in, if not, save the quiz info and redirect to home
  React.useEffect(() => {
    if (!userName || !userId) {
      // Save the quiz params to session storage
      if (accessCode) {
        sessionStorage.setItem("pendingQuizCode", accessCode);
      } else if (creatorSlug) {
        sessionStorage.setItem("pendingQuizSlug", creatorSlug);
      }
      
      // Redirect to home page to enter name
      navigate("/");
      return;
    }
  }, [accessCode, creatorSlug, navigate, userName, userId]);

  // Determine if we're using access code or creator slug
  const isUsingAccessCode = !!accessCode && !creatorSlug;
  const identifier = isUsingAccessCode ? accessCode : creatorSlug;
  const endpoint = isUsingAccessCode ? `/api/quizzes/code/${identifier}` : `/api/quizzes/slug/${identifier}`;

  // Helper function to check if a quiz has expired
  const isQuizExpired = (createdAtString: string | Date) => {
    const createdAt = new Date(createdAtString);
    const expirationDate = new Date(createdAt);
    expirationDate.setDate(expirationDate.getDate() + 30);
    
    return new Date() > expirationDate;
  };

  // Generate unique cache key for this particular quiz attempt
  const cacheKey = React.useMemo(() => `quiz-${identifier}-${Date.now()}`, [identifier]);

  // Fetch quiz by access code or URL slug with aggressive cache invalidation
  const { data: quiz, isLoading: isLoadingQuiz, error: quizError } = useQuery<Quiz>({
    queryKey: [endpoint, cacheKey],
    enabled: !!identifier && !!userName && !!userId,
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    staleTime: 0, // Don't use stale data
    gcTime: 0, // Don't cache at all
    refetchOnMount: "always", // Always refetch on mount
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });
  
  console.log("AnswerQuiz - quiz data:", { 
    quizId: quiz?.id, 
    creatorName: quiz?.creatorName,
    accessCode: quiz?.accessCode
  });

  // Fetch questions for the quiz with aggressive cache invalidation
  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery<Question[]>({
    queryKey: [`/api/quizzes/${quiz?.id}/questions`, cacheKey],
    enabled: !!quiz?.id,
    staleTime: 0, // Don't use stale data
    gcTime: 0, // Don't cache at all
    refetchOnMount: "always", // Always refetch on mount
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });

  // Submit quiz attempt
  const submitAttemptMutation = useMutation({
    mutationFn: async (data: {
      answers: QuestionAnswer[];
      score: number;
    }) => {
      const response = await apiRequest("POST", "/api/quiz-attempts", {
        quizId: quiz?.id,
        userAnswerId: userId,
        userName,
        score: data.score,
        totalQuestions: questions.length,
        answers: data.answers
      });
      return response.json();
    },
    onSuccess: (data) => {
      navigate(`/results/${quiz?.id}/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit quiz attempt",
        variant: "destructive"
      });
    }
  });

  const handleQuizComplete = (answers: QuestionAnswer[], score: number) => {
    submitAttemptMutation.mutate({ answers, score });
  };

  if (isLoadingQuiz || isLoadingQuestions) {
    return (
      <Layout>
        <MetaTags 
          title="Loading Quiz | QzonMe - How Well Do Your Friends Know You?"
          description="Loading a personalized quiz on QzonMe. Take the quiz to see how well you know your friend!"
        />
        
        <h1 className="text-3xl font-bold mb-6">Loading Quiz</h1>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-40">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading quiz...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Preparing questions and answers for you to test your knowledge
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Additional content for SEO purposes */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">About QzonMe Quizzes</h2>
          <p className="mb-4">
            QzonMe offers fun and interactive quizzes that test how well your friends know you. 
            Each quiz is personalized by the creator and contains multiple-choice questions that 
            can include images and personal details.
          </p>
          
          <h3 className="text-lg font-semibold mb-2">How It Works</h3>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Answer each question to the best of your knowledge</li>
            <li>Get instant feedback on your answers</li>
            <li>See your final score and how you compare to others</li>
            <li>Share your results on social media</li>
          </ul>
          
          <p className="text-muted-foreground">
            All quizzes remain active for 7 days after creation, after which they're automatically deleted 
            to maintain data privacy and keep content fresh.
          </p>
        </div>
      </Layout>
    );
  }

  if (quizError || !quiz) {
    // Convert error object to string for debugging
    const errorMessage = quizError instanceof Error 
      ? quizError.message
      : 'Unknown error occurred';
    
    // Extract more details if it's a response error
    let detailedError = "Quiz not found";
    try {
      if (errorMessage && errorMessage.includes('{')) {
        const jsonPart = errorMessage.substring(errorMessage.indexOf('{'));
        const errorObj = JSON.parse(jsonPart);
        detailedError = errorObj.message || 'Quiz not found';
      }
    } catch (e) {
      detailedError = "Quiz not found";
    }

    console.log("Quiz error details:", { errorMessage, detailedError });
    
    return (
      <Layout>
        <MetaTags 
          title="Quiz Not Found | QzonMe"
          description="We couldn't find the quiz you're looking for. It may have expired or the link is incorrect."
        />
        
        <h1 className="text-3xl font-bold mb-6">Quiz Not Found</h1>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <img src="/favicon.png" alt="QzonMe Logo" className="h-16 w-16" />
              </div>
              <p className="mb-4">
                We couldn't find a quiz with the identifier: <br />
                <code className="bg-gray-100 p-1 rounded">{identifier}</code>
              </p>
              <p className="text-sm text-gray-600 mb-6">
                This quiz may have expired or the link is incorrect.<br />
                Would you like to find a different quiz?
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
  
  // Check if the quiz has expired (7 days after creation)
  if (isQuizExpired(quiz.createdAt)) {
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
                This quiz has expired after the 7-day limit and is no longer accessible.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                All quizzes on QzonMe are automatically removed 7 days after creation.<br />
                Would you like to find a different quiz?
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
      {/* Add meta tags for better WhatsApp sharing preview */}
      <MetaTags 
        title={`${quiz.creatorName}'s Quiz | How Well Do You Know Me? | QzonMe`}
        description={`Take ${quiz.creatorName}'s personalized quiz and see how well you really know them! Answer questions, get scored, and compare results with friends.`}
        creatorName={quiz.creatorName}
        url={window.location.href}
        imageUrl="/favicon.png"
        type="quiz"
      />
      
      {/* Quiz Title */}
      <h1 className="text-3xl font-bold mb-6">{quiz.creatorName}'s Quiz</h1>
      
      {/* Descriptive content for SEO - hidden on mobile for better UX */}
      <div className="hidden md:block mb-4">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <p className="text-muted-foreground">
                This quiz was created by {quiz.creatorName} to test how well you know them.
                Answer all the questions carefully to get the highest score!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-4 mb-2">
              <div className="bg-muted p-3 rounded-lg">
                <h3 className="font-semibold mb-1">Total Questions</h3>
                <p>{questions.length} questions to answer</p>
              </div>
              
              <div className="bg-muted p-3 rounded-lg">
                <h3 className="font-semibold mb-1">Scoring</h3>
                <p>Get scored based on your answers</p>
              </div>
              
              <div className="bg-muted p-3 rounded-lg">
                <h3 className="font-semibold mb-1">Results</h3>
                <p>See where you rank on the leaderboard</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
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
