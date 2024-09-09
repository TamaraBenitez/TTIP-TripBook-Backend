export class TripUserResponseDto {
    id: string;
    user: {
      id: string;
      name: string;
      surname: string;
      email: string;
      locality: string;
    };
    joinDate: Date;
    status: string;
  }