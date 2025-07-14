import { faker } from '@faker-js/faker';
import { FakeMongooseModel } from '@fiap-food/test-factory/utils';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { MongooseOrderSchema } from '../../../infra/persistance/mongoose/order/order.schema';
import { OrderFollowUp } from '../dtos/follow-up.dto';
import { FollowUpOrdersHandler } from './follow-up-orders.handler';
import {
  FollowUpOrdersQuery,
  FollowUpOrdersResult,
} from './follow-up-orders.query';

describe('FollowUpOrdersHandler', () => {
  let app: INestApplication;
  let target: FollowUpOrdersHandler;
  let model: FakeMongooseModel<MongooseOrderSchema>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        FollowUpOrdersHandler,
        {
          provide: getModelToken(MongooseOrderSchema.name),
          useClass: FakeMongooseModel,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(FollowUpOrdersHandler);
    model = app.get(getModelToken(MongooseOrderSchema.name));
  });

  it('should return Empty if no order was found', async () => {
    const query = new FollowUpOrdersQuery();
    jest.spyOn(model, 'exec').mockResolvedValue(null);
    const result = await target.execute(query);
    expect(result).toBeInstanceOf(FollowUpOrdersResult);
  });

  it('should return followup groups', async () => {
    const preparationRequestedAt = new Date();
    preparationRequestedAt.setUTCMinutes(
      preparationRequestedAt.getUTCMinutes() - 5,
    );
    const schema: MongooseOrderSchema = {
      _id: new Types.ObjectId(),
      items: [{ key: '123', name: 'X-Food', price: 12.99 }],
      status: 'PreparationRequested',
      total: 12.99,
      preparationRequestedAt,
      requester: {
        name: faker.person.fullName(),
        cpf: '01234567890',
        email: faker.internet.email(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(model, 'exec').mockResolvedValue([schema]);
    const result = await target.execute(new FollowUpOrdersQuery());
    expect(result).toBeInstanceOf(FollowUpOrdersResult);
    expect(result.data.received).toBeInstanceOf(Array);
    expect(result.data.received[0]).toBeInstanceOf(OrderFollowUp);
    expect(result.data.received[0].waitingTime).toMatch(/\d+:\d{2}:\d{2}/g);
  });
});
