import { AmqpRetrialPolicy, AmqpSubscription } from '@fiap-food/amqp';
import { routingKeyOfEvent } from '@fiap-food/tactical-design/amqp';
import { Body, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { withPrefix } from '../../../config/amqp.config';
import { RequestOrderPreparationOnPaymentApprovedCommand } from '../../application/order/commands/request-order-preparation-on-payment-approved.command';
import { PaymentApproved } from '../../application/order/dtos/payment-approved.integration-event';

@Injectable()
export class OnPaymentApprovedRequestPreparationController {
  constructor(private readonly commandBus: CommandBus) {}

  @AmqpSubscription({
    exchange: 'fiap.food.payments.events',
    routingKey: routingKeyOfEvent(PaymentApproved),
    queue: withPrefix(RequestOrderPreparationOnPaymentApprovedCommand.name),
  })
  @AmqpRetrialPolicy({
    delay: 5000,
    maxDelay: 5,
    maxAttempts: 5,
  })
  async execute(@Body() data: PaymentApproved) {
    const paymentId = data.aggregateId;
    await this.commandBus.execute(
      new RequestOrderPreparationOnPaymentApprovedCommand(paymentId),
    );
  }
}
