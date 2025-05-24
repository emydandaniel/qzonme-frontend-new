import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface MultipleChoiceEditorProps {
  options: string[];
  setOptions: React.Dispatch<React.SetStateAction<string[]>>;
  correctOption: number;
  setCorrectOption: React.Dispatch<React.SetStateAction<number>>;
}

const MultipleChoiceEditor: React.FC<MultipleChoiceEditorProps> = ({
  options,
  setOptions,
  correctOption,
  setCorrectOption,
}) => {
  // Simplified direct handler to avoid any focus issues
  const handleOptionChange = (index: number, value: string) => {
    // Create a new array with the updated value at the specific index
    const newOptions = options.map((option, i) => 
      i === index ? value : option
    );
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  return (
    <div id="multiple-choice-options">
      <div className="mb-4">
        <Label className="block text-sm font-medium mb-1">Options</Label>
        <RadioGroup
          value={correctOption.toString()}
          onValueChange={(val) => setCorrectOption(parseInt(val))}
          className="space-y-2"
        >
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
              />
            </div>
          ))}
        </RadioGroup>
      </div>
      
      {options.length < 8 && (
        <Button
          type="button"
          variant="link"
          className="text-sm text-primary hover:text-[#E76F51] font-medium p-0"
          onClick={handleAddOption}
        >
          + Add Another Option
        </Button>
      )}
    </div>
  );
};

export default MultipleChoiceEditor;
