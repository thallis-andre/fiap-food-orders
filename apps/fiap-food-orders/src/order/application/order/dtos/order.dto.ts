import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EOrderStatus,
  OrderStatusValues,
} from '../../../domain/values/order-status.value';
import { OrderRequester } from './requester.dto';

export class OrderItem {
  @ApiProperty()
  public readonly key: string;

  @ApiProperty()
  public readonly name: string;

  @ApiProperty()
  public readonly price: number;
}

export class Order {
  @ApiProperty()
  public readonly id: string;

  @ApiPropertyOptional()
  public readonly requester?: OrderRequester;

  @ApiProperty({ enum: EOrderStatus })
  public readonly status: OrderStatusValues;

  @ApiProperty()
  public readonly total: number;

  @ApiProperty({ type: OrderItem })
  public readonly items: OrderItem[];

  @ApiPropertyOptional()
  public readonly paymentId?: string;

  @ApiPropertyOptional()
  public readonly qrCode?: string;

  @ApiPropertyOptional()
  public readonly preparationId?: string;

  @ApiPropertyOptional()
  public readonly preparationRequestedAt?: Date;

  @ApiPropertyOptional()
  public readonly rejectionReason?: string;

  @ApiProperty()
  public readonly createdAt: Date;

  @ApiPropertyOptional()
  public readonly updatedAt?: Date;

  constructor(values: Order) {
    Object.assign(this, values);
  }
}
