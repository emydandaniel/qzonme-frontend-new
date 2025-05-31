import React from "react";
import { Link } from "wouter";
import Layout from "./Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MetaTags from "./MetaTags";

interface StaticPageLayoutProps {
  title: string;
  children: React.ReactNode;
  description?: string;
  type?: string;
}

const StaticPageLayout: React.FC<StaticPageLayoutProps> = ({ 
  title, 
  children, 
  description = "QzonMe - Create and share personalized quizzes to test how well your friends know you.", 
  type = "website" 
}) => {
  return (
    <Layout>
      <MetaTags 
        title={`${title} | QzonMe`}
        description={description}
        type={type}
      />
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">{title}</h1>
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="prose max-w-none dark:prose-invert">
            {children}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default StaticPageLayout;