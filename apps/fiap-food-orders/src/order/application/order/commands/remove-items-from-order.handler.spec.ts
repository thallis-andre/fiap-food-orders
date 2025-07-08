import { TransactionManager } from '@fiap-food/tactical-design/core';
import {
    FakeRepository,
    FakeTransactionManager,
} from '@fiap-food/test-factory/utils';
import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { Item } from '../../../domain/item.entity';
import { Order } from '../../../domain/order.aggregate';
import { OrderStatus } from '../../../domain/values/order-status.value';
import { OrderRepository } from '../abstractions/order.repository';
import { RemoveItemsFromOrderCommand } from './remove-items-from-order.command';
import { RemoveItemsFromOrderHandler } from './remove-items-from-order.handler';

describe('RemoveItemsFromOrderHandler', () => {
  let app: INestApplication;
  let target: RemoveItemsFromOrderHandler;
  let orderRepository: OrderRepository;

  const itemPrice = 19.9;
  const createItem = (id: string = randomUUID()) =>
    new Item(
      id,
      'X-Food',
      itemPrice,
      'Snack',
      'I would like to buy a hamfood',
    );

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveItemsFromOrderHandler,
        {
          provide: TransactionManager,
          useClass: FakeTransactionManager,
        },
        {
          provide: OrderRepository,
          useClass: FakeRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(RemoveItemsFromOrderHandler);
    orderRepository = app.get(OrderRepository);
  });

  it('should throw NotFoundException when Order does not exist', async () => {
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(null);
    jest.spyOn(orderRepository, 'update');
    const command = new RemoveItemsFromOrderCommand({
      id: '123',
      items: [{ key: '123' }],
    });
    await expect(() => target.execute(command)).rejects.toThrow(
      NotFoundException,
    );
    expect(orderRepository.update).not.toHaveBeenCalled();
  });

  it('should ignore when no items were provided', async () => {
    const order = new Order(randomUUID(), null, OrderStatus.initiate());
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(order);
    jest.spyOn(orderRepository, 'update');
    const command = new RemoveItemsFromOrderCommand({ id: '123', items: [] });
    await target.execute(command);
    expect(orderRepository.update).not.toHaveBeenCalled();
  });

  it('should remove item from order', async () => {
    const order = new Order(randomUUID(), null, OrderStatus.initiate());
    order.addItem(createItem());
    order.addItem(createItem());
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(order);
    jest.spyOn(orderRepository, 'update').mockResolvedValue();
    const [itemToRemove] = order.items;
    const command = new RemoveItemsFromOrderCommand({
      id: '123',
      items: [itemToRemove],
    });
    await target.execute(command);
    expect(orderRepository.update).toHaveBeenCalled();
    expect(order.items.length).toBe(1);
    const expectedPrice = Number((itemPrice * order.items.length).toFixed(2));
    expect(order.total).toBe(expectedPrice);
  });
});
