import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CompareImageService } from '../compare-image/compare-image.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService,
        {
          provide: UserService,
          useValue: {

          },
        },
        {
          provide: JwtService,
          useValue: {
            // Métodos mock del JwtService
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
            // Métodos mock del CompareImageService
          },
        },],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
