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

      // Configurações robustas para produção
      const options: MongooseModuleOptions = {
        uri,
        appName,
        // Configurações de timeout e retry para produção
        serverSelectionTimeoutMS: 10000, // 10 segundos
        socketTimeoutMS: 45000, // 45 segundos
        connectTimeoutMS: 10000, // 10 segundos
        maxPoolSize: 10, // Máximo de 10 conexões no pool
        retryWrites: true,
        retryReads: true,
        // Buffer de comandos desabilitado para falhas rápidas
        bufferCommands: false,
        // Log de conexão
        family: 4, // Use IPv4, skip trying IPv6
      };

      this.logger.log('MongooseConfig - Configuração criada com sucesso');
      this.logger.log(
        `MongooseConfig - Configurações aplicadas: timeout=${options.serverSelectionTimeoutMS}ms, poolSize=${options.maxPoolSize}`,
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
