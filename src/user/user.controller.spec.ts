import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';

describe('UserController', () => {
  let controller: UserController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userService: UserService

  beforeEach(async () => {
    const mockUserService = {
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn()
    }

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mockJwtToken'),
      verify: jest.fn().mockReturnValue({ userId: 'a1234b5678c9d0e12345f6g7h8i9j0kl' }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }, {
        provide: JwtService,
        useValue: mockJwtService,
      },],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
