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
import { ItemRepository } from '../../item/abstractions/item.repository';
import { OrderRepository } from '../abstractions/order.repository';
import { AddItemsToOrderCommand } from './add-items-to-order.command';
import { AddItemsToOrderHandler } from './add-items-to-order.handler';

describe('AddItemsToOrderHandler', () => {
  let app: INestApplication;
  let target: AddItemsToOrderHandler;
  let orderRepository: OrderRepository;
  let itemRepository: ItemRepository;

  const itemPrice = 19.9;

  const fakeFindItemById = async (id: string) =>
    new Item(id, 'X-Food', itemPrice, 'Snack', 'I would like to buy a hamfood');

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        AddItemsToOrderHandler,
        {
          provide: TransactionManager,
          useClass: FakeTransactionManager,
        },
        {
          provide: OrderRepository,
          useClass: FakeRepository,
        },
        {
          provide: ItemRepository,
          useClass: FakeRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(AddItemsToOrderHandler);
    orderRepository = app.get(OrderRepository);
    itemRepository = app.get(ItemRepository);
  });

  it('should throw NotFoundException when Order does not exist', async () => {
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(null);
    jest.spyOn(orderRepository, 'update');
    const command = new AddItemsToOrderCommand({
      id: '123',
      items: [{ id: '123' }],
    });
    await expect(() => target.execute(command)).rejects.toThrow(
      NotFoundException,
    );
    expect(orderRepository.update).not.toHaveBeenCalled();
  });

  it('should ignore when provided items do not exist', async () => {
    const order = new Order(randomUUID(), null, OrderStatus.initiate());
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(order);
    jest.spyOn(orderRepository, 'update');
    jest.spyOn(itemRepository, 'findById').mockResolvedValue(null);
    const command = new AddItemsToOrderCommand({
      id: '123',
      items: [{ id: '123' }],
    });
    await target.execute(command);
    expect(orderRepository.update).not.toHaveBeenCalled();
  });

  it('should add items to existing order', async () => {
    const order = new Order(randomUUID(), null, OrderStatus.initiate());
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(order);
    jest.spyOn(orderRepository, 'update').mockResolvedValue();
    jest.spyOn(itemRepository, 'findById').mockImplementation(fakeFindItemById);
    const command = new AddItemsToOrderCommand({
      id: '123',
      items: [{ id: '123' }, { id: '123' }],
    });
    await target.execute(command);
    expect(orderRepository.update).toHaveBeenCalled();
    expect(order.items.length).toBe(command.data.items.length);
    const expectedPrice = Number(
      (itemPrice * command.data.items.length).toFixed(2),
    );
    expect(order.total).toEqual(expectedPrice);
  });
});
