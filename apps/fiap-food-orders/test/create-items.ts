import { items } from '@fiap-food/test-factory/utils';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { fakeToken } from './mocks/mock.token';

export const populateItems = async (app: App) => {
  for (const item of items) {
    await request(app)
      .post('/v1/items')
      .set('Authorization', fakeToken.admin)
      .send(item);
  }
};
