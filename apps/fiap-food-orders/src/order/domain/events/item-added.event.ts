import { DomainEvent } from '@fiap-food/tactical-design/core';
import { OrderItem } from '../values/order-item.value';

export class ItemAdded extends DomainEvent {
  public readonly addedAt = new Date();

  constructor(public readonly item: OrderItem) {
    super();
  }
}
