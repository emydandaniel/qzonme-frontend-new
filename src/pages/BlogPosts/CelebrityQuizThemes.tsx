import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import StaticPageLayout from "@/components/common/StaticPageLayout";
import MetaTags from "@/components/common/MetaTags";

export default function CelebrityQuizThemes() {
  const blogTitle = "Top 5 Celebrity Quiz Themes Fans Are Loving Right Now";
  const blogDescription = "Discover the trending celebrity quiz themes that fans are creating and sharing, from Taylor Swift eras to Marvel character matches.";
  
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
              Pop culture and quizzes are a match made in heaven. If you're looking to go viral or just entertain your fandom, try one of these ideas:
            </p>
            
            <h2>1. Taylor Swift – Which Era Are You?</h2>
            <p>
              Fearless, Reputation, or Lover? This quiz is a hit with Swifties and always trending.
            </p>
            
            <h2>2. BTS – Which Member Would Be Your Bestie?</h2>
            <p>
              Every fan has a bias. Let them find out who'd vibe with their personality best.
            </p>
            
            <h2>3. Marvel – Which Avenger Are You?</h2>
            <p>
              Are you Iron Man-level clever or more like Peter Parker? Great for comic and MCU fans.
            </p>
            
            <h2>4. Stranger Things – What Character Matches Your Energy?</h2>
            <p>
              Get quirky with 80s vibes and nostalgia. This theme is fun and familiar.
            </p>
            
            <h2>5. The Kardashians – What Kind of Drama Magnet Are You?</h2>
            <p>
              For humor, sass, and chaotic energy quizzes.
            </p>
            
            <p>
              Celebrity quizzes are entertaining, highly shareable, and perfect for fans who want to express their identity.
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