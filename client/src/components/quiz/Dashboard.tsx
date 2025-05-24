import React from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Question, QuizAttempt } from "@shared/schema";
import { formatPercentage } from "@/lib/utils";
import Layout from "../common/Layout";
import { Share, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  quizId: number;
  accessCode: string;
  questions: Question[];
  attempts: QuizAttempt[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  quizId, 
  accessCode, 
  questions, 
  attempts 
}) => {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // A more gentle approach - fetch fresh data without page reload
      console.log("Dashboard: User clicked manual refresh");
      
      toast({
        title: "Refreshing data",
        description: "Loading the latest attempts from server...",
        variant: "default"
      });
      
      // Add cache busting to fetch call
      const timestamp = Date.now();
      
      // Fetch fresh data directly
      try {
        const response = await fetch(`/api/quizzes/${quizId}/attempts?nocache=${timestamp}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch attempts');
        
        // Parse the response
        const data = await response.json();
        const freshAttempts = data.data || data;
        
        console.log(`Manual refresh fetched ${freshAttempts.length} attempts`);
        
        // Update the data locally
        queryClient.setQueryData([`/api/quizzes/${quizId}/attempts`], freshAttempts);
        
        toast({
          title: "Dashboard refreshed",
          description: `Latest data loaded: ${freshAttempts.length} attempts`,
          variant: "default"
        });
        
      } catch (error) {
        console.error("Error refreshing data:", error);
        throw error;  // Re-throw to be caught by outer handler
      }
      
    } catch (error) {
      console.error("Dashboard refresh error:", error);
      toast({
        title: "Refresh failed",
        description: "Could not load the latest data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const totalAttempts = attempts.length;
  const averageScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, attempt) => 
        sum + (attempt.score / attempt.totalQuestions) * 100, 0
      ) / attempts.length)
    : 0;
  
  const topScore = attempts.length > 0
    ? Math.round(Math.max(...attempts.map(a => (a.score / a.totalQuestions) * 100)))
    : 0;
  
  const handleShare = () => {
    navigate(`/share/${quizId}`);
  };
  
  // Calculate question performance
  const questionPerformance = questions.map(question => {
    // Use type assertion to handle the answers property
    const allAnswersForQuestion = attempts.flatMap(attempt => {
      const answers = attempt.answers as { questionId: number; isCorrect: boolean; userAnswer: any }[];
      return answers.filter(a => a.questionId === question.id);
    });
    
    const correctAnswersCount = allAnswersForQuestion.filter(a => a.isCorrect).length;
    const correctPercentage = allAnswersForQuestion.length > 0
      ? Math.round((correctAnswersCount / allAnswersForQuestion.length) * 100)
      : 0;
    
    // Find most common answer
    const answerCounts = new Map<string, number>();
    allAnswersForQuestion.forEach(a => {
      const answerStr = String(a.userAnswer);
      answerCounts.set(answerStr, (answerCounts.get(answerStr) || 0) + 1);
    });
    
    let mostCommonAnswer = "";
    let maxCount = 0;
    
    answerCounts.forEach((count, answer) => {
      if (count > maxCount) {
        mostCommonAnswer = answer;
        maxCount = count;
      }
    });
    
    const isCommonAnswerCorrect = 
      (question.correctAnswers as string[]).includes(mostCommonAnswer);
    
    return {
      question,
      correctPercentage,
      mostCommonAnswer,
      isCommonAnswerCorrect
    };
  });
  
  return (
    <Layout>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-xl font-bold font-poppins">Your Quiz Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                See how your friends are doing
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                type="button" 
                className="btn-primary flex items-center"
                onClick={handleShare}
              >
                <Share className="mr-2 h-4 w-4" />
                Share Quiz
              </Button>
            </div>
          </div>
          
          {/* Quiz Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-muted-foreground text-sm mb-1">Total Attempts</div>
              <div className="text-2xl font-bold">{totalAttempts}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-muted-foreground text-sm mb-1">Average Score</div>
              <div className="text-2xl font-bold">{averageScore}%</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-muted-foreground text-sm mb-1">Top Score</div>
              <div className="text-2xl font-bold text-primary">{topScore}%</div>
            </div>
          </div>
          
          {/* Full Leaderboard */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-poppins font-semibold text-lg">Leaderboard</h3>
              <Button 
                type="button" 
                size="sm"
                variant="outline" 
                className="flex items-center h-8" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attempts.length > 0 ? (
                    attempts
                      .sort((a, b) => 
                        (b.score / b.totalQuestions) - (a.score / a.totalQuestions)
                      )
                      .map((attempt, index) => (
                        <tr key={attempt.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {attempt.userName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-primary font-medium">
                            {formatPercentage(attempt.score, attempt.totalQuestions)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                            {new Date(attempt.completedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-500">
                        No attempts yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Question Performance */}
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-3">Question Performance</h3>
            <div className="space-y-4">
              {questionPerformance.map(({ question, correctPercentage, mostCommonAnswer, isCommonAnswerCorrect }) => (
                <div key={question.id} className="p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{question.text}</span>
                    <span className={`text-sm px-2 py-1 ${
                      correctPercentage >= 50 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    } rounded`}>
                      {correctPercentage}% correct
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Most common answer: {mostCommonAnswer} 
                    {mostCommonAnswer && !isCommonAnswerCorrect && " (incorrect)"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Dashboard;
