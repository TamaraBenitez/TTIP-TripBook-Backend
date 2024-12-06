import { Test, TestingModule } from '@nestjs/testing';
import { VehicleService } from './vehicle.service';
import { UserService } from '../user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TripUserService } from '../trip-user/trip-user.service';


describe('VehicleService', () => {
  let service: VehicleService;
  let userServiceMock: UserService;
  let vehicleRepositoryMock: Repository<Vehicle>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let tripUserService: TripUserService;

  beforeEach(async () => {
    userServiceMock = {
      findOneById: jest.fn(),
    } as any;


    vehicleRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    } as unknown as Repository<Vehicle>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: UserService, useValue: userServiceMock },
        { provide: getRepositoryToken(Vehicle), useValue: vehicleRepositoryMock },
        {
          provide: TripUserService,
          useValue: {
            hasVehicleFutureTrips: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
    vehicleRepositoryMock = module.get(getRepositoryToken(Vehicle));
    userServiceMock = module.get(UserService);
    tripUserService = module.get(TripUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });



  it('should throw NotFoundException if vehicle does not exist', async () => {
    const vehicleId = 'vehicle-id';


    (vehicleRepositoryMock.findOne as jest.Mock).mockResolvedValue(null);

    try {
      await service.findOneById(vehicleId);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('El vehículo no existe.');
    }

    expect(vehicleRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: vehicleId } });
  });

  it('should get vehicles by owner', async () => {
    const ownerId = 'user-id';
    const vehicles = [
      { id: 'vehicle-id-1', model: 'Car Model 1', color: 'Red', plateNumber: 'ABC123', year: 2020, owner: { id: ownerId } },
      { id: 'vehicle-id-2', model: 'Car Model 2', color: 'Blue', plateNumber: 'DEF456', year: 2021, owner: { id: ownerId } },
    ];


    (userServiceMock.findOneById as jest.Mock).mockResolvedValue({ id: ownerId, name: 'John Doe' });


    (vehicleRepositoryMock.find as jest.Mock).mockResolvedValue(vehicles);

    const result = await service.getVehiclesByOwner(ownerId);

    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'vehicle-id-1' }),
      expect.objectContaining({ id: 'vehicle-id-2' }),
    ]));
    expect(vehicleRepositoryMock.find).toHaveBeenCalledWith({
      where: { owner: { id: ownerId }, isDeleted: false },
      relations: ['owner'],
    });
  });

  it('should throw NotFoundException if owner does not exist when getting vehicles', async () => {
    const ownerId = 'non-existing-user-id';


    (userServiceMock.findOneById as jest.Mock).mockResolvedValue(null);

    try {
      await service.getVehiclesByOwner(ownerId);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('El usuario no existe');
    }

    expect(userServiceMock.findOneById).toHaveBeenCalledWith(ownerId);
  });
});
