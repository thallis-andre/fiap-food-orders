import { User } from '@fiap-food/setup';
import { ForbiddenException } from '@nestjs/common';
import { CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { GetOrderByIdQuery } from '../../application/order/queries/get-order-by-id.query';
import { GetOrderByIdController } from './get-order-by-id.controller';

describe('GetOrderByIdController', () => {
  let target: GetOrderByIdController;
  let queryBus: QueryBus;

  const user = new User({
    name: 'John Doe',
    cpf: '01234567890',
    email: 'john@doe.com',
    role: 'ADMIN',
  });

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [GetOrderByIdController],
    }).compile();

    target = app.get(GetOrderByIdController);
    queryBus = app.get(QueryBus);
  });

  it('should return existing item', async () => {
    jest.spyOn(queryBus, 'execute').mockResolvedValue({ data: { id: '123' } });
    const id = randomUUID();

    const result = await target.execute(id, user);
    expect(result.id).toBe('123');
    expect(queryBus.execute).toHaveBeenCalledWith(new GetOrderByIdQuery(id));
  });
  it('should throw forbidden when trying to access resource from other customer', async () => {
    const customer = new User({ ...user, role: 'CUSTOMER' });
    jest.spyOn(queryBus, 'execute').mockResolvedValue({
      data: {
        id: '123',
        requester: { email: 'something@else.com', cpf: '11111111111' },
      },
    });
    const id = randomUUID();

    await expect(() => target.execute(id, customer)).rejects.toThrow(
      ForbiddenException,
    );
    expect(queryBus.execute).toHaveBeenCalledWith(new GetOrderByIdQuery(id));
  });

  it('should not reject if empty requester', async () => {
    jest.spyOn(queryBus, 'execute').mockResolvedValue({
      data: { id: '123' },
    });
    const id = randomUUID();

    const result = await target.execute(id, user);
    expect(queryBus.execute).toHaveBeenCalledWith(new GetOrderByIdQuery(id));
    expect(result.id).toBe('123');
  });

  it('should throw if commandBus throws', async () => {
    const err = new Error('Too Bad');
    jest.spyOn(queryBus, 'execute').mockRejectedValue(err);

    await expect(() => target.execute('123', user)).rejects.toThrow(err);
    expect(queryBus.execute).toHaveBeenCalledWith(new GetOrderByIdQuery('123'));
  });
});
