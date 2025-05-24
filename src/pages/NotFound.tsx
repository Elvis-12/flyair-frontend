
import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plane } from 'lucide-react';

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(`404 Error: Page not found for path: ${location.pathname}`);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="bg-blue-100 p-6 w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center">
          <Plane className="h-16 w-16 text-blue-600 transform rotate-45" />
        </div>
        
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Flight Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for has either departed or doesn't exist.
          Please check your destination and try again.
        </p>
        
        <div className="space-y-4">
          <Button asChild className="px-8">
            <Link to="/">Return to Dashboard</Link>
          </Button>
          <div>
            <Link to="/search" className="text-blue-600 hover:underline text-sm">
              Search for Flights
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
