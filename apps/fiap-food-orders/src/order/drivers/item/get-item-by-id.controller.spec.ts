import { CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { GetItemByIdQuery } from '../../application/item/queries/get-item-by-id.query';
import { GetItemByIdController } from './get-item-by-id.controller';

describe('GetItemByIdController', () => {
  let target: GetItemByIdController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [GetItemByIdController],
    }).compile();

    target = app.get(GetItemByIdController);
    queryBus = app.get(QueryBus);
  });

  it('should return existing item', async () => {
    jest.spyOn(queryBus, 'execute').mockResolvedValue({ data: { id: '123' } });
    const id = randomUUID();
    const result = await target.execute(id);
    expect(result.id).toBe('123');
    expect(queryBus.execute).toHaveBeenCalledWith(new GetItemByIdQuery(id));
  });

  it('should throw if commandBus throws', async () => {
    const err = new Error('Too Bad');
    jest.spyOn(queryBus, 'execute').mockRejectedValue(err);

    await expect(() => target.execute('123')).rejects.toThrow(err);
    expect(queryBus.execute).toHaveBeenCalledWith(new GetItemByIdQuery('123'));
  });
});
