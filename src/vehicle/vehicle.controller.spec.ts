import { Test, TestingModule } from '@nestjs/testing';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
import { JwtService } from '@nestjs/jwt';

describe('VehicleController', () => {
  let controller: VehicleController;
  let vehicleServiceMock: Partial<VehicleService>;

  beforeEach(async () => {
    // Mock de VehicleService
    vehicleServiceMock = {
      createVehicle: jest.fn().mockResolvedValue({
        id: 'vehicle-id',
        model: 'Car Model',
        color: 'Red',
        plateNumber: 'ABC123',
        ownerId: 'user-id',
      }),
      getVehiclesByOwner: jest.fn().mockResolvedValue([
        {
          id: 'vehicle-id-1',
          model: 'Car Model 1',
          color: 'Blue',
          plateNumber: 'XYZ123',
          ownerId: 'user-id',
        },
        {
          id: 'vehicle-id-2',
          model: 'Car Model 2',
          color: 'Green',
          plateNumber: 'XYZ124',
          ownerId: 'user-id',
        },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        {
          provide: VehicleService,
          useValue: vehicleServiceMock,
        },
        {
          provide: JwtService,
          useValue: {}, // Mock vacío del JwtService
        },
      ],
    }).compile();

    controller = module.get<VehicleController>(VehicleController);
  });

  it('should create a vehicle', async () => {
    const createVehicleDto: CreateVehicleDto = {
      model: 'Car Model',
      color: 'Red',
      plateNumber: 'ABC123',
      ownerId: 'user-id',
    };

    const result: VehicleResponseDto = await controller.createVehicle(createVehicleDto);

    expect(result).toEqual({
      id: 'vehicle-id',
      model: 'Car Model',
      color: 'Red',
      plateNumber: 'ABC123',
      ownerId: 'user-id',
    });

    expect(vehicleServiceMock.createVehicle).toHaveBeenCalledWith(createVehicleDto);
    expect(vehicleServiceMock.createVehicle).toHaveBeenCalledTimes(1);
  });

  it('should get vehicles by ownerId', async () => {
    const ownerId = 'user-id';

    const result: VehicleResponseDto[] = await controller.getVehiclesByOwner(ownerId);

    expect(result).toEqual([
      {
        id: 'vehicle-id-1',
        model: 'Car Model 1',
        color: 'Blue',
        plateNumber: 'XYZ123',
        ownerId: 'user-id',
      },
      {
        id: 'vehicle-id-2',
        model: 'Car Model 2',
        color: 'Green',
        plateNumber: 'XYZ124',
        ownerId: 'user-id',
      },
    ]);

    expect(vehicleServiceMock.getVehiclesByOwner).toHaveBeenCalledWith(ownerId);
    expect(vehicleServiceMock.getVehiclesByOwner).toHaveBeenCalledTimes(1);
  });
});
