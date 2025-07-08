import { AmqpModuleOptions, AmqpOptionsFactory } from '@fiap-food/amqp';
import { toDottedNotation } from '@fiap-food/amqp/utils/amqp-infrastructure.util';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const withPrefix = (value: string) =>
  `${toDottedNotation('FiapFoodOrder')}.${toDottedNotation(value)}`;

@Injectable()
export class AmqpConfig implements AmqpOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createAmqpOptions(): AmqpModuleOptions {
    const [appName, url, inspectionMode, isCI, extraExchanges] = [
      this.config.getOrThrow('APP_NAME'),
      this.config.getOrThrow('AMQP_URL'),
      this.config.get('TRAFFIC_INSPECTION_AMQP', 'all'),
      this.config.get('CI', false),
      this.config.get('EXTRA_EXCHANGES', ''),
    ];
    const exchanges = extraExchanges
      ? extraExchanges.split(';').filter((x: string) => Boolean(x))
      : [];
    return {
      url,
      appName,
      prefix: 'FiapFoodOrder',
      trafficInspection: { mode: inspectionMode },
      waitForConnection: isCI,
      exchanges: [
        // ::StyleKeep::
        { name: withPrefix('events') },
        ...exchanges.map((name: string) => ({ name })),
      ],
    };
  }
}
