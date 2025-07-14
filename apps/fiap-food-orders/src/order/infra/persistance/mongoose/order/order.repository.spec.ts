import {
    AggregateMergeContext,
    TransactionManager,
} from '@fiap-food/tactical-design/core';
import { FakeMongooseModel } from '@fiap-food/test-factory/utils';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderRepository } from '../../../../application/order/abstractions/order.repository';
import { MongooseOrderSchemaFactory } from './order-schema.factory';
import { MongooseOrderRepository } from './order.repository';
import { MongooseOrderSchema } from './order.schema';

describe('MongooseOrderRepository', () => {
  let app: INestApplication;
  let target: OrderRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TransactionManager,
          useValue: Object.create(TransactionManager.prototype),
        },
        {
          provide: getModelToken(MongooseOrderSchema.name),
          useClass: FakeMongooseModel,
        },
        {
          provide: MongooseOrderSchemaFactory,
          useValue: Object.create(MongooseOrderSchema.prototype),
        },
        {
          provide: AggregateMergeContext,
          useValue: Object.create(AggregateMergeContext.prototype),
        },
        {
          provide: OrderRepository,
          useClass: MongooseOrderRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(OrderRepository);
  });

  it('should instantiate correctly', async () => {
    expect(target).toBeInstanceOf(MongooseOrderRepository);
  });
});
