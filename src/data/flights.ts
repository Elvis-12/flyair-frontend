export interface Flight {
  id: string;
  flightNumber: string;
  departureAirportId: string;
  arrivalAirportId: string;
  departureTime: string;
  arrivalTime: string;
  gateNumber: string;
  terminal: string;
  aircraftType: string;
  status: 'SCHEDULED' | 'DELAYED' | 'CANCELLED' | 'COMPLETED';
  departureAirport?: {
    id: string;
    airportCode: string;
    airportName: string;
  };
  arrivalAirport?: {
    id: string;
    airportCode: string;
    airportName: string;
  };
}

// This is just for initial development/testing
// In production, this data should come from the API
export const flights: Flight[] = [
  {
    id: '1',
    flightNumber: 'FL101',
    departureAirportId: '1',
    arrivalAirportId: '2',
    departureTime: '2024-03-20T10:00:00Z',
    arrivalTime: '2024-03-20T12:00:00Z',
    gateNumber: 'A1',
    terminal: 'T1',
    aircraftType: 'Boeing 737',
    status: 'SCHEDULED',
    departureAirport: {
      id: '1',
      airportCode: 'JFK',
      airportName: 'John F. Kennedy International Airport'
    },
    arrivalAirport: {
      id: '2',
      airportCode: 'LHR',
      airportName: 'London Heathrow Airport'
    }
  },
  {
    id: '2',
    flightNumber: 'FL102',
    departureAirportId: '2',
    arrivalAirportId: '3',
    departureTime: '2024-03-20T14:00:00Z',
    arrivalTime: '2024-03-20T18:00:00Z',
    gateNumber: 'B2',
    terminal: 'T2',
    aircraftType: 'Airbus A320',
    status: 'SCHEDULED',
    departureAirport: {
      id: '2',
      airportCode: 'LHR',
      airportName: 'London Heathrow Airport'
    },
    arrivalAirport: {
      id: '3',
      airportCode: 'DXB',
      airportName: 'Dubai International Airport'
    }
  }
]; 