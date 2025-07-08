import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { RemoveItemsFromOrderCommand } from '../../application/order/commands/remove-items-from-order.command';
import { RemoveItemsFromOrderInput } from '../../application/order/dtos/remove-items-from-order.input';
import { RemoveItemsFromOrderController } from './remove-items-from-order.controller';

describe('RemoveItemsFromOrderController', () => {
  let target: RemoveItemsFromOrderController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [RemoveItemsFromOrderController],
    }).compile();

    target = app.get(RemoveItemsFromOrderController);
    commandBus = app.get(CommandBus);
  });

  it('should execute RemoveItemsFromOrder command', async () => {
    jest.spyOn(commandBus, 'execute').mockResolvedValue(null);
    const input = new RemoveItemsFromOrderInput();
    input.items = [{ key: '123' }];
    await target.execute('123', input);
    expect(commandBus.execute).toHaveBeenCalledWith(
      new RemoveItemsFromOrderCommand(input),
    );
  });

  it('should throw if commandBus throws', async () => {
    const err = new Error('Too Bad');
    jest.spyOn(commandBus, 'execute').mockRejectedValue(err);
    const input = new RemoveItemsFromOrderInput();
    await expect(() => target.execute('123', input)).rejects.toThrow(err);
    expect(commandBus.execute).toHaveBeenCalledWith(
      new RemoveItemsFromOrderCommand(input),
    );
  });
});
