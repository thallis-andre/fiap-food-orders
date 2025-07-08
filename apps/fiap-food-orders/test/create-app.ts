import { createTestApp as baseCreateTestApp } from '@fiap-food/test-factory/utils';
import { setupServer, SetupServerApi } from 'msw/node';
import { AppModule } from '../src/app.module';
import { getPayementsServiceHandlers } from './mocks/payments.msw';
import { getPrerationServiceHandlers } from './mocks/preparation.msw';

export const env = {
  APP_NAME: 'fiap-food-orders-test-app',
  APP_DESCRIPTION: 'Orders Component for Fiap Food',
  APP_VERSION: '1.0.0',
  BASE_URL_PAYMENT_SERVICE: 'http://payment.localhost',
  BASE_URL_PREPARATION_SERVICE: 'http://preparation.localhost',
  EXTRA_EXCHANGES: 'fiap.food.payments.events;fiap.food.preparation.events',
};

export const createTestApp = async (silentLogger: boolean = true) =>
  baseCreateTestApp(AppModule, { env, silentLogger });

export const createMockService = () => {
  const mockService = setupServer(
    ...getPayementsServiceHandlers(env.BASE_URL_PAYMENT_SERVICE),
    ...getPrerationServiceHandlers(env.BASE_URL_PREPARATION_SERVICE),
  );
  mockService.listen({ onUnhandledRequest: 'bypass' });
  return mockService;
};

export const destroyMockService = (mockService: SetupServerApi) => {
  mockService.close();
};
