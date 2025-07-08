import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ItemSuite } from './step-definitions/item.suite';
import { OrderSuite } from './step-definitions/order.suite';
@Module({
  imports: [HttpModule],
  providers: [ItemSuite, OrderSuite],
})
export class AppModule {}
