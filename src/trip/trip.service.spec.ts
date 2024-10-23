import { Test, TestingModule } from '@nestjs/testing';
import { TripService } from './trip.service';
import { DataSource } from 'typeorm';

// @ts-ignore
export const dataSourceMockFactory: () => MockType<DataSource> = jest.fn(
  () => ({
    findAll: jest.fn(),
  }),
);

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};

describe('TripService', () => {
  let service: TripService;
  let dataSourceMock: MockType<DataSource>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: DataSource, useFactory: dataSourceMockFactory }],
    }).compile();
    dataSourceMock = module.get(DataSource);
    service = module.get<TripService>(TripService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
