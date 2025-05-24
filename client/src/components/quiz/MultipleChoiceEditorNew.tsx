import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X } from "lucide-react";

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
  // Simple direct handler to update options
  const handleOptionChange = (index: number, value: string) => {
    // Create a new array with the updated value
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Add a new option
  const handleAddOption = () => {
    if (options.length < 8) {
      setOptions([...options, ""]);
    }
  };

  // Remove an option
  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      
      // Adjust correctOption if needed
      if (index === correctOption) {
        setCorrectOption(0);
      } else if (index < correctOption) {
        setCorrectOption(correctOption - 1);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-sm font-medium mb-2">
          Options (Select the correct answer)
        </Label>
        
        <RadioGroup
          value={correctOption.toString()}
          onValueChange={(val) => setCorrectOption(parseInt(val))}
          className="space-y-3"
        >
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <div className="flex-1 flex items-center">
                <input
                  type="text"
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                {options.length > 2 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    className="ml-2 h-8 w-8 p-0" 
                    onClick={() => handleRemoveOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      {options.length < 8 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddOption}
        >
          Add Another Option
        </Button>
      )}
    </div>
  );
};

export default MultipleChoiceEditor;