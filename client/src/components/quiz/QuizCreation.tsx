import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit, Plus, Image } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const QuizCreation = ({ username }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    imageUrl: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswers: [false, false, false, false]
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  // Restored to require 5 questions as per user request
  const MIN_QUESTIONS_REQUIRED = 5;

  const createQuizMutation = useMutation({
    mutationFn: async (quizData) => {
      const response = await axios.post('/api/quizzes', quizData);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Quiz created successfully!');
      navigate(`/share/${data.urlSlug}`, { 
        state: { 
          accessCode: data.accessCode,
          dashboardToken: data.dashboardToken
        } 
      });
    },
    onError: (error) => {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz. Please try again.');
    }
  });

  const handleQuestionChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      text: e.target.value
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  const handleCorrectAnswerChange = (index) => {
    const newCorrectAnswers = [...currentQuestion.correctAnswers];
    newCorrectAnswers[index] = !newCorrectAnswers[index];
    setCurrentQuestion({
      ...currentQuestion,
      correctAnswers: newCorrectAnswers
    });
  };

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, ''],
      correctAnswers: [...currentQuestion.correctAnswers, false]
    });
  };

  const removeOption = (index) => {
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    const newCorrectAnswers = currentQuestion.correctAnswers.filter((_, i) => i !== index);
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
      correctAnswers: newCorrectAnswers
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return '';
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const response = await axios.post('/api/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return '';
    }
  };

  const addQuestion = async () => {
    // Validate question
    if (!currentQuestion.text.trim()) {
      toast.error('Please enter a question');
      return;
    }

    // Validate options
    const filledOptions = currentQuestion.options.filter(opt => opt.trim() !== '');
    if (filledOptions.length < 2) {
      toast.error('Please add at least 2 options');
      return;
    }

    // Validate correct answer selection
    if (!currentQuestion.correctAnswers.some(ans => ans)) {
      toast.error('Please select at least one correct answer');
      return;
    }

    // Upload image if selected
    let imageUrl = '';
    if (selectedFile) {
      imageUrl = await uploadImage();
    }

    // Filter out empty options
    const validOptions = currentQuestion.options
      .map((option, index) => ({
        text: option,
        isCorrect: currentQuestion.correctAnswers[index]
      }))
      .filter(option => option.text.trim() !== '');

    const newQuestion = {
      ...currentQuestion,
      imageUrl,
      options: validOptions
    };

    setQuestions([...questions, newQuestion]);
    
    // Reset current question
    setCurrentQuestion({
      text: '',
      imageUrl: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswers: [false, false, false, false]
    });
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    toast.success('Question added successfully!');
  };

  const editQuestion = (index) => {
    const questionToEdit = questions[index];
    
    // Convert the options array of objects back to separate arrays
    const options = questionToEdit.options.map(opt => opt.text);
    const correctAnswers = questionToEdit.options.map(opt => opt.isCorrect);
    
    setCurrentQuestion({
      text: questionToEdit.text,
      imageUrl: questionToEdit.imageUrl,
      type: questionToEdit.type,
      options,
      correctAnswers
    });
    
    if (questionToEdit.imageUrl) {
      setPreviewUrl(questionToEdit.imageUrl);
    }
    
    // Remove the question from the list
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
    toast.success('Question deleted');
  };

  const handleFinishQuiz = () => {
    if (questions.length < MIN_QUESTIONS_REQUIRED) {
      toast.error(`Please add at least ${MIN_QUESTIONS_REQUIRED} question${MIN_QUESTIONS_REQUIRED > 1 ? 's' : ''}`);
      return;
    }

    const quizData = {
      creatorName: username,
      questions: questions
    };

    createQuizMutation.mutate(quizData);
  };

  const allOptionsFilled = currentQuestion.options.every(option => option.trim() !== '');
  const atLeastOneCorrectAnswer = currentQuestion.correctAnswers.some(ans => ans);
  const canAddQuestion = currentQuestion.text.trim() !== '' && 
                         currentQuestion.options.filter(opt => opt.trim() !== '').length >= 2 &&
                         atLeastOneCorrectAnswer;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Create Your Quiz</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
          <Input
            value={currentQuestion.text}
            onChange={handleQuestionChange}
            placeholder="Ask something about yourself..."
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Question Image (Optional)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            {previewUrl ? (
              <div className="mb-4">
                <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Image className="h-12 w-12 text-gray-400" />
                <p className="mt-1 text-sm text-gray-500">
                  Click to upload an image
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG or GIF (max. 10MB)
                </p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              id="image-upload"
            />
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? 'Change Image' : 'Upload Image'}
            </Button>
            {previewUrl && (
              <Button
                type="button"
                variant="outline"
                className="mt-2 ml-2"
                onClick={() => {
                  setPreviewUrl('');
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Remove Image
              </Button>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Options (Select the correct answer)</label>
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <Checkbox
                checked={currentQuestion.correctAnswers[index]}
                onCheckedChange={() => handleCorrectAnswerChange(index)}
                className="mr-2"
              />
              <Input
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-grow"
              />
              {currentQuestion.options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                  className="ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addOption}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Another Option
          </Button>
        </div>
        
        <Button
          type="button"
          onClick={addQuestion}
          disabled={!canAddQuestion}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          Add Question
        </Button>
      </div>
      
      {questions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Your Questions</h2>
          
          {questions.map((question, index) => (
            <div key={index} className="border-b border-gray-200 py-4 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{question.text}</p>
                  {question.imageUrl && (
                    <img src={question.imageUrl} alt="Question" className="mt-2 max-h-20" />
                  )}
                </div>
                <div className="flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editQuestion(index)}
                    className="mr-1"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteQuestion(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-4 text-sm text-gray-500">
            {questions.length} of {MIN_QUESTIONS_REQUIRED} questions added
          </div>
          
          <Button
            type="button"
            onClick={handleFinishQuiz}
            disabled={questions.length < MIN_QUESTIONS_REQUIRED}
            className={`mt-4 w-full ${
              questions.length >= MIN_QUESTIONS_REQUIRED
                ? 'bg-pink-500 hover:bg-pink-600'
                : 'bg-pink-300'
            } text-white`}
          >
            Finish & Share
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizCreation;
