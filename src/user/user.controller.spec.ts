import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
