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
import { ReadyOrderOnPreparationCompletedCommand } from './ready-order-on-preparation-completed.command';
import { ReadyOrderOnPreparationCompletedHandler } from './ready-order-on-preparation-completed.handler';

describe('ReadyOrderOnPreparationCompletedHandler', () => {
  let app: INestApplication;
  let target: ReadyOrderOnPreparationCompletedHandler;
  let orderRepository: OrderRepository;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        ReadyOrderOnPreparationCompletedHandler,
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
    target = app.get(ReadyOrderOnPreparationCompletedHandler);
    orderRepository = app.get(OrderRepository);

    orderRepository.findByPreparationId = jest.fn();
  });

  it('should throw NotFoundException when Order does not exist', async () => {
    jest.spyOn(orderRepository, 'findByPreparationId').mockResolvedValue(null);
    jest.spyOn(orderRepository, 'update');
    const command = new ReadyOrderOnPreparationCompletedCommand('123');
    await expect(() => target.execute(command)).rejects.toThrow(
      NotFoundException,
    );
    expect(orderRepository.update).not.toHaveBeenCalled();
  });

  it('should complete order preparation', async () => {
    const order = new Order(
      randomUUID(),
      null,
      OrderStatus.create(EOrderStatus.PreparationStarted),
    );
    jest.spyOn(order, 'completePreparation');
    jest.spyOn(orderRepository, 'findByPreparationId').mockResolvedValue(order);
    jest.spyOn(orderRepository, 'update').mockResolvedValue();
    const command = new ReadyOrderOnPreparationCompletedCommand(
      order.paymentId,
    );
    await target.execute(command);
    expect(orderRepository.update).toHaveBeenCalled();
    expect(order.completePreparation).toHaveBeenCalled();
  });
});
