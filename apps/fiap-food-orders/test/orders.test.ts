import { AmqpService } from '@fiap-food/amqp';
import { toDottedNotation } from '@fiap-foodactical-design/amqp';
import { AggregateEvent } from '@fiap-foodactical-design/core';
import { destroyTestApp } from '@fiap-foodest-factory/utils';
import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { SetupServerApi } from 'msw/node';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { setTimeout } from 'timers/promises';
import { Order } from '../src/order/application/order/dtos/order.dto';
import { PaymentApproved } from '../src/order/application/order/dtos/payment-approved.integration-event';
import { PaymentRejected } from '../src/order/application/order/dtos/payment-rejected.integration-event';
import { PreparationCompleted } from '../src/order/application/order/dtos/preparation-completed.integration-event';
import { PreparationStarted } from '../src/order/application/order/dtos/preparation-started.integration-event';
import { EOrderStatus } from '../src/order/domain/values/order-status.value';
import {
  createMockService,
  createTestApp,
  destroyMockService,
} from './create-app';
import { populateItems } from './create-items';
import { fakeToken } from './mocks/mock.token';

const basePath = '/v1/orders';
const exchanges = {
  payments: 'fiap.foodayments.events',
  preparation: 'fiap.foodreparation.events',
};

describe('Orders', () => {
  let app: INestApplication;
  let server: App;

  let items: { id: string }[];

  const getOrder = async (id: string): Promise<Order> => {
    const response = await request(server)
      .get(`${basePath}/${id}`)
      .set('Authorization', fakeToken.admin);
    return response.body;
  };

  const createOrder = async (): Promise<string> => {
    const response = await request(server)
      .post(basePath)
      .set('Authorization', fakeToken.admin)
      .send({ items });
    return response.body.id;
  };

  const checkoutOrder = async (id: string) => {
    await request(server)
      .post(`${basePath}/${id}/checkout`)
      .set('Authorization', fakeToken.admin);
  };

  const publishAggregateEvent = async (
    aggregateId: string,
    eventName: string,
    exchange: string,
  ) => {
    const aggregateEvent = new AggregateEvent(
      randomUUID(),
      aggregateId,
      eventName,
      new Date(),
      1,
      {},
    );

    const amqp = app.get(AmqpService);
    await amqp.publish(exchange, toDottedNotation(eventName), aggregateEvent);
    await setTimeout(100);
  };

  const publishPaymentApproved = async (aggregateId: string) => {
    await publishAggregateEvent(
      aggregateId,
      PaymentApproved.name,
      exchanges.payments,
    );
  };

  const publishPaymentRejected = async (aggregateId: string) => {
    await publishAggregateEvent(
      aggregateId,
      PaymentRejected.name,
      exchanges.payments,
    );
  };

  const publishPreparationStarted = async (aggregateId: string) => {
    await publishAggregateEvent(
      aggregateId,
      PreparationStarted.name,
      exchanges.preparation,
    );
  };

  const publishPreparationCompleted = async (aggregateId: string) => {
    await publishAggregateEvent(
      aggregateId,
      PreparationCompleted.name,
      exchanges.preparation,
    );
  };

  let mockService: SetupServerApi;
  beforeAll(async () => {
    mockService = createMockService();
    app = await createTestApp();
    server = app.getHttpServer();
    await populateItems(server);
    const getItemsResponse = await request(server).get(`/v1/items`);
    items = getItemsResponse.body.data
      .slice(0, 3)
      .map((x: any) => ({ id: x.id }));
  });

  afterAll(async () => {
    await destroyTestApp(app);
    destroyMockService(mockService);
  });

  describe('HTTP Drivers', () => {
    describe('POST /v1/orders', () => {
      it('should return create a new empty order and return its id', async () => {
        const postResponse = await request(server).post(basePath);
        const { statusCode, body } = postResponse;
        expect(statusCode).toBe(201);
        expect(body.id).toEqual(expect.any(String));
      });

      it('should return create an order with items', async () => {
        const postResponse = await request(server)
          .post(basePath)
          .send({ items });
        const { statusCode, body } = postResponse;
        expect(statusCode).toBe(201);
        expect(body.id).toEqual(expect.any(String));
      });
    });

    describe('POST /v1/orders/:id/checkout', () => {
      it('should checkout order and return payment information', async () => {
        const createOrderResponse = await request(server)
          .post(basePath)
          .send({ items });
        const { id: orderId } = createOrderResponse.body;
        const targetResponse = await request(server).post(
          `${basePath}/${orderId}/checkout`,
        );
        const { statusCode, body } = targetResponse;
        expect(statusCode).toBe(200);
        expect(body.qrCode).toEqual(expect.any(String));
      });

      it('should return not found when order does not exist', async () => {
        const orderId = new Types.ObjectId().toHexString();
        const targetResponse = await request(server).post(
          `${basePath}/${orderId}/checkout`,
        );
        const { statusCode } = targetResponse;
        expect(statusCode).toBe(404);
      });

      it('should return an error when order is empty', async () => {
        const createOrderResponse = await request(server).post(basePath);
        const { id: orderId } = createOrderResponse.body;
        const targetResponse = await request(server).post(
          `${basePath}/${orderId}/checkout`,
        );
        const { statusCode } = targetResponse;
        expect(statusCode).toBe(422);
      });

      it('should return an error when order is not initiated', async () => {
        const createOrderResponse = await request(server)
          .post(basePath)
          .send({ items });
        const { id: orderId } = createOrderResponse.body;
        await request(server).post(`${basePath}/${orderId}/checkout`);
        const targetResponse = await request(server).post(
          `${basePath}/${orderId}/checkout`,
        );
        const { statusCode } = targetResponse;
        expect(statusCode).toBe(422);
      });
    });

    describe('GET /v1/orders', () => {
      it('should return all orders without any filters', async () => {
        const orderId = await createOrder();
        await checkoutOrder(orderId);
        const targetResponse = await request(server)
          .get(basePath)
          .set('Authorization', fakeToken.admin);
        expect(targetResponse.statusCode).toBe(200);
      });
      it('should return orders in given date range filters', async () => {
        const from = new Date();
        const to = new Date();
        to.setDate(to.getDate() + 1);
        const orderId = await createOrder();
        const targetResponse = await request(server)
          .get(basePath)
          .set('Authorization', fakeToken.admin)
          .query({
            from: from.toISOString().slice(0, 10),
            to: to.toISOString().slice(0, 10),
          });
        const data = targetResponse.body.data;
        expect(data).toEqual(
          expect.arrayContaining([expect.objectContaining({ id: orderId })]),
        );
      });

      it('should return all orders up to provided date', async () => {
        const to = new Date();
        const targetResponse = await request(server)
          .get(basePath)
          .set('Authorization', fakeToken.admin)
          .query({
            to: to.toISOString().slice(0, 10),
          });
        const data = targetResponse.body.data;
        expect(data).toEqual([]);
      });

      it('should return all orders begining at provided date', async () => {
        const from = new Date();
        from.setDate(from.getDate() + 1);
        const targetResponse = await request(server)
          .get(basePath)
          .set('Authorization', fakeToken.admin)
          .query({
            from: from.toISOString().slice(0, 10),
          });
        const data = targetResponse.body.data;
        expect(data).toEqual([]);
      });

      it('should return with the given criterea', async () => {
        const email = 'john@doe.com';
        const cpf = '01234567890';
        const status = 'Created';
        const targetResponse = await request(server)
          .get(basePath)
          .set('Authorization', fakeToken.admin)
          .query({ email, cpf, status });
        const data = targetResponse.body.data;
        expect(data).toEqual([]);
      });
    });

    describe('POST /v1/orders/:id/complete', () => {
      it('should complete order', async () => {
        const orderId = await createOrder();
        await checkoutOrder(orderId);
        const { paymentId } = await getOrder(orderId);
        await publishPaymentApproved(paymentId);
        const { preparationId } = await getOrder(orderId);
        await publishPreparationStarted(preparationId);
        await publishPreparationCompleted(preparationId);
        const targetResponse = await request(server)
          .post(`${basePath}/${orderId}/complete`)
          .set('Authorization', fakeToken.admin);
        const target = await getOrder(orderId);
        expect(targetResponse.statusCode).toBe(200);
        expect(target.status).toBe(EOrderStatus.Completed);
      });

      it('should return error when order is in an invalid status', async () => {
        const orderId = await createOrder();
        const targetResponse = await request(server)
          .post(`${basePath}/${orderId}/complete`)
          .set('Authorization', fakeToken.admin);
        const target = await getOrder(orderId);
        expect(targetResponse.statusCode).toBe(422);
        expect(target.status).toBe(EOrderStatus.Initiated);
      });

      it('should return not found when order does not exist', async () => {
        const orderId = new Types.ObjectId().toHexString();
        const targetResponse = await request(server)
          .post(`${basePath}/${orderId}/complete`)
          .set('Authorization', fakeToken.admin);
        const { statusCode } = targetResponse;
        expect(statusCode).toBe(404);
      });
    });

    describe('PUT /v1/orders/:id', () => {
      it('should add items to order', async () => {
        const postResponse = await request(server).post(basePath).send({});
        const orderId = postResponse.body.id;
        const putResponse = await request(server)
          .put(`${basePath}/${orderId}`)
          .send({ items });
        const { statusCode } = putResponse;
        const orderResponse = await getOrder(orderId);
        expect(statusCode).toBe(204);
        expect(orderResponse.items.length).toBe(items.length);
      });

      it('should return an error when trying to add items to checked out order', async () => {
        const orderId = await createOrder();
        await checkoutOrder(orderId);
        const putResponse = await request(server)
          .put(`${basePath}/${orderId}`)
          .send({ items });
        const { statusCode } = putResponse;
        const orderResponse = await getOrder(orderId);
        expect(statusCode).toBe(422);
        expect(orderResponse.items.length).toBe(items.length);
      });

      it('should only add existing items to order', async () => {
        const postResponse = await request(server).post(basePath).send({});
        const orderId = postResponse.body.id;
        const putResponse = await request(server)
          .put(`${basePath}/${orderId}`)
          .send({
            items: [...items, { id: new Types.ObjectId().toHexString() }],
          });
        const { statusCode } = putResponse;
        const getOrderResponse = await getOrder(orderId);
        expect(statusCode).toBe(204);
        expect(getOrderResponse.items.length).toBe(items.length);
      });

      it('should not add anything if no existing items were provided', async () => {
        const postResponse = await request(server).post(basePath).send({});
        const orderId = postResponse.body.id;
        const putResponse = await request(server)
          .put(`${basePath}/${orderId}`)
          .send({
            items: [{ id: new Types.ObjectId().toHexString() }],
          });
        const { statusCode } = putResponse;
        const getOrderResponse = await getOrder(orderId);
        expect(statusCode).toBe(204);
        expect(getOrderResponse.items.length).toBe(0);
      });

      it('should not found when order does not exist', async () => {
        const id = new Types.ObjectId().toHexString();
        const putResponse = await request(server)
          .put(`${basePath}/${id}`)
          .send({ items });
        const { statusCode } = putResponse;
        expect(statusCode).toBe(404);
      });
    });

    describe('PATCH /v1/orders/:id', () => {
      it('should remove an item from order', async () => {
        const postResponse = await request(server)
          .post(basePath)
          .send({ items });
        const orderId = postResponse.body.id;
        const orderResponse = await getOrder(orderId);
        const patchResponse = await request(server)
          .patch(`${basePath}/${orderId}`)
          .send({
            items: [{ key: orderResponse.items[0].key }],
          });
        const { statusCode } = patchResponse;
        const targetOrder = await getOrder(orderId);
        expect(statusCode).toBe(204);
        expect(targetOrder.items.length).toBe(items.length - 1);
      });

      it('should return an error when order is already closed', async () => {
        const orderId = await createOrder();
        await checkoutOrder(orderId);
        const orderResponse = await getOrder(orderId);
        const patchResponse = await request(server)
          .patch(`${basePath}/${orderId}`)
          .send({
            items: [{ key: orderResponse.items[0].key }],
          });
        const { statusCode } = patchResponse;
        const targetOrder = await getOrder(orderId);
        expect(statusCode).toBe(422);
        expect(targetOrder.items.length).toBe(items.length);
      });

      it('should not return an error when item was already removed', async () => {
        const orderId = await createOrder();
        await checkoutOrder(orderId);
        const patchResponse = await request(server)
          .patch(`${basePath}/${orderId}`)
          .send({
            items: [{ key: randomUUID() }],
          });
        const { statusCode } = patchResponse;
        const targetOrder = await getOrder(orderId);
        expect(statusCode).toBe(204);
        expect(targetOrder.items.length).toBe(items.length);
      });

      it('should not return error when order has no items', async () => {
        const postResponse = await request(server).post(basePath).send({});
        const orderId = postResponse.body.id;
        const patchResponse = await request(server)
          .patch(`${basePath}/${orderId}`)
          .send({ items: [{ key: randomUUID() }] });
        const { statusCode } = patchResponse;
        const getOrderResponse = await getOrder(orderId);
        expect(statusCode).toBe(204);
        expect(getOrderResponse.items.length).toBe(0);
      });

      it('should not found when order does not exist', async () => {
        const id = new Types.ObjectId().toHexString();
        const patchResponse = await request(server)
          .patch(`${basePath}/${id}`)
          .send({ items: [{ key: randomUUID() }] });
        const { statusCode } = patchResponse;
        expect(statusCode).toBe(404);
      });
    });

    describe('GET /v1/orders/:id', () => {
      describe('Anonymous Order', () => {
        it('should return existing order', async () => {
          const postResponse = await request(server).post(basePath);
          const id = postResponse.body.id;
          const getResponse = await request(server).get(`${basePath}/${id}`);
          const { statusCode, body } = getResponse;
          expect(statusCode).toBe(200);
          expect(body.id).toBe(id);
        });
      });

      describe('Identified Order', () => {
        it('should return existing order when admin request', async () => {
          const postResponse = await request(server)
            .post(basePath)
            .set('Authorization', fakeToken.customer);
          const id = postResponse.body.id;
          const getResponse = await request(server)
            .get(`${basePath}/${id}`)
            .set('Authorization', fakeToken.admin);
          const { statusCode, body } = getResponse;
          expect(statusCode).toBe(200);
          expect(body.id).toBe(id);
        });

        it('should not return existing order when different user', async () => {
          const postResponse = await request(server)
            .post(basePath)
            .set('Authorization', fakeToken.admin);
          const id = postResponse.body.id;
          const getResponse = await request(server)
            .get(`${basePath}/${id}`)
            .set('Authorization', fakeToken.customer);
          const { statusCode } = getResponse;
          expect(statusCode).toBe(403);
        });

        it('should not return order when empty auth', async () => {
          const postResponse = await request(server)
            .post(basePath)
            .set('Authorization', fakeToken.customer);
          const id = postResponse.body.id;
          const getResponse = await request(server).get(`${basePath}/${id}`);
          const { statusCode } = getResponse;
          expect(statusCode).toBe(403);
        });
      });

      it('should not found when order does not exist', async () => {
        const id = new Types.ObjectId().toHexString();
        const getResponse = await request(server).get(`${basePath}/${id}`);
        const { statusCode } = getResponse;
        expect(statusCode).toBe(404);
      });
    });
  });

  describe('AMQP Drivers', () => {
    describe('OnPaymentApprovedRequestPreparation', () => {
      it('should change preparation status to PreparationRequested', async () => {
        const orderId = await createOrder();
        await checkoutOrder(orderId);
        const { paymentId } = await getOrder(orderId);
        await publishPaymentApproved(paymentId);
        const target = await getOrder(orderId);
        expect(target.status).toBe(EOrderStatus.PreparationRequested);
      });
    });

    describe('OnPaymentRejectedRejectOrder', () => {
      it('should change order status to PaymentRejected', async () => {
        const orderId = await createOrder();
        await checkoutOrder(orderId);
        const { paymentId } = await getOrder(orderId);
        await publishPaymentRejected(paymentId);
        const target = await getOrder(orderId);
        expect(target.status).toBe(EOrderStatus.PaymentRejected);
      });
    });

    describe('OnPreparationStartedStartOrderPreparation', () => {
      it('should change order status to PreparationStarted', async () => {
        const orderId = await createOrder();
        await checkoutOrder(orderId);
        const { paymentId } = await getOrder(orderId);
        await publishPaymentApproved(paymentId);
        const { preparationId } = await getOrder(orderId);
        await publishPreparationStarted(preparationId);
        const target = await getOrder(orderId);
        expect(target.status).toBe(EOrderStatus.PreparationStarted);
      });
    });

    describe('OnPreparationCompletedReadyOrder', () => {
      it('should change order status to PreparationCompleted', async () => {
        const orderId = await createOrder();
        await checkoutOrder(orderId);
        const { paymentId } = await getOrder(orderId);
        await publishPaymentApproved(paymentId);
        const { preparationId } = await getOrder(orderId);
        await publishPreparationStarted(preparationId);
        await publishPreparationCompleted(preparationId);
        const target = await getOrder(orderId);
        expect(target.status).toBe(EOrderStatus.PreparationCompleted);
      });
    });
  });
});
