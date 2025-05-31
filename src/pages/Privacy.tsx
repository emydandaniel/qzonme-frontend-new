import React from "react";
import StaticPageLayout from "@/components/common/StaticPageLayout";

const Privacy: React.FC = () => {
  return (
    <StaticPageLayout 
      title="Privacy Policy"
      description="Learn about how QzonMe handles your data and protects your privacy. Our policy explains what information we collect and how we use it."
    >
      <h2 className="text-xl font-semibold mb-4">Privacy Policy for QzonMe</h2>

      <p className="mb-4">
        At QzonMe, accessible from https://qzonme.com, your privacy is important to us. 
        This Privacy Policy document outlines the types of information that is collected 
        and recorded by QzonMe and how we use it.
      </p>

      <h3 className="text-lg font-semibold mt-6 mb-2">1. Information We Collect</h3>
      <p className="mb-4">
        We collect only necessary data, such as names entered for quizzes, quiz answers, 
        and browser cookies to improve your experience.
      </p>

      <h3 className="text-lg font-semibold mt-6 mb-2">2. How We Use Your Information</h3>
      <p className="mb-2">We use your data to:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Display your quiz results and rankings</li>
        <li>Improve user experience</li>
        <li>Analyze how the website is used</li>
        <li>Serve relevant ads</li>
      </ul>

      <h3 className="text-lg font-semibold mt-6 mb-2">3. Third-Party Services</h3>
      <p className="mb-4">
        We use third-party advertising networks and partners including Google AdSense, 
        Media.net, Amazon Associates, Taboola, and other ad networks which may collect 
        cookies and usage data to serve personalized or interest-based advertisements.
      </p>
      <p className="mb-4">
        These advertising partners may use technologies such as cookies, web beacons, and 
        similar technologies to collect information about your activities on our website 
        to provide you with targeted advertising based on your browsing activities and interests.
      </p>

      <h3 className="text-lg font-semibold mt-6 mb-2">4. Data Protection</h3>
      <p className="mb-4">
        We do not sell, trade, or transfer your data to outside parties.
      </p>

      <h3 className="text-lg font-semibold mt-6 mb-2">5. Consent</h3>
      <p className="mb-4">
        By using our website, you consent to our Privacy Policy.
      </p>
    </StaticPageLayout>
  );
};

export default Privacy;