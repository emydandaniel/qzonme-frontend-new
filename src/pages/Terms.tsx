import React from "react";
import StaticPageLayout from "@/components/common/StaticPageLayout";

const Terms: React.FC = () => {
  return (
    <StaticPageLayout 
      title="Terms & Conditions"
      description="Read the terms and conditions for using QzonMe. Understand your rights and responsibilities when creating and sharing quizzes on our platform."
    >
      <h2 className="text-xl font-semibold mb-4">Terms & Conditions for QzonMe</h2>

      <p className="mb-4">
        By using this website, you agree to the following terms:
      </p>

      <ol className="list-decimal pl-6 mb-6 space-y-2">
        <li>You must be 13 years or older to use this site.</li>
        <li>You are responsible for the content you create or answer.</li>
        <li>The website may use ads to monetize content.</li>
        <li>We are not liable for any user-generated content.</li>
        <li>We reserve the right to ban misuse or spam.</li>
      </ol>

      <p className="italic">
        Use this site for fun, share your quiz responsibly, and stay respectful.
      </p>
    </StaticPageLayout>
  );
};

export default Terms;