import { randomUUID } from 'crypto';
import { Item } from '../item.entity';

export class OrderItem {
  constructor(
    readonly key: string,
    readonly name: string,
    readonly price: number,
  ) {}

  static fromItem(item: Item) {
    return new OrderItem(randomUUID(), item.name, item.price);
  }
}
