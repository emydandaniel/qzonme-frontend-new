import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardView from "@/components/quiz/Dashboard";
import ShareQuiz from "@/components/quiz/ShareQuiz";
import { Question, QuizAttempt, Quiz } from "@/lib/schema";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { isQuizExpired, QUIZ_EXPIRY_MESSAGES } from '@/lib/utils';

interface DashboardProps {
  params: {
    token: string;
  };
}

// Response type for attempts API
interface AttemptsResponse {
  data: QuizAttempt[];
  serverTime: number;
}

const REFRESH_INTERVAL = 30000; // 30 seconds

const Dashboard: React.FC<DashboardProps> = ({ params }) => {
  const { token } = params;
  const queryClient = useQueryClient();
  const [showShareView, setShowShareView] = React.useState(false);

  // Fetch quiz with proper error handling and expiry check
  const { 
    data: quiz, 
    isLoading: isLoadingQuiz,
    error: quizError
  } = useQuery<Quiz>({
    queryKey: [`/api/quizzes/dashboard/${token}`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/quizzes/dashboard/${token}`);
      if (!response.ok) {
        throw new Error("Failed to load quiz");
      }
      return response.json();
    },
    refetchInterval: REFRESH_INTERVAL
  });

  // Fetch questions with proper caching
  const { 
    data: questions = [], 
    isLoading: isLoadingQuestions 
  } = useQuery<Question[]>({
    queryKey: [`/api/quizzes/${quiz?.id}/questions`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/quizzes/${quiz?.id}/questions`);
      if (!response.ok) {
        throw new Error("Failed to load questions");
      }
      return response.json();
    },
    enabled: !!quiz?.id,
    staleTime: REFRESH_INTERVAL
  });

  // Fetch attempts with real-time updates
  const { 
    data: attempts = [], 
    isLoading: isLoadingAttempts,
    refetch: refetchAttempts 
  } = useQuery<QuizAttempt[]>({
    queryKey: [`/api/quizzes/${quiz?.id}/attempts`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/quizzes/${quiz?.id}/attempts`);
      if (!response.ok) {
        throw new Error("Failed to load attempts");
      }
      const data: AttemptsResponse | QuizAttempt[] = await response.json();
      return Array.isArray(data) ? data : data.data;
    },
    enabled: !!quiz?.id,
    refetchInterval: REFRESH_INTERVAL
  });

  // Refetch attempts when the window regains focus
  React.useEffect(() => {
    const onFocus = () => {
      if (quiz?.id) {
        refetchAttempts();
      }
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [quiz?.id, refetchAttempts]);

  // Show loading state
  if (isLoadingQuiz || isLoadingQuestions) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (quizError || !quiz) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {quizError instanceof Error ? quizError.message : "Failed to load quiz"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Show expired quiz state
  if (quiz.expiresAt && isQuizExpired(quiz.expiresAt)) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardContent className="p-6">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Quiz Expired</AlertTitle>
            <AlertDescription>{QUIZ_EXPIRY_MESSAGES.expired}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return showShareView ? (
    <ShareQuiz 
      quizId={quiz.id.toString()}
      urlSlug={quiz.urlSlug}
      creatorName={quiz.creatorName}
    />
  ) : (
    <DashboardView 
      quizId={quiz.id}
      questions={questions}
      attempts={attempts}
    />
  );
};

export default Dashboard;
