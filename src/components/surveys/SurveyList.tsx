
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, BarChart, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Survey {
  id: number;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
  response_count?: number;
}

export const SurveyList = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/surveys/', {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSurveys(data.results || data);
      }
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
      // Mock data for development
      setSurveys([
        {
          id: 1,
          title: "Customer Satisfaction Survey",
          description: "Collect feedback about our services",
          is_active: true,
          created_at: "2024-01-15T10:00:00Z",
          response_count: 45
        },
        {
          id: 2,
          title: "Product Feedback",
          description: "Gather insights about our new product features",
          is_active: true,
          created_at: "2024-01-10T14:30:00Z",
          response_count: 23
        },
        {
          id: 3,
          title: "Employee Engagement",
          description: "Internal survey for team feedback",
          is_active: false,
          created_at: "2024-01-05T09:15:00Z",
          response_count: 12
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSurveyStatus = async (surveyId: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/surveys/${surveyId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        setSurveys(surveys.map(survey => 
          survey.id === surveyId 
            ? { ...survey, is_active: !currentStatus }
            : survey
        ));
        toast({
          title: "Survey updated",
          description: `Survey ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        });
      }
    } catch (error) {
      console.error('Failed to update survey:', error);
      toast({
        title: "Error",
        description: "Failed to update survey status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Surveys</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Surveys</h1>
          <p className="text-gray-600 mt-1">Manage your survey collection</p>
        </div>
        <Link to="/surveys/create">
          <Button className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Create Survey
          </Button>
        </Link>
      </div>

      {/* Survey Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map((survey) => (
          <Card key={survey.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{survey.title}</CardTitle>
                <Badge variant={survey.is_active ? "default" : "secondary"}>
                  {survey.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{survey.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Responses: {survey.response_count || 0}</span>
                  <span>Created: {new Date(survey.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex space-x-2">
                  <Link to={`/surveys/${survey.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Link to={`/responses/${survey.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Users className="w-4 h-4 mr-1" />
                      Responses
                    </Button>
                  </Link>
                  <Link to={`/analytics/${survey.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart className="w-4 h-4 mr-1" />
                      Analytics
                    </Button>
                  </Link>
                </div>
                
                <Button
                  variant={survey.is_active ? "destructive" : "default"}
                  size="sm"
                  className="w-full"
                  onClick={() => toggleSurveyStatus(survey.id, survey.is_active)}
                >
                  {survey.is_active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {surveys.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first survey</p>
            <Link to="/surveys/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Survey
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
