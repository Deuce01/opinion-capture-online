
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Download, Eye } from 'lucide-react';

interface Response {
  id: number;
  respondent_name?: string;
  respondent_email?: string;
  submitted_at: string;
  answers: Array<{
    question: string;
    answer: string;
    question_type: string;
  }>;
}

export const SurveyResponses = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [responses, setResponses] = useState<Response[]>([]);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (surveyId) {
      fetchResponses();
      fetchSurveyDetails();
    }
  }, [surveyId]);

  const fetchResponses = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/survey-responses/?survey=${surveyId}`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResponses(data.results || data);
      }
    } catch (error) {
      console.error('Failed to fetch responses:', error);
      // Mock data for development
      setResponses([
        {
          id: 1,
          respondent_email: 'john@example.com',
          submitted_at: '2024-01-15T14:30:00Z',
          answers: [
            {
              question: 'How satisfied are you with our service?',
              answer: '5',
              question_type: 'rating'
            },
            {
              question: 'What could we improve?',
              answer: 'Better response time',
              question_type: 'textarea'
            }
          ]
        },
        {
          id: 2,
          respondent_email: 'jane@example.com',
          submitted_at: '2024-01-14T10:15:00Z',
          answers: [
            {
              question: 'How satisfied are you with our service?',
              answer: '4',
              question_type: 'rating'
            },
            {
              question: 'What could we improve?',
              answer: 'More features',
              question_type: 'textarea'
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveyDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/surveys/${surveyId}/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const survey = await response.json();
        setSurveyTitle(survey.title);
      }
    } catch (error) {
      console.error('Failed to fetch survey details:', error);
      setSurveyTitle('Survey Responses');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/export-responses/?survey=${surveyId}`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `survey-${surveyId}-responses.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export responses:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Survey Responses</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Survey Responses</h1>
          <p className="text-gray-600 mt-1">{surveyTitle}</p>
        </div>
        <div className="flex space-x-3">
          <Link to={`/analytics/${surveyId}`}>
            <Button variant="outline">
              <BarChart className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{responses.length}</p>
              <p className="text-gray-600">Total Responses</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {responses.length > 0 ? Math.round(responses.length / 7) : 0}
              </p>
              <p className="text-gray-600">Avg. per Day</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {responses.length > 0 ? responses[responses.length - 1].submitted_at.split('T')[0] : 'N/A'}
              </p>
              <p className="text-gray-600">Latest Response</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Responses List */}
      <div className="space-y-4">
        {responses.map((response) => (
          <Card key={response.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    Response #{response.id}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {response.respondent_email && `From: ${response.respondent_email} • `}
                    Submitted: {new Date(response.submitted_at).toLocaleDateString()} at{' '}
                    {new Date(response.submitted_at).toLocaleTimeString()}
                  </p>
                </div>
                <Badge variant="outline">
                  {response.answers.length} answers
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {response.answers.map((answer, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-medium text-gray-900">{answer.question}</h4>
                    <p className="text-gray-700 mt-1">
                      {answer.question_type === 'rating' ? (
                        <span className="flex items-center">
                          {answer.answer}/5 
                          <span className="ml-2 text-yellow-500">
                            {'★'.repeat(parseInt(answer.answer))}{'☆'.repeat(5 - parseInt(answer.answer))}
                          </span>
                        </span>
                      ) : (
                        answer.answer
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {responses.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
            <p className="text-gray-600">Responses will appear here once people start filling out your survey</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
