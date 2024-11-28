import { Test, TestingModule } from '@nestjs/testing';
import { ImgurController } from './imgur.controller';
import { ImgurService } from './imgur.service';

describe('ImgurController', () => {
  let controller: ImgurController;
  let service: ImgurService;
  const mockImgurService = {
    uploadImage: jest.fn()
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImgurController],
      providers: [{
        provide: ImgurService, useValue: mockImgurService}]
    }).compile();

    controller = module.get<ImgurController>(ImgurController);
    service = module.get<ImgurService>(ImgurService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
