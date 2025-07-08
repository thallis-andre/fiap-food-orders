import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderRepository } from '../abstractions/order.repository';
import { RemoveItemsFromOrderCommand } from './remove-items-from-order.command';

@CommandHandler(RemoveItemsFromOrderCommand)
export class RemoveItemsFromOrderHandler
  implements ICommandHandler<RemoveItemsFromOrderCommand, void>
{
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(command: RemoveItemsFromOrderCommand): Promise<void> {
    const { id, items: itemsInput } = command.data;

    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException();
    }

    if (!order.items.length) {
      return;
    }

    order.items
      .filter((x) => itemsInput.some((y) => x.key === y.key))
      .forEach((item) => order.removeItem(item));

    await this.orderRepository.update(order);
    await order.commit();
  }
}
