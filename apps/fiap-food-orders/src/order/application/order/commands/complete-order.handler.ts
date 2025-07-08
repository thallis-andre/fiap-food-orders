import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderRepository } from '../abstractions/order.repository';
import { CompleteOrderCommand } from './complete-order.command';

@CommandHandler(CompleteOrderCommand)
export class CompleteOrderHandler
  implements ICommandHandler<CompleteOrderCommand, void>
{
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute({ id }: CompleteOrderCommand): Promise<void> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException();
    }

    order.complete();
    await this.orderRepository.update(order);
    await order.commit();
  }
}
