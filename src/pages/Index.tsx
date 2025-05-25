import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Plane, Bookmark, Calendar, Headset, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, loading]);

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
      {/* Optional: Background elements for visual interest */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        {/* Example: Add a subtle pattern or shape */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-300 opacity-20 rounded-full mix-blend-multiply animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-300 opacity-20 rounded-full mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute top-[40%] left-[40%] w-72 h-72 bg-pink-300 opacity-20 rounded-full mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center min-h-screen">
        {/* Hero Section */}
        <div className="mb-12 max-w-4xl">
          <div className="bg-blue-600 p-6 w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center shadow-lg">
            <Plane className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Discover Seamless Travel with <span className="text-blue-700">FlyAir</span>
          </h1>
          <p className="text-xl text-gray-700 mb-10 leading-relaxed">
            Your ultimate solution for airline management and effortless booking experiences.
          </p>
          
          {/* Call to Action Buttons - Moved up */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button asChild size="lg" className="px-10 py-3 text-lg font-semibold shadow-lg transform transition-transform hover:scale-105">
              <Link to="/search">Search Flights</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-10 py-3 text-lg font-semibold border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg transform transition-transform hover:scale-105">
              <Link to="/register">Create Account</Link>
            </Button>
          </div>
        </div>

        {/* About & Services Section - Using a grid for better layout */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 text-left mt-20">
          {/* About Us */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">About FlyAir</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              FlyAir is dedicated to providing exceptional airline services with a focus on comfort, safety, and affordability. Our mission is to connect people and places, making air travel accessible and enjoyable for everyone. We offer a wide range of flights to various destinations, backed by a commitment to excellent customer service and efficient operations.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mt-4">
              With a modern fleet and a team of experienced professionals, FlyAir ensures a smooth and reliable travel experience from booking to arrival. Whether you are traveling for business or leisure, we strive to make your journey memorable.
            </p>
          </div>

          {/* Our Services */}
          <div>
             <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Services</h2>
             <ul className="text-lg text-gray-700 leading-relaxed space-y-4">
               <li className="flex items-start">
                 <Bookmark className="text-blue-600 mr-3 mt-1 flex-shrink-0 h-6 w-6" />
                 <span>Easy Online Flight Booking: Search, compare, and book flights effortlessly with our user-friendly platform.</span>
               </li>
               <li className="flex items-start">
                 <Calendar className="text-blue-600 mr-3 mt-1 flex-shrink-0 h-6 w-6" />
                 <span>Flexible Booking Management: Easily modify or cancel your bookings online with our flexible options.</span>
               </li>
               <li className="flex items-start">
                 <Headset className="text-blue-600 mr-3 mt-1 flex-shrink-0 h-6 w-6" />
                 <span>24/7 Customer Support: Our dedicated support team is available around the clock to assist you with any queries.</span>
               </li>
               <li className="flex items-start">
                 <Award className="text-blue-600 mr-3 mt-1 flex-shrink-0 h-6 w-6" />
                 <span>Loyalty Program: Earn rewards and enjoy exclusive benefits with our frequent flyer program.</span>
               </li>
             </ul>
          </div>
        </div>
        
        {/* Popular Destinations Section */}
        <div className="w-full max-w-5xl mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Popular Destinations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Destination Cards */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-105 hover:shadow-xl group">
              <img src="/images/new-york.jpg" alt="New York City" className="w-full h-40 object-cover transition-opacity group-hover:opacity-90" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">New York</h3>
                <p className="text-gray-600">Explore the Big Apple</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-105 hover:shadow-xl group">
              <img src="/images/paris.jpg" alt="Paris, France" className="w-full h-40 object-cover transition-opacity group-hover:opacity-90" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Paris</h3>
                <p className="text-gray-600">The City of Love</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-105 hover:shadow-xl group">
              <img src="/images/tokyo.jpg" alt="Tokyo, Japan" className="w-full h-40 object-cover transition-opacity group-hover:opacity-90" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tokyo</h3>
                <p className="text-gray-600">A Blend of Tradition and Modernity</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-105 hover:shadow-xl group">
              <img src="/images/sydney.jpg" alt="Sydney, Australia" className="w-full h-40 object-cover transition-opacity group-hover:opacity-90" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sydney</h3>
                <p className="text-gray-600">Iconic Landmarks and Beaches</p>
              </div>
            </div>
            {/* Add more cities as needed */}
          </div>
        </div>

        {/* Small footer or additional info */}
        <div className="mt-20 text-center text-gray-600 text-sm">
          © 2025 FlyAir. All rights reserved.
        </div>

      </div>
    </div>
  );
}
