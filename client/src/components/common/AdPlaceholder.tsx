import React from "react";

interface AdPlaceholderProps {
  refreshKey?: number;  // Kept for compatibility, but not used
}

// Returns null (nothing) instead of an ad placeholder
const AdPlaceholder: React.FC<AdPlaceholderProps> = () => {
  return null;
};

export default AdPlaceholder;
