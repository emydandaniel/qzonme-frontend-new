import React from "react";
import { Link } from "wouter";
import Layout from "@/components/common/Layout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import MetaTags from "@/components/common/MetaTags";

// Blog post data 
const blogPosts = [
  {
    id: "quiz-ideas",
    title: "10 Fun Quiz Ideas to Challenge Your Friends",
    excerpt: "Creating a quiz is half the fun, but getting started with good questions makes all the difference. Here are 10 creative and hilarious quiz themes to spark your next masterpiece.",
    author: "QzonMe Team",
    date: "May 15, 2025",
    readTime: "4 min read",
    image: "/blog/question-ideas.jpg",
    url: "/blog/quiz-ideas"
  },
  {
    id: "how-to-make-quiz",
    title: "How to Make a \"How Well Do You Know Me?\" Quiz",
    excerpt: "A personalized quiz is the ultimate friendship challenge. Here's how to make one that's fun, surprising, and totally you with these easy steps.",
    author: "QzonMe Team",
    date: "May 14, 2025",
    readTime: "3 min read",
    image: "/blog/question-ideas.jpg",
    url: "/blog/how-to-make-quiz"
  },
  {
    id: "celebrity-quiz-themes",
    title: "Top 5 Celebrity Quiz Themes Fans Are Loving Right Now",
    excerpt: "Pop culture and quizzes are a match made in heaven. If you're looking to go viral or just entertain your fandom, try one of these trending celebrity quiz themes.",
    author: "QzonMe Team",
    date: "May 13, 2025",
    readTime: "4 min read",
    image: "/blog/quiz-success.jpg",
    url: "/blog/celebrity-quiz-themes"
  },
  {
    id: "creative-quiz-questions",
    title: "Creative Questions to Ask in Your Best Friend Quiz",
    excerpt: "Skip the usual boring questions and try these creative, funny, and unique questions that will make your friendship quiz stand out.",
    author: "QzonMe Team",
    date: "May 12, 2025",
    readTime: "3 min read",
    image: "/blog/question-ideas.jpg",
    url: "/blog/creative-quiz-questions"
  },
  {
    id: "quizzes-love-language",
    title: "Why Online Quizzes Are the New Love Language",
    excerpt: "In today's fast-paced digital world, real connection is hard to come by. But a well-made quiz? That's modern romance.",
    author: "QzonMe Team",
    date: "May 11, 2025",
    readTime: "3 min read",
    image: "/blog/friendship-facts.jpg",
    url: "/blog/quizzes-love-language"
  },
  {
    id: "why-qzonme",
    title: "Why QzonMe Is the Funniest Way to Bond",
    excerpt: "QzonMe isn't just another quiz platform. It's a space where humor, friendship, and personality collide. The quizzes you create are about you—your likes, your memories, your quirks.",
    author: "QzonMe Team",
    date: "May 10, 2025",
    readTime: "3 min read",
    image: "/blog/friendship-facts.jpg",
    url: "/blog/why-qzonme-is-the-funniest-way-to-bond"
  },
  {
    id: "seven-quiz-types",
    title: "From BFFs to Crushes – 7 Quiz Types You Can Make on QzonMe",
    excerpt: "Need quiz ideas? Here's your cheat sheet for creating perfect quizzes for best friends, crushes, group chats, and more.",
    author: "QzonMe Team",
    date: "May 8, 2025",
    readTime: "4 min read",
    image: "/blog/quiz-success.jpg",
    url: "/blog/seven-quiz-types"
  },
  {
    id: "influencers-quizzes",
    title: "How Celebrities, Influencers, and Social Media Creators Can Use QzonMe",
    excerpt: "In the age of content overload, creators are always looking for unique ways to stand out, build engagement, and grow loyal communities.",
    author: "QzonMe Team",
    date: "May 7, 2025",
    readTime: "5 min read",
    image: "/blog/quiz-success.jpg",
    url: "/blog/influencers-quizzes"
  },
  {
    id: "top-quiz-websites",
    title: "Top 7 Quiz Websites in 2024 (And Why QzonMe Stands Out)",
    excerpt: "If you're into quizzes, games, or interactive fun, you've probably seen dozens of quiz sites floating around the internet. But not all quiz platforms are created equal.",
    author: "QzonMe Team",
    date: "May 5, 2025",
    readTime: "5 min read",
    image: "/blog/quiz-success.jpg",
    url: "/blog/top-quiz-websites"
  }
];

const Blog: React.FC = () => {
  return (
    <Layout>
      <MetaTags 
        title="Blog | QzonMe - How Well Do Your Friends Know You?" 
        description="Discover tips, tricks, and fun ideas for creating and sharing your QzonMe friendship quizzes. Read our latest articles about friendship, quizzes, and more."
      />
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">QzonMe Blog</h1>
          <p className="text-muted-foreground">
            Discover tips, tricks, and fun ideas for your friendship quizzes
          </p>
        </div>
        
        <div className="space-y-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-3 gap-0">
                  <div className="bg-muted h-48 md:h-full flex items-center justify-center">
                    <div className="text-2xl font-bold text-primary px-4 text-center">
                      {post.title}
                    </div>
                  </div>
                  <div className="md:col-span-2 p-6">
                    <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                    
                    <div className="flex flex-wrap gap-3 mb-3 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {post.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      {post.excerpt}
                    </p>
                    
                    <Link href={post.url}>
                      <Button variant="outline" className="mt-2">
                        Read More <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Coming Soon Message */}
        <Card className="mt-12">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-4">More Articles Coming Soon!</h2>
            <p className="text-muted-foreground mb-6">
              We're working on creating more helpful content about friendship quizzes, social sharing tips, and how to create engaging questions.
              Check back soon for new articles!
            </p>
            <Link href="/">
              <Button variant="outline">
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Blog;