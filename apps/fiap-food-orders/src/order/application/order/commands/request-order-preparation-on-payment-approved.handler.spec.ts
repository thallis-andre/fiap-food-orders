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
import { FiapFoodPreparationService } from '../../../infra/external-services/fiap-food-preparation.service';
import { OrderRepository } from '../abstractions/order.repository';
import { PreparationService } from '../abstractions/preparation.service';
import { RequestOrderPreparationOnPaymentApprovedCommand } from './request-order-preparation-on-payment-approved.command';
import { RequestOrderPreparationOnPaymentApprovedHandler } from './request-order-preparation-on-payment-approved.handler';

describe('RequestOrderPreparationOnPaymentApprovedHandler', () => {
  let app: INestApplication;
  let target: RequestOrderPreparationOnPaymentApprovedHandler;
  let orderRepository: OrderRepository;
  let preparationService: PreparationService;

  const itemPrice = 19.9;
  const createItem = (id: string = randomUUID()) =>
    new Item(id, 'X-Food', itemPrice, 'Snack', 'I would like to buy a hamfood');

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        RequestOrderPreparationOnPaymentApprovedHandler,
        {
          provide: TransactionManager,
          useClass: FakeTransactionManager,
        },
        {
          provide: OrderRepository,
          useClass: FakeRepository,
        },
        {
          provide: PreparationService,
          useValue: Object.create(FiapFoodPreparationService.prototype),
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(RequestOrderPreparationOnPaymentApprovedHandler);
    orderRepository = app.get(OrderRepository);
    preparationService = app.get(PreparationService);

    orderRepository.findByPaymentId = jest.fn();
  });

  it('should throw NotFoundException when Order does not exist', async () => {
    jest.spyOn(orderRepository, 'findByPaymentId').mockResolvedValue(null);
    jest.spyOn(orderRepository, 'update');
    const command = new RequestOrderPreparationOnPaymentApprovedCommand('123');
    await expect(() => target.execute(command)).rejects.toThrow(
      NotFoundException,
    );
    expect(orderRepository.update).not.toHaveBeenCalled();
  });

  it('should request order preparation on external service', async () => {
    const conciliationId = '123';
    const order = new Order(randomUUID(), null, OrderStatus.initiate());
    order.addItem(createItem());
    order.checkout(randomUUID(), randomUUID());
    jest.spyOn(orderRepository, 'findByPaymentId').mockResolvedValue(order);
    jest.spyOn(orderRepository, 'update').mockResolvedValue();
    jest
      .spyOn(preparationService, 'requestPreparation')
      .mockResolvedValue({ conciliationId });
    const command = new RequestOrderPreparationOnPaymentApprovedCommand(
      order.paymentId,
    );
    await target.execute(command);
    expect(orderRepository.update).toHaveBeenCalled();
    expect(order.preparationId).toBe(conciliationId);
  });
});
