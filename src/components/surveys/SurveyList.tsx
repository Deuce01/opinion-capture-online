
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Archive, Eye } from 'lucide-react';

export const SurveyList = () => {
  const [surveys, setSurveys] = useState([
    { id: 1, title: 'Customer Satisfaction Survey', status: 'active' },
    { id: 2, title: 'Employee Feedback Form', status: 'draft' },
    { id: 3, title: 'Product Evaluation Survey', status: 'closed' },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Surveys</h2>
        <Button asChild>
          <Link to="/surveys/create" className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Create Survey
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {surveys.map((survey) => (
          <Card key={survey.id} className="bg-white shadow-md rounded-md">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {survey.title}
                <div>
                  {survey.status === 'active' && <Badge className="bg-green-500 text-white">Active</Badge>}
                  {survey.status === 'draft' && <Badge variant="secondary">Draft</Badge>}
                  {survey.status === 'closed' && <Badge variant="destructive">Closed</Badge>}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/responses/${survey.id}`} className="flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    View Responses
                  </Link>
                </Button>
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/surveys/${survey.id}/edit`} className="flex items-center">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button variant="destructive" size="sm">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
