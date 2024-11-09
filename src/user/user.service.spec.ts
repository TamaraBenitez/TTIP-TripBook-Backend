import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Gender, User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userRepository: jest.Mocked<Repository<User>>

  beforeEach(async () => {
    const mockUserRepository = {
      save: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call save method with correct user data ', async () => {
    const createUserDto: CreateUserDto = {
      name: 'John',
      surname: 'Doe',
      email: 'test@example.com',
      birthDate: new Date('1990-01-01'),
      password: 'testpass',
      dniPhoto: Buffer.from('fake-image-binary-data')
    };

    await service.createUser(createUserDto);

    expect(userRepository.save).toHaveBeenCalledWith(createUserDto);
  });

  it('should call findOneBy with correct email and return the user', async () => {
    const email = 'test@example.com';
    const userFound: User = {
      id: '1',
      name: 'John',
      surname: 'Doe',
      email,
      password: 'hashedpassword',
      nroDni: '12345678',
      nroTramiteDni: '87654321',
      gender: Gender.MALE,
      birthDate: new Date('1990-01-01'),
      province: 'Province Name',
      locality: 'Locality Name',
      latitud: 0,
      longitud: 0,
      isEmailVerified: false,
      isUserVerified: false,
      emailVerificationToken: 'verification-token',
      emailVerificationTokenExpires: new Date(),
      tripUsers: [],
      imageDescriptor: 'some-image-data',
      phoneNumber: '5491187654321'
    };
    userRepository.findOneBy.mockResolvedValue(userFound)

    const result = await service.findOneByEmail(email)

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ email });
    expect(result).toEqual(userFound);
  });

  it('should call findOneBy with correct id and return the user', async () => {
    const id = '1';
    const user: User = {
      id,
      name: 'John',
      surname: 'Doe',
      email: 'test@example.com',
      password: 'hashedpassword',
      nroDni: '12345678',
      nroTramiteDni: '87654321',
      gender: Gender.MALE,
      birthDate: new Date('1990-01-01'),
      province: 'Province Name',
      locality: 'Locality Name',
      latitud: 0,
      longitud: 0,
      isEmailVerified: false,
      isUserVerified: false,
      emailVerificationToken: 'verification-token',
      emailVerificationTokenExpires: new Date(),
      tripUsers: [],
      imageDescriptor: 'some-image-data',
      phoneNumber: '5491187654321'
    };

    userRepository.findOneBy.mockResolvedValue(user)

    const result = await service.findOneById(id)

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id })
    expect(result).toEqual(user)
  });


  it('should call findOne with correct token and return the user', async () => {
    const token = 'verification-token'
    const user: User = {
      id: '1',
      name: 'John',
      surname: 'Doe',
      email: 'test@example.com',
      password: 'hashedpassword',
      nroDni: '12345678',
      nroTramiteDni: '87654321',
      gender: Gender.MALE,
      birthDate: new Date('1990-01-01'),
      province: 'Province Name',
      locality: 'Locality Name',
      latitud: 0,
      longitud: 0,
      isEmailVerified: false,
      isUserVerified: false,
      emailVerificationToken: token,
      emailVerificationTokenExpires: new Date(),
      tripUsers: [],
      imageDescriptor: 'some-image-data',
      phoneNumber: '5491187654321'
    };

    userRepository.findOne.mockResolvedValue(user)

    const result = await service.findByVerifyToken(token)

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { emailVerificationToken: token },
    });
    expect(result).toEqual(user)
  });




});