import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdPlaceholder from "@/components/common/AdPlaceholder";
import Layout from "@/components/common/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Plus, Users, MessageSquare, Heart, ThumbsUp, Share2, Trophy } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const HomePage: React.FC = () => {
  const [userName, setUserName] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Check if there's a pending quiz to answer
  const [pendingQuiz, setPendingQuiz] = useState<{
    type: 'code' | 'slug';
    value: string;
  } | null>(null);
  
  // Only check for pending quiz in session storage
  useEffect(() => {
    // Check if there's a pending quiz code or slug in session storage
    const pendingQuizCode = sessionStorage.getItem("pendingQuizCode");
    const pendingQuizSlug = sessionStorage.getItem("pendingQuizSlug");
    
    if (pendingQuizCode) {
      setPendingQuiz({ type: 'code', value: pendingQuizCode });
      sessionStorage.removeItem("pendingQuizCode");
    } else if (pendingQuizSlug) {
      setPendingQuiz({ type: 'slug', value: pendingQuizSlug });
      sessionStorage.removeItem("pendingQuizSlug");
    }
  }, []);

  const createUserMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/users", { username: name });
      return response.json();
    },
  });

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First scroll to the top of the page
    window.scrollTo(0, 0);
    
    if (!userName.trim()) {
      toast({
        title: "Name is required",
        description: "Please enter your name to continue",
        variant: "destructive",
      });
      // Focus on the user name input at the top
      document.getElementById('user-name')?.focus();
      return;
    }
    
    try {
      const user = await createUserMutation.mutateAsync(userName);
      // Store user in session - ensure both variations are set to prevent issues
      sessionStorage.setItem("username", userName); 
      sessionStorage.setItem("userName", userName); // Set both versions for compatibility
      sessionStorage.setItem("userId", user.id);
      
      // Clear any local storage that might be interfering
      localStorage.removeItem("creatorName");
      
      // Navigate to quiz creation
      navigate("/create");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAnswerQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      toast({
        title: "Name is required",
        description: "Please enter your name to continue",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const user = await createUserMutation.mutateAsync(userName);
      // Store user in session - ensure both variations are set to prevent issues
      sessionStorage.setItem("username", userName); 
      sessionStorage.setItem("userName", userName); // Set both versions for compatibility
      sessionStorage.setItem("userId", user.id);
      
      // Clear any local storage that might be interfering
      localStorage.removeItem("creatorName");
      
      // If there's a pending quiz, navigate to it
      if (pendingQuiz) {
        if (pendingQuiz.type === 'code') {
          navigate(`/quiz/code/${pendingQuiz.value}`);
        } else {
          navigate(`/quiz/${pendingQuiz.value}`);
        }
        return;
      }
      
      // Otherwise, try to get quiz URL from clipboard
      navigator.clipboard.readText()
        .then(clipText => {
          // Check if clipboard contains a quiz URL or slug
          if (clipText.includes("/quiz/") || !clipText.includes("/")) {
            let slug = clipText;
            
            // Extract slug if it's a full URL
            if (clipText.includes("/quiz/")) {
              const urlParts = clipText.split("/quiz/");
              slug = urlParts[urlParts.length - 1].trim();
            }
            
            // Navigate to the quiz
            navigate(`/quiz/${slug}`);
          } else {
            // If clipboard doesn't contain a valid quiz link, go to find-quiz page
            navigate("/find-quiz");
          }
        })
        .catch(() => {
          // If can't access clipboard, go to find-quiz page
          navigate("/find-quiz");
        });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Features for homepage
  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Test Your Friendship",
      description: "Create custom quizzes about yourself and challenge friends to see who knows you best."
    },
    {
      icon: <Share2 className="h-8 w-8 text-primary" />,
      title: "Easy Sharing",
      description: "Share your personalized quiz link on WhatsApp, Instagram, or any social platform."
    },
    {
      icon: <Trophy className="h-8 w-8 text-primary" />,
      title: "Competitive Leaderboard",
      description: "See who scored highest on your quiz with our real-time leaderboard."
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Fun & Free",
      description: "No sign-up required - create and share quizzes instantly at no cost."
    }
  ];

  // Testimonials for homepage
  const testimonials = [
    {
      name: "Sarah K.",
      content: "Made this for my birthday and all my friends loved it! So much fun seeing who knows me best."
    },
    {
      name: "James T.",
      content: "Super easy to create and share. My quiz got over 30 responses in one day!"
    },
    {
      name: "Mia L.",
      content: "Used this for a team-building activity at work. Great way to break the ice!"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="mb-12">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 font-poppins">How Well Do Your Friends Really Know You?</h1>
              
              {/* Different description based on whether we are on the main domain or a shared link */}
              {pendingQuiz ? (
                <p className="text-muted-foreground mb-6">
                  Before you answer this quiz, we need to know who you are! Enter your name below to continue.
                </p>
              ) : (
                <p className="text-lg text-muted-foreground mb-6">
                  Create a personalized quiz, share it with friends, and discover who knows you best. 
                  It's free, fun, and takes just minutes!
                </p>
              )}
              
              {/* Name Input Form */}
              <form className="max-w-md mx-auto">
                <div className="mb-4">
                  <Label htmlFor="user-name" className="block text-left text-sm font-medium mb-1">
                    Your Name
                  </Label>
                  <Input
                    type="text"
                    id="user-name"
                    className="input-field"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
                  {/* Always show both buttons, regardless of how the page was accessed */}
                  <Button 
                    type="button" 
                    className="btn-primary flex-1" 
                    onClick={handleCreateQuiz}
                    disabled={createUserMutation.isPending}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Create a Quiz
                  </Button>
                  <Button 
                    type="button" 
                    className={pendingQuiz ? "btn-primary flex-1" : "btn-secondary flex-1"} 
                    onClick={handleAnswerQuiz}
                    disabled={createUserMutation.isPending}
                  >
                    {pendingQuiz ? (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" /> Answer This Quiz
                      </>
                    ) : (
                      <>
                        Answer a Quiz
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
            
            {/* Ad Placement */}
            <AdPlaceholder />
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Why People Love QzonMe</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="mb-2">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">How It Works</CardTitle>
            <CardDescription className="text-center">Create, share, and enjoy in 3 simple steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">1</div>
                <div>
                  <h3 className="font-semibold">Create Your Quiz</h3>
                  <p className="text-muted-foreground">Enter your name and create questions about yourself. Add images to make it more personal!</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">2</div>
                <div>
                  <h3 className="font-semibold">Share With Friends</h3>
                  <p className="text-muted-foreground">Get a unique link to share on social media or send directly to friends.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">3</div>
                <div>
                  <h3 className="font-semibold">Discover Results</h3>
                  <p className="text-muted-foreground">See who knows you best on your personalized leaderboard!</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleCreateQuiz}>
              <Plus className="h-4 w-4 mr-2" /> Create Your Quiz Now
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* Testimonials */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">What Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full">
              <CardContent className="pt-6">
                <blockquote className="text-muted-foreground italic mb-4">"{testimonial.content}"</blockquote>
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 text-primary mr-2" />
                  <span className="font-medium">{testimonial.name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="mb-8">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Create Your Quiz?</h2>
              <p className="mb-6">It's free, fun, and takes just minutes to set up!</p>
              <Button variant="secondary" size="lg" onClick={handleCreateQuiz}>
                <Plus className="h-4 w-4 mr-2" /> Create Your Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* What is QzonMe section */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">What is QzonMe?</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p>
                QzonMe is a fun and engaging quiz platform that lets you create personalized "How Well Do You Know Me?" quizzes. 
                It's the perfect way to test your friends, family, and followers on how well they really know you!
              </p>
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Why Use QzonMe?</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>No account or sign-up required - create quizzes instantly</li>
                  <li>Beautiful, mobile-friendly interface that works on any device</li>
                  <li>Share your quiz anywhere with a custom link</li>
                  <li>See who knows you best with our real-time leaderboard</li>
                  <li>Completely free to use with no hidden fees</li>
                </ul>
              </div>
              <p>
                Whether you're looking to have fun with friends, engage your social media followers, or just learn more about how others perceive you,
                QzonMe offers a fun, easy-to-use platform that anyone can enjoy.
              </p>
              <div className="flex justify-center">
                <Link href="/faq">
                  <Button variant="outline">Learn More About QzonMe</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Blog preview section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Latest from Our Blog</h2>
          <Link href="/blog">
            <span className="text-primary hover:underline cursor-pointer">View all</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">10 Fun Quiz Ideas to Challenge Your Friends</h3>
              <p className="text-muted-foreground mb-4">Creating a quiz is half the fun, but getting started with good questions makes all the difference.</p>
              <Link href="/blog/quiz-ideas">
                <Button variant="outline">
                  Read More <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">Why QzonMe Is the Funniest Way to Bond</h3>
              <p className="text-muted-foreground mb-4">QzonMe isn't just another quiz platform. It's a space where humor, friendship, and personality collide.</p>
              <Link href="/blog/why-qzonme-is-the-funniest-way-to-bond">
                <Button variant="outline">
                  Read More <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
