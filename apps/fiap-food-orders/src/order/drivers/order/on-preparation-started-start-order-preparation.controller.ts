import { AmqpRetrialPolicy, AmqpSubscription } from '@fiap-food/amqp';
import { routingKeyOfEvent } from '@fiap-food/tactical-design/amqp';
import { Body, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { withPrefix } from '../../../config/amqp.config';
import { StartOrderPreparationOnPreparationStartedCommand } from '../../application/order/commands/start-order-preparation-on-preparation-started.command';
import { PreparationStarted } from '../../application/order/dtos/preparation-started.integration-event';

@Injectable()
export class OnPreparationStartedStartOrderPreparationController {
  constructor(private readonly commandBus: CommandBus) {}

  @AmqpSubscription({
    exchange: 'fiap.food.preparation.events',
    routingKey: routingKeyOfEvent(PreparationStarted),
    queue: withPrefix(StartOrderPreparationOnPreparationStartedCommand.name),
  })
  @AmqpRetrialPolicy({
    delay: 5000,
    maxDelay: 5,
    maxAttempts: 5,
  })
  async execute(@Body() data: PreparationStarted) {
    const paymentId = data.aggregateId;
    await this.commandBus.execute(
      new StartOrderPreparationOnPreparationStartedCommand(paymentId),
    );
  }
}
