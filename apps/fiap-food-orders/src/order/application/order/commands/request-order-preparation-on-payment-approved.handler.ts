import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderRepository } from '../abstractions/order.repository';
import { PreparationService } from '../abstractions/preparation.service';
import { RequestOrderPreparationOnPaymentApprovedCommand } from './request-order-preparation-on-payment-approved.command';

@CommandHandler(RequestOrderPreparationOnPaymentApprovedCommand)
export class RequestOrderPreparationOnPaymentApprovedHandler
  implements
    ICommandHandler<RequestOrderPreparationOnPaymentApprovedCommand, void>
{
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly preparationService: PreparationService,
  ) {}

  async execute(
    command: RequestOrderPreparationOnPaymentApprovedCommand,
  ): Promise<void> {
    const { paymentId } = command;

    const order = await this.orderRepository.findByPaymentId(paymentId);

    /* istanbul ignore if */
    if (!order) {
      throw new NotFoundException();
    }

    const { conciliationId } = await this.preparationService.requestPreparation(
      order.id,
      order.items,
    );

    order.requestPreparation(conciliationId);

    await this.orderRepository.update(order);
    await order.commit();
  }
}
