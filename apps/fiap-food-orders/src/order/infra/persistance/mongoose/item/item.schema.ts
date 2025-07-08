import { MongooseEntitySchema } from '@fiap-food/tactical-design/mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ItemTypes } from '../../../../domain/values/item-type.value';

@Schema({ collection: 'Items', timestamps: true })
export class MongooseItemSchema extends MongooseEntitySchema {
  @Prop()
  name: string;

  @Prop()
  price: number;

  @Prop({ type: String })
  type: ItemTypes;

  @Prop()
  description: string;

  @Prop({ type: [String] })
  images: string[];
}

export const MongooseItemSchemaModel =
  SchemaFactory.createForClass(MongooseItemSchema);
