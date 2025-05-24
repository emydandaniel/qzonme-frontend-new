import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardView from "@/components/quiz/Dashboard";
import ShareQuiz from "@/components/quiz/ShareQuiz";
import { Question, QuizAttempt, Quiz } from "@shared/schema";
import { Loader2, AlertTriangle, Clock } from "lucide-react";
import Layout from "@/components/common/Layout";
import { Card, CardContent } from "@/components/ui/card"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DashboardProps {
  params: {
    token: string;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ params }) => {
  const { token } = params;
  const queryClient = useQueryClient();
  const [showShareView, setShowShareView] = React.useState(false);

  // We no longer want to show the share view when coming to dashboard
  // The share view is only shown after quiz creation
  React.useEffect(() => {
    setShowShareView(false);
  }, [params.token]);

  // Fetch quiz by token
  const { 
    data: quiz, 
    isLoading: isLoadingQuiz,
    error: quizError
  } = useQuery<Quiz>({
    queryKey: [`/api/quizzes/dashboard/${token}`],
  });

  // Use the quizId from the fetched quiz for subsequent queries
  const quizId = quiz?.id;

  // Fetch questions once we have the quizId
  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery<Question[]>({
    queryKey: [`/api/quizzes/${quizId}/questions`],
    enabled: !!quizId,
  });

  // Track the number of refreshes to trigger complete cache clearing periodically
  const [refreshCount, setRefreshCount] = React.useState(0);
  const [lastRefreshTime, setLastRefreshTime] = React.useState(Date.now());

  // Create a unique cache key that changes every time we want to force a complete refresh
  const cacheKey = React.useMemo(() => 
    `dashboard-${quizId}-${refreshCount}-${Date.now()}`, 
    [quizId, refreshCount]
  );
  
  // Use direct state management instead of React Query for attempts data
  const [attempts, setAttempts] = React.useState<QuizAttempt[]>([]);
  const [isLoadingAttempts, setIsLoadingAttempts] = React.useState(true);
  
  // Direct fetch function that bypasses all caching mechanisms
  const fetchAttemptsDirectly = React.useCallback(async () => {
    if (!quizId) return;
    
    try {
      console.log("Dashboard: Direct fetch attempts");
      setIsLoadingAttempts(true);
      
      // Clear React Query cache for this endpoint before fetching
      queryClient.removeQueries({ queryKey: [`/api/quizzes/${quizId}/attempts`] });
      
      // Add cache busting parameters and headers
      const cacheBuster = Date.now();
      const response = await fetch(`/api/quizzes/${quizId}/attempts?t=${cacheBuster}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch attempts');
      }
      
      // Get data and handle the new response format
      const attemptsData = await response.json();
      
      // Extract the attempts array from whatever format the server returns
      const attemptsList = attemptsData.data || attemptsData;
      const serverTime = attemptsData.serverTime || Date.now();
      
      console.log(`Directly fetched ${attemptsList.length} attempts at ${new Date(serverTime).toISOString()}`);
      
      // Update state with fresh data
      setAttempts(attemptsList);
      setIsLoadingAttempts(false);
    } catch (error) {
      console.error('Error directly fetching attempts:', error);
      setIsLoadingAttempts(false);
    }
  }, [quizId, queryClient]);
  
  // Set up regular direct fetching
  React.useEffect(() => {
    if (!quizId) return;
    
    // Fetch immediately
    fetchAttemptsDirectly();
    
    // Set up interval for much less frequent refreshes
    const refreshInterval = setInterval(fetchAttemptsDirectly, 30000); // Every 30 seconds
    
    // Return cleanup function
    return () => {
      clearInterval(refreshInterval);
    };
  }, [quizId, fetchAttemptsDirectly]);

  // Set up a much less frequent hard reload effect (completely separate from the data fetching)
  React.useEffect(() => {
    if (!quizId) return;
    
    // Function for hard page reload - only used very occasionally
    const forcePageReload = () => {
      console.log("FORCE RELOAD: Dashboard page will refresh completely");
      // Add cache busting parameter to reload fresh - this is the nuclear option
      window.location.href = `${window.location.pathname}?t=${Date.now()}`;
    };
    
    // Schedule a hard reload every 5 minutes - much less frequent
    const reloadIntervalId = setInterval(forcePageReload, 300000); // 5 minutes
    
    return () => {
      clearInterval(reloadIntervalId);
    };
  }, [quizId]);

  // Format expiration date if we have a quiz
  const formatExpirationDate = (createdAtString: string | Date) => {
    const createdAt = new Date(createdAtString);
    const expirationDate = new Date(createdAt);
    expirationDate.setDate(expirationDate.getDate() + 7);
    
    return expirationDate.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  // Check if quiz has expired (7 days after creation)
  const isQuizExpired = (createdAtString: string | Date) => {
    const createdAt = new Date(createdAtString);
    const expirationDate = new Date(createdAt);
    expirationDate.setDate(expirationDate.getDate() + 7);
    
    return new Date() > expirationDate;
  };

  if (isLoadingQuiz || (quizId && (isLoadingQuestions || isLoadingAttempts))) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center p-6 min-h-[200px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p>Loading dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizError || !quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-500 mb-2">Dashboard Not Found</h2>
              <p>We couldn't find this dashboard. The token may be invalid or the quiz has expired.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if the quiz has expired
  if (isQuizExpired(quiz.createdAt)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-orange-500 mb-2">Quiz Expired</h2>
              <p>This quiz has expired after the 7-day limit and is no longer accessible.</p>
              <p className="mt-4 text-sm text-muted-foreground">
                Quizzes are automatically removed 7 days after creation to keep the platform fresh.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showShareView) {
    return <ShareQuiz accessCode={quiz.accessCode} quizId={quiz.id} urlSlug={quiz.urlSlug} />;
  }

  console.log("Dashboard rendering with attempts:", attempts);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Expiration Warning */}
      <Alert variant="default" className="mb-6 border-amber-500 bg-amber-50 text-amber-700">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertTitle>Quiz Expiration</AlertTitle>
        <AlertDescription>
          This quiz will expire on {formatExpirationDate(quiz.createdAt)}. After this date, 
          the quiz and dashboard will no longer be accessible.
        </AlertDescription>
      </Alert>
      
      <DashboardView
        quizId={quiz.id}
        accessCode={quiz.accessCode}
        questions={questions}
        attempts={attempts}
      />
    </div>
  );
};

export default Dashboard;
