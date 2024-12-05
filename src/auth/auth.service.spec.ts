import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CompareImageService } from '../compare-image/compare-image.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Gender, User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';



describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let compareImageService: CompareImageService;

  const mockUser: User = {
    id: 'user-id',
    name: 'Test',
    surname: 'User',
    email: 'user@example.com',
    password: 'hashed-password',
    nroDni: '12345678',
    nroTramiteDni: '87654321',
    gender: Gender.MALE,
    birthDate: new Date('1990-01-01'),
    province: 'Test Province',
    locality: 'Test Locality',
    latitud: 0.0,
    longitud: 0.0,
    isEmailVerified: true,
    isUserVerified: true,
    emailVerificationToken: null,
    emailVerificationTokenExpires: null,
    tripUsers: [],
    imageDescriptor: 'base64string',
    phoneNumber: '5491187654321',
    vehicles: []
  };

  const loginDto = { email: 'user@example.com', password: 'password' };
  const fileMock: Express.Multer.File = {
    buffer: Buffer.from('fake image data'),
    originalname: 'image.png',
    mimetype: 'image/png',
    fieldname: 'file',
    size: 1024,
    stream: null,
    destination: '',
    filename: '',
    path: '',
    encoding: '',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService,
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                SMTP_HOST: 'smtp.example.com',
                SMTP_PORT: '587',
                SMTP_SECURE: 'false',
                SMTP_USER: 'user@example.com',
                SMTP_PASS: 'password',
              };
              return config[key];
            }),
          },
        },
        {
          provide: CompareImageService,
          useValue: {
            compareFaces: jest.fn(),
            imageProcessed: jest.fn(),
          },
        },],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    compareImageService = module.get<CompareImageService>(CompareImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a token and user data if login is successful', async () => {
    // Mocking responses for successful login
    jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(mockUser);
    (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(true);

    jest.spyOn(compareImageService, 'compareFaces').mockResolvedValue({
      isSamePerson: true,
      similarity: 0.95,
    });
    jest.spyOn(jwtService, 'signAsync').mockResolvedValue('jwt-token');

    const result = await service.login(loginDto, fileMock);

    expect(result).toEqual({
      token: 'jwt-token',
      email: mockUser.email,
      idUser: mockUser.id,
      similarity: 0.95,
    });
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(undefined);

    await expect(service.login(loginDto, fileMock)).rejects.toThrow(
      new UnauthorizedException('El email es incorrecto'),
    );
  });

  it('should throw UnauthorizedException if password is incorrect', async () => {
    jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(mockUser);
    (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(false);


    await expect(service.login(loginDto, fileMock)).rejects.toThrow(
      new UnauthorizedException('La contraseña es incorrecta'),
    );
  });

  it('should throw UnauthorizedException if face comparison fails', async () => {
    jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(mockUser);
    (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(true);

    jest.spyOn(compareImageService, 'compareFaces').mockResolvedValue({
      isSamePerson: false,
      similarity: 0.5,
    });

    await expect(service.login(loginDto, fileMock)).rejects.toThrow(
      new UnauthorizedException('Las caras no coinciden'),
    );
  });



  /* it('should register a user successfully', async () => {
    const registerDto = {
      id: 'mock-id',
      name: 'Test',
      surname: 'User',
      email: 'test@example.com',
      password: 'hashedpassword',
      birthDate: new Date(),
      imageDescriptor: 'mock-base64-descriptor',
      province: 'Province',
      locality: 'Locality',
      latitud: 0.0,
      longitud: 0.0,
      nroDni: null,
      nroTramiteDni: null,
      gender: Gender.MALE,
      isEmailVerified: false,
      isUserVerified: false,
      emailVerificationToken: null,
      emailVerificationTokenExpires: null,
      tripUsers: []
    };
    const fileMock = { buffer: Buffer.from('test') } as Express.Multer.File;

    const mockDetection = {
      detection: {
        _score: 0.99,
        _classScore: 0.99,
        _className: 'face',
        _imageDims: { width: 100, height: 100 },
        _box: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        },
        imageWidth: 100,
        imageHeight: 100,
        relativeBox: {
          x: 0,
          y: 0,
          width: 1,
          height: 1,
        },
        classScore: jest.fn().mockReturnValue(0.99),
        className: jest.fn().mockReturnValue('face'),
        imageDims: jest.fn().mockReturnValue({ width: 100, height: 100 }),
        box: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        },
        score: 0.99,
        forSize: jest.fn(),
        getBox: jest.fn().mockReturnValue({
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        }),
        getScore: jest.fn().mockReturnValue(0.99),
      },
      descriptor: new Float32Array(128), // Simulación del descriptor
    };
    

    const userDescriptorBase64 = Buffer.from(mockDetection.descriptor.buffer).toString('base64');
    const createdUser = { id: '1', ...registerDto, imageDescriptor: userDescriptorBase64 };
    const userResponse = plainToInstance(UserResponseDto, createdUser, { excludeExtraneousValues: true });

    jest.spyOn(userService, 'findOneByEmail').mockResolvedValueOnce(null);
    jest.spyOn(compareImageService, 'imageProcessed').mockResolvedValueOnce([mockDetection]);
    (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockResolvedValue('hashedPassword');
    jest.spyOn(userService, 'createUser').mockResolvedValue(createdUser);
    jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(createdUser);

    const result = await service.register(registerDto, fileMock);

    expect(result).toEqual(userResponse);
  }); */

  it('should throw BadRequestException if user already exists', async () => {
    jest.spyOn(userService, 'findOneByEmail').mockResolvedValueOnce({} as any);

    const registerDto: RegisterDto = {
      name: 'John',
      surname: 'Doe',
      email: 'existing@example.com',
      password: 'password123',
      birthDate: new Date(),
      province: 'TestProvince',
      locality: 'TestLocality',
      latitud: 10.0,
      longitud: 20.0,
      phoneNumber: '5491198765432'
    };
    const fileMock = { buffer: Buffer.from('test') } as Express.Multer.File;

    await expect(service.register(registerDto, fileMock)).rejects.toThrow(
      new BadRequestException('El usuario ya existe'),
    );
  });

  it('should throw BadRequestException if no face is detected', async () => {
    jest.spyOn(userService, 'findOneByEmail').mockResolvedValueOnce(null);
    jest.spyOn(compareImageService, 'imageProcessed').mockResolvedValueOnce([]);


    const registerDto: RegisterDto = {
      name: 'John',
      surname: 'Doe',
      email: 'new@example.com',
      password: 'password123',
      birthDate: new Date(),
      province: 'TestProvince',
      locality: 'TestLocality',
      latitud: 10.0,
      longitud: 20.0,
      phoneNumber: '5491198765432'
    };
    const fileMock = { buffer: Buffer.from('test') } as Express.Multer.File;

    await expect(service.register(registerDto, fileMock)).rejects.toThrow(
      new BadRequestException('No se detectó ninguna cara en la imagen proporcionada.'),
    );
  });

});
