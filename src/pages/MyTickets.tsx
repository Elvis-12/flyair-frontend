
import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Ticket, 
  Search, 
  Plane, 
  MapPin, 
  Clock,
  CheckCircle,
  Download,
  QrCode
} from 'lucide-react';
import { Ticket as TicketType } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function MyTickets() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await apiService.getMyTickets();
      if (response.success) {
        setTickets(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tickets.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (ticketId: string) => {
    setCheckingIn(ticketId);
    try {
      const response = await apiService.checkInTicket(ticketId);
      if (response.success) {
        toast({
          title: 'Check-in Successful',
          description: 'You have successfully checked in for your flight.',
        });
        await loadTickets(); // Refresh the list
      }
    } catch (error) {
      toast({
        title: 'Check-in Failed',
        description: 'Failed to check in. Please try again or visit the airport counter.',
        variant: 'destructive',
      });
    } finally {
      setCheckingIn(null);
    }
  };

  const handleDownloadBoardingPass = (ticket: TicketType) => {
    // In a real app, this would generate and download a PDF boarding pass
    toast({
      title: 'Boarding Pass',
      description: 'Boarding pass download feature will be available soon.',
    });
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.booking.flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.booking.flight.departureAirport.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.booking.flight.arrivalAirport.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.passengerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: TicketType['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CHECKED_IN':
        return 'bg-green-100 text-green-800';
      case 'BOARDED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canCheckIn = (ticket: TicketType) => {
    const now = new Date();
    const departureTime = new Date(ticket.booking.flight.departureTime);
    const timeDifference = departureTime.getTime() - now.getTime();
    const hoursUntilDeparture = timeDifference / (1000 * 60 * 60);
    
    return (
      ticket.status === 'CONFIRMED' &&
      hoursUntilDeparture >= 1 && // Can check in 24 hours before, but not less than 1 hour
      hoursUntilDeparture <= 24 &&
      ticket.booking.flight.status === 'SCHEDULED'
    );
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
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
        <p className="text-gray-600">Check in and manage your flight tickets</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tickets List */}
      {filteredTickets.length > 0 ? (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Ticket className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{ticket.booking.flight.flightNumber}</CardTitle>
                      <CardDescription>Ticket #{ticket.id.slice(-8)}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>From</span>
                    </div>
                    <p className="font-medium">{ticket.booking.flight.departureAirport}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(ticket.booking.flight.departureTime).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(ticket.booking.flight.departureTime).toLocaleTimeString([], { 
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
                    <p className="font-medium">{ticket.booking.flight.arrivalAirport}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(ticket.booking.flight.arrivalTime).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(ticket.booking.flight.arrivalTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Ticket className="h-4 w-4" />
                      <span>Passenger</span>
                    </div>
                    <p className="font-medium">{ticket.passengerName}</p>
                    <p className="text-sm text-gray-600">Seat {ticket.seatNumber}</p>
                    {ticket.checkInTime && (
                      <p className="text-sm text-green-600">
                        Checked in: {new Date(ticket.checkInTime).toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Flight Info</span>
                    </div>
                    <p className="font-medium">{ticket.booking.flight.aircraft}</p>
                    <p className="text-sm text-gray-600">
                      Duration: {Math.round(
                        (new Date(ticket.booking.flight.arrivalTime).getTime() - 
                         new Date(ticket.booking.flight.departureTime).getTime()) / (1000 * 60 * 60)
                      )}h
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    {canCheckIn(ticket) && (
                      <Button
                        onClick={() => handleCheckIn(ticket.id)}
                        disabled={checkingIn === ticket.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {checkingIn === ticket.id ? 'Checking In...' : 'Check In'}
                      </Button>
                    )}
                    
                    {ticket.status === 'CHECKED_IN' && (
                      <Button
                        onClick={() => handleDownloadBoardingPass(ticket)}
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Boarding Pass
                      </Button>
                    )}
                  </div>
                  
                  {ticket.status === 'CHECKED_IN' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <QrCode className="h-4 w-4 mr-2" />
                          View QR Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Mobile Boarding Pass</DialogTitle>
                          <DialogDescription>
                            Show this QR code at security and boarding gate
                          </DialogDescription>
                        </DialogHeader>
                        <div className="text-center py-8">
                          <div className="w-48 h-48 bg-gray-100 mx-auto flex items-center justify-center rounded-lg">
                            <QrCode className="h-24 w-24 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-600 mt-4">
                            Flight: {ticket.booking.flight.flightNumber}<br />
                            Seat: {ticket.seatNumber}<br />
                            Gate: A12 (Check airport displays)
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                
                {ticket.status === 'CONFIRMED' && !canCheckIn(ticket) && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {new Date(ticket.booking.flight.departureTime) > new Date() 
                        ? 'Check-in will be available 24 hours before departure'
                        : 'Check-in is no longer available for this flight'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No matching tickets found' : 'No tickets yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms.' 
                : 'Your tickets will appear here after booking flights.'
              }
            </p>
            {!searchTerm && (
              <Button>
                <Plane className="h-4 w-4 mr-2" />
                Book a Flight
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
