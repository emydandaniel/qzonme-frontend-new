import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/common/Layout";
import MetaTags from "@/components/common/MetaTags";

const FindQuiz: React.FC = () => {
  const [quizLink, setQuizLink] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleFindQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quizLink.trim()) {
      toast({
        title: "Link is required",
        description: "Please enter a quiz link or slug",
        variant: "destructive",
      });
      return;
    }
    
    // Extract slug if it's a full URL
    if (quizLink.includes("/quiz/")) {
      const urlParts = quizLink.split("/quiz/");
      const slug = urlParts[urlParts.length - 1].trim();
      navigate(`/quiz/${slug}`);
    }
    // Check if it's a direct access code (legacy)
    else if (quizLink.length === 6 && /^[A-Z0-9]{6}$/.test(quizLink)) {
      navigate(`/quiz/code/${quizLink}`);
    }
    // Otherwise treat as a slug
    else {
      navigate(`/quiz/${quizLink.trim()}`);
    }
  };

  return (
    <Layout>
      <MetaTags 
        title="Find a Quiz | QzonMe - How Well Do Your Friends Know You?"
        description="Enter a quiz code or link to take your friend's personalized quiz. See how well you know them and compare your score with others."
      />
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4 font-poppins">Find a Quiz</h2>
            <p className="text-muted-foreground mb-6">
              Enter a quiz link or slug to take your friend's quiz.
            </p>
            
            <form onSubmit={handleFindQuiz} className="max-w-md mx-auto">
              <div className="mb-4">
                <Label htmlFor="quiz-link" className="block text-left text-sm font-medium mb-1">
                  Quiz Link or Slug
                </Label>
                <Input
                  type="text"
                  id="quiz-link"
                  className="input-field"
                  placeholder="Paste link or enter quiz code"
                  value={quizLink}
                  onChange={(e) => setQuizLink(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="btn-primary w-full mt-4"
              >
                Find Quiz
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
      
      {/* Additional content for SEO and AdSense approval */}
      <div className="mt-8 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">Ways to Find a Quiz</h2>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Using a Quiz Link</h3>
                <p>
                  If someone shared a QzonMe quiz link with you through WhatsApp, social media, 
                  or messaging apps, you can paste the entire link in the box above.
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Using a 6-Digit Code</h3>
                <p>
                  Every QzonMe quiz has a unique 6-digit code. If you have this code, 
                  simply enter it in the box above to find your friend's quiz.
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Using a Creator's Name</h3>
                <p>
                  QzonMe generates custom URLs based on the creator's name. 
                  If you know your friend's name used for the quiz, try entering it in the box above.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">About QzonMe Quizzes</h2>
            <p className="mb-4">
              QzonMe quizzes are personalized quizzes that test how well you know your friends. 
              Each quiz contains questions created by someone about themselves, which you can answer 
              to see how well you really know them.
            </p>
            <p className="mb-4">
              After answering all the questions, you'll receive a score and see how you compare with other 
              friends who have taken the same quiz. It's a fun way to see who knows the quiz creator best!
            </p>
            <p>
              All quizzes remain active for 7 days, giving you plenty of time to take the quiz and 
              compare your score with others.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FindQuiz;