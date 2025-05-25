import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plane, 
  Clock, 
  MapPin,
  Filter,
  ArrowRight,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Flight, SearchFilters, User, Booking } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

export default function FlightSearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState<SearchFilters>({
    departureAirportCode: '',
    arrivalAirportCode: '',
    departureDate: '',
    passengers: 1,
    class: 'ECONOMY'
  });
  
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searchedFlights, setSearchedFlights] = useState<Flight[]>([]);
  const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
  const [searchedBookings, setSearchedBookings] = useState<Booking[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Fetch all flights on initial load (if no global search query)
    const loadAllFlights = async () => {
      setInitialLoading(true);
      try {
        const response = await apiService.getFlights();
        if (response.success) {
           // Handle both direct array and paginated response
          if (Array.isArray(response.data)) {
            setFlights(response.data);
          } else if (response.data && typeof response.data === 'object' && 'content' in response.data) {
            setFlights((response.data as any).content || []);
          } else {
            setFlights([]);
          }
        } else {
           toast({
            title: 'Error loading flights',
            description: response.message || 'Failed to fetch all flights.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error loading flights',
          description: 'An unexpected error occurred while fetching flights.',
          variant: 'destructive',
        });
      } finally {
        setInitialLoading(false);
      }
    };

    const query = searchParams.get('q');
    if (query) {
      performGlobalSearch(query);
    } else {
      loadAllFlights(); // Load all flights only if no global search query
    }
  }, [searchParams]);

  const performGlobalSearch = async (query: string) => {
    setSearching(true);
    setSearchedFlights([]); // Clear previous global search results
    setSearchedUsers([]);
    setSearchedBookings([]);

    try {
      // Assuming the backend returns an object with properties like flights, users, bookings
      const response = await apiService.globalSearch(query);
      if (response.success) {
        setSearchedFlights(response.data.flights || []);
        setSearchedUsers(response.data.users || []);
        setSearchedBookings(response.data.bookings || []);

        // Optionally show a toast if no results found across all types
        if ((response.data.flights?.length || 0) === 0 &&
            (response.data.users?.length || 0) === 0 &&
            (response.data.bookings?.length || 0) === 0) {
              toast({
                title: 'No Results Found',
                description: `No results found for "${query}"`, 
              });
            }

      } else {
        toast({
          title: 'Search Error',
          description: response.message || 'Failed to perform global search.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Global search failed:', error);
      toast({
        title: 'Search Error',
        description: 'An unexpected error occurred during global search.',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!filters.departureAirportCode || !filters.arrivalAirportCode) {
      toast({
        title: 'Missing Information',
        description: 'Please enter departure and arrival airport codes.',
        variant: 'destructive',
      });
      return;
    }

    // This is the flight-specific search form, not global search
    setLoading(true);
    try {
      const response = await apiService.searchFlights(filters);
      if (response.success) {
        setFlights(response.data.content);
        if (response.data.content.length === 0) {
          toast({
            title: 'No Flights Found',
            description: 'No flights match your search criteria. Try different dates or airports.',
          });
        }
      } else {
         toast({
          title: 'Search Error',
          description: response.message || 'Failed to search flights.',
          variant: 'destructive',
        });
      }
    } catch (error) {
       console.error('Flight search failed:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search flights. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookFlight = (flight: Flight) => {
    navigate('/booking', { state: { flight, filters } });
  };

  const getStatusColor = (status: Flight['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-green-100 text-green-800';
      case 'DELAYED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderFlightResult = (flight: Flight) => (
     <div key={flight.id} className="p-4 border rounded-md shadow-sm bg-white">
        <div className="flex justify-between items-center">
            <div>
                <p className="font-semibold">{flight.departureAirport?.airportCode} → {flight.arrivalAirport?.airportCode}</p>
                <p className="text-sm text-gray-600">{format(new Date(flight.departureTime), 'PPP p')} - {format(new Date(flight.arrivalTime), 'PPP p')}</p>
            </div>
            <Badge className={getStatusColor(flight.status)}>{flight.status}</Badge>
        </div>
        <p className="text-sm text-gray-500 mt-2">Flight Number: {flight.flightNumber}</p>
        <p className="text-sm text-gray-500">Duration: {flight.durationMinutes} minutes</p>
     </div>
  );

  const renderUserResult = (user: User) => (
    <div key={user.id} className="p-4 border rounded-md shadow-sm bg-white flex items-center space-x-4">
        <div className="bg-blue-100 text-blue-800 rounded-full h-10 w-10 flex items-center justify-center font-bold text-lg">
            {user.firstName?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
            <p className="font-semibold">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-600">Role: {user.role}</p>
        </div>
    </div>
  );

  const renderBookingResult = (booking: Booking) => (
     <div key={booking.id} className="p-4 border rounded-md shadow-sm bg-white">
        <p className="font-semibold">Booking ID: {String(booking.id).substring(0, 8)}...</p>
        <p className="text-sm text-gray-600">Passenger: {booking.passengerName}</p>
        <p className="text-sm text-gray-600">Flight: {booking.flight?.flightNumber} ({booking.flight?.departureAirport?.airportCode} → {booking.flight?.arrivalAirport?.airportCode})</p>
        <p className="text-sm text-gray-600">Status: {booking.status}</p>
     </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
        <p className="text-gray-600">Displaying results for your search query</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Flight Search
          </CardTitle>
          <CardDescription>Enter your travel details to find available flights</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departure">From</Label>
                <Input
                  id="departure"
                  placeholder="Departure airport code (e.g., JFK)"
                  value={filters.departureAirportCode}
                  onChange={(e) => setFilters({ ...filters, departureAirportCode: e.target.value.toUpperCase() })}
                  required
                  maxLength={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="arrival">To</Label>
                <Input
                  id="arrival"
                  placeholder="Arrival airport code (e.g., LAX)"
                  value={filters.arrivalAirportCode}
                  onChange={(e) => setFilters({ ...filters, arrivalAirportCode: e.target.value.toUpperCase() })}
                  required
                  maxLength={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Departure Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.departureDate ? format(new Date(filters.departureDate), 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.departureDate ? new Date(filters.departureDate) : undefined}
                      onSelect={(date) => setFilters({ 
                        ...filters, 
                        departureDate: date ? date.toISOString().split('T')[0] + 'T00:00:00' : '' 
                      })}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passengers">Passengers</Label>
                <Select value={filters.passengers?.toString()} onValueChange={(value) => setFilters({ ...filters, passengers: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'passenger' : 'passengers'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select value={filters.class} onValueChange={(value) => setFilters({ ...filters, class: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ECONOMY">Economy</SelectItem>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                    <SelectItem value="FIRST">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Searching...' : 'Search Flights'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searching ? (
        <div className="space-y-4">
           <Skeleton className="h-8 w-48"/>
           {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : (
        <div className="space-y-8">
          {searchedFlights.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Flights Found ({searchedFlights.length})</h2>
              <div className="space-y-4">
                {searchedFlights.map(renderFlightResult)}
              </div>
            </div>
          )}

          {searchedUsers.length > 0 && (
             <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Users Found ({searchedUsers.length})</h2>
               <div className="space-y-4">
                {searchedUsers.map(renderUserResult)}
               </div>
             </div>
          )}

          {searchedBookings.length > 0 && (
             <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Bookings Found ({searchedBookings.length})</h2>
               <div className="space-y-4">
                {searchedBookings.map(renderBookingResult)}
               </div>
             </div>
          )}

          {!initialLoading && !loading && !searching && searchedFlights.length === 0 && searchedUsers.length === 0 && searchedBookings.length === 0 && searchParams.has('q') && (
            <p className="text-center text-gray-600">No results found for "{searchParams.get('q')}"</p>
          )}
           {!initialLoading && !loading && !searching && !searchParams.has('q') && flights.length === 0 && (
             <p className="text-center text-gray-600">Use the search bar above or the flight search form to find results.</p>
           )}
            {!initialLoading && !loading && !searching && !searchParams.has('q') && flights.length > 0 && (
               <div className="space-y-4">
                 <h2 className="text-2xl font-bold text-gray-800">All Flights</h2>
                 <div className="space-y-4">
                  {flights.map(renderFlightResult)}
                 </div>
               </div>
            )}

        </div>
      )}
    </div>
  );
}
