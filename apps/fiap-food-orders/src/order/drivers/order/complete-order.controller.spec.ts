import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { CompleteOrderCommand } from '../../application/order/commands/complete-order.command';
import { CompleteOrderController } from './complete-order.controller';

describe('CompleteOrderController', () => {
  let target: CompleteOrderController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [CompleteOrderController],
    }).compile();

    target = app.get(CompleteOrderController);
    commandBus = app.get(CommandBus);
  });

  it('should execute CompleteOrder command', async () => {
    jest
      .spyOn(commandBus, 'execute')
      .mockResolvedValue({ data: { qrCode: randomUUID() } });
    const id = '123';
    await target.execute(id);
    expect(commandBus.execute).toHaveBeenCalledWith(
      new CompleteOrderCommand(id),
    );
  });

  it('should throw if commandBus throws', async () => {
    const err = new Error('Too Bad');
    jest.spyOn(commandBus, 'execute').mockRejectedValue(err);
    const id = '123';
    await expect(() => target.execute(id)).rejects.toThrow(err);
    expect(commandBus.execute).toHaveBeenCalledWith(
      new CompleteOrderCommand(id),
    );
  });
});
