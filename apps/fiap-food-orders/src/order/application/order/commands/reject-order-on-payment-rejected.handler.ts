import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EOrderRejectionReason } from '../../../domain/values/order-rejection-reason.value';
import { OrderRepository } from '../abstractions/order.repository';
import { RejectOrderOnPaymentRejectedCommand } from './reject-order-on-payment-rejected.command';

@CommandHandler(RejectOrderOnPaymentRejectedCommand)
export class RejectOrderOnPaymentRejectedHandler
  implements ICommandHandler<RejectOrderOnPaymentRejectedCommand, void>
{
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(command: RejectOrderOnPaymentRejectedCommand): Promise<void> {
    const { paymentId } = command;

    const order = await this.orderRepository.findByPaymentId(paymentId);

    /* istanbul ignore if */
    if (!order) {
      throw new NotFoundException();
    }

    order.reject(EOrderRejectionReason.PaymentRejected);
    await this.orderRepository.update(order);
    await order.commit();
  }
}
