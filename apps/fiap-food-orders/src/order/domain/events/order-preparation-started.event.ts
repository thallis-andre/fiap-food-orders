import { DomainEvent } from '@fiap-food/tactical-design/core';

export class OrderPreparationSarted extends DomainEvent {
  public readonly startedAt = new Date();
}
