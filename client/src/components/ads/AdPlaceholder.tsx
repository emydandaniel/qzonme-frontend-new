import React from 'react';

// Simple placeholder component to resolve build error
const AdPlaceholder: React.FC<{ refreshKey?: number }> = ({ refreshKey }) => {
  // You can add basic ad placeholder styling or logic here if needed
  // For now, just returning null to avoid rendering anything
  console.log('AdPlaceholder rendered with key:', refreshKey); // Optional: log rendering
  return null; 
};

export default AdPlaceholder;

