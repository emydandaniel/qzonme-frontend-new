import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import StaticPageLayout from "@/components/common/StaticPageLayout";
import MetaTags from "@/components/common/MetaTags";

export default function CreativeQuizQuestions() {
  const blogTitle = "Creative Questions to Ask in Your Best Friend Quiz";
  const blogDescription = "Skip the usual boring questions and try these creative, funny, and unique questions that will make your friendship quiz stand out.";
  
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
              If you want your quiz to stand out, skip the usual "What's my favorite color?" and try these instead:
            </p>
            
            <ul className="list-disc pl-5 space-y-2">
              <li>What's my secret talent no one knows?</li>
              <li>Which fast food place do I secretly hate but still eat at?</li>
              <li>What's my weirdest fear?</li>
              <li>Which fictional world would I move to in a heartbeat?</li>
              <li>What's my ultimate guilty pleasure movie?</li>
              <li>What's something I do that annoys people but I pretend not to notice?</li>
              <li>If I were a drink, what would I be?</li>
              <li>Which celebrity would play me in a movie?</li>
            </ul>
            
            <p>
              These kinds of questions make your quiz feel like a personality test crossed with an inside joke. They're fun, personal, and the perfect way to bond.
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