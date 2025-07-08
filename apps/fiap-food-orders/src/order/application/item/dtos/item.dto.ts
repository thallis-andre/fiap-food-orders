import { ApiProperty } from '@nestjs/swagger';
import { EItemType, ItemTypes } from '../../../domain/values/item-type.value';

export class Item {
  @ApiProperty()
  public readonly id: string;

  @ApiProperty()
  public readonly name: string;

  @ApiProperty()
  public readonly description: string;

  @ApiProperty()
  public readonly price: number;

  @ApiProperty({ enum: EItemType })
  public readonly type: ItemTypes;

  @ApiProperty({ type: [String] })
  public readonly images: string[];

  @ApiProperty()
  public readonly createdAt: Date;

  @ApiProperty()
  public readonly updatedAt?: Date;

  constructor(values: Item) {
    Object.assign(this, values);
  }
}
