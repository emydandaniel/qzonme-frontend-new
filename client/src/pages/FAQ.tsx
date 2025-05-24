import React from "react";
import Layout from "@/components/common/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, Info, FileQuestion, Lightbulb, Share2, Lock } from "lucide-react";
import MetaTags from "@/components/common/MetaTags";

const FAQ: React.FC = () => {
  return (
    <Layout>
      <MetaTags 
        title="FAQ & How It Works | QzonMe" 
        description="Learn how to create, share, and enjoy your QzonMe quizzes with friends. Find answers to frequently asked questions about our friendship quiz platform."
      />
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">FAQ & How It Works</h1>
        
        <Tabs defaultValue="how-it-works" className="mb-12">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
            <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
          </TabsList>
          
          {/* How It Works Tab */}
          <TabsContent value="how-it-works">
            <Card>
              <CardHeader>
                <CardTitle>How to Use QzonMe</CardTitle>
                <CardDescription>
                  Follow these simple steps to create and share your personalized quiz.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Create Your Quiz</h3>
                      <p className="text-muted-foreground mb-4">
                        Enter your name and start creating questions about yourself. You can add:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                        <li>Multiple-choice questions with up to 4 options</li>
                        <li>Image questions to make your quiz more personal</li>
                        <li>Fun and challenging questions about yourself</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Review and Finalize</h3>
                      <p className="text-muted-foreground mb-4">
                        Once you've added all your questions, review them carefully. You can:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                        <li>Edit or delete questions before finalizing</li>
                        <li>Reorder questions by deleting and re-adding them</li>
                        <li>Create a quiz with at least 3 questions (maximum 20)</li>
                      </ul>
                      <p className="text-muted-foreground mt-4">
                        <span className="font-semibold">Important:</span> Once your quiz is created, you cannot edit it, so make sure everything is correct!
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Share With Friends</h3>
                      <p className="text-muted-foreground mb-4">
                        After creating your quiz, you'll get:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                        <li>A unique shareable link (e.g., qzonme.com/quiz/your-name)</li>
                        <li>A 6-digit access code that friends can use to find your quiz</li>
                        <li>A private dashboard link to view all results</li>
                        <li>Sharing buttons for WhatsApp, copy link, and more</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Track Results</h3>
                      <p className="text-muted-foreground mb-4">
                        Use your dashboard to:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                        <li>See who has taken your quiz</li>
                        <li>Check scores and rankings on the leaderboard</li>
                        <li>View detailed results for each question</li>
                        <li>Share your dashboard link to keep tracking results for 7 days</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Find answers to common questions about QzonMe.</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center">
                        <FileQuestion className="mr-2 h-5 w-5 text-primary" />
                        <span>What is QzonMe?</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      QzonMe is a fun web platform that lets you create personalized "How Well Do You Know Me?" quizzes. You can create questions about yourself, share them with friends, and see who knows you best based on their scores.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center">
                        <Info className="mr-2 h-5 w-5 text-primary" />
                        <span>Is QzonMe free to use?</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      Yes! QzonMe is completely free to use. You can create as many quizzes as you want, and your friends can take them at no cost. There are no hidden fees or premium features.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center">
                        <Lock className="mr-2 h-5 w-5 text-primary" />
                        <span>Do I need to create an account?</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      No, QzonMe doesn't require account creation or registration. Simply enter your name to start creating a quiz or answering one. This makes it quick and easy to use without any signup process.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center">
                        <HelpCircle className="mr-2 h-5 w-5 text-primary" />
                        <span>How long do quizzes stay active?</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      Quizzes remain active for 7 days from the creation date. After this period, they are automatically deleted along with all results and images. This keeps the platform fresh and ensures data privacy.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center">
                        <Share2 className="mr-2 h-5 w-5 text-primary" />
                        <span>How do I share my quiz?</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      After creating your quiz, you'll get a unique URL and a 6-digit access code. You can share the URL directly via WhatsApp, other social media, or messaging apps. Alternatively, friends can enter your access code on the "Find Quiz" page.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center">
                        <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                        <span>Can I edit my quiz after creating it?</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      No, quizzes cannot be edited after creation to maintain the integrity of results. We recommend carefully reviewing your questions before finalizing. If you need to make changes, you'll need to create a new quiz.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-7">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center">
                        <HelpCircle className="mr-2 h-5 w-5 text-primary" />
                        <span>What happens to my data and images?</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      QzonMe respects your privacy. All quizzes, results, and uploaded images are automatically deleted after 7 days. We use secure image hosting, and we don't sell or share your personal data with third parties. For more details, please see our Privacy Policy.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default FAQ;