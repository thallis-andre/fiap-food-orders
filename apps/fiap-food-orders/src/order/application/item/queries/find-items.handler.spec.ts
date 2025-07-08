import { FakeMongooseModel } from '@fiap-food/test-factory/utils';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { MongooseItemSchema } from '../../../infra/persistance/mongoose/item/item.schema';
import { Item } from '../dtos/item.dto';
import { FindItemsHandler } from './find-items.handler';
import { FindItemsQuery, FindItemsResult } from './find-items.query';

describe('FindItemsHandler', () => {
  let app: INestApplication;
  let target: FindItemsHandler;
  let model: FakeMongooseModel<MongooseItemSchema>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        FindItemsHandler,
        {
          provide: getModelToken(MongooseItemSchema.name),
          useClass: FakeMongooseModel,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(FindItemsHandler);
    model = app.get(getModelToken(MongooseItemSchema.name));
  });

  it('should return existing items when filters provided', async () => {
    const schema: MongooseItemSchema = {
      _id: new Types.ObjectId(),
      name: 'XFood',
      description: 'XFood Description',
      price: 12.99,
      type: 'Snack',
      images: ['https://anyurl.com'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const query = new FindItemsQuery({ name: 'XFood', type: ['Snack'] });
    jest.spyOn(model, 'exec').mockResolvedValue([schema]);
    const result = await target.execute(query);
    expect(result).toBeInstanceOf(FindItemsResult);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data[0]).toBeInstanceOf(Item);
  });

  it('should return existing items when filters provided', async () => {
    const schema: MongooseItemSchema = {
      _id: new Types.ObjectId(),
      name: 'XFood',
      description: 'XFood Description',
      price: 12.99,
      type: 'Snack',
      images: ['https://anyurl.com'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const query = new FindItemsQuery({});
    jest.spyOn(model, 'exec').mockResolvedValue([schema]);
    const result = await target.execute(query);
    expect(result).toBeInstanceOf(FindItemsResult);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data[0]).toBeInstanceOf(Item);
  });
});
