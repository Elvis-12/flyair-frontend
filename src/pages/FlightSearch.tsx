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
import { Flight, SearchFilters } from '@/types';
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
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Fetch all flights on initial load
    const loadAllFlights = async () => {
      try {
        setInitialLoading(true);
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

    loadAllFlights();
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      performGlobalSearch(query);
    }
  }, [searchParams]);

  const performGlobalSearch = async (query: string) => {
    setSearching(true);
    try {
      const response = await apiService.globalSearch(query);
      if (response.success) {
        setFlights(response.data.flights || []);
      }
    } catch (error) {
      toast({
        title: 'Search Error',
        description: 'Failed to perform search.',
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
      }
    } catch (error) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Search Flights</h1>
        <p className="text-gray-600">Find the perfect flight for your journey</p>
      </div>

      {/* Search Form */}
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
                    <SelectItem value="FIRST_CLASS">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Searching...' : 'Search Flights'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      <div className="space-y-4">
        {(loading || searching) && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        )}
        
        {!loading && !searching && flights.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {flights.length} {flights.length === 1 ? 'flight' : 'flights'} found
              </h2>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            
            {flights.map((flight) => (
              <Card key={flight.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Plane className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{flight.flightNumber}</h3>
                          <p className="text-sm text-gray-600">{flight.aircraft}</p>
                        </div>
                        <Badge className={getStatusColor(flight.status)}>
                          {flight.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{flight.departureAirport?.airportCode}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(flight.departureTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center">
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{flight.arrivalAirport?.airportCode}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(flight.arrivalTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {Math.round(
                                (new Date(flight.arrivalTime).getTime() - new Date(flight.departureTime).getTime()) / 
                                (1000 * 60 * 60)
                              )}h flight
                            </span>
                          </div>
                          <span>{flight.availableSeats} seats available</span>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">${flight.price}</p>
                          <p className="text-sm text-gray-600">per person</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <Button 
                        onClick={() => handleBookFlight(flight)}
                        disabled={flight.status !== 'SCHEDULED' || flight.availableSeats === 0}
                        className="px-8"
                      >
                        {flight.availableSeats === 0 ? 'Sold Out' : 'Select Flight'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
        
        {!loading && !searching && flights.length === 0 && searchParams.get('q') && (
          <Card>
            <CardContent className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No flights found</h3>
              <p className="text-gray-600">
                No flights match your search for "{searchParams.get('q')}". Try different search terms.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
