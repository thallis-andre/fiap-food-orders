import {
  CommonModuleOptions,
  InjectCommonModuleOptions,
} from '@fiap-food/setup';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class MongooseConfig implements MongooseOptionsFactory {
  private readonly logger = new Logger(MongooseConfig.name);

  constructor(
    private readonly config: ConfigService,
    @InjectCommonModuleOptions()
    private readonly options: CommonModuleOptions,
  ) {}

  createMongooseOptions(): MongooseModuleOptions {
    try {
      this.logger.log('MongooseConfig - Configurando conexão com MongoDB');

      // Verificar se MONGO_URL existe
      const mongoUrl = this.config.get('MONGO_URL');
      if (!mongoUrl) {
        const errorMessage =
          'MONGO_URL não está definida nas variáveis de ambiente';
        this.logger.error(`MongooseConfig - ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const uri = mongoUrl;
      const appName = this.options.appName;

      this.logger.log(`MongooseConfig - App Name: ${appName}`);
      this.logger.log(
        `MongooseConfig - MongoDB URI: ${uri.substring(0, 30)}...`,
      );

      // Configurações otimizadas para ambiente Kubernetes
      const options: MongooseModuleOptions = {
        uri,
        appName,
        // Configurações de timeout mais agressivas para falha rápida
        serverSelectionTimeoutMS: 5000, // 5 segundos para descobrir servidor
        connectTimeoutMS: 5000, // 5 segundos para conectar
        socketTimeoutMS: 30000, // 30 segundos para operações
        heartbeatFrequencyMS: 5000, // Check de saúde a cada 5s
        maxPoolSize: 5, // Pool menor para Kubernetes
        minPoolSize: 1, // Manter pelo menos 1 conexão
        retryWrites: true,
        retryReads: true,
        // Buffer de comandos desabilitado para falhas rápidas
        bufferCommands: false,
        // Configurações de rede otimizadas
        family: 4, // Use IPv4, skip trying IPv6
        // Configurações de autenticação flexíveis
        authSource: 'admin',
        // Configurações de replica set
        readPreference: 'primary',
        // Configurações de timeout de aplicação
        maxIdleTimeMS: 30000,
        waitQueueTimeoutMS: 5000,
      };

      this.logger.log('MongooseConfig - Configuração criada com sucesso');
      this.logger.log(
        `MongooseConfig - Configurações: timeout=${options.serverSelectionTimeoutMS}ms, pool=${options.maxPoolSize}`,
      );

      return options;
    } catch (error) {
      this.logger.error('MongooseConfig - Erro ao configurar MongoDB:', error);
      this.logger.error(`MongooseConfig - Stack trace: ${error.stack}`);
      this.logger.error(
        'MongooseConfig - Verifique se as variáveis de ambiente estão configuradas corretamente',
      );
      throw error;
    }
  }
}
