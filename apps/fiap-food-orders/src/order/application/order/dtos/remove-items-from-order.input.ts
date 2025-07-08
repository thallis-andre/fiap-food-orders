import { IsArray, IsNotEmpty, IsString } from 'class-validator';

class OrderItemInput {
  @IsString()
  key: string;
}

export class RemoveItemsFromOrderInput {
  id: string;

  @IsArray()
  @IsNotEmpty()
  items: OrderItemInput[];
}
