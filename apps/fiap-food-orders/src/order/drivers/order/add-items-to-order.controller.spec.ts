import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { AddItemsToOrderCommand } from '../../application/order/commands/add-items-to-order.command';
import { AddItemsToOrderInput } from '../../application/order/dtos/add-items-to-order.input';
import { AddItemsToOrderController } from './add-items-to-order.controller';

describe('AddItemsToOrderController', () => {
  let target: AddItemsToOrderController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [AddItemsToOrderController],
    }).compile();

    target = app.get(AddItemsToOrderController);
    commandBus = app.get(CommandBus);
  });

  it('should execute AddItemsToOrderCommand command', async () => {
    jest.spyOn(commandBus, 'execute').mockResolvedValue(null);
    const input = new AddItemsToOrderInput();
    input.items = [{ id: '123' }];
    await target.execute('123', input);
    expect(commandBus.execute).toHaveBeenCalledWith(
      new AddItemsToOrderCommand(input),
    );
  });

  it('should throw if commandBus throws', async () => {
    const err = new Error('Too Bad');
    jest.spyOn(commandBus, 'execute').mockRejectedValue(err);
    const input = new AddItemsToOrderInput();
    await expect(() => target.execute('123', input)).rejects.toThrow(err);
    expect(commandBus.execute).toHaveBeenCalledWith(
      new AddItemsToOrderCommand(input),
    );
  });
});
