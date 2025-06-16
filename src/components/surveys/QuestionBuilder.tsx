
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Question {
  id?: number;
  question_text: string;
  question_type: string;
  is_required: boolean;
  order: number;
  options?: string[];
}

interface QuestionBuilderProps {
  surveyId: number;
}

const QUESTION_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'mcq', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'rating', label: 'Rating Scale' },
  { value: 'file', label: 'File Upload' },
];

export const QuestionBuilder = ({ surveyId }: QuestionBuilderProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [surveyId]);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/survey-questions/?survey=${surveyId}`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.results || data);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      // Mock data for development
      setQuestions([
        {
          id: 1,
          question_text: "How satisfied are you with our service?",
          question_type: "rating",
          is_required: true,
          order: 1
        },
        {
          id: 2,
          question_text: "What could we improve?",
          question_type: "textarea",
          is_required: false,
          order: 2
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      question_text: '',
      question_type: 'text',
      is_required: false,
      order: questions.length + 1,
      options: [],
    };
    setEditingQuestion(newQuestion);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion({ ...question });
  };

  const handleSaveQuestion = async (question: Question) => {
    try {
      const token = localStorage.getItem('authToken');
      const isNew = !question.id;
      
      const questionData = {
        ...question,
        survey: surveyId,
        options: ['mcq', 'checkbox', 'dropdown'].includes(question.question_type) 
          ? question.options?.filter(opt => opt.trim()) || []
          : undefined
      };

      const response = await fetch(
        isNew ? '/api/survey-questions/' : `/api/survey-questions/${question.id}/`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(questionData),
        }
      );

      if (response.ok) {
        const savedQuestion = await response.json();
        
        if (isNew) {
          setQuestions(prev => [...prev, savedQuestion]);
        } else {
          setQuestions(prev => prev.map(q => q.id === savedQuestion.id ? savedQuestion : q));
        }
        
        setEditingQuestion(null);
        toast({
          title: "Question saved",
          description: `Question ${isNew ? 'added' : 'updated'} successfully`,
        });
      }
    } catch (error) {
      console.error('Failed to save question:', error);
      toast({
        title: "Error",
        description: "Failed to save question",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/survey-questions/${questionId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
        toast({
          title: "Question deleted",
          description: "Question removed successfully",
        });
      }
    } catch (error) {
      console.error('Failed to delete question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Questions</CardTitle>
          <Button onClick={handleAddQuestion} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id || index} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium">{question.question_text}</h4>
                <p className="text-sm text-gray-600 capitalize">
                  {QUESTION_TYPES.find(t => t.value === question.question_type)?.label}
                  {question.is_required && ' (Required)'}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditQuestion(question)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                {question.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteQuestion(question.id!)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No questions added yet. Click "Add Question" to get started.</p>
          </div>
        )}

        {/* Question Editor Modal */}
        {editingQuestion && (
          <QuestionEditor
            question={editingQuestion}
            onSave={handleSaveQuestion}
            onCancel={() => setEditingQuestion(null)}
          />
        )}
      </CardContent>
    </Card>
  );
};

interface QuestionEditorProps {
  question: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

const QuestionEditor = ({ question: initialQuestion, onSave, onCancel }: QuestionEditorProps) => {
  const [question, setQuestion] = useState<Question>(initialQuestion);

  const handleChange = (field: keyof Question, value: any) => {
    setQuestion(prev => ({ ...prev, [field]: value }));
  };

  const handleAddOption = () => {
    const options = question.options || [];
    setQuestion(prev => ({ ...prev, options: [...options, ''] }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const options = [...(question.options || [])];
    options[index] = value;
    setQuestion(prev => ({ ...prev, options }));
  };

  const handleRemoveOption = (index: number) => {
    const options = question.options?.filter((_, i) => i !== index) || [];
    setQuestion(prev => ({ ...prev, options }));
  };

  const needsOptions = ['mcq', 'checkbox', 'dropdown'].includes(question.question_type);

  return (
    <Card className="mt-4 border-2 border-blue-200">
      <CardHeader>
        <CardTitle>{question.id ? 'Edit Question' : 'Add Question'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question_text">Question Text *</Label>
          <Textarea
            id="question_text"
            value={question.question_text}
            onChange={(e) => handleChange('question_text', e.target.value)}
            placeholder="Enter your question"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="question_type">Question Type</Label>
          <Select
            value={question.question_type}
            onValueChange={(value) => handleChange('question_type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {needsOptions && (
          <div className="space-y-2">
            <Label>Options</Label>
            {question.options?.map((option, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveOption(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={handleAddOption} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </Button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_required"
            checked={question.is_required}
            onChange={(e) => handleChange('is_required', e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="is_required">Required field</Label>
        </div>

        <div className="flex space-x-4">
          <Button
            onClick={() => onSave(question)}
            disabled={!question.question_text.trim()}
          >
            Save Question
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
