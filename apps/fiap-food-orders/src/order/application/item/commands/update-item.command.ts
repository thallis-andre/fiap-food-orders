import { UpdateItemInput } from '../dtos/update-item.input';

export class UpdateItemCommand {
  constructor(readonly data: UpdateItemInput) {}
}
