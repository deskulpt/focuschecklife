import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AssessmentApp from '@/components/AssessmentApp';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-medical-light/20 to-background">
        <div className="text-center">
          <img src="/logo.png" alt="FocusCheck" className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <AssessmentApp />;
};

export default Index;
