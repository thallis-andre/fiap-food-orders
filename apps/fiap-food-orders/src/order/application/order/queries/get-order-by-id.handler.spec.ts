import { FakeMongooseModel } from '@fiap-food/test-factory/utils';
import { INestApplication, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { MongooseOrderSchema } from '../../../infra/persistance/mongoose/order/order.schema';
import { Order } from '../dtos/order.dto';
import { GetOrderByIdHandler } from './get-order-by-id.handler';
import { GetOrderByIdQuery, GetOrderByIdResult } from './get-order-by-id.query';

describe('GetOrderByIdHandler', () => {
  let app: INestApplication;
  let target: GetOrderByIdHandler;
  let model: FakeMongooseModel<MongooseOrderSchema>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderByIdHandler,
        {
          provide: getModelToken(MongooseOrderSchema.name),
          useClass: FakeMongooseModel,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(GetOrderByIdHandler);
    model = app.get(getModelToken(MongooseOrderSchema.name));
  });

  it('should throw NotFound if item does not exist', async () => {
    const query = new GetOrderByIdQuery(new Types.ObjectId().toHexString());
    jest.spyOn(model, 'exec').mockResolvedValue(null);
    await expect(() => target.execute(query)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return existing item if found', async () => {
    const schema: MongooseOrderSchema = {
      _id: new Types.ObjectId(),
      items: [{ key: '123', name: 'X-Food', price: 12.99 }],
      status: 'Completed',
      total: 12.99,
      requester: {
        name: 'John Doe',
        cpf: '01234567890',
        email: 'john@doe.com',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const query = new GetOrderByIdQuery(schema._id.toHexString());
    jest.spyOn(model, 'exec').mockResolvedValue(schema);
    const result = await target.execute(query);
    expect(result).toBeInstanceOf(GetOrderByIdResult);
    expect(result.data).toBeInstanceOf(Order);
    expect(result.data.id).toBe(query.id);
  });
});
