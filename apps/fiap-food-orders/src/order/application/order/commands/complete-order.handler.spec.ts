import { TransactionManager } from '@fiap-food/tactical-design/core';
import {
  FakeRepository,
  FakeTransactionManager,
} from '@fiap-food/test-factory/utils';
import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { Order } from '../../../domain/order.aggregate';
import {
  EOrderStatus,
  OrderStatus,
} from '../../../domain/values/order-status.value';
import { OrderRepository } from '../abstractions/order.repository';
import { CompleteOrderCommand } from './complete-order.command';
import { CompleteOrderHandler } from './complete-order.handler';

describe('CompleteOrderHandler', () => {
  let app: INestApplication;
  let target: CompleteOrderHandler;
  let orderRepository: OrderRepository;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        CompleteOrderHandler,
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
    target = app.get(CompleteOrderHandler);
    orderRepository = app.get(OrderRepository);
  });

  it('should throw NotFoundException when Order does not exist', async () => {
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(null);
    jest.spyOn(orderRepository, 'update');
    const command = new CompleteOrderCommand('123');
    await expect(() => target.execute(command)).rejects.toThrow(
      NotFoundException,
    );
    expect(orderRepository.update).not.toHaveBeenCalled();
  });

  it('should complete order workflow', async () => {
    const order = new Order(
      randomUUID(),
      null,
      OrderStatus.create(EOrderStatus.PreparationCompleted),
    );
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(order);
    jest.spyOn(orderRepository, 'update').mockResolvedValue();
    const command = new CompleteOrderCommand('123');
    await target.execute(command);
    expect(orderRepository.update).toHaveBeenCalled();
    expect(order.status).toBe(EOrderStatus.Completed);
  });
});
