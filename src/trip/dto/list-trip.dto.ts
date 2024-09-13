export class ListTripResponseDto {
    id: string;
    startPoint: string;
    endPoint: string;
    startDate: Date;
    description: string;
    estimatedCost: number;
    numberOfRegistrants: number;
  }