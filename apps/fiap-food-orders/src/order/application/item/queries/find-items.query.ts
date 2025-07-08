import { FindItemsInput } from '../dtos/find-items.input';
import { Item } from '../dtos/item.dto';

export class FindItemsQuery {
  constructor(public readonly data: FindItemsInput) {}
}

export class FindItemsResult {
  constructor(public readonly data: Item[]) {}
}
