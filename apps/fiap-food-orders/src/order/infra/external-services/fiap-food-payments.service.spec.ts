import { faker } from '@faker-js/faker';
import { HttpService } from '@nestjs/axios';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosInstance } from 'axios';
import { randomUUID } from 'crypto';
import { FiapFoodPaymentService } from './fiap-food-payments.service';

describe('MongooseFiapFoodPaymentService', () => {
  let app: INestApplication;
  let target: FiapFoodPaymentService;
  let config: ConfigService;
  let http: HttpService;
  let axios: AxiosInstance;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        FiapFoodPaymentService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn(), getOrThrow: jest.fn() },
        },
        {
          provide: HttpService,
          useValue: { axiosRef: { post: jest.fn(), get: jest.fn() } },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(FiapFoodPaymentService);
    config = app.get(ConfigService);
    http = app.get(HttpService);
    axios = http.axiosRef;
  });

  it('should instantiate correctly', async () => {
    expect(target).toBeInstanceOf(FiapFoodPaymentService);
  });

  it('should throw if config service throws', async () => {
    jest.spyOn(config, 'getOrThrow').mockImplementation(() => {
      throw new Error();
    });
    await expect(() => target.createPixPayment(12.99)).rejects.toThrow();
  });

  it('should throw if http service throws', async () => {
    jest.spyOn(config, 'getOrThrow').mockReturnValue(faker.internet.url());
    jest.spyOn(axios, 'post').mockRejectedValue(new Error());
    await expect(() => target.createPixPayment(12.99)).rejects.toThrow();
  });

  it('should create payment and return its content', async () => {
    jest.spyOn(config, 'getOrThrow').mockReturnValue(faker.internet.url());
    const id = randomUUID();
    const content = randomUUID();
    jest.spyOn(axios, 'post').mockResolvedValue({ data: { id } });
    jest.spyOn(axios, 'get').mockResolvedValue({
      data: { status: 'Created', content },
    });
    const result = await target.createPixPayment(12.99);
    expect(result.id).toBe(id);
    expect(result.qrCode).toBe(content);
  });
});
