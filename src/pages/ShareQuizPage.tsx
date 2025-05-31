import React from "react";
import { useQuery } from "@tanstack/react-query";
import ShareQuiz from "@/components/quiz/ShareQuiz";
import { useToast } from "@/hooks/use-toast";
import MetaTags from "@/components/common/MetaTags";
import { apiRequest } from "@/lib/api";

interface Quiz {
  id: string;
  creatorName: string;
  urlSlug: string;
  accessCode: string;
  dashboardToken?: string;
}

interface ShareQuizPageProps {
  params: {
    quizId: string;
  };
}

const ShareQuizPage: React.FC<ShareQuizPageProps> = ({ params }) => {
  const quizId = params.quizId;
  const { toast } = useToast();

  const { data: quiz, isLoading: isLoadingQuiz, error } = useQuery<Quiz, Error>({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/quizzes/${quizId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch quiz: ${response.statusText}`);
      }
      const data = await response.json();
      return data as Quiz;
    }
  });

  React.useEffect(() => {
    if (error) {
      console.error("Error fetching quiz:", error);
      toast({
        title: "Error Loading Quiz",
        description: "Failed to load quiz. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoadingQuiz) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p>Loading your quiz...</p>
        </div>
      </div>
    );
  }

  // Get saved quiz data from session storage as fallback
  const sessionQuizId = sessionStorage.getItem("currentQuizId");
  const sessionQuizUrlSlug = sessionStorage.getItem("currentQuizUrlSlug");
  const sessionCreatorName = sessionStorage.getItem("currentCreatorName");
  
  // If quiz from API failed but we have matching session data, use that
  if (!quiz && sessionQuizId === quizId && sessionQuizUrlSlug && sessionCreatorName) {
    const fallbackQuiz = {
      id: sessionQuizId,
      creatorName: sessionCreatorName,
      urlSlug: sessionQuizUrlSlug,
      accessCode: sessionStorage.getItem("currentQuizAccessCode") || ''
    };

    return (
      <>
        <MetaTags 
          creatorName={fallbackQuiz.creatorName}
          url={`${window.location.origin}/quiz/${fallbackQuiz.urlSlug}`}
          imageUrl="/favicon.png"
          title={`${fallbackQuiz.creatorName}'s Quiz Just for You 💬`}
          description={`How well do you know ${fallbackQuiz.creatorName}? Try this private QzonMe quiz they made just for close friends.`}
        />
          <ShareQuiz
          quizId={quizId}
          urlSlug={fallbackQuiz.urlSlug}
          creatorName={fallbackQuiz.creatorName}
        />
      </>
    );
  }

  if (!quiz) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Quiz Not Found</h2>
          <p className="text-muted-foreground mb-4">
            Sorry, we couldn't find the quiz you're looking for.
          </p>
          <div className="mb-4 text-sm text-gray-600">
            <p>Quiz ID: {quizId}</p>
            <p>Session quiz ID: {sessionQuizId || 'none'}</p>
            {error && <p>Error: {error.toString()}</p>}
          </div>
          <a href="/" className="text-primary hover:underline">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  // At this point TypeScript knows quiz is not null
  return (
    <>
      <MetaTags 
        creatorName={quiz.creatorName}
        url={`${window.location.origin}/quiz/${quiz.urlSlug}`}
        imageUrl="/favicon.png"
        title={`${quiz.creatorName}'s Quiz Just for You 💬`}
        description={`How well do you know ${quiz.creatorName}? Try this private QzonMe quiz they made just for close friends.`}
      />      <ShareQuiz
        quizId={quizId}
        urlSlug={quiz.urlSlug}
        creatorName={quiz.creatorName || sessionStorage.getItem("currentCreatorName") || ""}
      />
    </>
  );
};

export default ShareQuizPage;