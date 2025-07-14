import { AmqpRetrialPolicy, AmqpSubscription } from '@fiap-food/amqp';
import { routingKeyOfEvent } from '@fiap-food/tactical-design/amqp';
import { Body, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { withPrefix } from '../../../config/amqp.config';
import { ReadyOrderOnPreparationCompletedCommand } from '../../application/order/commands/ready-order-on-preparation-completed.command';
import { PreparationCompleted } from '../../application/order/dtos/preparation-completed.integration-event';

@Injectable()
export class OnPreparationCompletedReadyOrderController {
  constructor(private readonly commandBus: CommandBus) {}

  @AmqpSubscription({
    exchange: 'fiap.food.preparation.events',
    routingKey: routingKeyOfEvent(PreparationCompleted),
    queue: withPrefix(ReadyOrderOnPreparationCompletedCommand.name),
  })
  @AmqpRetrialPolicy({
    delay: 5000,
    maxDelay: 5,
    maxAttempts: 5,
  })
  async execute(@Body() data: PreparationCompleted) {
    const paymentId = data.aggregateId;
    await this.commandBus.execute(
      new ReadyOrderOnPreparationCompletedCommand(paymentId),
    );
  }
}
