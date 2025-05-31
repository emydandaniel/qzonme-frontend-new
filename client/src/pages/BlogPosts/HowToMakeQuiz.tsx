import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import StaticPageLayout from "@/components/common/StaticPageLayout";
import MetaTags from "@/components/common/MetaTags";

export default function HowToMakeQuiz() {
  const blogTitle = `How to Make a "How Well Do You Know Me?" Quiz`;
  const blogDescription = "Learn how to create the perfect personalized quiz that's fun, surprising, and totally you with these easy steps.";
  
  return (
    <>
      <MetaTags 
        title={`${blogTitle} | QzonMe Blog`}
        description={blogDescription}
        type="article"
      />
      
      <StaticPageLayout 
        title="Blog"
        description="Get tips, ideas, and inspiration for creating fun friendship quizzes."
        type="blog"
      >
        <Card className="border-none shadow-none">
          <CardContent className="p-0">
          
          <h1 className="text-3xl font-bold mb-6">{blogTitle}</h1>
          
          <div className="prose max-w-none dark:prose-invert">
            <p>
              A personalized quiz is the ultimate friendship challenge. Here's how to make one that's fun, surprising, and totally you:
            </p>
            
            <h2>Step 1: Choose a Catchy Title</h2>
            <p>
              Make your quiz sound irresistible. "Only My Real Friends Can Pass This Test" or "Guess If You Really Know Me."
            </p>
            
            <h2>Step 2: Pick the Right Questions</h2>
            <p>
              Don't stick to boring stuff. Ask about personal stories, favorite things, fears, or dream jobs. The weirder, the better.
            </p>
            
            <h2>Step 3: Add Curveballs</h2>
            <p>
              Mix easy and tough questions. This keeps it interesting and fun to take.
            </p>
            
            <h2>Step 4: Include Images</h2>
            <p>
              Images help spice things up and make your quiz more visually engaging.
            </p>
            
            <h2>Step 5: Be Creative with Answers</h2>
            <p>
              Make even the wrong options entertaining. Humor matters!
            </p>
            
            <h2>Step 6: Share It Everywhere</h2>
            <p>
              Send the link, post it in your bio, or challenge your group chat.
            </p>
            
            <p>
              Quizzes like this let you express your personality and strengthen bonds at the same time.
            </p>
          </div>
          
          <div className="mt-8 flex justify-between">
            <Button variant="outline" asChild>
              <Link to="/blog">Back to Blog</Link>
            </Button>
            <Button asChild>
              <Link to="/">Create Your Quiz</Link>
            </Button>
          </div>
          </CardContent>
        </Card>
      </StaticPageLayout>
    </>
  );
}