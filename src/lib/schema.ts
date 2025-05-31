// Quiz Question and Answer Types

export interface Question {
  id: string | number;
  quizId: number;
  question: string;
  type: 'multiple-choice';
  options: string[];
  correctAnswer: string | string[] | number;
  hint: string | null;
  order: number;
  imageUrl: string | null;
}

export interface QuestionAnswer {
  questionId: string | number;
  userAnswer: string | number | string[];
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  userAnswerId: number;
  userName: string;
  score: number;
  totalQuestions: number;
  answers: QuestionAnswer[];
  completedAt: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  creatorName: string;
  accessCode: string;
  urlSlug: string;
  dashboardToken: string;
  createdAt: string;
  expiresAt: string;
}
