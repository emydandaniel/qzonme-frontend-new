import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import StaticPageLayout from "@/components/common/StaticPageLayout";
import MetaTags from "@/components/common/MetaTags";

export default function QuizzesLoveLanguage() {
  const blogTitle = "Why Online Quizzes Are the New Love Language";
  const blogDescription = "Discover how personalized quizzes have become a new form of connection and expression in our digital world - the perfect modern love language.";
  
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
              In today's fast-paced, emoji-filled digital world, real connection is hard to come by. But a well-made quiz? That's modern romance.
            </p>
            
            <p>
              Quizzes let people express their personalities, share their quirks, and feel seen. When you build a quiz just for someone, it tells them, "You matter to me. I want to know what you'd pick, how you think, and how well you know me."
            </p>
            
            <p>
              On QzonMe, people create quizzes for crushes, partners, even exes (drama alert). Couples use it as a playful compatibility test. Friends turn it into mini challenges. Content creators turn it into engagement.
            </p>
            
            <p>
              And unlike a one-time message, a quiz sticks around. People can come back to it, compare scores, and laugh about it together. In a way, it becomes a little love letter disguised as a game.
            </p>
            
            <p>
              So yes, quizzes are the new love language. And QzonMe is the perfect place to write yours.
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