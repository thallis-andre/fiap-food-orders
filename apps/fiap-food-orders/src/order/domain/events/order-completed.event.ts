import { DomainEvent } from '@fiap-food/tactical-design/core';

export class OrderCompleted extends DomainEvent {
  public readonly completedAt = new Date();
}
