import { TransactionManager } from '@fiap-food/tactical-design/core';
import {
    FakeRepository,
    FakeTransactionManager,
} from '@fiap-food/test-factory/utils';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Item } from '../../../domain/item.entity';
import { Order } from '../../../domain/order.aggregate';
import { ItemRepository } from '../../item/abstractions/item.repository';
import { OrderRepository } from '../abstractions/order.repository';
import { CreateOrderCommand } from './create-order.command';
import { CreateOrderHandler } from './create-order.handler';

describe('CreateOrderHandler', () => {
  let app: INestApplication;
  let target: CreateOrderHandler;
  let orderRepository: OrderRepository;
  let itemRepository: ItemRepository;

  const itemPrice = 19.9;

  const fakeFindItemById = async (id: string) =>
    new Item(id, 'X-Food', itemPrice, 'Snack', 'Nice Description');

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderHandler,
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
    target = app.get(CreateOrderHandler);
    orderRepository = app.get(OrderRepository);
    itemRepository = app.get(ItemRepository);
  });

  it('should create an empty Order', async () => {
    jest.spyOn(orderRepository, 'create').mockResolvedValue();
    jest.spyOn(itemRepository, 'findById').mockResolvedValue(null);
    const command = new CreateOrderCommand({});
    await target.execute(command);
    expect(orderRepository.create).toHaveBeenCalled();
    expect(itemRepository.findById).not.toHaveBeenCalled();
  });

  it('should create an Order with Requester', async () => {
    let order: Order;
    jest.spyOn(orderRepository, 'create').mockImplementation(async (x) => {
      order = x;
    });
    jest.spyOn(itemRepository, 'findById').mockResolvedValue(null);
    const requester = {
      name: 'John Doe',
      cpf: '01234567890',
      email: 'john@doe.com',
    };
    const command = new CreateOrderCommand({ requester });
    await target.execute(command);
    expect(orderRepository.create).toHaveBeenCalled();
    expect(order.requester).toEqual(expect.objectContaining(requester));
  });

  it('should create an Order with email only Requester', async () => {
    let order: Order;
    jest.spyOn(orderRepository, 'create').mockImplementation(async (x) => {
      order = x;
    });
    jest.spyOn(itemRepository, 'findById').mockResolvedValue(null);
    const requester = {
      name: 'John Doe',
      email: 'john@doe.com',
    };
    const command = new CreateOrderCommand({ requester });
    await target.execute(command);
    expect(orderRepository.create).toHaveBeenCalled();
    expect(order.requester).toEqual(expect.objectContaining(requester));
  });

  it('should create an Order with Items', async () => {
    let order: Order;
    jest.spyOn(orderRepository, 'create').mockImplementation(async (x) => {
      order = x;
    });

    jest.spyOn(itemRepository, 'findById').mockImplementation(fakeFindItemById);
    const items = Array(3)
      .fill(null)
      .map((_, i) => ({ id: `item:${i}` }));
    const command = new CreateOrderCommand({ items });
    await target.execute(command);
    expect(orderRepository.create).toHaveBeenCalled();
    expect(itemRepository.findById).toHaveBeenCalledTimes(items.length);
    const expectedPrice = Number((itemPrice * items.length).toFixed(2));
    expect(order.total).toEqual(expectedPrice);
  });
});
