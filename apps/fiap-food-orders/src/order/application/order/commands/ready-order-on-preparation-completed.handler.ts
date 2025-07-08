import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderRepository } from '../abstractions/order.repository';
import { ReadyOrderOnPreparationCompletedCommand } from './ready-order-on-preparation-completed.command';

@CommandHandler(ReadyOrderOnPreparationCompletedCommand)
export class ReadyOrderOnPreparationCompletedHandler
  implements ICommandHandler<ReadyOrderOnPreparationCompletedCommand, void>
{
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(
    command: ReadyOrderOnPreparationCompletedCommand,
  ): Promise<void> {
    const { preparationId } = command;

    const order = await this.orderRepository.findByPreparationId(preparationId);

    /* istanbul ignore if */
    if (!order) {
      throw new NotFoundException();
    }

    order.completePreparation();

    await this.orderRepository.update(order);
    await order.commit();
  }
}
