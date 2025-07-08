import {
    AggregateMergeContext,
    TransactionManager,
} from '@fiap-food/tactical-design/core';
import { MongooseRepository } from '@fiap-food/tactical-design/mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ItemRepository } from '../../../../application/item/abstractions/item.repository';
import { Item } from '../../../../domain/item.entity';
import { MongooseItemSchemaFactory } from './item-schema.factory';
import { MongooseItemSchema } from './item.schema';

@Injectable()
export class MongooseItemRepository
  extends MongooseRepository<MongooseItemSchema, Item>
  implements ItemRepository
{
  constructor(
    protected readonly transactionManager: TransactionManager,
    @InjectModel(MongooseItemSchema.name)
    protected readonly ItemModel: Model<MongooseItemSchema>,
    protected readonly ItemSchemaFactory: MongooseItemSchemaFactory,
    protected readonly mergeContext: AggregateMergeContext,
  ) {
    super(mergeContext, transactionManager, ItemModel, ItemSchemaFactory);
  }

  generateId(): string {
    return new Types.ObjectId().toHexString();
  }

  async findByName(name: string): Promise<Item> {
    return this.findOne({ name });
  }
}
