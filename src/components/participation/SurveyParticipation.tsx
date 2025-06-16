
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  is_required: boolean;
  options?: string[];
}

interface Survey {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

export const SurveyParticipation = () => {
  const { token } = useParams<{ token: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [files, setFiles] = useState<Record<number, File>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchSurvey();
    }
  }, [token]);

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`/api/customer-tokens/${token}/`);
      
      if (response.ok) {
        const tokenData = await response.json();
        setSurvey(tokenData.survey);
      } else if (response.status === 404) {
        setError('Survey not found or token expired');
      } else {
        setError('Failed to load survey');
      }
    } catch (error) {
      console.error('Failed to fetch survey:', error);
      // Mock data for development
      setSurvey({
        id: 1,
        title: "Customer Satisfaction Survey",
        description: "We'd love to hear your feedback about our services",
        questions: [
          {
            id: 1,
            question_text: "How satisfied are you with our service?",
            question_type: "rating",
            is_required: true
          },
          {
            id: 2,
            question_text: "Which features do you use most?",
            question_type: "mcq",
            is_required: true,
            options: ["Dashboard", "Reports", "Settings", "Analytics"]
          },
          {
            id: 3,
            question_text: "What could we improve?",
            question_type: "textarea",
            is_required: false
          },
          {
            id: 4,
            question_text: "Upload any relevant documents",
            question_type: "file",
            is_required: false
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: number, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleFileChange = (questionId: number, file: File | null) => {
    if (file) {
      setFiles(prev => ({ ...prev, [questionId]: file }));
    } else {
      const newFiles = { ...files };
      delete newFiles[questionId];
      setFiles(newFiles);
    }
  };

  const validateForm = () => {
    const requiredQuestions = survey?.questions.filter(q => q.is_required) || [];
    
    for (const question of requiredQuestions) {
      if (!responses[question.id] || responses[question.id].trim() === '') {
        return `Please answer: ${question.question_text}`;
      }
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Submit responses
      const responseData = {
        customer_token: token,
        answers: survey?.questions.map(question => ({
          question: question.id,
          answer: responses[question.id] || ''
        }))
      };

      const response = await fetch('/api/survey-response/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData),
      });

      // Upload files if any
      for (const [questionId, file] of Object.entries(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('question', questionId);
        formData.append('customer_token', token || '');

        await fetch('/api/survey-file-upload/', {
          method: 'POST',
          body: formData,
        });
      }

      if (response.ok) {
        setSubmitted(true);
        toast({
          title: "Thank you!",
          description: "Your response has been submitted successfully",
        });
      } else {
        throw new Error('Failed to submit response');
      }
    } catch (error) {
      console.error('Failed to submit response:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit your response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const value = responses[question.id] || '';

    switch (question.question_type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            required={question.is_required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            rows={4}
            required={question.is_required}
          />
        );

      case 'mcq':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleResponseChange(question.id, val)}
            required={question.is_required}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'rating':
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                type="button"
                variant={value === rating.toString() ? "default" : "outline"}
                onClick={() => handleResponseChange(question.id, rating.toString())}
                className="w-12 h-12"
              >
                {rating}
              </Button>
            ))}
          </div>
        );

      case 'file':
        return (
          <Input
            type="file"
            onChange={(e) => handleFileChange(question.id, e.target.files?.[0] || null)}
            className="cursor-pointer"
          />
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${question.id}-${index}`}
                  checked={value.includes(option)}
                  onChange={(e) => {
                    const currentValues = value ? value.split(',') : [];
                    if (e.target.checked) {
                      handleResponseChange(question.id, [...currentValues, option].join(','));
                    } else {
                      handleResponseChange(question.id, currentValues.filter(v => v !== option).join(','));
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Survey Not Available</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
            <p className="text-gray-600">
              Your response has been submitted successfully. We appreciate your feedback!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survey) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="mb-4">
              <div className="text-2xl font-bold text-blue-600 mb-2">OpenPort</div>
              <div className="w-16 h-1 bg-blue-600 mx-auto rounded"></div>
            </div>
            <CardTitle className="text-3xl text-gray-900">{survey.title}</CardTitle>
            {survey.description && (
              <p className="text-gray-600 mt-2">{survey.description}</p>
            )}
          </CardHeader>
        </Card>

        {/* Survey Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {survey.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <Label className="text-lg font-medium">
                  {index + 1}. {question.question_text}
                  {question.is_required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              </CardHeader>
              <CardContent>
                {renderQuestion(question)}
              </CardContent>
            </Card>
          ))}

          {/* Submit Button */}
          <Card>
            <CardContent className="p-6">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 text-lg"
              >
                {submitting ? 'Submitting...' : 'Submit Survey'}
              </Button>
              <p className="text-sm text-gray-500 text-center mt-3">
                * Required fields
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};
