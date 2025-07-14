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
import { EOrderRejectionReason } from '../../../domain/values/order-rejection-reason.value';
import { OrderStatus } from '../../../domain/values/order-status.value';
import { OrderRepository } from '../abstractions/order.repository';
import { RejectOrderOnPaymentRejectedCommand } from './reject-order-on-payment-rejected.command';
import { RejectOrderOnPaymentRejectedHandler } from './reject-order-on-payment-rejected.handler';

describe('RejectOrderOnPaymentRejectedHandler', () => {
  let app: INestApplication;
  let target: RejectOrderOnPaymentRejectedHandler;
  let orderRepository: OrderRepository;

  const itemPrice = 19.9;
  const createItem = (id: string = randomUUID()) =>
    new Item(id, 'X-Food', itemPrice, 'Snack', 'I would like to buy a hamfood');

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        RejectOrderOnPaymentRejectedHandler,
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
    target = app.get(RejectOrderOnPaymentRejectedHandler);
    orderRepository = app.get(OrderRepository);

    orderRepository.findByPaymentId = jest.fn();
  });

  it('should throw NotFoundException when Order does not exist', async () => {
    jest.spyOn(orderRepository, 'findByPaymentId').mockResolvedValue(null);
    jest.spyOn(orderRepository, 'update');
    const command = new RejectOrderOnPaymentRejectedCommand('123');
    await expect(() => target.execute(command)).rejects.toThrow(
      NotFoundException,
    );
    expect(orderRepository.update).not.toHaveBeenCalled();
  });

  it('should reject order when on payment rejected', async () => {
    const order = new Order(randomUUID(), null, OrderStatus.initiate());
    order.addItem(createItem());
    order.checkout(randomUUID(), randomUUID());
    jest.spyOn(orderRepository, 'findByPaymentId').mockResolvedValue(order);
    jest.spyOn(orderRepository, 'update').mockResolvedValue();
    const command = new RejectOrderOnPaymentRejectedCommand(order.paymentId);
    await target.execute(command);
    expect(orderRepository.update).toHaveBeenCalled();
    expect(order.rejectionReason).toBe(EOrderRejectionReason.PaymentRejected);
  });
});
