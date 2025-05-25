import { ApiResponse, User, Flight, Booking, Ticket, Airport, Seat, DashboardStats, SearchFilters, AuthenticationResponse, CreateBulkFlightSeatsRequest, FlightSeat } from '@/types';
import api from '../config/api';

const API_BASE_URL = 'http://localhost:8086';

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(credentials: { username: string; password: string }) {
    return api.post<ApiResponse<AuthenticationResponse>>('/auth/login', credentials);
  }

  async verify2FA(data: { temporaryToken: string; code: string }) {
    return api.post<ApiResponse<AuthenticationResponse>>('/auth/verify-2fa', data);
  }

  async register(userData: any) {
    return api.post('/auth/register', userData);
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<DashboardStats>('/api/dashboard/stats');
  }

  // Flights
  async searchFlights(filters: SearchFilters) {
    return this.request<{ content: Flight[]; totalElements: number; totalPages: number }>('/api/flights/search', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  async getFlights(params?: { page?: number; size?: number; sortBy?: string; sortDir?: string; searchTerm?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.append('sortDir', params.sortDir);
    if (params?.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    
    return this.request<{ content: Flight[]; totalElements: number; totalPages: number }>(`/api/flights?${searchParams}`);
  }

  async createFlight(flightData: Partial<Flight>) {
    return this.request<Flight>('/api/flights', {
      method: 'POST',
      body: JSON.stringify(flightData),
    });
  }

  async updateFlight(id: string, flightData: Partial<Flight>) {
    return this.request<Flight>(`/api/flights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(flightData),
    });
  }

  async updateFlightStatus(id: string, status: Flight['status']) {
    return this.request<Flight>(`/api/flights/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteFlight(id: string) {
    return this.request<void>(`/api/flights/${id}`, {
      method: 'DELETE',
    });
  }

  // Bookings
  async getMyBookings() {
    return this.request<Booking[]>('/api/bookings/my-bookings');
  }

  async getAllBookings(params?: { page?: number; size?: number; searchTerm?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    
    return this.request<Booking[]>(`/api/bookings?${searchParams}`);
  }

  async createBooking(bookingData: any) {
    return this.request<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async cancelBooking(ticketId: string): Promise<ApiResponse<Ticket>> {
    return this.request<Ticket>(`/api/tickets/${ticketId}/cancel`, {
      method: 'PATCH',
    });
  }

  // Tickets
  async getMyTickets() {
    return this.request<Ticket[]>('/api/tickets/my-tickets');
  }

  async getAllTickets(params?: { page?: number; size?: number; searchTerm?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    
    return this.request<Ticket[]>(`/api/tickets?${searchParams}`);
  }

  async checkInTicket(id: string) {
    return this.request<Ticket>(`/api/tickets/${id}/check-in`, {
      method: 'PATCH',
    });
  }

  async boardTicket(id: string) {
    return this.request<Ticket>(`/api/tickets/${id}/board`, {
      method: 'PATCH',
    });
  }

  // Users
  async getUsers(params?: { page?: number; size?: number; searchTerm?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    
    return this.request<{ content: User[]; totalElements: number; totalPages: number }>(`/api/users?${searchParams}`);
  }

  async updateUser(id: string, userData: Partial<User>) {
    return this.request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/api/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async enable2FA() {
    return this.request<{ qrCode: string; secret: string }>('/api/users/enable-2fa', {
      method: 'POST',
    });
  }

  async confirm2FA(code: string) {
    return this.request<{ message: string }>(`/api/users/confirm-2fa?code=${encodeURIComponent(code)}`, {
      method: 'POST',
    });
  }

  // Airports
  async getAirports(params?: { page?: number; size?: number; searchTerm?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    
    return this.request<Airport[]>(`/api/airports?${searchParams}`);
  }

  async createAirport(airportData: Omit<Airport, 'id'>) {
    return this.request<Airport>('/api/airports', {
      method: 'POST',
      body: JSON.stringify(airportData),
    });
  }

  async updateAirport(id: string, airportData: Partial<Airport>) {
    return this.request<Airport>(`/api/airports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(airportData),
    });
  }

  async deleteAirport(id: string) {
    return this.request<void>(`/api/airports/${id}`, {
      method: 'DELETE',
    });
  }

  // Seats
  async getAvailableSeats(flightId: string) {
    return this.request<Seat[]>(`/api/flight-seats/flight/${flightId}/available`);
  }

  async getSeats(params?: { page?: number; size?: number; searchTerm?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    
    return this.request<Seat[]>(`/api/seats?${searchParams}`);
  }

  async createSeat(seatData: Omit<Seat, 'id'>) {
    return this.request<Seat>('/api/seats', {
      method: 'POST',
      body: JSON.stringify(seatData),
    });
  }

  async updateSeat(id: string, seatData: Partial<Seat>) {
    return this.request<Seat>(`/api/seats/${id}`, {
      method: 'PUT',
      body: JSON.stringify(seatData),
    });
  }

  async deleteSeat(id: string) {
    return this.request<void>(`/api/seats/${id}`, {
      method: 'DELETE',
    });
  }

  // Global Search
  async globalSearch(query: string) {
    return this.request<{
      flights: Flight[];
      bookings: Booking[];
      users: User[];
      airports?: Airport[];
      tickets?: Ticket[];
      seats?: Seat[];
    }>(`/api/search/global?query=${encodeURIComponent(query)}`);
  }

  // New functions from the code block
  async getUserBookings() {
    return api.get('/api/bookings/user');
  }

  async getFlightSeats(flightId: string) {
    return api.get(`/api/flights/${flightId}/seats`);
  }

  async getUserProfile() {
    return api.get('/api/users/profile');
  }

  async updateUserProfile(userData: any) {
    return api.put('/api/users/profile', userData);
  }

  async createBulkFlightSeats(requestData: CreateBulkFlightSeatsRequest) {
    return this.request<FlightSeat[]>(`/api/flight-seats/bulk`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }
}

export const apiService = new ApiService();
