import { DomainEvent } from '@fiap-food/tactical-design/core';
import { OrderRejectionReason } from '../values/order-rejection-reason.value';

export class OrderRejected extends DomainEvent {
  public readonly rejectedAt = new Date();

  constructor(public readonly reason: OrderRejectionReason) {
    super();
  }
}
