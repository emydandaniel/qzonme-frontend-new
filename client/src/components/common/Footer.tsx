import React from "react";
import { Link } from "wouter";

const Footer: React.FC = () => {
  return (
    <footer className="mt-8 py-4 border-t text-center text-sm text-muted-foreground">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <h3 className="font-semibold mb-2">QzonMe</h3>
          <ul className="space-y-1">
            <li>
              <Link href="/">
                <span className="hover:underline cursor-pointer">Home</span>
              </Link>
            </li>
            <li>
              <Link href="/about">
                <span className="hover:underline cursor-pointer">About</span>
              </Link>
            </li>
            <li>
              <Link href="/faq">
                <span className="hover:underline cursor-pointer">FAQ</span>
              </Link>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Resources</h3>
          <ul className="space-y-1">
            <li>
              <Link href="/blog">
                <span className="hover:underline cursor-pointer">Blog</span>
              </Link>
            </li>
            <li>
              <Link href="/contact">
                <span className="hover:underline cursor-pointer">Contact</span>
              </Link>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Legal</h3>
          <ul className="space-y-1">
            <li>
              <Link href="/privacy">
                <span className="hover:underline cursor-pointer">Privacy Policy</span>
              </Link>
            </li>
            <li>
              <Link href="/terms">
                <span className="hover:underline cursor-pointer">Terms & Conditions</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="border-t pt-4">
        &copy; {new Date().getFullYear()} QzonMe. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;