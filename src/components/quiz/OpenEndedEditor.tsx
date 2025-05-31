import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OpenEndedEditorProps {
  acceptedAnswers: string;
  setAcceptedAnswers: React.Dispatch<React.SetStateAction<string>>;
  hint: string;
  setHint: React.Dispatch<React.SetStateAction<string>>;
}

const OpenEndedEditor: React.FC<OpenEndedEditorProps> = ({
  acceptedAnswers,
  setAcceptedAnswers,
  hint,
  setHint,
}) => {
  return (
    <div id="open-ended-options">
      <div className="mb-4">
        <Label className="block text-sm font-medium mb-1">
          Accepted Answers (comma-separated)
        </Label>
        <Input
          type="text"
          className="input-field"
          placeholder="e.g. New York, NYC, The Big Apple"
          value={acceptedAnswers}
          onChange={(e) => setAcceptedAnswers(e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <Label className="block text-sm font-medium mb-1">
          Hint (optional)
        </Label>
        <Input
          type="text"
          className="input-field"
          placeholder="Give your friends a clue..."
          value={hint}
          onChange={(e) => setHint(e.target.value)}
        />
      </div>
    </div>
  );
};

export default OpenEndedEditor;
