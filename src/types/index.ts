export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  twoFactorEnabled: boolean;
}

export interface Flight {
  id: number;
  flightNumber: string;
  departureAirportId: number;
  arrivalAirportId: number;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  status: 'SCHEDULED' | 'DELAYED' | 'CANCELLED' | 'COMPLETED';
  gateNumber: string;
  terminal: string;
  aircraftType: string;
  createdAt: string;
  updatedAt: string;
  departureAirport?: Airport;
  arrivalAirport?: Airport;
  aircraft?: string;
  availableSeats?: number;
  price?: number;
}

export interface Booking {
  id: string;
  userId: string;
  flightId: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  passengerName: string;
  seatNumber?: string;
  bookingDate: string;
  totalPrice: number;
  flight: Flight;
}

export interface Ticket {
  id: string;
  bookingId: string;
  passengerName: string;
  seatNumber: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'BOARDED' | 'ISSUED';
  checkInTime?: string;
  boardingTime?: string;
  booking: Booking;
}

export interface Airport {
  id: number;
  airportCode: string;
  airportName: string;
  city: string;
  country: string;
  countryCode?: string;
  timeZone?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Seat {
  id: string;
  flightId: string;
  seatNumber: string;
  seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST';
  price: number;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
  flight?: Flight;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface DashboardStats {
  totalFlights: number;
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
  recentBookings: Booking[];
}

export interface SearchFilters {
  departureAirportCode?: string;
  arrivalAirportCode?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: number;
  class?: string;
}

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  requiresTwoFactor: boolean;
  temporaryToken?: string;
  message?: string;
}

export interface CreateBulkFlightSeatsRequest {
  flightId: number;
  seats: FlightSeatDetails[];
}

export interface FlightSeatDetails {
  seatId: number;
  price: number;
  isAvailable?: boolean;
}

export interface FlightSeat {
  id: number;
  flightId: number;
  seatId: number;
  price: number;
  isAvailable: boolean;
  isOccupied: boolean;
  createdAt: string;
  updatedAt: string;
  flight?: Flight;
  seat?: Seat;
}
