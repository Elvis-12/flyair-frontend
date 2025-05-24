import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plane, 
  MapPin, 
  Clock, 
  User,
  CreditCard,
  Check
} from 'lucide-react';
import { Flight, Seat } from '@/types';

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { flight, filters } = location.state || {};
  
  const [step, setStep] = useState(1); // 1: Select Seat, 2: Passenger Details, 3: Payment
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);
  const [passengerName, setPassengerName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!flight) {
      navigate('/search');
      return;
    }
    loadAvailableSeats();
  }, [flight, navigate]);

  const loadAvailableSeats = async () => {
    try {
      const response = await apiService.getAvailableSeats(flight.id);
      if (response.success) {
        setAvailableSeats(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load available seats.',
        variant: 'destructive',
      });
    }
  };

  const handleSeatSelection = (seat: Seat) => {
    setSelectedSeat(seat);
  };

  const handleBooking = async () => {
    if (!selectedSeat) {
      toast({
        title: 'Error',
        description: 'Please select a seat.',
        variant: 'destructive',
      });
      return;
    }

    if (!passengerName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter passenger name.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.createBooking({
        flightId: flight.id,
        passengerName: passengerName.trim(),
        seatNumber: selectedSeat.seatNumber
      });
      
      if (response.success) {
        toast({
          title: 'Booking Confirmed!',
          description: 'Your flight has been booked successfully.',
        });
        navigate('/my-bookings');
      }
    } catch (error) {
      toast({
        title: 'Booking Failed',
        description: 'Failed to complete booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!flight) {
    return null;
  }

  const totalPrice = selectedSeat ? flight.price + selectedSeat.price : flight.price;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Book Your Flight</h1>
        <p className="text-gray-600">Complete your booking in a few simple steps</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8 mb-8">
        {[
          { step: 1, title: 'Select Seat', icon: Plane },
          { step: 2, title: 'Passenger Details', icon: User },
          { step: 3, title: 'Payment', icon: CreditCard }
        ].map(({ step: stepNum, title, icon: Icon }) => (
          <div key={stepNum} className="flex items-center space-x-2">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step > stepNum ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
            </div>
            <span className={`font-medium ${step >= stepNum ? 'text-blue-600' : 'text-gray-600'}`}>
              {title}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Your Seat</CardTitle>
                <CardDescription>Choose your preferred seat for the flight</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Seat Map Legend */}
                  <div className="flex items-center justify-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-100 border border-green-300 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 border border-blue-300 rounded"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded"></div>
                      <span>Occupied</span>
                    </div>
                  </div>

                  {/* Seat Grid */}
                  <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
                    {availableSeats.map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatSelection(seat)}
                        className={`w-10 h-10 text-xs font-medium rounded border-2 transition-colors ${
                          selectedSeat?.id === seat.id
                            ? 'bg-blue-100 border-blue-300 text-blue-800'
                            : seat.isAvailable
                            ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!seat.isAvailable}
                      >
                        {seat.seatNumber}
                      </button>
                    ))}
                  </div>

                  {selectedSeat && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="font-medium">Selected Seat: {selectedSeat.seatNumber}</p>
                      <p className="text-sm text-gray-600">
                        Class: {selectedSeat.class} • Additional: ${selectedSeat.price}
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={() => setStep(2)} 
                    className="w-full"
                    disabled={!selectedSeat}
                  >
                    Continue to Passenger Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Passenger Details</CardTitle>
                <CardDescription>Enter passenger information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="passengerName">Passenger Name</Label>
                    <Input
                      id="passengerName"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="Enter full name as on ID"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back to Seat Selection
                    </Button>
                    <Button 
                      onClick={() => setStep(3)} 
                      className="flex-1"
                      disabled={!passengerName.trim()}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
                <CardDescription>Complete your booking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Payment Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Base Price:</span>
                        <span>${flight.price}</span>
                      </div>
                      {selectedSeat?.price > 0 && (
                        <div className="flex justify-between">
                          <span>Seat Upgrade:</span>
                          <span>${selectedSeat.price}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Total:</span>
                        <span>${totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-600 p-4 bg-blue-50 rounded-lg">
                    This is a demo. No actual payment will be processed.
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Back to Details
                    </Button>
                    <Button 
                      onClick={handleBooking} 
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Confirm Booking'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Flight Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Plane className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{flight.flightNumber}</span>
                </div>
                <p className="text-sm text-gray-600">{flight.aircraft}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                    <MapPin className="h-3 w-3" />
                    <span>From</span>
                  </div>
                  <p className="font-medium">{flight.departureAirport?.airportCode}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(flight.departureTime).toLocaleString()}
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                    <MapPin className="h-3 w-3" />
                    <span>To</span>
                  </div>
                  <p className="font-medium">{flight.arrivalAirport?.airportCode}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(flight.arrivalTime).toLocaleString()}
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                    <Clock className="h-3 w-3" />
                    <span>Duration</span>
                  </div>
                  <p className="font-medium">
                    {Math.round(
                      (new Date(flight.arrivalTime).getTime() - new Date(flight.departureTime).getTime()) / 
                      (1000 * 60 * 60)
                    )}h
                  </p>
                </div>
              </div>

              {selectedSeat && (
                <div className="pt-3 border-t">
                  <p className="font-medium">Selected Seat: {selectedSeat.seatNumber}</p>
                  <p className="text-sm text-gray-600">{selectedSeat.class}</p>
                </div>
              )}

              {passengerName && (
                <div className="pt-3 border-t">
                  <p className="font-medium">Passenger</p>
                  <p className="text-sm text-gray-600">{passengerName}</p>
                </div>
              )}

              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Price</span>
                  <span className="text-xl font-bold text-blue-600">${totalPrice}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
