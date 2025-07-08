import { faker } from '@faker-js/faker';
import { FakeMongooseModel } from '@fiap-food/test-factory/utils';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { EOrderStatus } from '../../../domain/values/order-status.value';
import { MongooseOrderSchema } from '../../../infra/persistance/mongoose/order/order.schema';
import { Order } from '../dtos/order.dto';
import { FindOrdersHandler } from './find-orders.handler';
import { FindOrdersQuery, FindOrdersResult } from './find-orders.query';

describe('FindOrdersHandler', () => {
  let app: INestApplication;
  let target: FindOrdersHandler;
  let model: FakeMongooseModel<MongooseOrderSchema>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        FindOrdersHandler,
        {
          provide: getModelToken(MongooseOrderSchema.name),
          useClass: FakeMongooseModel,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(FindOrdersHandler);
    model = app.get(getModelToken(MongooseOrderSchema.name));
  });

  it('should return Empty if no order was found', async () => {
    const query = new FindOrdersQuery({});
    jest.spyOn(model, 'exec').mockResolvedValue(null);
    const result = await target.execute(query);
    expect(result.data).toEqual([]);
  });

  it.each([
    new FindOrdersQuery({ customerCpf: '01234567890' }),
    new FindOrdersQuery({ customerEmail: faker.internet.email() }),
    new FindOrdersQuery({ status: EOrderStatus.Initiated }),
    new FindOrdersQuery({ from: new Date(), to: new Date() }),
    new FindOrdersQuery({ from: new Date() }),
    new FindOrdersQuery({ to: new Date() }),
  ])('should return existing for given criterea', async (query) => {
    const schema: MongooseOrderSchema = {
      _id: new Types.ObjectId(),
      items: [{ key: '123', name: 'X-Food', price: 12.99 }],
      status: 'Completed',
      total: 12.99,
      requester: {
        name: faker.person.fullName(),
        cpf: '01234567890',
        email: faker.internet.email(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(model, 'exec').mockResolvedValue([schema]);
    const result = await target.execute(query);
    expect(result).toBeInstanceOf(FindOrdersResult);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data[0]).toBeInstanceOf(Order);
  });
});
