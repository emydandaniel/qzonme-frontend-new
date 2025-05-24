import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Home, BookOpen, MessageSquare, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const closeMenu = () => {
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    return location === path ? "font-bold text-primary" : "text-muted-foreground";
  };

  return (
    <div className="flex items-center justify-end">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden relative" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px] pt-10">
          <nav className="flex flex-col gap-4">
            <Link href="/" onClick={closeMenu}>
              <div className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted ${isActive("/")}`}>
                <Home className="h-5 w-5" />
                <span>Home</span>
              </div>
            </Link>
            <Link href="/blog" onClick={closeMenu}>
              <div className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted ${isActive("/blog")}`}>
                <BookOpen className="h-5 w-5" />
                <span>Blog</span>
              </div>
            </Link>
            <Link href="/contact" onClick={closeMenu}>
              <div className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted ${isActive("/contact")}`}>
                <MessageSquare className="h-5 w-5" />
                <span>Contact Us</span>
              </div>
            </Link>
            <Link href="/faq" onClick={closeMenu}>
              <div className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted ${isActive("/faq")}`}>
                <HelpCircle className="h-5 w-5" />
                <span>FAQ / How It Works</span>
              </div>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      
      {/* Desktop navigation */}
      <nav className="hidden md:flex space-x-4">
        <Link href="/">
          <span className={`hover:text-primary transition-colors ${isActive("/")}`}>Home</span>
        </Link>
        <Link href="/blog">
          <span className={`hover:text-primary transition-colors ${isActive("/blog")}`}>Blog</span>
        </Link>
        <Link href="/contact">
          <span className={`hover:text-primary transition-colors ${isActive("/contact")}`}>Contact</span>
        </Link>
        <Link href="/faq">
          <span className={`hover:text-primary transition-colors ${isActive("/faq")}`}>FAQ</span>
        </Link>
      </nav>
    </div>
  );
};

export default Navigation;