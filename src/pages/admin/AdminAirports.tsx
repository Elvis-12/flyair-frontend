import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { MapPin, Search, Filter, Download, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Airport } from '@/types';

export default function AdminAirports() {
  const { user } = useAuth();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const airportsPerPage = 4;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null);
  const [formData, setFormData] = useState({
    airportCode: '',
    airportName: '',
    city: '',
    country: '',
    countryCode: '',
    timeZone: '',
    latitude: null,
    longitude: null
  });

  useEffect(() => {
    const loadAirports = async () => {
      try {
        const response = await apiService.getAirports();
        if (response.success) {
          // Handle both direct array and paginated response
          if (Array.isArray(response.data)) {
            setAirports(response.data);
          } else if (response.data && typeof response.data === 'object' && 'content' in response.data) {
            setAirports((response.data as any).content || []);
          } else {
            setAirports([]);
          }
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load airports.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadAirports();
  }, []);

  const handleCreateAirport = async () => {
    try {
      const response = await apiService.createAirport(formData);
      if (response.success) {
        setAirports([...airports, response.data]);
        setIsDialogOpen(false);
        setFormData({ 
          airportCode: '', 
          airportName: '', 
          city: '', 
          country: '',
          countryCode: '',
          timeZone: '',
          latitude: null,
          longitude: null
        });
        toast({
          title: 'Success',
          description: 'Airport created successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create airport.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateAirport = async () => {
    if (!editingAirport) return;
    
    try {
      const response = await apiService.updateAirport(editingAirport.id, formData);
      if (response.success) {
        setAirports(airports.map(airport => 
          airport.id === editingAirport.id ? response.data : airport
        ));
        setIsDialogOpen(false);
        setEditingAirport(null);
        setFormData({ 
          airportCode: '', 
          airportName: '', 
          city: '', 
          country: '',
          countryCode: '',
          timeZone: '',
          latitude: null,
          longitude: null
        });
        toast({
          title: 'Success',
          description: 'Airport updated successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update airport.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAirport = async (airportId: string) => {
    if (!confirm('Are you sure you want to delete this airport?')) return;
    
    try {
      const response = await apiService.deleteAirport(airportId);
      if (response.success) {
        setAirports(airports.filter(airport => airport.id !== airportId));
        toast({
          title: 'Success',
          description: 'Airport deleted successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete airport.',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (airport: Airport) => {
    setEditingAirport(airport);
    setFormData({
      airportCode: airport.airportCode,
      airportName: airport.airportName,
      city: airport.city,
      country: airport.country,
      countryCode: airport.countryCode || '',
      timeZone: airport.timeZone || '',
      latitude: airport.latitude,
      longitude: airport.longitude
    });
    setIsDialogOpen(true);
  };

  const handleNewAirportClick = () => {
    setEditingAirport(null);
    setFormData({ 
      airportCode: '', 
      airportName: '', 
      city: '', 
      country: '',
      countryCode: '',
      timeZone: '',
      latitude: null,
      longitude: null
    });
    setIsDialogOpen(true);
  };

  const filteredAirports = airports.filter(airport => {
    const matchesSearch = airport.airportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         airport.airportCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         airport.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = countryFilter === 'ALL' || airport.country === countryFilter;
    return matchesSearch && matchesCountry;
  });

  // Calculate pagination
  const indexOfLastAirport = currentPage * airportsPerPage;
  const indexOfFirstAirport = indexOfLastAirport - airportsPerPage;
  const currentAirports = filteredAirports.slice(indexOfFirstAirport, indexOfLastAirport);
  const totalPages = Math.ceil(filteredAirports.length / airportsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const uniqueCountries = [...new Set(airports.map(airport => airport.country))];

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
          <h1 className="text-3xl font-bold text-gray-900">Airport Management</h1>
          <p className="text-gray-600">Manage airport information and locations</p>
        </div>
        <Button onClick={handleNewAirportClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Airport
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
                  placeholder="Search by name, code, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="ALL">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Airports Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Airports ({filteredAirports.length})</CardTitle>
          <CardDescription>
            Manage airport codes, names, and locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentAirports.map((airport) => (
                  <TableRow key={airport.id}>
                    <TableCell className="font-mono font-bold">
                      {airport.airportCode}
                    </TableCell>
                    <TableCell className="font-medium">
                      {airport.airportName}
                    </TableCell>
                    <TableCell>{airport.city}</TableCell>
                    <TableCell>{airport.country}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(airport)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAirport(airport.id)}
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

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstAirport + 1} to {Math.min(indexOfLastAirport, filteredAirports.length)} of {filteredAirports.length} airports
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
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Airport Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAirport ? 'Edit Airport' : 'Add New Airport'}
            </DialogTitle>
            <DialogDescription>
              {editingAirport 
                ? 'Update the airport information below.' 
                : 'Enter the details for the new airport.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="airportCode">Airport Code</Label>
              <Input
                id="airportCode"
                value={formData.airportCode}
                onChange={(e) => setFormData({ ...formData, airportCode: e.target.value.toUpperCase() })}
                placeholder="e.g., JFK"
                maxLength={3}
              />
            </div>
            <div>
              <Label htmlFor="airportName">Airport Name</Label>
              <Input
                id="airportName"
                value={formData.airportName}
                onChange={(e) => setFormData({ ...formData, airportName: e.target.value })}
                placeholder="e.g., John F. Kennedy International Airport"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g., New York"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g., United States"
              />
            </div>
            <div>
              <Label htmlFor="countryCode">Country Code</Label>
              <Input
                id="countryCode"
                value={formData.countryCode}
                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
                placeholder="e.g., US"
                maxLength={2}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingAirport ? handleUpdateAirport : handleCreateAirport}>
                {editingAirport ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
