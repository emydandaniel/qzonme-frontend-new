import React from "react";
import HomePage from "@/components/home/HomePage";
import MetaTags from "@/components/common/MetaTags";

const Home: React.FC = () => {
  return (
    <>
      <MetaTags 
        title="QzonMe - How Well Do Your Friends Know You?" 
        description="Create fun and engaging quizzes to test how well your friends know you. Share with friends, view results, and see who knows you best!"
        type="website"
      />
      <HomePage />
    </>
  );
};

export default Home;
