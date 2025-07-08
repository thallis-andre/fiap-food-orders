import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { EItemType, ItemTypes } from '../../../domain/values/item-type.value';

export class CreateItemInput {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: EItemType })
  @IsEnum(EItemType)
  type: ItemTypes;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  images: string[];
}
