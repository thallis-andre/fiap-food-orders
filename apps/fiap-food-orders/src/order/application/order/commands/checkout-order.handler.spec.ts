import {
  DomainException,
  TransactionManager,
} from '@fiap-food/tactical-design/core';
import {
  FakeRepository,
  FakeTransactionManager,
} from '@fiap-food/test-factory/utils';
import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { Item } from '../../../domain/item.entity';
import { Order } from '../../../domain/order.aggregate';
import {
  EOrderStatus,
  OrderStatus,
} from '../../../domain/values/order-status.value';
import { FiapFoodPaymentService } from '../../../infra/external-services/fiap-food-payments.service';
import { OrderRepository } from '../abstractions/order.repository';
import { PaymentService } from '../abstractions/payments.service';
import { CheckoutOrderCommand } from './checkout-order.command';
import { CheckoutOrderHandler } from './checkout-order.handler';

describe('CheckoutOrderHandler', () => {
  let app: INestApplication;
  let target: CheckoutOrderHandler;
  let orderRepository: OrderRepository;
  let paymentService: PaymentService;

  const itemPrice = 19.9;
  const createItem = (id: string = randomUUID()) =>
    new Item(id, 'X-Food', itemPrice, 'Snack', 'I would like to buy a hamfood');

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutOrderHandler,
        {
          provide: TransactionManager,
          useClass: FakeTransactionManager,
        },
        {
          provide: OrderRepository,
          useClass: FakeRepository,
        },
        {
          provide: PaymentService,
          useValue: Object.create(FiapFoodPaymentService.prototype),
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(CheckoutOrderHandler);
    orderRepository = app.get(OrderRepository);
    paymentService = app.get(PaymentService);
  });

  it('should throw NotFoundException when Order does not exist', async () => {
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(null);
    jest.spyOn(orderRepository, 'update');
    jest.spyOn(paymentService, 'createPixPayment');
    const command = new CheckoutOrderCommand('123');
    await expect(() => target.execute(command)).rejects.toThrow(
      NotFoundException,
    );
    expect(orderRepository.update).not.toHaveBeenCalled();
    expect(paymentService.createPixPayment).not.toHaveBeenCalled();
  });

  it('should throw DomainException when Order has no items', async () => {
    const order = new Order(randomUUID(), null, OrderStatus.initiate());
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(order);
    jest.spyOn(orderRepository, 'update');
    jest.spyOn(paymentService, 'createPixPayment');
    const command = new CheckoutOrderCommand('123');
    await expect(() => target.execute(command)).rejects.toThrow(
      DomainException,
    );
    expect(orderRepository.update).not.toHaveBeenCalled();
    expect(paymentService.createPixPayment).not.toHaveBeenCalled();
  });

  it('should throw DomainException when Order is already advanced', async () => {
    const order = new Order(randomUUID(), null, OrderStatus.initiate());
    order.addItem(createItem());
    order.checkout('paymetnId', 'qrCode');
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(order);
    jest.spyOn(orderRepository, 'update');
    jest.spyOn(paymentService, 'createPixPayment');
    const command = new CheckoutOrderCommand('123');
    await expect(() => target.execute(command)).rejects.toThrow(
      DomainException,
    );
    expect(orderRepository.update).not.toHaveBeenCalled();
    expect(paymentService.createPixPayment).not.toHaveBeenCalled();
  });

  it('should throw if PaymentSerivce throws', async () => {
    const order = new Order(randomUUID(), null, OrderStatus.initiate());
    order.addItem(createItem());
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(order);
    jest.spyOn(orderRepository, 'update').mockResolvedValue();
    jest
      .spyOn(paymentService, 'createPixPayment')
      .mockRejectedValue(new Error());
    const command = new CheckoutOrderCommand('123');
    await expect(() => target.execute(command)).rejects.toThrow();
    expect(paymentService.createPixPayment).toHaveBeenCalled();
    expect(orderRepository.update).not.toHaveBeenCalled();
  });

  it('should checkout order appending paymentId', async () => {
    const order = new Order(randomUUID(), null, OrderStatus.initiate());
    order.addItem(createItem());
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(order);
    jest.spyOn(orderRepository, 'update').mockResolvedValue();
    const payment = { id: randomUUID(), qrCode: randomUUID() };
    jest.spyOn(paymentService, 'createPixPayment').mockResolvedValue(payment);
    const command = new CheckoutOrderCommand('123');
    const result = await target.execute(command);
    expect(orderRepository.update).toHaveBeenCalled();
    expect(order.status).toBe(EOrderStatus.PaymentRequested);
    expect(order.paymentId).toBe(payment.id);
    expect(order.qrCode).toBe(payment.qrCode);
    expect(result.data.qrCode).toBe(payment.qrCode);
  });
});
