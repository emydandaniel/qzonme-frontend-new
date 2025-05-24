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

interface ShareQuizProps {
  accessCode: string;
  quizId: number;
  urlSlug: string;
}

const ShareQuiz: React.FC<ShareQuizProps> = ({ accessCode, quizId, urlSlug }) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [copiedDashboard, setCopiedDashboard] = useState(false);
  
  // Custom query to get the quiz with dashboard token
  // Explicitly disable cache, set immediate as high priority
  const { data: quiz, isLoading, error } = useQuery<any>({
    queryKey: [`/api/quizzes/${quizId}`],
    staleTime: 0, // Always consider data stale
    refetchOnMount: "always", // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 3, // Retry failed requests 3 times
    retryDelay: 1000, // Wait 1 second between retries
    refetchInterval: false, // Don't automatically refetch at intervals
    networkMode: "always" // Always try to fetch, even if network may be down
  });
  
  // Get the dashboard token from the API response or from sessionStorage as a fallback
  const dashboardToken = quiz?.dashboardToken || sessionStorage.getItem("currentQuizDashboardToken");
  console.log("Dashboard token from API:", quiz?.dashboardToken);
  console.log("Dashboard token from sessionStorage:", sessionStorage.getItem("currentQuizDashboardToken"));
  
  // Save the dashboard token to sessionStorage whenever we get it from the API
  useEffect(() => {
    if (quiz?.dashboardToken) {
      console.log("Saving dashboard token to sessionStorage:", quiz.dashboardToken);
      sessionStorage.setItem("currentQuizDashboardToken", quiz.dashboardToken);
    }
  }, [quiz?.dashboardToken]);
  
  // Use the custom domain for sharing
  const customDomain = "https://qzonme.com";
  const quizLink = `${customDomain}/quiz/${urlSlug}`;
  const shareMessage = `Hey! I made this QzonMe quiz just for YOU. 👀\nLet's see if you really know me 👇\n${quizLink}`;
  
  const dashboardLink = dashboardToken ? `${customDomain}/dashboard/${dashboardToken}` : null;
  
  // Format expiration date (7 days from today)
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);
  const formattedExpirationDate = expirationDate.toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Now paste it to your friend 👌🏽",
      duration: 3000
    });
    setTimeout(() => setCopied(false), 3000);
  };
  
  const handleCopyDashboardLink = () => {
    // Use either the API response or the fallback from sessionStorage
    if (!dashboardToken) {
      toast({
        title: "Error",
        description: "Could not find dashboard token. Please try refreshing the page.",
        variant: "destructive"
      });
      return;
    }
    
    navigator.clipboard.writeText(dashboardLink || "");
    
    setCopiedDashboard(true);
    toast({
      title: "Dashboard link copied!",
      description: "Make sure to bookmark it as you'll need it to view results.",
      duration: 3000
    });
    setTimeout(() => setCopiedDashboard(false), 3000);
  };
  
  const handleViewDashboard = () => {
    // Use either the API response or the fallback from sessionStorage
    if (dashboardToken) {
      console.log("Navigating to dashboard with token:", dashboardToken);
      navigate(`/dashboard/${dashboardToken}`);
    } else {
      toast({
        title: "Error",
        description: "Dashboard access not available. Please try refreshing the page.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Layout>
      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="mx-auto mb-6 w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4 font-poppins">Your Quiz is Ready!</h2>
          <p className="text-muted-foreground mb-6">
            Share this link with your friends to see how well they know you.
          </p>
          
          {/* Expiration Alert */}
          <Alert variant="destructive" className="mb-6 border-amber-500 bg-amber-50 text-amber-700">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle>Your quiz will expire in 7 days</AlertTitle>
            <AlertDescription>
              🕒 <strong>Note:</strong> This quiz and its dashboard will remain active for 7 days from today (until {formattedExpirationDate}).
              After that, the links will expire and no longer be accessible.
            </AlertDescription>
          </Alert>
          
          {/* Share Box - Same style as in Results page */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-6">
            <h3 className="font-poppins font-semibold text-lg mb-2 text-left">Share This Quiz</h3>
            <p className="text-sm text-gray-600 mb-3 text-left">
              Copy this message to invite your friends to take your quiz!
            </p>
            <div className="bg-white p-3 rounded border border-gray-200 text-sm mb-3 text-left">
              Hey! I made this QzonMe quiz just for YOU. 👀<br/>
              Let's see if you really know me 👇<br/>
              <span className="text-blue-500 truncate block">{quizLink}</span>
            </div>
            <Button 
              type="button" 
              className="w-full" 
              onClick={handleCopyLink}
              disabled={copied}
            >
              {copied ? "Copied!" : (
                <>
                  <Copy className="h-4 w-4 mr-2" /> Copy Message
                </>
              )}
            </Button>
          </div>
          
          {/* Dashboard Link Box */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-6">
            <h3 className="font-poppins font-semibold text-lg mb-2 text-left flex items-center">
              <Bookmark className="h-4 w-4 mr-2 text-primary" /> Your Dashboard Link
            </h3>
            <p className="text-sm text-gray-600 mb-3 text-left">
              <strong>Important:</strong> This is your unique dashboard link. Please bookmark or save it as it won't be stored in your browser.
            </p>
            
            {/* Display dashboard link from either API response or sessionStorage fallback */}
            {dashboardToken ? (
              <div className="mb-3">
                <div className="flex space-x-2 mb-2">
                  <Input 
                    value={`${customDomain}/dashboard/${dashboardToken}`}
                    readOnly
                    className="bg-white"
                  />
                  <Button
                    type="button"
                    onClick={handleCopyDashboardLink}
                    disabled={copiedDashboard}
                  >
                    {copiedDashboard ? "Copied!" : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ) : isLoading ? (
              <div className="bg-white p-3 rounded border border-gray-200 text-sm mb-3 text-center">
                Loading dashboard link...
              </div>
            ) : error ? (
              <div className="bg-red-50 p-3 rounded border border-red-200 text-sm text-red-700 mb-3 text-center">
                Error loading dashboard link. Please refresh the page.
              </div>
            ) : (
              <div className="bg-orange-50 p-3 rounded border border-orange-200 text-sm text-orange-700 mb-3 text-center">
                Dashboard token not found. Please try creating another quiz.
              </div>
            )}
            
            <Button 
              type="button" 
              className="w-full" 
              onClick={handleViewDashboard}
              disabled={isLoading || (!dashboardToken)}
            >
              <BarChart className="h-4 w-4 mr-2" /> View My Dashboard
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            <Clock className="h-3 w-3 inline-block mr-1" /> 
            Remember: You can only access your dashboard using the link above.
          </p>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default ShareQuiz;