import { Test, TestingModule } from '@nestjs/testing';
import { Pdf417DecoderService } from './pdf417-decoder.service';
import { UserService } from '../user/user.service';

describe('Pdf417DecoderService', () => {
  let service: Pdf417DecoderService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userService: UserService;

  beforeEach(async () => {
    const mockUserService = {
      findOneById: jest.fn().mockResolvedValue({
        id: '123',
        name: 'John',
        surname: 'Doe',
        nroDni: '12345678',
        birthDate: '1994-10-07',
        gender: 'M',
        nroTramiteDni: '98765432',
      }),
      update: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [Pdf417DecoderService, { provide: UserService, useValue: mockUserService },],
    }).compile();

    service = module.get<Pdf417DecoderService>(Pdf417DecoderService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
