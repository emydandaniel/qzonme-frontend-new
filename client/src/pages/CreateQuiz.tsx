import React from "react";
import QuizCreationNew from "@/components/quiz/QuizCreationNew";
import MetaTags from "@/components/common/MetaTags";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/common/Layout";

const CreateQuiz: React.FC = () => {
  return (
    <Layout>
      <MetaTags 
        title="Create a Quiz | QzonMe - Test Your Friends" 
        description="Create a personalized quiz that tests how well your friends know you. Add multiple-choice questions, images, and share with friends in minutes!"
        type="website"
      />
      
      {/* Create Quiz Heading */}
      <h1 className="text-3xl font-bold mb-6">Create Your Quiz</h1>
      
      {/* SEO Content */}
      <div className="mb-8">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="mb-4">
              Ready to see how well your friends, family, or followers really know you? Create your custom quiz in just a few minutes with these simple steps:
            </p>
            <ol className="list-decimal pl-5 mb-4 space-y-2">
              <li>Add multiple-choice questions about yourself</li>
              <li>Upload images to make your quiz more personal and engaging</li>
              <li>Customize with your name and share with friends</li>
              <li>Watch as your friends try to guess your preferences, habits, and memories</li>
              <li>See who knows you best on your personalized leaderboard</li>
            </ol>
            <p className="text-muted-foreground">
              Your quiz will remain active for 7 days, giving everyone plenty of time to participate. No account required!
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* The actual quiz creation component */}
      <QuizCreationNew />
    </Layout>
  );
};

export default CreateQuiz;
