import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ApplicationModule } from '../application/applicaton.module';
import { CreateItemController } from './item/create-item.controller';
import { FindItemsController } from './item/find-items.controller';
import { GetItemByIdController } from './item/get-item-by-id.controller';
import { UpdateItemController } from './item/update-item.controller';
import { AddItemsToOrderController } from './order/add-items-to-order.controller';
import { CheckoutOrderController } from './order/checkout-order.controller';
import { CompleteOrderController } from './order/complete-order.controller';
import { CreateOrderController } from './order/create-order.controller';
import { FindOrdersController } from './order/find-orders.controller';
import { FollowUpOrdersController } from './order/follow-up-orders.controller';
import { GetOrderByIdController } from './order/get-order-by-id.controller';
import { OnPaymentApprovedRequestPreparationController } from './order/on-payment-approved-request-prepration.controller';
import { OnPaymentRejectedRejectOrderController } from './order/on-payment-rejected-reject-order.controller';
import { OnPreparationCompletedReadyOrderController } from './order/on-preparation-completed-ready-order.controller';
import { OnPreparationStartedStartOrderPreparationController } from './order/on-preparation-started-start-order-preparation.controller';
import { RemoveItemsFromOrderController } from './order/remove-items-from-order.controller';

const HttpDrivers = [
  CreateItemController,
  GetItemByIdController,
  UpdateItemController,
  FindItemsController,
  CreateOrderController,
  GetOrderByIdController,
  FindOrdersController,
  AddItemsToOrderController,
  RemoveItemsFromOrderController,
  CheckoutOrderController,
  CompleteOrderController,
  FollowUpOrdersController,
];
const AmqpDrivers = [
  OnPaymentApprovedRequestPreparationController,
  OnPaymentRejectedRejectOrderController,
  OnPreparationCompletedReadyOrderController,
  OnPreparationStartedStartOrderPreparationController,
];

@Module({
  imports: [CqrsModule, ApplicationModule],
  controllers: [...HttpDrivers],
  providers: [...AmqpDrivers],
})
export class DriversModule {}
