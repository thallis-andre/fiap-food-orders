import {
  destroyTestApp,
  items,
  itemsTypes,
} from '@fiap-food/test-factory/utils';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './create-app';
import { populateItems } from './create-items';

const basePath = '/v1/items';

describe('Items', () => {
  let app: INestApplication;
  let server: App;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
    await populateItems(server);
  }, 30000);

  afterAll(async () => {
    await destroyTestApp(app);
  }, 30000);

  describe('GET /v1/items', () => {
    it('should return all items', async () => {
      const getResponse = await request(server).get(basePath);
      const { statusCode, body } = getResponse;
      expect(statusCode).toBe(200);
      expect(body.data.length).toBe(items.length);
    });

    it.each(itemsTypes)(
      'should return all items for the given criterea',
      async (type) => {
        const getResponse = await request(server).get(basePath).query({ type });
        const { statusCode, body } = getResponse;
        expect(statusCode).toBe(200);
        expect(body.data.length).toBe(
          items.filter((x) => x.type === type).length,
        );
      },
    );

    it('should allow multiple categories in criterea', async () => {
      const [firstType, secondType] = itemsTypes;
      const getResponse = await request(server).get(
        `${basePath}?type=${firstType}&type=${secondType}`,
      );
      const { statusCode, body } = getResponse;
      expect(statusCode).toBe(200);
      expect(body.data.length).toBe(
        items.filter((x) => [firstType, secondType].includes(x.type)).length,
      );
    });
  });
});
