import { RemoveItemsFromOrderInput } from '../dtos/remove-items-from-order.input';

export class RemoveItemsFromOrderCommand {
  constructor(public readonly data: RemoveItemsFromOrderInput) {}
}
