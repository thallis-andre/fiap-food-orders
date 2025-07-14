import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemRepository } from '../application/item/abstractions/item.repository';
import { OrderRepository } from '../application/order/abstractions/order.repository';
import { PaymentService } from '../application/order/abstractions/payments.service';
import { PreparationService } from '../application/order/abstractions/preparation.service';
import { FiapFoodPaymentService } from './external-services/fiap-food-payments.service';
import { FiapFoodPreparationService } from './external-services/fiap-food-preparation.service';
import { MongooseItemSchemaFactory } from './persistance/mongoose/item/item-schema.factory';
import { MongooseItemRepository } from './persistance/mongoose/item/item.repository';
import {
  MongooseItemSchema,
  MongooseItemSchemaModel,
} from './persistance/mongoose/item/item.schema';
import { MongooseOrderSchemaFactory } from './persistance/mongoose/order/order-schema.factory';
import { MongooseOrderRepository } from './persistance/mongoose/order/order.repository';
import {
  MongooseOrderSchema,
  MongooseOrderSchemaModel,
} from './persistance/mongoose/order/order.schema';

const MongooseSchemaModule = MongooseModule.forFeature([
  {
    name: MongooseItemSchema.name,
    schema: MongooseItemSchemaModel,
  },
  {
    name: MongooseOrderSchema.name,
    schema: MongooseOrderSchemaModel,
  },
]);

MongooseSchemaModule.global = true;

@Module({
  imports: [HttpModule.register({}), MongooseSchemaModule],
  providers: [
    MongooseItemSchemaFactory,
    {
      provide: ItemRepository,
      useClass: MongooseItemRepository,
    },
    MongooseOrderSchemaFactory,
    {
      provide: OrderRepository,
      useClass: MongooseOrderRepository,
    },
    {
      provide: PaymentService,
      useClass: FiapFoodPaymentService,
    },
    {
      provide: PreparationService,
      useClass: FiapFoodPreparationService,
    },
  ],
  exports: [
    ItemRepository,
    OrderRepository,
    PaymentService,
    PreparationService,
  ],
})
export class InfraModule {}
