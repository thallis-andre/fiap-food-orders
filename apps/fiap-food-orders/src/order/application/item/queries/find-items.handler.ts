import { InternalServerErrorException, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongooseItemSchema } from '../../../infra/persistance/mongoose/item/item.schema';
import { Item } from '../dtos/item.dto';
import { FindItemsQuery, FindItemsResult } from './find-items.query';

@QueryHandler(FindItemsQuery)
export class FindItemsHandler
  implements IQueryHandler<FindItemsQuery, FindItemsResult>
{
  private readonly logger = new Logger(FindItemsHandler.name);

  constructor(
    @InjectModel(MongooseItemSchema.name)
    private readonly queryModel: Model<MongooseItemSchema>,
  ) {}

  async execute(query: FindItemsQuery): Promise<FindItemsResult> {
    try {
      this.logger.log('FindItemsHandler - Iniciando execução');
      this.logger.log(
        `FindItemsHandler - Query recebida: ${JSON.stringify(query.data)}`,
      );

      const { name, type } = query.data;

      // Verificar estado da conexão com MongoDB
      const connectionState = this.queryModel.db.readyState;
      this.logger.log(
        `FindItemsHandler - Estado da conexão: ${connectionState} (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)`,
      );

      if (connectionState !== 1) {
        const errorMessage = `MongoDB não está conectado. Estado atual: ${connectionState}`;
        this.logger.error(`FindItemsHandler - ${errorMessage}`);
        throw new InternalServerErrorException(
          'Erro de conexão com o banco de dados',
        );
      }

      this.logger.log('FindItemsHandler - Tentando conectar ao MongoDB');

      const result = await this.queryModel
        .find({
          ...(name ? { name } : {}),
          ...(type ? { type } : {}),
        })
        .exec();

      this.logger.log(
        `FindItemsHandler - Query executada com sucesso. Resultados encontrados: ${result?.length || 0}`,
      );

      if (!result) {
        this.logger.log(
          'FindItemsHandler - Nenhum resultado encontrado, retornando array vazio',
        );
        return new FindItemsResult([]);
      }

      const mappedResult = result.map(
        (x) =>
          new Item({
            id: x._id.toHexString(),
            name: x.name,
            description: x.description,
            type: x.type,
            price: x.price,
            images: x.images,
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
          }),
      );

      this.logger.log(
        `FindItemsHandler - Resultado mapeado com sucesso. Itens: ${mappedResult.length}`,
      );
      return new FindItemsResult(mappedResult);
    } catch (error) {
      this.logger.error('FindItemsHandler - Erro durante a execução:', error);
      this.logger.error(`FindItemsHandler - Stack trace: ${error.stack}`);
      this.logger.error(
        `FindItemsHandler - Mensagem de erro: ${error.message}`,
      );
      this.logger.error(
        `FindItemsHandler - Tipo de erro: ${error.constructor.name}`,
      );

      // Verificar tipos específicos de erro do MongoDB
      if (error.name === 'MongoNetworkError') {
        this.logger.error(
          'FindItemsHandler - Erro de rede com MongoDB detectado',
        );
        throw new InternalServerErrorException(
          'Erro de conectividade com o banco de dados',
        );
      } else if (error.name === 'MongoTimeoutError') {
        this.logger.error(
          'FindItemsHandler - Timeout de conexão com MongoDB detectado',
        );
        throw new InternalServerErrorException(
          'Timeout na conexão com o banco de dados',
        );
      } else if (error.name === 'MongoServerError') {
        this.logger.error(
          'FindItemsHandler - Erro do servidor MongoDB detectado',
        );
        throw new InternalServerErrorException(
          'Erro interno do banco de dados',
        );
      } else if (error.code === 'ECONNREFUSED') {
        this.logger.error('FindItemsHandler - Conexão recusada pelo MongoDB');
        throw new InternalServerErrorException('Banco de dados indisponível');
      }

      // Se já é um erro HTTP conhecido, re-throw
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      // Para outros erros, log e throw um erro genérico
      this.logger.error('FindItemsHandler - Erro não tratado:', error);
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }
}
