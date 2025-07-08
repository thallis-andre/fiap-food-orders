import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderRepository } from '../abstractions/order.repository';
import { StartOrderPreparationOnPreparationStartedCommand } from './start-order-preparation-on-preparation-started.command';

@CommandHandler(StartOrderPreparationOnPreparationStartedCommand)
export class StartOrderPreparationOnPreparationStartedHandler
  implements
    ICommandHandler<StartOrderPreparationOnPreparationStartedCommand, void>
{
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(
    command: StartOrderPreparationOnPreparationStartedCommand,
  ): Promise<void> {
    const { preparationId } = command;

    const order = await this.orderRepository.findByPreparationId(preparationId);

    /* istanbul ignore if */
    if (!order) {
      throw new NotFoundException();
    }

    order.startPreparation();

    await this.orderRepository.update(order);
    await order.commit();
  }
}
