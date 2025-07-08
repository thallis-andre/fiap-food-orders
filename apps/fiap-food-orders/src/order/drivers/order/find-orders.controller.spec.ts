import { CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Order } from '../../application/order/dtos/order.dto';
import {
  FindOrdersQuery,
  FindOrdersResult,
} from '../../application/order/queries/find-orders.query';
import { FindOrdersController } from './find-orders.controller';

describe('FindOrdersController', () => {
  let target: FindOrdersController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [FindOrdersController],
    }).compile();

    target = app.get(FindOrdersController);
    queryBus = app.get(QueryBus);
  });

  it('should return existing orders', async () => {
    jest
      .spyOn(queryBus, 'execute')
      .mockResolvedValue(
        new FindOrdersResult([Object.create(Order.prototype)]),
      );
    const result = await target.execute({});
    expect(result).toBeInstanceOf(FindOrdersResult);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data[0]).toBeInstanceOf(Order);
    expect(queryBus.execute).toHaveBeenCalledWith(new FindOrdersQuery({}));
  });

  it('should throw if commandBus throws', async () => {
    const err = new Error('Too Bad');
    jest.spyOn(queryBus, 'execute').mockRejectedValue(err);

    await expect(() => target.execute({})).rejects.toThrow(err);
    expect(queryBus.execute).toHaveBeenCalledWith(new FindOrdersQuery({}));
  });
});
