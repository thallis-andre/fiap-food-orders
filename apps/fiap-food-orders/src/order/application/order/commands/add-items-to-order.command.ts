import { AddItemsToOrderInput } from '../dtos/add-items-to-order.input';

export class AddItemsToOrderCommand {
  constructor(public readonly data: AddItemsToOrderInput) {}
}
