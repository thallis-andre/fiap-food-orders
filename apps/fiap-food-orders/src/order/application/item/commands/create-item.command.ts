import { CreateItemInput } from '../dtos/create-item.input';

export class CreateItemCommand {
  constructor(readonly data: CreateItemInput) {}
}

export class CreateItemResult {
  constructor(readonly id: string) {}
}
