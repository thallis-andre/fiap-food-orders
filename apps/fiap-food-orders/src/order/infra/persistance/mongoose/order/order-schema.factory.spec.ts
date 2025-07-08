import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { Order } from '../../../../domain/order.aggregate';
import { OrderItem } from '../../../../domain/values/order-item.value';
import { OrderStatus } from '../../../../domain/values/order-status.value';
import { Requester } from '../../../../domain/values/requester.value';
import { MongooseOrderSchemaFactory } from './order-schema.factory';
import { MongooseOrderSchema } from './order.schema';

describe('MongooseOrderSchemaFactory', () => {
  let app: INestApplication;
  let target: MongooseOrderSchemaFactory;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [MongooseOrderSchemaFactory],
    }).compile();

    app = moduleFixture.createNestApplication();
    target = app.get(MongooseOrderSchemaFactory);
  });

  it('should transform a Order Aggregate into a MongooseSchema', async () => {
    const actual = new Order(new Types.ObjectId().toHexString());

    const result = target.entityToSchema(actual);
    expect(result._id).toBeInstanceOf(Types.ObjectId);
    expect(result).not.toBeInstanceOf(Order);
  });

  it('should transform a MongooseSchema into a PreparationEntity', async () => {
    const actual: MongooseOrderSchema = {
      _id: new Types.ObjectId(),
      items: [],
      status: 'Initiated',
      total: 0,
    };
    const result = target.schemaToEntity(actual);
    expect(result.id).not.toBeInstanceOf(Types.ObjectId);
    expect(result.id).toBe(actual._id.toHexString());
    expect(result).toBeInstanceOf(Order);
  });

  it('should transform a full Order Aggregate into a MongooseSchema', async () => {
    const requester = {
      name: 'John Doe',
      cpf: '01234567890',
      email: 'john@doe.com',
    };
    const orderItem = { key: randomUUID(), name: 'X-Food', price: 12.99 };
    const actual = new Order(
      new Types.ObjectId().toHexString(),
      new Requester(requester.name, requester.cpf, requester.email),
      OrderStatus.initiate(),
      0,
      [new OrderItem(orderItem.key, orderItem.name, orderItem.price)],
    );

    const result = target.entityToSchema(actual);
    expect(result._id).toBeInstanceOf(Types.ObjectId);
    expect(result).not.toBeInstanceOf(Order);
    expect(result.items).toEqual([orderItem]);
    expect(result.requester).toEqual(requester);
  });

  it('should transform a MongooseSchema into a PreparationEntity', async () => {
    const actual: MongooseOrderSchema = {
      _id: new Types.ObjectId(),
      items: [{ key: randomUUID(), name: 'X-Food', price: 12.99 }],
      status: 'Initiated',
      total: 0,
      requester: {
        name: 'John Doe',
        cpf: '01234567890',
        email: 'john@doe.com',
      },
    };
    const [itemBefore] = actual.items;
    const result = target.schemaToEntity(actual);
    const [itemAfter] = result.items;
    expect(result.id).not.toBeInstanceOf(Types.ObjectId);
    expect(result.id).toBe(actual._id.toHexString());
    expect(result).toBeInstanceOf(Order);
    expect(result.requester.name).toBe(actual.requester.name);
    expect(result.requester.cpf).toBe(actual.requester.cpf);
    expect(result.requester.email).toBe(actual.requester.email);
    expect(result.requester.name).toBe(actual.requester.name);
    expect(result.requester.cpf).toBe(actual.requester.cpf);
    expect(result.requester.email).toBe(actual.requester.email);
    expect(itemAfter.key).toBe(itemBefore.key);
    expect(itemAfter.name).toBe(itemBefore.name);
    expect(itemAfter.price).toBe(itemBefore.price);
  });
});
