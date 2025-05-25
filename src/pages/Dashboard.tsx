import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Calendar, 
  Ticket, 
  Users, 
  Plane, 
  DollarSign,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Booking, DashboardStats, Flight } from '@/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CalendarIcon } from 'lucide-react';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (isAdmin) {
          const statsResponse = await apiService.getDashboardStats();
          if (statsResponse.success) {
            setDashboardStats(statsResponse.data);
          }
        } else {
          const bookingsResponse = await apiService.getMyBookings();
          if (bookingsResponse.success) {
            const upcoming = (bookingsResponse.data as any).content.filter(
              booking => new Date(booking.flight.departureTime) > new Date()
            ).slice(0, 3);
            setUpcomingBookings(upcoming);
          }
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAdmin]);

  const handleBookFlight = (flight: Flight) => {
    console.log('Book Flight clicked for:', flight);
    toast({ title: 'Booking feature not fully implemented yet.'});
  };

  const getStatusColor = (status: Flight['status'] | Booking['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-green-100 text-green-800';
      case 'DELAYED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}. Here's your system overview.</p>
        </div>

        {/* Admin Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Flights</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.totalFlights || 0}</div>
              <p className="text-xs text-muted-foreground">Active flights in system</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.totalBookings || 0}</div>
              <p className="text-xs text-muted-foreground">All time bookings</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardStats?.totalRevenue || 0}</div>
              <p className="text-xs text-muted-foreground">Total revenue generated</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest booking activity across the system</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardStats?.recentBookings && dashboardStats.recentBookings.length > 0 ? (
              <div className="space-y-4">
                {dashboardStats.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{booking.passengerName}</p>
                      <p className="text-sm text-gray-600">
                        {booking.flight.departureAirport?.airportCode} → {booking.flight.arrivalAirport?.airportCode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${booking.totalPrice}</p>
                      <p className="text-sm text-gray-600">{booking.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent bookings</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plane className="h-5 w-5 mr-2" />
                Manage Flights
              </CardTitle>
              <CardDescription>Create and manage flight schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/admin/flights">Go to Flights</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                View Bookings
              </CardTitle>
              <CardDescription>Monitor all customer bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/admin/bookings">Go to Bookings</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Manage Users
              </CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/admin/users">Go to Users</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Welcome back, {user?.firstName}!</h1>
        <p className="mt-2 text-lg text-gray-600">Here's a quick overview of your upcoming travel.</p>
      </div>

      {/* Upcoming Bookings Section */}
      <Card className="shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-2xl font-bold text-gray-800">Upcoming Bookings</CardTitle>
          <CardDescription className="text-gray-600">Your next scheduled flights.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {upcomingBookings.length > 0 ? (
            <div className="space-y-6">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border border-gray-200 rounded-md bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex-grow mb-4 sm:mb-0">
                    <p className="text-lg font-semibold text-gray-800">{booking.flight.departureAirport?.airportCode} <ArrowRight className="inline-block h-4 w-4 mx-1 text-gray-500" /> {booking.flight.arrivalAirport?.airportCode}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      <CalendarIcon className="inline-block h-4 w-4 mr-1 text-gray-500" />
                      {format(new Date(booking.flight.departureTime), 'PPP p')}
                    </p>
                     {booking.flight.flightNumber && (
                       <p className="text-sm text-gray-600 mt-1"><Plane className="inline-block h-4 w-4 mr-1 text-gray-500" /> Flight Number: {booking.flight.flightNumber}</p>
                     )}
                  </div>
                  <div className="flex-shrink-0">
                     <Badge className={`text-sm px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}>{booking.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Plane className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <p className="text-xl font-semibold text-gray-600 mb-3">No upcoming bookings</p>
              <p className="text-gray-500 mb-6">Looks like you don't have any flights scheduled yet.</p>
              <Button asChild size="lg">
                <Link to="/search">Find and Book a Flight</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
