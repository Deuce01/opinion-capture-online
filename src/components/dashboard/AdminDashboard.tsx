
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { DashboardOverview } from './DashboardOverview';
import { SurveyList } from '@/components/surveys/SurveyList';
import { CreateSurvey } from '@/components/surveys/CreateSurvey';
import { EditSurvey } from '@/components/surveys/EditSurvey';
import { SurveyResponses } from '@/components/responses/SurveyResponses';
import { SurveyAnalytics } from '@/components/analytics/SurveyAnalytics';
import { UserProfile } from '@/components/profile/UserProfile';
import { SurveyParticipation } from '@/components/participation/SurveyParticipation';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to dashboard if on root
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [location.pathname, navigate]);

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/surveys" element={<SurveyList />} />
        <Route path="/surveys/create" element={<CreateSurvey />} />
        <Route path="/surveys/:id/edit" element={<EditSurvey />} />
        <Route path="/responses/:surveyId" element={<SurveyResponses />} />
        <Route path="/analytics/:surveyId" element={<SurveyAnalytics />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/participate/:token" element={<SurveyParticipation />} />
      </Routes>
    </DashboardLayout>
  );
};
