import { CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { FollowUpOutput } from '../../application/order/dtos/follow-up.dto';
import {
  FollowUpOrdersQuery,
  FollowUpOrdersResult,
} from '../../application/order/queries/follow-up-orders.query';
import { FollowUpOrdersController } from './follow-up-orders.controller';

describe('FollowUpOrdersController', () => {
  let target: FollowUpOrdersController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [FollowUpOrdersController],
    }).compile();

    target = app.get(FollowUpOrdersController);
    queryBus = app.get(QueryBus);
  });

  it('should return existing followup', async () => {
    jest
      .spyOn(queryBus, 'execute')
      .mockResolvedValue(new FollowUpOrdersResult(new FollowUpOutput({})));
    const result = await target.execute();
    expect(result).toBeInstanceOf(FollowUpOutput);
  });

  it('should throw if commandBus throws', async () => {
    const err = new Error('Too Bad');
    jest.spyOn(queryBus, 'execute').mockRejectedValue(err);

    await expect(() => target.execute()).rejects.toThrow(err);
    expect(queryBus.execute).toHaveBeenCalledWith(new FollowUpOrdersQuery());
  });
});
