import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateItemCommand } from '../../application/item/commands/create-item.command';
import { CreateItemInput } from '../../application/item/dtos/create-item.input';
import { CreateItemController } from './create-item.controller';

describe('CreateItemController', () => {
  let target: CreateItemController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [CreateItemController],
    }).compile();

    target = app.get(CreateItemController);
    commandBus = app.get(CommandBus);
  });

  it('should execute request preparation command', async () => {
    jest
      .spyOn(commandBus, 'execute')
      .mockResolvedValue({ data: { id: '123' } });
    const input = new CreateItemInput();
    await target.execute(input);
    expect(commandBus.execute).toHaveBeenCalledWith(
      new CreateItemCommand(input),
    );
  });

  it('should throw if commandBus throws', async () => {
    const err = new Error('Too Bad');
    jest.spyOn(commandBus, 'execute').mockRejectedValue(err);
    const input = new CreateItemInput();
    await expect(() => target.execute(input)).rejects.toThrow(err);
    expect(commandBus.execute).toHaveBeenCalledWith(
      new CreateItemCommand(input),
    );
  });
});
