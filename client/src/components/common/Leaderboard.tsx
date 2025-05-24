import React, { useEffect, useState, useMemo } from "react";
import { QuizAttempt } from "@shared/schema";
import { formatPercentage } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LeaderboardProps {
  attempts: QuizAttempt[];
  currentUserName?: string;
  currentUserScore?: number;
  currentUserTotalQuestions?: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  attempts, 
  currentUserName,
  currentUserScore = 0,
  currentUserTotalQuestions = 1
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh the leaderboard data when attempts or current user data changes
  useEffect(() => {
    console.log("Leaderboard received new data:", { 
      attemptsCount: attempts?.length, 
      attempt_ids: attempts?.map(a => a.id),
      currentUserName,
      currentUserScore
    });
    
    // Show loading state briefly for visual feedback
    setIsRefreshing(true);
    const timer = setTimeout(() => {
      setRefreshKey(prev => prev + 1); // Increment key to force re-render
      setIsRefreshing(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [
    attempts, 
    attempts?.length, 
    currentUserName, 
    currentUserScore, 
    currentUserTotalQuestions
  ]);
  
  // Memoize the processed leaderboard data to avoid recalculations
  const sortedLeaderboardData = useMemo(() => {
    // Start with sorted attempts array
    let sortedData = [...(attempts || [])].map(attempt => ({
      ...attempt,
      // Ensure score can't exceed total questions
      score: Math.min(attempt.score, attempt.totalQuestions)
    })).sort((a, b) => {
      const scoreA = (a.score / (a.totalQuestions || 1)) * 100;
      const scoreB = (b.score / (b.totalQuestions || 1)) * 100;
      return scoreB - scoreA;
    });

    // Check if current user exists in the attempts data
    const userExists = currentUserName && sortedData.some(a => 
      a.userName?.toLowerCase() === currentUserName?.toLowerCase()
    );
    
    // If user doesn't exist in the attempts but we have their name and score, add them
    if (currentUserName && !userExists && currentUserScore !== undefined) {
      // Create a virtual attempt for the current user
      const userAttempt = {
        id: -1, // Virtual entry marker
        quizId: 0,
        userAnswerId: 0,
        userName: currentUserName,
        score: Math.min(currentUserScore, currentUserTotalQuestions || 1),
        totalQuestions: currentUserTotalQuestions || 1,
        answers: [],
        completedAt: new Date()
      };
      
      // Add to sorted array and resort
      sortedData.push(userAttempt);
      sortedData = sortedData.sort((a, b) => {
        const scoreA = (a.score / (a.totalQuestions || 1)) * 100;
        const scoreB = (b.score / (b.totalQuestions || 1)) * 100;
        return scoreB - scoreA;
      });
    }
    
    return sortedData;
  }, [attempts, currentUserName, currentUserScore, currentUserTotalQuestions, refreshKey]);
  
  // If refreshing, show loading state
  if (isRefreshing) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
        <p className="text-muted-foreground text-sm">Refreshing leaderboard...</p>
      </div>
    );
  }
  
  // If there's no data at all, show empty state
  if (sortedLeaderboardData.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 p-4 text-center text-gray-500">
        No attempts yet
      </div>
    );
  }

  return (
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
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedLeaderboardData.map((attempt, index) => {
            const isCurrentUser = currentUserName && attempt.userName === currentUserName;
            
            return (
              <tr 
                key={`${attempt.id}-${index}`}
                className={isCurrentUser ? "bg-orange-50 border-l-4 border-orange-400" : ""}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {isCurrentUser ? (
                    <span className="font-medium text-orange-600">You ({attempt.userName})</span>
                  ) : (
                    attempt.userName || "Anonymous"
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                  <span className={isCurrentUser ? "text-orange-600" : "text-primary"}>
                    {formatPercentage(attempt.score, attempt.totalQuestions || 1)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
