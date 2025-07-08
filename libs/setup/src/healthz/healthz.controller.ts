import { AmqpHealthIndicatorService } from '@fiap-food/amqp';
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('Health Check')
@Controller('healthz')
export class HealthzController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongodb: MongooseHealthIndicator,
    private readonly http: HttpHealthIndicator,
    private readonly moduleRef: ModuleRef,
    private readonly config: ConfigService,
  ) {}

  private tryGetAMQP(): AmqpHealthIndicatorService {
    try {
      return this.moduleRef.get(AmqpHealthIndicatorService, { strict: false });
    } catch {
      return null;
    }
  }

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Executes Health Check',
    description:
      'Runs a health check on the service and its dependencies, including upstream services',
  })
  async checkHealth() {
    const amqp = this.tryGetAMQP();
    const paymentServiceBaseURL = this.config.getOrThrow(
      'BASE_URL_PAYMENT_SERVICE',
    );
    const preparationServiceBaseURL = this.config.getOrThrow(
      'BASE_URL_PREPARATION_SERVICE',
    );

    return this.health.check([
      () => this.mongodb.pingCheck('Database'),
      () =>
        this.http.pingCheck(
          'PaymentsService',
          `${paymentServiceBaseURL}/healthz/self`,
        ),
      () =>
        this.http.pingCheck(
          'PreparationService',
          `${preparationServiceBaseURL}/healthz/self`,
        ),
      () => amqp?.isConnected('MessageBroker'),
    ]);
  }

  @Get('self')
  @HealthCheck()
  @ApiOperation({
    summary: 'Executes Self Health Check',
    description:
      'Runs a health check on the service and its core dependencies, exclusing upstream services',
  })
  async checkSelfHealth() {
    const amqp = this.tryGetAMQP();

    return this.health.check([
      () => this.mongodb.pingCheck('Database'),
      () => amqp?.isConnected('MessageBroker'),
    ]);
  }
}
