import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ResultsView from "@/components/quiz/ResultsView";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/common/Layout";
import { Loader2 } from "lucide-react";

interface ResultsProps {
  params: {
    quizId: string;
    attemptId: string;
  };
}

const Results: React.FC<ResultsProps> = ({ params }) => {
  const quizId = parseInt(params.quizId);
  const attemptId = parseInt(params.attemptId);
  // Check both possible keys for username compatibility
  const userName = sessionStorage.getItem("userName") || sessionStorage.getItem("username") || "";
  const queryClient = useQueryClient();

  // Implement direct fetch approach that ignores all caching
  const [rawAttempts, setRawAttempts] = React.useState<any[]>([]);
  const [rawAttempt, setRawAttempt] = React.useState<any>(null);
  
  // Direct fetch with no caching
  const fetchAllDataDirectly = React.useCallback(async () => {
    if (!quizId || !attemptId) return;
    
    try {
      console.log("Results page: Directly fetching fresh data");
      const timestamp = Date.now();
      
      // Fetch attempts with cache busting
      const attemptsResponse = await fetch(`/api/quizzes/${quizId}/attempts?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      // Fetch this specific attempt with cache busting
      const attemptResponse = await fetch(`/api/quiz-attempts/${attemptId}?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (attemptsResponse.ok && attemptResponse.ok) {
        const attemptsData = await attemptsResponse.json();
        const attemptData = await attemptResponse.json();
        
        const attemptsList = attemptsData.data || attemptsData;
        const attemptResult = attemptData.data || attemptData;
        
        console.log(`Results page: Direct fetch retrieved ${attemptsList.length} attempts`);
        
        setRawAttempts(attemptsList);
        setRawAttempt(attemptResult);
      }
    } catch (error) {
      console.error("Error directly fetching results data:", error);
    }
  }, [quizId, attemptId]);
  
  // Set up regular refresh for the data
  useEffect(() => {
    if (quizId && attemptId) {
      // Initial fetch
      fetchAllDataDirectly();
      
      // Periodic refresh - much less frequent
      const intervalId = setInterval(fetchAllDataDirectly, 45000); // Every 45 seconds
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [quizId, attemptId, fetchAllDataDirectly]);
  
  // Also use React Query for backup fallback data
  useEffect(() => {
    if (quizId) {
      // Force refetch all relevant data to ensure we have the latest
      queryClient.invalidateQueries({ queryKey: [`/api/quizzes/${quizId}/attempts`] });
      queryClient.invalidateQueries({ queryKey: [`/api/quiz-attempts/${attemptId}`] });
      console.log("Results page: Invalidated queries to refresh data");
    }
  }, [quizId, attemptId, queryClient]);

  // Fetch quiz
  const { data: quiz, isLoading: isLoadingQuiz, error: quizError } = useQuery<any>({
    queryKey: [`/api/quizzes/${quizId}`],
    refetchOnWindowFocus: true,
  });

  // Fetch questions
  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery<any[]>({
    queryKey: [`/api/quizzes/${quizId}/questions`],
    enabled: !!quizId,
  });

  // Fetch quiz attempts with aggressive refetching strategy
  const { 
    data: attempts = [], 
    isLoading: isLoadingAttempts,
    error: attemptsError,
  } = useQuery<any[]>({
    queryKey: [`/api/quizzes/${quizId}/attempts`],
    enabled: !!quizId,
    refetchOnMount: "always", // Always refetch on mount
    staleTime: 0, // Consider data always stale to ensure refetch
    gcTime: 0, // Don't cache previous data
    refetchInterval: 60000, // Refresh every minute
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when reconnecting
    retry: 3, // Retry failed requests 
    retryDelay: 1000, // Retry after 1 second
  });

  // Fetch this specific attempt with aggressive refetching
  const { data: thisAttempt, isLoading: isLoadingAttempt } = useQuery<any>({
    queryKey: [`/api/quiz-attempts/${attemptId}`],
    enabled: !!attemptId,
    refetchOnMount: "always",
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 60000, // Refresh every minute (same as attempts)
    refetchOnWindowFocus: true,
    refetchOnReconnect: true, 
    retry: 3,
    retryDelay: 1000
  });

  console.log("Results page - current attempts data:", attempts);
  console.log("Results page - current username:", userName);

  if (
    isLoadingQuiz ||
    isLoadingQuestions ||
    isLoadingAttempts ||
    isLoadingAttempt
  ) {
    return (
      <Layout>
        <Card>
          <CardContent className="flex items-center justify-center p-6 min-h-[200px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p>Loading your quiz results...</p>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (quizError || !quiz) {
    return (
      <Layout>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Quiz</h2>
              <p>Unable to load the quiz data. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (!thisAttempt) {
    return (
      <Layout>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-orange-500 mb-2">Results Not Found</h2>
              <p>We couldn't find your quiz attempt. It may have been removed.</p>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  // Extract real data from possibly nested response structure
  // Use our directly fetched data first if available, fall back to React Query data
  const attemptsList = rawAttempts.length > 0 ? 
    rawAttempts : 
    (attempts && typeof attempts === 'object' && 'data' in attempts && Array.isArray(attempts.data)) ? 
    attempts.data : attempts;
    
  const attemptData = rawAttempt ? 
    rawAttempt : 
    (thisAttempt && typeof thisAttempt === 'object' && 'data' in thisAttempt) ? 
    thisAttempt.data : thisAttempt;
  
  console.log("Results page - processed data:", {
    attemptsCount: attemptsList.length,
    attemptData: attemptData
  });
  
  // Type casting to fix TypeScript errors
  return (
    <ResultsView
      userName={userName}
      quizCreator={quiz.creatorName || ""}
      questions={questions as any[]}
      answers={attemptData.answers || []}
      attempts={attemptsList as any[]}
      score={attemptData.score || 0}
      currentAttemptId={attemptId}
    />
  );
};

export default Results;
