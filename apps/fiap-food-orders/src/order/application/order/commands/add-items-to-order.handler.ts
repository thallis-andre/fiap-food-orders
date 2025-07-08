import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ItemRepository } from '../../item/abstractions/item.repository';
import { OrderRepository } from '../abstractions/order.repository';
import { AddItemsToOrderCommand } from './add-items-to-order.command';

@CommandHandler(AddItemsToOrderCommand)
export class AddItemsToOrderHandler
  implements ICommandHandler<AddItemsToOrderCommand, void>
{
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly itemsRepository: ItemRepository,
  ) {}

  async execute(command: AddItemsToOrderCommand): Promise<void> {
    const { id, items: itemsInput } = command.data;

    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException();
    }

    const items = await Promise.all(
      itemsInput.map((x) => this.itemsRepository.findById(x.id)),
    ).then((result) => result.filter((x) => Boolean(x)));

    if (!items?.length) {
      return;
    }

    items.forEach((item) => order.addItem(item));

    await this.orderRepository.update(order);
    await order.commit();
  }
}
