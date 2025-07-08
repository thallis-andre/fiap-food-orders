import { DomainException } from '@fiap-food/tactical-design/core';
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EOrderStatus } from '../../../domain/values/order-status.value';
import { OrderRepository } from '../abstractions/order.repository';
import { PaymentService } from '../abstractions/payments.service';
import {
  CheckoutOrderCommand,
  CheckoutOrderResult,
} from './checkout-order.command';

@CommandHandler(CheckoutOrderCommand)
export class CheckoutOrderHandler
  implements ICommandHandler<CheckoutOrderCommand, CheckoutOrderResult>
{
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentService: PaymentService,
  ) {}

  async execute({ id }: CheckoutOrderCommand): Promise<CheckoutOrderResult> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException();
    }

    if (!order.items.length) {
      throw new DomainException('Order has no items');
    }

    if (order.status !== EOrderStatus.Initiated) {
      throw new DomainException(
        'Cannot checkout order that is already in an advanced state',
      );
    }
    const { id: paymentId, qrCode } =
      await this.paymentService.createPixPayment(order.total);
    order.checkout(paymentId, qrCode);

    await this.orderRepository.update(order);
    await order.commit();

    return new CheckoutOrderResult({ qrCode });
  }
}
