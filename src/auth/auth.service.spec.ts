import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CompareImageService } from '../compare-image/compare-image.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Gender, User } from '../user/entities/user.entity';


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
    password: 'hashed-password', // Asegúrate de que la contraseña esté hasheada si es necesario para la prueba
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
    tripUsers: [], // Puedes dejar esto como un array vacío si no es relevante para la prueba
    imageDescriptor: 'base64string',
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

});
