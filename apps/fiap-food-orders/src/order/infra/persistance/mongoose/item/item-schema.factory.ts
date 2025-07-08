import { EntitySchemaFactory } from '@fiap-food/tactical-design/core';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Item } from '../../../../domain/item.entity';
import { MongooseItemSchema } from './item.schema';

@Injectable()
export class MongooseItemSchemaFactory
  implements EntitySchemaFactory<MongooseItemSchema, Item>
{
  entityToSchema(entity: Item): MongooseItemSchema {
    return {
      _id: new Types.ObjectId(entity.id),
      name: entity.name,
      description: entity.description,
      price: entity.price,
      type: entity.type,
      images: entity.images,
    };
  }

  schemaToEntity(entitySchema: MongooseItemSchema): Item {
    return new Item(
      entitySchema._id.toHexString(),
      entitySchema.name,
      entitySchema.price,
      entitySchema.type,
      entitySchema.description,
      entitySchema.images,
    );
  }
}
