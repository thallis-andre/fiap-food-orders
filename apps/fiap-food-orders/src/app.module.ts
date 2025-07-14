import { AmqpModule } from '@fiap-food/amqp';
import { CommonModule, ContextModule, HealthzModule } from '@fiap-food/setup';
import { AmqpTacticalDesignModule } from '@fiap-food/tactical-design/amqp';
import { TacticalDesignModule } from '@fiap-food/tactical-design/core';
import {
  MongooseTacticalDesignModule,
  MongooseTransactionalModule,
} from '@fiap-food/tactical-design/mongoose';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AmqpConfig } from './config/amqp.config';
import { AppConfig } from './config/app.config';
import { MongooseConfig } from './config/mongoose.config';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ContextModule.forRoot({}),
    CommonModule.forRootAsync({ useClass: AppConfig }),
    MongooseModule.forRootAsync({ useClass: MongooseConfig }),
    AmqpModule.forRootAsync({ useClass: AmqpConfig }),
    HealthzModule,
    TacticalDesignModule,
    MongooseTacticalDesignModule,
    AmqpTacticalDesignModule,
    MongooseTransactionalModule,
    OrderModule,
  ],
})
export class AppModule {}
