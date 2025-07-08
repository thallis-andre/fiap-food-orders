import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderCommand } from '../../application/order/commands/create-order.command';
import { CreateOrderInput } from '../../application/order/dtos/create-order.input';
import { CreateOrderController } from './create-order.controller';

describe('CreateOrderController', () => {
  let target: CreateOrderController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [CreateOrderController],
    }).compile();

    target = app.get(CreateOrderController);
    commandBus = app.get(CommandBus);
  });

  it.each([
    { items: null, requester: null },
    {
      items: [{ id: '123' }],
      requester: {
        name: 'John Doe',
        cpf: '01234567890',
        email: 'john@doe.com',
      },
    },
  ])('should execute request preparation command', async (values) => {
    jest
      .spyOn(commandBus, 'execute')
      .mockResolvedValue({ data: { id: '123' } });
    const { items, requester } = values;
    const input = new CreateOrderInput();
    input.items = items;
    await target.execute(input, requester);
    expect(commandBus.execute).toHaveBeenCalledWith(
      new CreateOrderCommand(input),
    );
  });

  it('should throw if commandBus throws', async () => {
    const err = new Error('Too Bad');
    jest.spyOn(commandBus, 'execute').mockRejectedValue(err);
    const input = new CreateOrderInput();
    await expect(() => target.execute(input, null)).rejects.toThrow(err);
    expect(commandBus.execute).toHaveBeenCalledWith(
      new CreateOrderCommand(input),
    );
  });
});
