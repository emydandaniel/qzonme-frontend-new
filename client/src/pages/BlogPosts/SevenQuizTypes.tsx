import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import StaticPageLayout from "@/components/common/StaticPageLayout";
import MetaTags from "@/components/common/MetaTags";

export default function SevenQuizTypes() {
  const blogTitle = "From BFFs to Crushes – 7 Quiz Types You Can Make on QzonMe";
  const blogDescription = "Need quiz inspiration? Here are 7 creative quiz types you can create on QzonMe for friends, crushes, and fans.";
  
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
              Need quiz ideas? Here's your cheat sheet:
            </p>
            
            <h2>1. Best Friend Quiz</h2>
            <p>
              Personal, hilarious, and borderline chaotic. Great for memories and inside jokes.
            </p>
            
            <h2>2. Crush Quiz</h2>
            <p>
              Want to send a subtle message? Make a flirty quiz with just enough spice.
            </p>
            
            <h2>3. Group Chat Quiz</h2>
            <p>
              Quiz your whole squad and start a mini competition.
            </p>
            
            <h2>4. Fan Quiz</h2>
            <p>
              Make it about your favorite artist, game, or show — but twist it to match your style.
            </p>
            
            <h2>5. Emoji Quiz</h2>
            <p>
              Use just emojis for the answers. Great for visual vibes.
            </p>
            
            <h2>6. Meme Quiz</h2>
            <p>
              Drop memes and ask which one they think suits you best. Laughs guaranteed.
            </p>
            
            <h2>7. Vibe Quiz</h2>
            <p>
              Keep it mysterious: mood-based questions, colors, songs — then reveal a fun result.
            </p>
            
            <p>
              Each quiz creates a moment to connect, compete, and share. What's not to love?
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