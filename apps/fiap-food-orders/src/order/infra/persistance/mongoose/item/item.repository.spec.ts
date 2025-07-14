import {
  AggregateMergeContext,
  TransactionManager,
} from '@fiap-food/tactical-design/core';
import { FakeMongooseModel } from '@fiap-food/test-factory/utils';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ItemRepository } from '../../../../application/item/abstractions/item.repository';
import { MongooseItemSchemaFactory } from './item-schema.factory';
import { MongooseItemRepository } from './item.repository';
import { MongooseItemSchema } from './item.schema';

describe('MongooseItemRepository', () => {
  let app: INestApplication;
  let target: ItemRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TransactionManager,
          useValue: Object.create(TransactionManager.prototype),
        },
        {
          provide: getModelToken(MongooseItemSchema.name),
          useClass: FakeMongooseModel,
        },
        {
          provide: MongooseItemSchemaFactory,
          useValue: Object.create(MongooseItemSchema.prototype),
        },
        {
          provide: AggregateMergeContext,
          useValue: Object.create(AggregateMergeContext.prototype),
        },
        {
          provide: ItemRepository,
          useClass: MongooseItemRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(ItemRepository);
  });

  it('should instantiate correctly', async () => {
    expect(target).toBeInstanceOf(MongooseItemRepository);
  });
});
