import { AmqpRetrialPolicy, AmqpSubscription } from '@fiap-food/amqp';
import { routingKeyOfEvent } from '@fiap-food/tactical-design/amqp';
import { Body, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { withPrefix } from '../../../config/amqp.config';
import { RejectOrderOnPaymentRejectedCommand } from '../../application/order/commands/reject-order-on-payment-rejected.command';
import { PaymentApproved } from '../../application/order/dtos/payment-approved.integration-event';
import { PaymentRejected } from '../../application/order/dtos/payment-rejected.integration-event';

@Injectable()
export class OnPaymentRejectedRejectOrderController {
  constructor(private readonly commandBus: CommandBus) {}

  @AmqpSubscription({
    exchange: 'fiap.foodayments.events',
    routingKey: routingKeyOfEvent(PaymentRejected),
    queue: withPrefix(RejectOrderOnPaymentRejectedCommand.name),
  })
  @AmqpRetrialPolicy({
    delay: 5000,
    maxDelay: 5,
    maxAttempts: 5,
  })
  async execute(@Body() data: PaymentApproved) {
    const paymentId = data.aggregateId;
    await this.commandBus.execute(
      new RejectOrderOnPaymentRejectedCommand(paymentId),
    );
  }
}
