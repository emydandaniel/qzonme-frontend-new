import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchX, Home, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import Layout from "@/components/common/Layout";
import MetaTags from "@/components/common/MetaTags";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <Layout>
      <MetaTags 
        title="Page Not Found | QzonMe"
        description="Sorry, the page you're looking for doesn't exist or may have been moved. Try creating a new quiz or finding an existing one."
      />
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <SearchX className="h-16 w-16 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
            
            <p className="mb-6 text-gray-600">
              Oops! The page you're looking for doesn't exist or may have been moved.
              <br />Don't worry, you can easily get back on track!
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/")}
                variant="outline"
                className="flex items-center"
              >
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
              
              <Button 
                onClick={() => navigate("/create")}
                className="flex items-center"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Create a Quiz
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
