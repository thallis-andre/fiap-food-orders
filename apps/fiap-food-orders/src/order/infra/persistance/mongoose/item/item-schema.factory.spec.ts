import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Item } from '../../../../domain/item.entity';
import { MongooseItemSchemaFactory } from './item-schema.factory';
import { MongooseItemSchema } from './item.schema';

describe('MongooseItemSchemaFactory', () => {
  let app: INestApplication;
  let target: MongooseItemSchemaFactory;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [MongooseItemSchemaFactory],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(MongooseItemSchemaFactory);
  });

  it('should transform a Item Entity into a MongooseSchema', async () => {
    const actual = new Item(
      new Types.ObjectId().toHexString(),
      'XFood',
      12.99,
      'Snack',
      'Some Description',
      ['https://anyurl.com'],
    );

    const result = target.entityToSchema(actual);
    expect(result._id).toBeInstanceOf(Types.ObjectId);
    expect(result).not.toBeInstanceOf(Item);
  });

  it('should transform a MongooseSchema into a PreparationEntity', async () => {
    const actual: MongooseItemSchema = {
      _id: new Types.ObjectId(),
      name: 'XFood',
      description: 'dummy',
      price: 12.99,
      type: 'Snack',
      images: ['https://anyurl.com'],
    };
    const result = target.schemaToEntity(actual);
    expect(result.id).not.toBeInstanceOf(Types.ObjectId);
    expect(result.id).toBe(actual._id.toHexString());
    expect(result).toBeInstanceOf(Item);
  });
});
