import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EItemType, ItemTypes } from '../../../domain/values/item-type.value';

export class FindItemsInput {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public readonly name?: string;

  @ApiPropertyOptional({ enum: EItemType, isArray: true })
  @IsEnum(EItemType, { each: true })
  @IsOptional()
  public readonly type?: ItemTypes[];
}
