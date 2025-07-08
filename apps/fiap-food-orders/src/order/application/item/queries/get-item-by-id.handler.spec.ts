import { FakeMongooseModel } from '@fiap-food/test-factory/utils';
import { INestApplication, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { MongooseItemSchema } from '../../../infra/persistance/mongoose/item/item.schema';
import { Item } from '../dtos/item.dto';
import { GetItemByIdHandler } from './get-item-by-id.handler';
import { GetItemByIdQuery, GetItemByIdResult } from './get-item-by-id.query';

describe('GetItemByIdHandler', () => {
  let app: INestApplication;
  let target: GetItemByIdHandler;
  let model: FakeMongooseModel<MongooseItemSchema>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        GetItemByIdHandler,
        {
          provide: getModelToken(MongooseItemSchema.name),
          useClass: FakeMongooseModel,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(GetItemByIdHandler);
    model = app.get(getModelToken(MongooseItemSchema.name));
  });

  it('should throw NotFound if item does not exist', async () => {
    const query = new GetItemByIdQuery(new Types.ObjectId().toHexString());
    jest.spyOn(model, 'exec').mockResolvedValue(null);
    await expect(() => target.execute(query)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return existing item if found', async () => {
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
    const query = new GetItemByIdQuery(schema._id.toHexString());
    jest.spyOn(model, 'exec').mockResolvedValue(schema);
    const result = await target.execute(query);
    expect(result).toBeInstanceOf(GetItemByIdResult);
    expect(result.data).toBeInstanceOf(Item);
    expect(result.data.id).toBe(query.id);
  });
});
