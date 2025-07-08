import { Item } from '../dtos/item.dto';

export class GetItemByIdQuery {
  constructor(public readonly id: string) {}
}

export class GetItemByIdResult {
  constructor(public readonly data: Item) {}
}
