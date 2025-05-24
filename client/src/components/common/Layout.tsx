import React from "react";
import { Link } from "wouter";
import Footer from "./Footer";
import Navigation from "./Navigation";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl min-h-screen flex flex-col">
      {/* Header with Logo and Navigation */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 relative">
        <div className="w-full md:w-auto flex justify-between items-center">
          <Link href="/">
            <div className="text-center cursor-pointer">
              <h1 className="text-3xl md:text-4xl font-bold text-primary font-poppins">
                <span className="inline-block transform -rotate-2">Qzon</span>
                <span className="inline-block text-[#E76F51] transform rotate-2">Me</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                How well do your friends know you?
              </p>
            </div>
          </Link>
          
          {/* Navigation menu */}
          <div className="md:hidden">
            <Navigation />
          </div>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:block">
          <Navigation />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">{children}</main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
