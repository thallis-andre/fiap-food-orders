import { faker } from '@faker-js/faker/.';
import { destroyTestApp } from '@fiap-food/test-factory/utils';
import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './create-app';
import { fakeToken } from './mocks/mock.token';

const basePath = '/v1/items';

const randomCategory = () => {
  const categories = ['Snack', 'Dessert', 'Accompaniment', 'Beverage'];
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
};

const randomItem = () => {
  const dish = faker.food.dish();
  const [randomPrefix] = randomUUID().split('-');
  return {
    name: `${randomPrefix} ${dish}`,
    price: Number(faker.finance.amount({ min: 1, max: 10 })),
    description: `${faker.food.adjective()} ${dish}`,
    type: randomCategory(),
    images: [faker.internet.url()],
  };
};

describe('Items', () => {
  let app: INestApplication;
  let server: App;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
  }, 30000);

  afterAll(async () => {
    await destroyTestApp(app);
  }, 30000);

  describe('POST /v1/items', () => {
    it('should create a new item', async () => {
      const postResponse = await request(server)
        .post(basePath)
        .set('Authorization', fakeToken.admin)
        .send(randomItem());
      const { statusCode, body } = postResponse;
      expect(statusCode).toBe(201);
      expect(body).toEqual({ id: expect.any(String) });
    });

    it('should reject request when unauthorized', async () => {
      const postResponse = await request(server)
        .post(basePath)
        .send(randomItem());
      const { statusCode } = postResponse;
      expect(statusCode).toBe(401);
    });

    it('should reject request when authorized with customer role', async () => {
      const postResponse = await request(server)
        .post(basePath)
        .set('Authorization', fakeToken.customer)
        .send(randomItem());
      const { statusCode } = postResponse;
      expect(statusCode).toBe(403);
    });

    it('should not allow creating the same item', async () => {
      const item = randomItem();
      await request(server)
        .post(basePath)
        .set('Authorization', fakeToken.admin)
        .send(item);
      const postResponse = await request(server)
        .post(basePath)
        .set('Authorization', fakeToken.admin)
        .send(item);
      const { statusCode } = postResponse;
      expect(statusCode).toBe(422);
    });
  });

  describe('GET /v1/items/:id', () => {
    it('should return existing items', async () => {
      const item = randomItem();
      const postResponse = await request(server)
        .post(basePath)
        .set('Authorization', fakeToken.admin)
        .send(item);
      const { id } = postResponse.body;

      const getResponse = await request(server).get(`${basePath}/${id}`);
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body).toEqual(expect.objectContaining({ id }));
      expect(getResponse.body.id).toBe(id);
      expect(getResponse.body.name).toBe(item.name);
      expect(getResponse.body.description).toBe(item.description);
      expect(getResponse.body.price).toBe(item.price);
      expect(getResponse.body.type).toBe(item.type);
      expect(getResponse.body.images).toEqual(item.images);
    });

    it('should return not found for non existing preparation', async () => {
      const id = new Types.ObjectId().toHexString();
      const getResponse = await request(server).get(`${basePath}/${id}`);
      expect(getResponse.statusCode).toBe(404);
    });

    it('should return bad request if an invalid id is provided', async () => {
      const id = randomUUID();
      const getResponse = await request(server).get(`${basePath}/${id}`);
      expect(getResponse.statusCode).toBe(400);
    });
  });

  describe('PUT /v1/items/:id', () => {
    it('should update an existing item', async () => {
      const item = randomItem();
      const otherItem = randomItem();
      const postResponse = await request(server)
        .post(basePath)
        .set('Authorization', fakeToken.admin)
        .send(item);
      const { id } = postResponse.body;

      const putResponse = await request(server)
        .put(`${basePath}/${id}`)
        .set('Authorization', fakeToken.admin)
        .send(otherItem);
      expect(putResponse.status).toBe(204);

      const getResponse = await request(server).get(`${basePath}/${id}`);
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body).toEqual(expect.objectContaining({ id }));
      expect(getResponse.body.id).toBe(id);
      expect(getResponse.body.name).toBe(otherItem.name);
      expect(getResponse.body.price).toBe(otherItem.price);
      expect(getResponse.body.description).toBe(otherItem.description);
      expect(getResponse.body.type).toBe(otherItem.type);
      expect(getResponse.body.images).toEqual(otherItem.images);
    });

    it('should reject when unauthorized', async () => {
      const item = randomItem();
      const otherItem = randomItem();
      const postResponse = await request(server)
        .post(basePath)
        .set('Authorization', fakeToken.admin)
        .send(item);
      const { id } = postResponse.body;

      const putResponse = await request(server)
        .put(`${basePath}/${id}`)
        .send(otherItem);
      expect(putResponse.status).toBe(401);
    });

    it('should reject when unauthorized', async () => {
      const item = randomItem();
      const otherItem = randomItem();
      const postResponse = await request(server)
        .post(basePath)
        .set('Authorization', fakeToken.admin)
        .send(item);
      const { id } = postResponse.body;

      const putResponse = await request(server)
        .put(`${basePath}/${id}`)
        .set('Authorization', fakeToken.customer)
        .send(otherItem);
      expect(putResponse.status).toBe(403);
    });

    it('should return bad request if no values are provided for update', async () => {
      const item = randomItem();
      const postResponse = await request(server)
        .post(basePath)
        .set('Authorization', fakeToken.admin)
        .send(item);
      const { id } = postResponse.body;

      const putResponse = await request(server)
        .put(`${basePath}/${id}`)
        .set('Authorization', fakeToken.admin)
        .send({});
      expect(putResponse.status).toBe(400);
    });

    it('should return unprocessable entity if new item name already exists', async () => {
      const item = randomItem();
      const otherItem = randomItem();
      const postResponse = await request(server)
        .post(basePath)
        .set('Authorization', fakeToken.admin)
        .send(item);
      const { id } = postResponse.body;
      await request(server)
        .post(basePath)
        .set('Authorization', fakeToken.admin)
        .send(otherItem);

      const putResponse = await request(server)
        .put(`${basePath}/${id}`)
        .set('Authorization', fakeToken.admin)
        .send({ name: otherItem.name });
      expect(putResponse.status).toBe(422);
    });

    it('should return not found for non existing item', async () => {
      const id = new Types.ObjectId().toHexString();
      const getResponse = await request(server)
        .put(`${basePath}/${id}`)
        .set('Authorization', fakeToken.admin)
        .send({
          name: `${faker.food.adjective()} ${faker.food.dish()}`,
        });
      expect(getResponse.statusCode).toBe(404);
    });

    it('should return bad request if an invalid id is provided', async () => {
      const id = randomUUID();
      const targetResponse = await request(server)
        .put(`${basePath}/${id}`)
        .set('Authorization', fakeToken.admin)
        .send({
          name: `${faker.food.adjective()} ${faker.food.dish()}`,
        });

      expect(targetResponse.statusCode).toBe(400);
    });
  });

  describe('GET /v1/items/:id', () => {
    it('should return existing items', async () => {
      const item = randomItem();
      const postResponse = await request(server)
        .post(basePath)
        .set('Authorization', fakeToken.admin)
        .send(item);
      const { id } = postResponse.body;

      const getResponse = await request(server).get(`${basePath}/${id}`);
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body).toEqual(expect.objectContaining({ id }));
      expect(getResponse.body.id).toBe(id);
      expect(getResponse.body.name).toBe(item.name);
      expect(getResponse.body.description).toBe(item.description);
      expect(getResponse.body.price).toBe(item.price);
      expect(getResponse.body.type).toBe(item.type);
      expect(getResponse.body.images).toEqual(item.images);
    });

    it('should return not found for non existing item', async () => {
      const id = new Types.ObjectId().toHexString();
      const getResponse = await request(server).get(`${basePath}/${id}`);
      expect(getResponse.statusCode).toBe(404);
    });

    it('should return bad request if an invalid id is provided', async () => {
      const id = randomUUID();
      const getResponse = await request(server).get(`${basePath}/${id}`);
      expect(getResponse.statusCode).toBe(400);
    });
  });

  describe('GET /v1/items', () => {
    it('should return empty ', async () => {
      const getResponse = await request(server)
        .get(`${basePath}`)
        .query({ name: 'DummyDummy' });
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body.data).toEqual([]);
    });
  });
});
