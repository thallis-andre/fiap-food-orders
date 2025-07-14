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
import { StartOrderPreparationOnPreparationStartedCommand } from './start-order-preparation-on-preparation-started.command';
import { StartOrderPreparationOnPreparationStartedHandler } from './start-order-preparation-on-preparation-started.handler';

describe('StartOrderPreparationOnPreparationStartedHandler', () => {
  let app: INestApplication;
  let target: StartOrderPreparationOnPreparationStartedHandler;
  let orderRepository: OrderRepository;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        StartOrderPreparationOnPreparationStartedHandler,
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
    target = app.get(StartOrderPreparationOnPreparationStartedHandler);
    orderRepository = app.get(OrderRepository);

    orderRepository.findByPreparationId = jest.fn();
  });

  it('should throw NotFoundException when Order does not exist', async () => {
    jest.spyOn(orderRepository, 'findByPreparationId').mockResolvedValue(null);
    jest.spyOn(orderRepository, 'update');
    const command = new StartOrderPreparationOnPreparationStartedCommand('123');
    await expect(() => target.execute(command)).rejects.toThrow(
      NotFoundException,
    );
    expect(orderRepository.update).not.toHaveBeenCalled();
  });

  it('should start order preparation', async () => {
    const order = new Order(
      randomUUID(),
      null,
      OrderStatus.create(EOrderStatus.PreparationRequested),
    );
    jest.spyOn(order, 'startPreparation');
    jest.spyOn(orderRepository, 'findByPreparationId').mockResolvedValue(order);
    jest.spyOn(orderRepository, 'update').mockResolvedValue();
    const command = new StartOrderPreparationOnPreparationStartedCommand(
      order.paymentId,
    );
    await target.execute(command);
    expect(orderRepository.update).toHaveBeenCalled();
    expect(order.startPreparation).toHaveBeenCalled();
  });
});
