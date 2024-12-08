import { Test, TestingModule } from '@nestjs/testing';
import { TripCoordinate } from './trip-coordinate.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TripCoordinateService } from '../trip-coordinate.service';
import { TripUser } from '../../trip-user/entities/trip-user.entity';

describe('TripCoordinateService', () => {
    let service: TripCoordinateService;
    let tripCoordinateRepository: Repository<TripCoordinate>;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          TripCoordinateService,
          {
            provide: getRepositoryToken(TripCoordinate),
            useClass: Repository,
          },
        ],
      }).compile();
  
      service = module.get<TripCoordinateService>(TripCoordinateService);
      tripCoordinateRepository = module.get<Repository<TripCoordinate>>(getRepositoryToken(TripCoordinate));
    });
  
    describe('createTripCoordinate method', () => {
      it('should save a trip coordinate when calling createTripCoordinate', async () => {
        const tripCoordinate = new TripCoordinate();
        jest.spyOn(tripCoordinateRepository, 'save').mockResolvedValue(tripCoordinate);
  
        const result = await service.createTripCoordinate(tripCoordinate);
        expect(result).toEqual(tripCoordinate);
        expect(tripCoordinateRepository.save).toHaveBeenCalledWith(tripCoordinate);
      });
    });
  
    describe('getCoordinatesByTripUsers method', () => {
      it('should return coordinates by trip users when calling getCoordinatesByTripUsers', async () => {
        const tripUser = new TripUser();
        const coordinate1 = new TripCoordinate();
        const coordinate2 = new TripCoordinate();
  
        // Setting properties of coordinates as per the entity
        Object.assign(coordinate1, { latitude: 1.234, longitude: 5.678, isStart: true, isEnd: false, tripUser });
        Object.assign(coordinate2, { latitude: 9.876, longitude: 5.432, isStart: false, isEnd: true, tripUser });
        
        tripUser.tripCoordinates = [coordinate1, coordinate2];
  
        const tripUsers = [tripUser];
        const result = await service.getCoordinatesByTripUsers(tripUsers);
  
        expect(result).toEqual([
          [
            { latitude: 1.234, longitude: 5.678, isStart: true, isEnd: false, userId: tripUser.id },
            { latitude: 9.876, longitude: 5.432, isStart: false, isEnd: true, userId: tripUser.id },
          ],
        ]);
      });
    });
  
    describe('getStartCoordinateByTripId', () => {
      it('should return the start coordinate by trip ID when calling getStartCoordinateByTripId', async () => {
        const tripId = '123';
        const startCoordinate = new TripCoordinate();
        jest.spyOn(tripCoordinateRepository, 'findOne').mockResolvedValue(startCoordinate);
  
        const result = await service.getStartCoordinateByTripId(tripId);
        expect(result).toEqual(startCoordinate);
        expect(tripCoordinateRepository.findOne).toHaveBeenCalledWith({
          where: { tripUser: { trip: { id: tripId } }, isStart: true },
        });
      });
  
      it('should return null if no start coordinate is found when calling getStartCoordinateByTripId', async () => {
        const tripId = '123';
        jest.spyOn(tripCoordinateRepository, 'findOne').mockResolvedValue(null);
  
        const result = await service.getStartCoordinateByTripId(tripId);
        expect(result).toBeNull();
        expect(tripCoordinateRepository.findOne).toHaveBeenCalledWith({
          where: { tripUser: { trip: { id: tripId } }, isStart: true },
        });
      });
    });
  });