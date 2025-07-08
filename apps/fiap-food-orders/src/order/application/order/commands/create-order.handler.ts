import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Order } from '../../../domain/order.aggregate';
import { OrderStatus } from '../../../domain/values/order-status.value';
import { Requester } from '../../../domain/values/requester.value';
import { ItemRepository } from '../../item/abstractions/item.repository';
import { OrderRepository } from '../abstractions/order.repository';
import { CreateOrderCommand, CreateOrderResult } from './create-order.command';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler
  implements ICommandHandler<CreateOrderCommand, CreateOrderResult>
{
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly itemsRepository: ItemRepository,
  ) {}

  async execute(command: CreateOrderCommand): Promise<CreateOrderResult> {
    const { requester, items: itemsInput = [] } = command.data;

    const orderRequester = requester
      ? new Requester(requester.name, requester.cpf, requester.email)
      : null;

    const id = this.orderRepository.generateId();
    const order = new Order(id, orderRequester, OrderStatus.initiate());
    order.create();

    const items = await Promise.all(
      itemsInput.map((x) => this.itemsRepository.findById(x.id)),
    );

    items.filter((x) => Boolean(x)).forEach((item) => order.addItem(item));

    await this.orderRepository.create(order);
    await order.commit();
    return new CreateOrderResult({ id });
  }
}
