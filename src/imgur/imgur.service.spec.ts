import { Test, TestingModule } from '@nestjs/testing';
import { ImgurService } from './imgur.service';
import { ConfigService } from '@nestjs/config';

describe('ImgurService', () => {
  let service: ImgurService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{
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
      }, ImgurService],
    }).compile();

    service = module.get<ImgurService>(ImgurService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
