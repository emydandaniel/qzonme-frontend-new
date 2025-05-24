import React from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Question, QuestionAnswer, QuizAttempt } from "@shared/schema";
import { formatPercentage, getRemarkByScore } from "@/lib/utils";
import Leaderboard from "../common/Leaderboard";
import AdPlaceholder from "../common/AdPlaceholder";
import Layout from "../common/Layout";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResultsViewProps {
  userName: string;
  quizCreator: string;
  questions: Question[];
  answers: QuestionAnswer[];
  attempts: QuizAttempt[];
  score: number;
  currentAttemptId: number;  // Add the current attempt ID
}

const ResultsView: React.FC<ResultsViewProps> = ({
  userName,
  quizCreator,
  questions,
  answers,
  attempts,
  score,
  currentAttemptId
}) => {
  const [, navigate] = useLocation();
  const percentage = formatPercentage(score, questions.length);
  
  const handleCreateOwnQuiz = () => {
    navigate("/create");
  };
  
  const handleTryAgain = () => {
    // Get the quiz access code from the URL or session storage
    const accessCode = window.location.pathname.split("/").pop() || "";
    navigate(`/quiz/${accessCode}`);
  };
  
  // Match questions with answers for display - with enhanced debugging 
  const questionAnswers = questions.map(question => {
    const answer = answers.find(a => a.questionId === question.id);
    
    // Debug output to check answer data
    console.log(`Question ${question.id} mapping:`, {
      questionText: question.text,
      answerFound: !!answer,
      userAnswer: answer?.userAnswer,
      isCorrect: answer?.isCorrect
    });
    
    // If we have an answer but userAnswer is somehow empty, add placeholder
    // This ensures we never show "No answer provided" for questions that were answered
    let enhancedAnswer = answer;
    if (answer && (answer.userAnswer === null || answer.userAnswer === undefined || answer.userAnswer === "")) {
      enhancedAnswer = {
        ...answer,
        userAnswer: answer.isCorrect ? 
          (Array.isArray(question.correctAnswers) ? question.correctAnswers[0] : question.correctAnswers) : 
          "Answer was recorded but not displayed correctly"
      };
      console.log("Enhanced empty answer:", enhancedAnswer);
    }
    
    return {
      question,
      answer: enhancedAnswer
    };
  });

  // Log attempt and user data for debugging
  console.log("ResultsView:", { 
    attemptsCount: attempts.length, 
    userName,
    score,
    attempts: attempts.map(a => ({ id: a.id, name: a.userName, score: a.score }))
  });
  
  // We don't need to manually enhance the attempts array anymore
  // The Leaderboard component will handle this directly
  
  const [showAnswers, setShowAnswers] = React.useState(false);
  const personalizedRemark = getRemarkByScore(score, questions.length);
  const { toast } = useToast();
  
  return (
    <Layout>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{percentage}</span>
            </div>
            <h2 className="text-2xl font-bold mb-2 font-poppins">
              {personalizedRemark}
            </h2>
            <p className="text-muted-foreground">
              You scored {score} out of {questions.length} on {quizCreator}'s quiz
            </p>
          </div>
          
          {/* Results Summary - Hidden by default */}
          <div className="mb-6 text-center">
            <Button 
              type="button" 
              className="mb-4" 
              onClick={() => setShowAnswers(!showAnswers)}
            >
              {showAnswers ? "Hide Your Answers" : "View Your Answers"}
            </Button>
            
            {showAnswers && (
              <div className="mt-4">
                <h3 className="font-poppins font-semibold text-lg mb-3 text-left">Your Answers</h3>
                <ul className="space-y-3">
                  {questionAnswers.map(({ question, answer }) => (
                    <li 
                      key={question.id} 
                      className={`p-3 rounded-lg border-l-4 ${
                        answer?.isCorrect 
                          ? 'bg-green-50 border-green-500' 
                          : 'bg-red-50 border-red-500'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{question.text}</span>
                        {answer?.isCorrect ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        <strong>Your answer:</strong> <span className="font-medium" style={{ color: answer?.isCorrect ? "#16a34a" : "#dc2626" }}>
                          {Array.isArray(answer?.userAnswer) 
                            ? answer?.userAnswer.join(", ") 
                            : (answer?.userAnswer !== null && answer?.userAnswer !== undefined && answer?.userAnswer !== "")
                                ? answer.userAnswer.toString()
                                : "No answer provided"}
                        </span>
                      </div>
                      {!answer?.isCorrect && (
                        <div className="text-sm text-red-600 mt-1">
                          <strong>Correct answer:</strong> {Array.isArray(question.correctAnswers) 
                            ? question.correctAnswers.join(" or ") 
                            : String(question.correctAnswers || "")}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Share box removed as requested */}
          
          {/* Leaderboard */}
          <div className="mt-8">
            <h3 className="font-poppins font-semibold text-lg mb-3">Leaderboard</h3>
            <Leaderboard 
              attempts={attempts} 
              currentUserName={userName}
              currentUserScore={score}
              currentUserTotalQuestions={questions.length}
            />
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button 
              type="button" 
              className="btn-primary" 
              onClick={handleCreateOwnQuiz}
            >
              Create My Own Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Ad Placeholder */}
      <AdPlaceholder />
    </Layout>
  );
};

export default ResultsView;
