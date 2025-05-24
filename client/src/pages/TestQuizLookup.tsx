import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/common/Layout";

// Define the quiz type for better type safety
interface Quiz {
  id: number;
  creatorName: string;
  accessCode: string;
  urlSlug: string;
}

const TestQuizLookup: React.FC = () => {
  const [slug, setSlug] = useState("testuser-test123");
  const [accessCode, setAccessCode] = useState("");
  const [lookupType, setLookupType] = useState("slug");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const currentUrl = window.location.origin;

  // Fetch existing quizzes to populate the dropdown
  const { data: availableQuizzes = [] } = useQuery<Quiz[]>({
    queryKey: ['/api/quizzes'],
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  const handleGo = () => {
    if (lookupType === "slug") {
      navigate(`/quiz/${slug}`);
    } else {
      navigate(`/quiz/code/${accessCode}`);
    }
  };
  
  const handleCopyUrl = () => {
    const url = lookupType === "slug" 
      ? `${currentUrl}/quiz/${slug}`
      : `${currentUrl}/quiz/code/${accessCode}`;
      
    navigator.clipboard.writeText(url)
      .then(() => {
        toast({
          title: "URL Copied",
          description: "The quiz URL has been copied to your clipboard.",
        });
      })
      .catch(err => {
        toast({
          title: "Copy Failed",
          description: "Could not copy the URL. Please try again.",
          variant: "destructive"
        });
      });
  };
  
  return (
    <Layout>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="font-poppins">Test Quiz URL Navigation</CardTitle>
          <CardDescription>
            Test the URL slug and access code navigation functionality
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="slug" onValueChange={(value) => setLookupType(value)}>
            <TabsList className="mb-4">
              <TabsTrigger value="slug">URL Slug</TabsTrigger>
              <TabsTrigger value="code">Access Code</TabsTrigger>
            </TabsList>
            
            <TabsContent value="slug">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quiz URL Slug</label>
                  <Input 
                    type="text" 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Enter quiz slug (e.g., username-abc123)"
                  />
                </div>
                
                <div className="border rounded-md p-3 bg-gray-50">
                  <div className="text-sm font-medium mb-1">URL Format</div>
                  <div className="text-xs">
                    <span className="text-gray-500">{currentUrl}/quiz/</span>
                    <span className="font-semibold">{slug}</span>
                  </div>
                </div>
                
                {availableQuizzes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Or select an existing quiz
                    </label>
                    <Select 
                      onValueChange={(value) => setSlug(value)} 
                      defaultValue={availableQuizzes[0]?.urlSlug}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a quiz" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableQuizzes.map((quiz) => (
                          <SelectItem key={quiz.id} value={quiz.urlSlug}>
                            {quiz.creatorName}'s Quiz ({quiz.urlSlug})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="code">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quiz Access Code</label>
                  <Input 
                    type="text" 
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter quiz access code (e.g., ABC123XY)"
                  />
                </div>
                
                <div className="border rounded-md p-3 bg-gray-50">
                  <div className="text-sm font-medium mb-1">URL Format</div>
                  <div className="text-xs">
                    <span className="text-gray-500">{currentUrl}/quiz/code/</span>
                    <span className="font-semibold">{accessCode}</span>
                  </div>
                </div>
                
                {availableQuizzes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Or select an existing quiz
                    </label>
                    <Select 
                      onValueChange={(value) => setAccessCode(value)} 
                      defaultValue={availableQuizzes[0]?.accessCode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a quiz" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableQuizzes.map((quiz) => (
                          <SelectItem key={quiz.id} value={quiz.accessCode}>
                            {quiz.creatorName}'s Quiz ({quiz.accessCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex gap-2">
          <Button onClick={handleGo} className="flex-1">
            Go to Quiz
          </Button>
          <Button variant="outline" onClick={handleCopyUrl}>
            Copy URL
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Navigation Type:</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                {lookupType === "slug" ? "URL Slug" : "Access Code"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current URL to test:</span>
              <span className="text-sm text-gray-600">
                {lookupType === "slug" 
                  ? `${currentUrl}/quiz/${slug}` 
                  : `${currentUrl}/quiz/code/${accessCode}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default TestQuizLookup;