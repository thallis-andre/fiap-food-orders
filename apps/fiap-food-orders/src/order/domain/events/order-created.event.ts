import { DomainEvent } from '@fiap-food/tactical-design/core';

export class OrderCreated extends DomainEvent {
  public readonly createdAt = new Date();
}
