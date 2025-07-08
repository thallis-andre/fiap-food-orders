import { DomainEvent } from '@fiap-food/tactical-design/core';

export class OrderPreparationCompleted extends DomainEvent {
  public readonly completedAt = new Date();
}
