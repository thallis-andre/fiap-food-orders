import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateItemCommand } from '../../application/item/commands/update-item.command';
import { UpdateItemInput } from '../../application/item/dtos/update-item.input';
import { UpdateItemController } from './update-item.controller';

describe('UpdateItemController', () => {
  let target: UpdateItemController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [UpdateItemController],
    }).compile();

    target = app.get(UpdateItemController);
    commandBus = app.get(CommandBus);
  });

  it('should execute request preparation command', async () => {
    jest
      .spyOn(commandBus, 'execute')
      .mockResolvedValue({ data: { id: '123' } });
    const input = new UpdateItemInput();
    await target.execute('123', input);
    expect(commandBus.execute).toHaveBeenCalledWith(
      new UpdateItemCommand(input),
    );
  });

  it('should throw if commandBus throws', async () => {
    const err = new Error('Too Bad');
    jest.spyOn(commandBus, 'execute').mockRejectedValue(err);
    const input = new UpdateItemInput();
    await expect(() => target.execute('123', input)).rejects.toThrow(err);
    expect(commandBus.execute).toHaveBeenCalledWith(
      new UpdateItemCommand(input),
    );
  });
});
