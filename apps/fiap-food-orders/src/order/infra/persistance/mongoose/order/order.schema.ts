import { MongooseEntitySchema } from '@fiap-food/tactical-design/mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OrderStatusValues } from '../../../../domain/values/order-status.value';

@Schema({ _id: false })
class MongooseOrderItemSchema {
  @Prop()
  key: string;

  @Prop()
  name: string;

  @Prop()
  price: number;
}

@Schema({ _id: false })
class MongooseOrderRequesterSchema {
  @Prop()
  name: string;

  @Prop()
  cpf?: string;

  @Prop()
  email?: string;
}

@Schema({ collection: 'Orders', timestamps: true })
export class MongooseOrderSchema extends MongooseEntitySchema {
  @Prop({ type: String })
  status: OrderStatusValues;

  @Prop()
  total: number;

  @Prop({ type: MongooseOrderRequesterSchema })
  requester?: MongooseOrderRequesterSchema;

  @Prop({ type: [MongooseOrderItemSchema] })
  items: MongooseOrderItemSchema[];

  @Prop()
  paymentId?: string;

  @Prop()
  qrCode?: string;

  @Prop()
  preparationId?: string;

  @Prop()
  preparationRequestedAt?: Date;

  @Prop()
  rejectionReason?: string;
}

export const MongooseOrderSchemaModel =
  SchemaFactory.createForClass(MongooseOrderSchema);
