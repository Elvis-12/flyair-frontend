
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Plane } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="bg-blue-600 p-6 w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center">
          <Plane className="h-12 w-12 text-white" />
        </div>
        
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to FlyAir</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your seamless airline management and booking experience
        </p>
        
        <div className="flex items-center justify-center space-x-4">
          <Button asChild size="lg" className="px-8">
            <a href="/login">Sign In</a>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8">
            <a href="/register">Create Account</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
