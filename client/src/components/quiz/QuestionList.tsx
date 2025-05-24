import React from "react";
import { Question } from "@shared/schema";
import { Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QuestionListProps {
  questions: Question[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({ 
  questions, 
  onEdit, 
  onDelete 
}) => {
  if (questions.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No questions added yet. Start by creating your first question.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {questions.map((question, index) => (
        <li 
          key={index} 
          className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
        >
          <div className="flex items-center gap-2">
            {question.imageUrl && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative w-8 h-8 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={question.imageUrl} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This question has an image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <span>{question.text}</span>
          </div>
          <div className="flex space-x-2">
            {question.imageUrl && (
              <ImageIcon className="h-5 w-5 text-green-500 mr-1" />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(index)}
              className="text-muted-foreground hover:text-primary"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(index)}
              className="text-muted-foreground hover:text-primary"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default QuestionList;
