import React from "react";
import StaticPageLayout from "@/components/common/StaticPageLayout";

const About: React.FC = () => {
  return (
    <StaticPageLayout 
      title="About QzonMe"
      description="Learn more about QzonMe - the fun quiz platform where you can create quizzes about yourself and see how well your friends know you."
    >
      <h2 className="text-xl font-semibold mb-4">What is QzonMe?</h2>

      <p className="mb-4">
        QzonMe is a fun quiz-based website that lets you test how well your friends know you! 
        You can create custom quizzes, challenge your friends, and see who knows you best on the leaderboard.
      </p>

      <div className="p-4 bg-primary/10 rounded-md my-6 text-center">
        <p className="font-medium mb-2">Built by students, for laughs and good vibes</p>
        <p>Have fun, and don't forget to share your quiz!</p>
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-2">How It Works</h3>
      <ol className="list-decimal pl-6 mb-4 space-y-2">
        <li>Create your personalized quiz with questions about yourself</li>
        <li>Share your unique quiz link with friends</li>
        <li>Friends answer the questions about you</li>
        <li>Compare scores and see who knows you best!</li>
      </ol>
    </StaticPageLayout>
  );
};

export default About;