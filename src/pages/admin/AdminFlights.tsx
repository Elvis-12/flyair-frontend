import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plane, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Filter,
  MapPin,
  Clock,
  Download,
  // Import Seat icon again if needed for the manage seats button/dialog
} from 'lucide-react';
import { Flight, Airport, Seat } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

export default function AdminFlights() {
  const { user } = useAuth();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [isManageSeatsDialogOpen, setIsManageSeatsDialogOpen] = useState(false);
  const [selectedFlightForSeats, setSelectedFlightForSeats] = useState<Flight | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [seatsToAssign, setSeatsToAssign] = useState<{ seatId: number; price: number; isAvailable: boolean }[]>([]);
  const [formData, setFormData] = useState({
    flightNumber: '',
    departureAirportId: 0,
    arrivalAirportId: 0,
    departureTime: '',
    arrivalTime: '',
    gateNumber: '',
    terminal: '',
    aircraftType: '',
    status: 'SCHEDULED' as Flight['status']
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [flightsResponse, airportsResponse] = await Promise.all([
          apiService.getFlights(),
          apiService.getAirports()
        ]);

        if (flightsResponse.success) {
          // Handle both direct array and paginated response
          if (Array.isArray(flightsResponse.data)) {
            setFlights(flightsResponse.data);
          } else if (flightsResponse.data && typeof flightsResponse.data === 'object' && 'content' in flightsResponse.data) {
            setFlights((flightsResponse.data as any).content || []);
          } else {
            setFlights([]);
          }
        }

        if (airportsResponse.success) {
          // Handle both direct array and paginated response
          if (Array.isArray(airportsResponse.data)) {
            setAirports(airportsResponse.data);
          } else if (airportsResponse.data && typeof airportsResponse.data === 'object' && 'content' in airportsResponse.data) {
            setAirports((airportsResponse.data as any).content || []);
          } else {
            setAirports([]);
          }
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const seatsResponse = await apiService.getSeats();
        if (seatsResponse.success && seatsResponse.data && 'content' in seatsResponse.data) {
          setSeats((seatsResponse.data as any).content || []);
        } else if (seatsResponse.success && Array.isArray(seatsResponse.data)) {
           setSeats(seatsResponse.data || []);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load seats.',
          variant: 'destructive',
        });
      }
    };

    // Fetch seats when the component mounts
    fetchSeats();
  }, []); // Empty dependency array means this runs once on mount

  const handleCreateFlight = async () => {
    try {
      const response = await apiService.createFlight(formData);
      if (response.success) {
        setFlights([...flights, response.data]);
        setIsDialogOpen(false);
        resetForm();
        toast({
          title: 'Success',
          description: 'Flight created successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create flight.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateFlight = async () => {
    if (!editingFlight) return;
    setLoading(true);
    try {
      const response = await apiService.updateFlight(String(editingFlight.id), {
        ...formData,
        departureAirportId: Number(formData.departureAirportId),
        arrivalAirportId: Number(formData.arrivalAirportId),
        // Ensure status is correctly typed if needed by the API
        status: formData.status as 'SCHEDULED' | 'DELAYED' | 'CANCELLED' | 'COMPLETED',
      });
      if (response.success) {
        setFlights(flights.map(flight => 
          flight.id === editingFlight.id ? response.data : flight
        ));
        setIsDialogOpen(false);
        resetForm();
        toast({
          title: 'Success',
          description: 'Flight updated successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update flight.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFlight = async (flightId: number) => {
    setLoading(true);
    try {
      const response = await apiService.deleteFlight(String(flightId));
      if (response.success) {
        setFlights(flights.filter(flight => flight.id !== flightId));
        toast({
          title: 'Success',
          description: 'Flight deleted successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete flight.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (flight: Flight) => {
    setEditingFlight(flight);
    setFormData({
      flightNumber: flight.flightNumber,
      departureAirportId: flight.departureAirportId,
      arrivalAirportId: flight.arrivalAirportId,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      gateNumber: flight.gateNumber,
      terminal: flight.terminal,
      aircraftType: flight.aircraftType,
      status: flight.status
    });
    setIsDialogOpen(true);
  };

  const handleManageSeatsClick = (flight: Flight) => {
    setSelectedFlightForSeats(flight);
    setSeatsToAssign(seats.map(seat => ({
      seatId: Number(seat.id),
      price: 0,
      isAvailable: true,
    })));
    setIsManageSeatsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingFlight(null);
    setFormData({
      flightNumber: '',
      departureAirportId: 0,
      arrivalAirportId: 0,
      departureTime: '',
      arrivalTime: '',
      gateNumber: '',
      terminal: '',
      aircraftType: '',
      status: 'SCHEDULED' as Flight['status'], // Ensure default status is a valid type
    });
  };

  const filteredFlights = flights.filter(flight => {
    const matchesSearch = flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase());
    // Ensure status comparison is correct
    const matchesStatus = statusFilter === 'ALL' || flight.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      SCHEDULED: 'default',
      DELAYED: 'secondary',
      CANCELLED: 'destructive',
      COMPLETED: 'secondary'
    } as const;
    return variants[status as keyof typeof variants] || 'default';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flights Management</h1>
          <p className="text-gray-600">Manage flight schedules and routes</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Flight
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by flight number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="DELAYED">Delayed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flights Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Flights ({filteredFlights.length})</CardTitle>
          <CardDescription>
            Manage flight schedules and routes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flight Number</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Gate</TableHead>
                  <TableHead>Aircraft</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlights.map((flight) => (
                  <TableRow key={flight.id}>
                    <TableCell className="font-medium">
                      {flight.flightNumber}
                    </TableCell>
                    <TableCell>
                      {airports.find(a => a.id === flight.departureAirportId)?.airportCode} → {airports.find(a => a.id === flight.arrivalAirportId)?.airportCode}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Departure: {new Date(flight.departureTime).toLocaleString()}</div>
                        <div>Arrival: {new Date(flight.arrivalTime).toLocaleString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {flight.gateNumber} ({flight.terminal})
                    </TableCell>
                    <TableCell>{flight.aircraftType}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(flight.status)}>
                        {flight.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(flight)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFlight(Number(flight.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageSeatsClick(flight)}
                      >
                        Seats
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingFlight ? 'Edit Flight' : 'Add New Flight'}</DialogTitle>
            <DialogDescription>
              {editingFlight ? 'Update flight details' : 'Create a new flight'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="text-sm font-medium">Flight Number</label>
              <Input
                value={formData.flightNumber}
                onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                placeholder="e.g., FL101"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Departure Airport</label>
              <Select
                value={String(formData.departureAirportId)}
                onValueChange={(value) => setFormData({ ...formData, departureAirportId: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select departure airport" />
                </SelectTrigger>
                <SelectContent>
                  {airports.map((airport) => (
                    <SelectItem key={airport.id} value={String(airport.id)}>
                      {airport.airportCode} - {airport.airportName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Arrival Airport</label>
              <Select
                value={String(formData.arrivalAirportId)}
                onValueChange={(value) => setFormData({ ...formData, arrivalAirportId: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select arrival airport" />
                </SelectTrigger>
                <SelectContent>
                  {airports.map((airport) => (
                    <SelectItem key={airport.id} value={String(airport.id)}>
                      {airport.airportCode} - {airport.airportName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Departure Time</label>
              <Input
                type="datetime-local"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Arrival Time</label>
              <Input
                type="datetime-local"
                value={formData.arrivalTime}
                onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Gate Number</label>
              <Input
                value={formData.gateNumber}
                onChange={(e) => setFormData({ ...formData, gateNumber: e.target.value })}
                placeholder="e.g., A1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Terminal</label>
              <Input
                value={formData.terminal}
                onChange={(e) => setFormData({ ...formData, terminal: e.target.value })}
                placeholder="e.g., T1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Aircraft Type</label>
              <Input
                value={formData.aircraftType}
                onChange={(e) => setFormData({ ...formData, aircraftType: e.target.value })}
                placeholder="e.g., Boeing 737"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={String(formData.status)}
                onValueChange={(value) => setFormData({ ...formData, status: value as Flight['status'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="DELAYED">Delayed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingFlight ? handleUpdateFlight : handleCreateFlight}
            >
              {editingFlight ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Seats Dialog */}
      <Dialog open={isManageSeatsDialogOpen} onOpenChange={setIsManageSeatsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Seats for {selectedFlightForSeats?.flightNumber}</DialogTitle>
            <DialogDescription>
              Assign and manage seats for this flight.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Seat management content will go here */}
            <h3 className="text-lg font-semibold">Available Seats</h3>
            {seats.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seat Number</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Available</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seats.map(seat => (
                    <TableRow key={seat.id} className="items-center">
                      <TableCell className="font-medium">{seat.seatNumber}</TableCell>
                      <TableCell>{seat.seatClass}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={seatsToAssign.find(s => s.seatId === Number(seat.id))?.price || 0}
                          onChange={(e) => {
                            const price = parseFloat(e.target.value);
                            setSeatsToAssign(prev =>
                              prev.map(item =>
                                item.seatId === Number(seat.id) ? { ...item, price: isNaN(price) ? 0 : price } : item
                              )
                            );
                          }}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={seatsToAssign.find(s => s.seatId === Number(seat.id))?.isAvailable || false}
                          onChange={(e) => {
                            setSeatsToAssign(prev =>
                              prev.map(item =>
                                item.seatId === Number(seat.id) ? { ...item, isAvailable: e.target.checked } : item
                              )
                            );
                          }}
                          className="h-4 w-4"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No generic seats available to assign.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManageSeatsDialogOpen(false)}>
              Close
            </Button>
            {/* Add Save/Assign Seats button here later */}
            <Button onClick={handleAssignSeats} disabled={!selectedFlightForSeats}>
              Assign Seats
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  async function handleAssignSeats() {
    if (!selectedFlightForSeats) return;

    const payload = {
      flightId: Number(selectedFlightForSeats.id), // Assuming flight ID is number
      seats: seatsToAssign.map(seat => ({
        seatId: seat.seatId,
        price: seat.price,
        isAvailable: seat.isAvailable,
      })),
    };

    try {
      const response = await apiService.createBulkFlightSeats(payload);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Seats assigned successfully.',
        });
        setIsManageSeatsDialogOpen(false);
        // Optionally refresh the flights list to show updated seat counts if applicable
        // loadData();
      } else {
         toast({
           title: 'Error',
           description: response.message || 'Failed to assign seats.',
           variant: 'destructive',
         });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while assigning seats.',
        variant: 'destructive',
      });
    }
  }
}
