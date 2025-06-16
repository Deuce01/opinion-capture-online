
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Users, ArrowLeft } from 'lucide-react';

interface QuestionStats {
  question: string;
  question_type: string;
  stats: Array<{
    answer: string;
    count: number;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const SurveyAnalytics = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [analytics, setAnalytics] = useState<QuestionStats[]>([]);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (surveyId) {
      fetchAnalytics();
      fetchSurveyDetails();
    }
  }, [surveyId]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/survey-question-stats/?survey=${surveyId}`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.questions || []);
        setTotalResponses(data.total_responses || 0);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Mock data for development
      setAnalytics([
        {
          question: 'How satisfied are you with our service?',
          question_type: 'rating',
          stats: [
            { answer: '1', count: 2 },
            { answer: '2', count: 1 },
            { answer: '3', count: 5 },
            { answer: '4', count: 12 },
            { answer: '5', count: 8 }
          ]
        },
        {
          question: 'Which features do you use most?',
          question_type: 'mcq',
          stats: [
            { answer: 'Dashboard', count: 15 },
            { answer: 'Reports', count: 12 },
            { answer: 'Settings', count: 8 },
            { answer: 'Analytics', count: 10 }
          ]
        }
      ]);
      setTotalResponses(28);
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
      setSurveyTitle('Survey Analytics');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/export-responses/?survey=${surveyId}&format=csv`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `survey-${surveyId}-analytics.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  const renderChart = (questionStat: QuestionStats) => {
    if (questionStat.question_type === 'rating') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={questionStat.stats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="answer" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (['mcq', 'checkbox', 'dropdown'].includes(questionStat.question_type)) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={questionStat.stats}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ answer, percent }) => `${answer} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {questionStat.stats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <div className="text-center py-12 text-gray-500">
        <p>Text responses cannot be visualized as charts</p>
        <p className="text-sm mt-2">Total responses: {questionStat.stats.reduce((sum, stat) => sum + stat.count, 0)}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Survey Analytics</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-gray-200 rounded"></div>
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
        <div className="flex items-center space-x-4">
          <Link to={`/responses/${surveyId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Responses
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Survey Analytics</h1>
            <p className="text-gray-600 mt-1">{surveyTitle}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link to={`/responses/${surveyId}`}>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              View Responses
            </Button>
          </Link>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-4xl font-bold">{totalResponses}</p>
            <p className="text-blue-100 mt-2">Total Survey Responses</p>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analytics.map((questionStat, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{questionStat.question}</CardTitle>
              <p className="text-sm text-gray-600 capitalize">
                {questionStat.question_type.replace('_', ' ')} • {questionStat.stats.reduce((sum, stat) => sum + stat.count, 0)} responses
              </p>
            </CardHeader>
            <CardContent>
              {renderChart(questionStat)}
            </CardContent>
          </Card>
        ))}
      </div>

      {analytics.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics available</h3>
            <p className="text-gray-600">Analytics will appear here once people start responding to your survey</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
