import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Ticket as TicketIcon, Search, Filter, Download, CheckCircle, Plane } from 'lucide-react';
import { Ticket } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const response = await apiService.getAllTickets();
        if (response.success) {
          // Handle both direct array and paginated response
          if (Array.isArray(response.data)) {
            setTickets(response.data);
          } else if (response.data && typeof response.data === 'object' && 'content' in response.data) {
            setTickets((response.data as any).content || []);
          } else {
            setTickets([]);
          }
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

    loadTickets();
  }, []);

  const handleCheckIn = async (ticketId: string) => {
    try {
      const response = await apiService.checkInTicket(ticketId);
      if (response.success) {
        setTickets(tickets.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, status: 'CHECKED_IN', checkInTime: new Date().toISOString() }
            : ticket
        ));
        toast({
          title: 'Success',
          description: 'Passenger checked in successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check in passenger.',
        variant: 'destructive',
      });
    }
  };

  const handleBoard = async (ticketId: string) => {
    try {
      const response = await apiService.boardTicket(ticketId);
      if (response.success) {
        setTickets(tickets.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, status: 'BOARDED', boardingTime: new Date().toISOString() }
            : ticket
        ));
        toast({
          title: 'Success',
          description: 'Passenger boarded successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to board passenger.',
        variant: 'destructive',
      });
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.seatNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      CONFIRMED: 'default',
      CHECKED_IN: 'secondary',
      BOARDED: 'default'
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tickets Management</h1>
        <p className="text-gray-600">Manage passenger check-ins and boarding</p>
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
                  placeholder="Search by passenger name or seat number..."
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
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                <SelectItem value="BOARDED">Boarded</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tickets ({filteredTickets.length})</CardTitle>
          <CardDescription>
            Manage passenger check-ins and boarding status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Flight</TableHead>
                  <TableHead>Check-in Time</TableHead>
                  <TableHead>Boarding Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-sm">
                      {ticket.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{ticket.passengerName}</div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {ticket.seatNumber}
                    </TableCell>
                    <TableCell>
                      {ticket.booking.flight.flightNumber}
                    </TableCell>
                    <TableCell>
                      {ticket.checkInTime 
                        ? new Date(ticket.checkInTime).toLocaleString() 
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {ticket.boardingTime 
                        ? new Date(ticket.boardingTime).toLocaleString() 
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {ticket.status === 'CONFIRMED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCheckIn(ticket.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Check In
                          </Button>
                        )}
                        {ticket.status === 'CHECKED_IN' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBoard(ticket.id)}
                          >
                            <Plane className="h-4 w-4 mr-1" />
                            Board
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
