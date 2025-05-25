import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Armchair, Search, Filter, Download, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Seat, Flight } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdminSeats() {
  const { user } = useAuth();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const seatsPerPage = 4;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null);
  const [formData, setFormData] = useState<Omit<Seat, 'id'> & { flightId: number }>({
    flightId: 0,
    seatNumber: '',
    seatClass: 'ECONOMY',
    price: 0,
    isAvailable: true
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [seatsResponse, flightsResponse] = await Promise.all([
          apiService.getSeats(),
          apiService.getFlights()
        ]);

        if (seatsResponse.success) {
          // Handle both direct array and paginated response
          if (Array.isArray(seatsResponse.data)) {
            setSeats(seatsResponse.data);
          } else if (seatsResponse.data && typeof seatsResponse.data === 'object' && 'content' in seatsResponse.data) {
            setSeats((seatsResponse.data as any).content || []);
          } else {
            setSeats([]);
          }
        }

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

  const handleCreateSeat = async () => {
    try {
      const response = await apiService.createSeat(formData);
      if (response.success) {
        setSeats([...seats, response.data]);
        setIsDialogOpen(false);
        resetForm();
        toast({
          title: 'Success',
          description: 'Seat created successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create seat.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateSeat = async () => {
    if (!editingSeat) return;

    try {
      const response = await apiService.updateSeat(editingSeat.id, formData);
      if (response.success) {
        setSeats(seats.map(seat => 
          seat.id === editingSeat.id ? response.data : seat
        ));
        setIsDialogOpen(false);
        resetForm();
        toast({
          title: 'Success',
          description: 'Seat updated successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update seat.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSeat = async (seatId: string) => {
    try {
      const response = await apiService.deleteSeat(seatId);
      if (response.success) {
        setSeats(seats.filter(seat => seat.id !== seatId));
        toast({
          title: 'Success',
          description: 'Seat deleted successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete seat.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (seat: Seat) => {
    setEditingSeat(seat);
    setFormData({
      flightId: Number(seat.flightId),
      seatNumber: seat.seatNumber,
      seatClass: seat.seatClass,
      price: seat.price,
      isAvailable: seat.isAvailable
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSeat(null);
    setFormData({
      flightId: 0,
      seatNumber: '',
      seatClass: 'ECONOMY',
      price: 0,
      isAvailable: true
    });
  };

  const filteredSeats = seats.filter(seat => {
    const matchesSearch = seat.seatNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'ALL' || seat.seatClass === classFilter;
    return matchesSearch && matchesClass;
  });

  // Calculate pagination
  const indexOfLastSeat = currentPage * seatsPerPage;
  const indexOfFirstSeat = indexOfLastSeat - seatsPerPage;
  const currentSeats = filteredSeats.slice(indexOfFirstSeat, indexOfLastSeat);
  const totalPages = Math.ceil(filteredSeats.length / seatsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getClassBadge = (seatClass: string) => {
    const variants = {
      ECONOMY: 'default',
      BUSINESS: 'secondary',
      FIRST: 'destructive'
    } as const;
    return variants[seatClass as keyof typeof variants] || 'default';
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
          <h1 className="text-3xl font-bold text-gray-900">Seats Management</h1>
          <p className="text-gray-600">Manage aircraft seats and pricing</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Seat
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
                  placeholder="Search by seat number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select
              value={classFilter}
              onValueChange={setClassFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Classes</SelectItem>
                <SelectItem value="ECONOMY">Economy</SelectItem>
                <SelectItem value="BUSINESS">Business</SelectItem>
                <SelectItem value="FIRST">First Class</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seats Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Seats ({filteredSeats.length})</CardTitle>
          <CardDescription>
            Manage aircraft seats and their availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seat Number</TableHead>
                  <TableHead>Flight</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSeats.map((seat) => (
                  <TableRow key={seat.id}>
                    <TableCell className="font-medium">
                      {seat.seatNumber}
                    </TableCell>
                    <TableCell>
                      {flights.find(f => f.id === seat.flightId)?.flightNumber || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getClassBadge(seat.seatClass)}>
                        {seat.seatClass}
                      </Badge>
                    </TableCell>
                    <TableCell>${seat.price}</TableCell>
                    <TableCell>
                      <Badge variant={seat.isAvailable ? 'default' : 'destructive'}>
                        {seat.isAvailable ? 'Available' : 'Occupied'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(seat)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSeat(seat.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstSeat + 1} to {Math.min(indexOfLastSeat, filteredSeats.length)} of {filteredSeats.length} seats
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index + 1}
                  variant={currentPage === index + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingSeat ? 'Edit Seat' : 'Add New Seat'}</CardTitle>
              <CardDescription>
                {editingSeat ? 'Update seat details' : 'Create a new seat'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Flight</label>
                  <Select
                    value={String(formData.flightId)}
                    onValueChange={(value) => setFormData({ ...formData, flightId: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select flight" />
                    </SelectTrigger>
                    <SelectContent>
                      {flights.map((flight) => (
                        <SelectItem key={flight.id} value={String(flight.id)}>
                          {flight.flightNumber} - {flight.departureAirport?.airportCode} to {flight.arrivalAirport?.airportCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Seat Number</label>
                  <Input
                    value={formData.seatNumber}
                    onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
                    placeholder="e.g., 12A"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Class</label>
                  <Select
                    value={formData.seatClass}
                    onValueChange={(value) => setFormData({ ...formData, seatClass: value as 'ECONOMY' | 'BUSINESS' | 'FIRST' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ECONOMY">Economy</SelectItem>
                      <SelectItem value="BUSINESS">Business</SelectItem>
                      <SelectItem value="FIRST">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="available"
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, isAvailable: checked as boolean })
                    }
                  />
                  <label htmlFor="available" className="text-sm font-medium">
                    Available
                  </label>
                </div>
              </div>
            </CardContent>
            <div className="flex justify-end space-x-2 p-4 border-t">
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
                onClick={editingSeat ? handleUpdateSeat : handleCreateSeat}
              >
                {editingSeat ? 'Update' : 'Create'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
