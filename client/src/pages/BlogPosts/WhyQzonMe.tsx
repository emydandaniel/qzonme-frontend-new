import React from "react";
import { Link } from "wouter";
import Layout from "@/components/common/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MetaTags from "@/components/common/MetaTags";

const WhyQzonMe: React.FC = () => {
  return (
    <Layout>
      <MetaTags 
        title="Why QzonMe Is the Funniest Way to Bond | QzonMe Blog"
        description="Discover why QzonMe quizzes are the perfect way to bond with friends, create hilarious moments, and test how well your friends really know you."
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
          
          <h1 className="text-3xl font-bold mb-6">Why QzonMe Is the Funniest Way to Bond</h1>
          
          <div className="prose max-w-none dark:prose-invert">
            <p>
              Have you ever thought your friends knew everything about you, only to find out they got your 
              favorite snack, color, or vacation spot completely wrong? That awkward moment when your bestie 
              thinks you prefer pineapple on pizza when you actually hate it? That's the kind of funny chaos 
              QzonMe thrives on.
            </p>
            
            <p>
              QzonMe isn't just another quiz platform. It's a space where humor, friendship, and personality 
              collide. The quizzes you create are about you—your likes, your memories, your quirks—and then 
              you throw those questions at your friends to see how well they really know you. That alone leads 
              to some hilarious moments.
            </p>
            
            <p>
              What makes it even better is how easy and fun it is to use. In less than a minute, you can build 
              a full quiz with custom questions and even add images for flair. Then share your unique link and 
              wait for the laughs to roll in. It's perfect for bonding with friends, breaking the ice in group 
              chats, or just killing time with something more personal than scrolling memes.
            </p>
            
            <p>
              Whether it's roasting your friends for getting every answer wrong or cheering on someone who gets 
              a perfect score, QzonMe turns friendship into a game. And it's one that never gets old.
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

export default WhyQzonMe;