import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Component that scrolls to the top of the page when the route changes
 * Uses both standard and smooth scrolling for cross-browser compatibility
 */
export default function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    // First try with smooth scrolling behavior (better UX)
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    } catch (e) {
      // Fallback for browsers that don't support smooth scrolling
      window.scrollTo(0, 0);
    }
    
    // As a backup, also set the body scroll position directly after a small delay
    setTimeout(() => {
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }, 100);
  }, [location]);
  
  // Also add event listener for history changes
  useEffect(() => {
    const handleHistoryChange = () => {
      window.scrollTo(0, 0);
    };
    
    window.addEventListener('popstate', handleHistoryChange);
    
    return () => {
      window.removeEventListener('popstate', handleHistoryChange);
    };
  }, []);
  
  return null;
}