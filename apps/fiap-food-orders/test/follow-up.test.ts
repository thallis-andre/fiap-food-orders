import { destroyTestApp } from '@fiap-food/test-factory/utils';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model, Types } from 'mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import {
    EOrderStatus,
    OrderStatusValues,
} from '../src/order/domain/values/order-status.value';
import { MongooseOrderSchema } from '../src/order/infra/persistance/mongoose/order/order.schema';
import { createTestApp } from './create-app';
import { populateItems } from './create-items';

const basePath = '/v1/orders-follow-up';

describe('FollowUp', () => {
  let app: INestApplication;
  let server: App;

  let orders: { _id: Types.ObjectId; status: OrderStatusValues }[];

  const populateOrders = async () => {
    const mongooseSchema = app.get<Model<MongooseOrderSchema>>(
      getModelToken(MongooseOrderSchema.name),
    );
    const createOrder = (status: OrderStatusValues) => ({
      _id: new Types.ObjectId(),
      status,
      items: [{ key: randomUUID(), name: 'X-Food', price: 19.9 }],
      paymentId: randomUUID(),
      total: 19.9,
    });

    orders = [
      createOrder('PreparationRequested'),
      createOrder('PreparationStarted'),
      createOrder('PreparationCompleted'),
    ];

    await mongooseSchema.create(...orders);
  };

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
    await populateItems(server);
    await populateOrders();
  });

  afterAll(async () => {
    await destroyTestApp(app);
  });

  describe('GET /v1/orders-follow-up', () => {
    it('should return create a orders grouped by their statuses', async () => {
      const followUpResponse = await request(server).get(basePath);
      const { statusCode, body } = followUpResponse;
      const received = orders.filter(
        (x) => x.status === EOrderStatus.PreparationRequested,
      );
      const started = orders.filter(
        (x) => x.status === EOrderStatus.PreparationStarted,
      );
      const ready = orders.filter(
        (x) => x.status === EOrderStatus.PreparationCompleted,
      );
      expect(statusCode).toBe(200);
      expect(body.ready).toHaveLength(ready.length);
      expect(body.started).toHaveLength(started.length);
      expect(body.received).toHaveLength(received.length);
    });
  });
});
