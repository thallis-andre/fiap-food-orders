import { IsArray, IsNotEmpty, IsString } from 'class-validator';

class OrderItemInput {
  @IsString()
  id: string;
}

export class AddItemsToOrderInput {
  id: string;

  @IsArray()
  @IsNotEmpty()
  items: OrderItemInput[];
}
