import React from "react";
import { Link } from "wouter";
import Layout from "@/components/common/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MetaTags from "@/components/common/MetaTags";

const QuizIdeas: React.FC = () => {
  return (
    <Layout>
      <MetaTags 
        title="10 Fun Quiz Ideas to Challenge Your Friends | QzonMe Blog"
        description="Get inspiration for your next QzonMe quiz with these 10 creative quiz ideas that will test how well your friends really know you."
        type="article"
      />
      
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex justify-between items-center">
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground">May 15, 2025</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-6">10 Fun Quiz Ideas to Challenge Your Friends</h1>
          
          <div className="prose max-w-none dark:prose-invert">
            <p>
              Creating a quiz is half the fun, but getting started with good questions makes all the difference. 
              Here are 10 creative and hilarious quiz themes to spark your next masterpiece:
            </p>
            
            <h2>1. Guess My Favorites</h2>
            <p>
              Ask friends to guess your favorite color, song, snack, movie, or season. A great way to test if 
              they've really been paying attention.
            </p>
            
            <h2>2. This or That?</h2>
            <p>
              Would you choose dogs or cats? Pizza or burgers? Summer or winter? Add a few wildcards to throw them off!
            </p>
            
            <h2>3. If I Won the Lottery…</h2>
            <p>
              Would you travel the world, buy a yacht, or open a cat cafe? Let them guess your dream scenario.
            </p>
            
            <h2>4. Song Lyrics I Relate To</h2>
            <p>
              Drop relatable or emotional lyrics and ask which one sounds the most like you.
            </p>
            
            <h2>5. My Dream Vacation</h2>
            <p>
              Mountains, beaches, big cities, or somewhere quiet—this one's great for wanderlust vibes.
            </p>
            
            <h2>6. True or False: Me Edition</h2>
            <p>
              Mix in real facts and made-up ones. "I once ate 10 tacos in one sitting." True or false?
            </p>
            
            <h2>7. How Would I React?</h2>
            <p>
              In awkward or hilarious scenarios—like being stuck in an elevator or seeing your crush unexpectedly.
            </p>
            
            <h2>8. What Emoji Describes Me?</h2>
            <p>
              😂 😅 🤔 😈 — A fun visual twist to see how your friends perceive your vibe.
            </p>
            
            <h2>9. Pick a Meme That Represents Me</h2>
            <p>
              Upload memes and ask them to match your personality to one. Funny and very sharable.
            </p>
            
            <h2>10. Inside Joke Edition</h2>
            <p>
              Only your close friends will understand this one. Personal, unpredictable, and chaotic.
            </p>
          </div>
          
          <div className="mt-8 flex justify-between">
            <Link href="/blog">
              <Button variant="outline">Back to All Posts</Button>
            </Link>
            <Link href="/create">
              <Button>Create Your Quiz Now</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default QuizIdeas;