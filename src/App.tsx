import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CreateQuiz from "@/pages/CreateQuiz";
import AnswerQuiz from "@/pages/AnswerQuiz";
import Results from "@/pages/Results";
import Dashboard from "@/pages/Dashboard";
import FindQuiz from "@/pages/FindQuiz";
import ShareQuizPage from "@/pages/ShareQuizPage";
import TestQuizLookup from "@/pages/TestQuizLookup";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import FAQ from "@/pages/FAQ";
import Admin from "@/pages/Admin";
// Blog post pages
import WhyQzonMe from "@/pages/BlogPosts/WhyQzonMe";
import TopQuizWebsites from "@/pages/BlogPosts/TopQuizWebsites";
import QuizIdeas from "@/pages/BlogPosts/QuizIdeas";
import HowToMakeQuiz from "@/pages/BlogPosts/HowToMakeQuiz";
import CelebrityQuizThemes from "@/pages/BlogPosts/CelebrityQuizThemes";
import CreativeQuizQuestions from "@/pages/BlogPosts/CreativeQuizQuestions";
import QuizzesLoveLanguage from "@/pages/BlogPosts/QuizzesLoveLanguage";
import SevenQuizTypes from "@/pages/BlogPosts/SevenQuizTypes";
import InfluencersQuizzes from "@/pages/BlogPosts/InfluencersQuizzes";
import ScrollToTop from "@/components/common/ScrollToTop";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreateQuiz} />
      <Route path="/find-quiz" component={FindQuiz} />
      <Route path="/quiz/code/:accessCode" component={AnswerQuiz} />
      <Route path="/quiz/:creatorSlug" component={AnswerQuiz} />
      <Route path="/results/:quizId/:attemptId" component={Results} />
      <Route path="/dashboard/:token" component={Dashboard} />
      <Route path="/share/:quizId" component={ShareQuizPage} />
      <Route path="/test-quiz-lookup" component={TestQuizLookup} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/blog" component={Blog} />
      
      {/* Blog post routes */}
      <Route path="/blog/why-qzonme-is-the-funniest-way-to-bond" component={WhyQzonMe} />
      <Route path="/blog/top-quiz-websites" component={TopQuizWebsites} />
      <Route path="/blog/quiz-ideas" component={QuizIdeas} />
      <Route path="/blog/how-to-make-quiz" component={HowToMakeQuiz} />
      <Route path="/blog/celebrity-quiz-themes" component={CelebrityQuizThemes} />
      <Route path="/blog/creative-quiz-questions" component={CreativeQuizQuestions} />
      <Route path="/blog/quizzes-love-language" component={QuizzesLoveLanguage} />
      <Route path="/blog/seven-quiz-types" component={SevenQuizTypes} />
      <Route path="/blog/influencers-quizzes" component={InfluencersQuizzes} />
      
      <Route path="/faq" component={FAQ} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <>
      <ScrollToTop />
      <Router />
      <Toaster />
    </>
  );
}

export default App;
