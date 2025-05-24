import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Search, 
  Plane, 
  MapPin, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Booking } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await apiService.getMyBookings();
      if (response.success) {
        if (Array.isArray(response.data)) {
          setBookings(response.data);
        } else if (response.data && typeof response.data === 'object' && 'content' in response.data) {
          setBookings((response.data as any).content || []);
        } else {
          setBookings([]);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load bookings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setCancelling(bookingId);
    try {
      const response = await apiService.cancelBooking(bookingId);
      if (response.success) {
        toast({
          title: 'Booking Cancelled',
          description: 'Your booking has been cancelled successfully.',
        });
        await loadBookings(); // Refresh the list
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCancelling(null);
    }
  };

  const filteredBookings = bookings.filter(booking =>
    (booking.flight?.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    booking.flight?.departureAirport?.airportName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.flight?.arrivalAirport?.airportName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.passengerName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600">View and manage your flight bookings</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Plane className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{booking.flight.flightNumber}</CardTitle>
                      <CardDescription>Booking #{String(booking.id).slice(-8)}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(booking.status)}
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>From</span>
                    </div>
                    <p className="font-medium">{booking.flight?.departureAirport?.airportName}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.flight.departureTime).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.flight.departureTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>To</span>
                    </div>
                    <p className="font-medium">{booking.flight?.arrivalAirport?.airportName}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.flight.arrivalTime).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.flight.arrivalTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Passenger</span>
                    </div>
                    <p className="font-medium">{booking.passengerName}</p>
                    {booking.seatNumber && (
                      <p className="text-sm text-gray-600">Seat {booking.seatNumber}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Total Price</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">${booking.totalPrice}</p>
                    <p className="text-sm text-gray-600">
                      Flight Duration: {Math.round(
                        (new Date(booking.flight.arrivalTime).getTime() - 
                         new Date(booking.flight.departureTime).getTime()) / (1000 * 60 * 60)
                      )}h
                    </p>
                  </div>
                </div>
                
                {booking.status === 'CONFIRMED' && new Date(booking.flight.departureTime) > new Date() && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      You can cancel this booking up to 24 hours before departure
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Cancel Booking
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this booking? This action cannot be undone.
                            You may be eligible for a refund based on our cancellation policy.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancelling === booking.id}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {cancelling === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No matching bookings found' : 'No bookings yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms.' 
                : 'When you book a flight, it will appear here.'
              }
            </p>
            {!searchTerm && (
              <Button>
                <Plane className="h-4 w-4 mr-2" />
                Search Flights
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
