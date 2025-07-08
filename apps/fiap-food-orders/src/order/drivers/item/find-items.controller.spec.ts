import { CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { FindItemsQuery } from '../../application/item/queries/find-items.query';
import { FindItemsController } from './find-items.controller';

describe('FindItemsController', () => {
  let target: FindItemsController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [FindItemsController],
    }).compile();

    target = app.get(FindItemsController);
    queryBus = app.get(QueryBus);
  });

  it('should return existing item', async () => {
    jest.spyOn(queryBus, 'execute').mockResolvedValue({ data: [] });
    await target.execute({});
    expect(queryBus.execute).toHaveBeenCalledWith(new FindItemsQuery({}));
  });

  it('should throw if commandBus throws', async () => {
    const err = new Error('Too Bad');
    jest.spyOn(queryBus, 'execute').mockRejectedValue(err);

    await expect(() => target.execute({})).rejects.toThrow(err);
    expect(queryBus.execute).toHaveBeenCalledWith(new FindItemsQuery({}));
  });
});
