import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, BarChart, AlertTriangle, Clock, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "../common/Layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

interface Quiz {
  id: string;
  creatorName: string;
  urlSlug: string;
  accessCode: string;
  dashboardToken?: string;
}

interface ShareQuizProps {
  quizId: string;
  urlSlug: string;
  creatorName: string;
}

const ShareQuiz: React.FC<ShareQuizProps> = ({ quizId, urlSlug, creatorName: propCreatorName }) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [copiedDashboard, setCopiedDashboard] = useState(false);
  
  // Get quiz data with proper typing and error handling
  const { data: quiz, isLoading, error } = useQuery<Quiz>({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/quizzes/${quizId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch quiz: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching quiz:", error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 0
  });

  // Get dashboard token and other data from multiple sources
  const dashboardToken = quiz?.dashboardToken || sessionStorage.getItem("currentQuizDashboardToken");
  const accessCode = quiz?.accessCode || sessionStorage.getItem("currentQuizAccessCode");
  
  // Use creator name from multiple fallback sources
  const creatorName = quiz?.creatorName || propCreatorName || sessionStorage.getItem("currentCreatorName") || "";

  // Use a custom domain for sharing
  const customDomain = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://qzonme.com';
  const quizLink = `${customDomain}/quiz/${urlSlug}`;
  const dashboardLink = dashboardToken ? `${customDomain}/dashboard/${dashboardToken}` : '';

  // Handle copying quiz link
  const handleCopyQuizLink = async () => {
    try {
      await navigator.clipboard.writeText(quizLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share it with your friends",
        duration: 3000
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast({
        title: "Failed to copy",
        description: "Please try copying manually",
        variant: "destructive"
      });
    }
  };

  // Handle copying dashboard link
  const handleCopyDashboardLink = async () => {
    if (!dashboardLink) return;
    try {
      await navigator.clipboard.writeText(dashboardLink);
      setCopiedDashboard(true);
      toast({
        title: "Dashboard link copied!",
        description: "Make sure to bookmark it as you'll need it to view results.",
        duration: 3000
      });
      setTimeout(() => setCopiedDashboard(false), 3000);
    } catch (error) {
      console.error("Failed to copy dashboard link:", error);
      toast({
        title: "Failed to copy",
        description: "Please try copying manually",
        variant: "destructive"
      });
    }
  };

  // Handle viewing dashboard
  const handleViewDashboard = () => {
    if (dashboardToken) {
      navigate(`/dashboard/${dashboardToken}`);
    } else {
      toast({
        title: "Error",
        description: "Dashboard access not available. Please try refreshing the page.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p>Loading quiz details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Quiz</AlertTitle>
          <AlertDescription>
            Failed to load quiz details. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="mx-auto mb-6 w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Quiz Created Successfully!</h1>
          <p className="text-muted-foreground mb-6">
            Your quiz is ready to share with friends
          </p>

          <div className="space-y-6">
            {/* Quiz Link Section */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Share Your Quiz</h2>
              <div className="flex gap-2 mb-2">
                <Input value={quizLink} readOnly />
                <Button onClick={handleCopyQuizLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              {/* Share buttons */}
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(quizLink)}`, '_blank')}
                >
                  Share on WhatsApp
                </Button>
              </div>
            </div>

            {/* Dashboard Section */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Your Quiz Dashboard</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Use your dashboard to view quiz results and rankings
              </p>
              
              <div className="flex gap-2 mb-4">
                <Input value={dashboardLink} readOnly />
                <Button onClick={handleCopyDashboardLink}>
                  {copiedDashboard ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              <Button onClick={handleViewDashboard} className="w-full">
                <BarChart className="h-4 w-4 mr-2" />
                View Dashboard
              </Button>
            </div>

            {/* Quiz Expiry Warning */}
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Quiz Active for 7 Days</AlertTitle>
              <AlertDescription className="text-sm">
                Make sure to save your dashboard link to check results
              </AlertDescription>
            </Alert>

            {/* Access Code Display */}
            {accessCode && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Quiz Access Code:</p>
                <code className="bg-muted px-3 py-1 rounded text-lg font-mono">
                  {accessCode}
                </code>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default ShareQuiz;