import { Question, QuestionAnswer } from "@shared/schema";
import { apiRequest } from "./queryClient";

// Verify a single answer against a question
export async function verifyAnswer(
  questionId: number,
  answer: string | string[]
): Promise<boolean> {
  try {
    const response = await apiRequest("POST", `/api/questions/${questionId}/verify`, {
      answer
    });
    const result = await response.json();
    return result.isCorrect;
  } catch (error) {
    console.error("Error verifying answer:", error);
    return false;
  }
}

// Calculate score from answers
export function calculateScore(answers: QuestionAnswer[]): {
  score: number;
  totalQuestions: number;
  percentage: string;
} {
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(answer => answer.isCorrect).length;
  const percentage = totalQuestions > 0 
    ? Math.round((correctAnswers / totalQuestions) * 100) + '%'
    : '0%';
  
  return {
    score: correctAnswers,
    totalQuestions,
    percentage
  };
}

// Format open-ended answers for storage
export function formatOpenEndedAnswers(answerText: string): string[] {
  if (!answerText.trim()) return [];
  return answerText
    .split(',')
    .map(a => a.trim())
    .filter(a => a.length > 0);
}

// For quiz creation - validate quiz has minimum 5 questions
export function validateQuiz(questions: Question[]): boolean {
  return questions.length >= 5;
}

// Determine if a question is correct
export function isAnswerCorrect(
  question: Question,
  answer: string | string[]
): boolean {
  const correctAnswers = question.correctAnswers as string[];
  
  if (Array.isArray(answer)) {
    return answer.every(ans => 
      correctAnswers.some(correct => 
        correct.toLowerCase() === ans.toLowerCase()
      )
    );
  } else {
    return correctAnswers.some(
      correct => correct.toLowerCase() === answer.toLowerCase()
    );
  }
}
