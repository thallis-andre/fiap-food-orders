import {
    AggregateMergeContext,
    TransactionManager,
} from '@fiap-food/tactical-design/core';
import { MongooseRepository } from '@fiap-food/tactical-design/mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrderRepository } from '../../../../application/order/abstractions/order.repository';
import { Order } from '../../../../domain/order.aggregate';
import { MongooseOrderSchemaFactory } from './order-schema.factory';
import { MongooseOrderSchema } from './order.schema';

@Injectable()
export class MongooseOrderRepository
  extends MongooseRepository<MongooseOrderSchema, Order>
  implements OrderRepository
{
  constructor(
    protected readonly transactionManager: TransactionManager,
    @InjectModel(MongooseOrderSchema.name)
    protected readonly ItemModel: Model<MongooseOrderSchema>,
    protected readonly ItemSchemaFactory: MongooseOrderSchemaFactory,
    protected readonly mergeContext: AggregateMergeContext,
  ) {
    super(mergeContext, transactionManager, ItemModel, ItemSchemaFactory);
  }

  generateId(): string {
    return new Types.ObjectId().toHexString();
  }

  async findByPaymentId(paymentId: string): Promise<Order> {
    return this.findOne({ paymentId });
  }

  async findByPreparationId(preparationId: string): Promise<Order> {
    return this.findOne({ preparationId });
  }
}
