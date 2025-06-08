import React, { useState, useEffect } from "react";
import QuizCreationNew from "@/components/quiz/QuizCreationNew";
import MetaTags from "@/components/common/MetaTags";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/common/Layout";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const CreateQuiz: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [sessionUsername, setSessionUsername] = useState<string | null>(null); // State to hold session value for display
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    console.log("CreateQuiz component mounted"); // Debug log
    
    // Retrieve username from sessionStorage
    try {
      const storedUsername = sessionStorage.getItem("username") || sessionStorage.getItem("userName");
      setSessionUsername(storedUsername); // Store session value for visible debug output
      console.log("Retrieved username from sessionStorage:", storedUsername); // Debug log
      
      if (storedUsername) {
        setUsername(storedUsername);
        console.log("Username state set to:", storedUsername); // Debug log
      } else {
        console.error("Username not found in sessionStorage"); // Debug log
        toast({
          title: "Username not found",
          description: "Please start from the homepage to create a quiz.",
          variant: "destructive",
        });
        
        // Redirect back to home after a short delay
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.error("Error accessing sessionStorage:", error);
      toast({
        title: "Error",
        description: "There was a problem accessing your session data. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast, navigate]);

  console.log("Rendering CreateQuiz. Current username state:", username); // Debug log

  // Force a hard reload of the page to ensure proper hydration
  const forceReload = () => {
    window.location.reload();
  };

  return (
    <Layout>
      <MetaTags 
        title="Create a Quiz | QzonMe - Test Your Friends" 
        description="Create a personalized quiz that tests how well your friends know you. Add multiple-choice questions, images, and share with friends in minutes!"
        type="website"
      />
      
      {/* Create Quiz Heading */}
      <h1 className="text-3xl font-bold mb-6">Create Your Quiz</h1>

      {/* Visible Debug Output */}
      <div style={{ border: "1px solid red", padding: "10px", marginBottom: "20px", backgroundColor: "#ffeeee" }}>
        <h3 style={{ color: "red", marginTop: 0 }}>DEBUG INFO</h3>
        <p>Username from state: <strong>{username || "null"}</strong></p>
        <p>Username from sessionStorage (on mount): <strong>{sessionUsername || "null"}</strong></p>
        <button 
          onClick={forceReload}
          style={{ 
            backgroundColor: "#ff6666", 
            color: "white", 
            padding: "5px 10px", 
            border: "none", 
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Force Page Reload
        </button>
      </div>
      
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
      
      {/* The actual quiz creation component - pass username prop */}
      {username ? (
        <QuizCreationNew username={username} />
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-red-600">
            <p>Error: Username not found. Please return to the homepage and enter your name first.</p>
            <button 
              onClick={() => navigate("/")}
              style={{ 
                backgroundColor: "#0066cc", 
                color: "white", 
                padding: "8px 16px", 
                border: "none", 
                borderRadius: "4px",
                marginTop: "10px",
                cursor: "pointer"
              }}
            >
              Return to Homepage
            </button>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
};

export default CreateQuiz;
