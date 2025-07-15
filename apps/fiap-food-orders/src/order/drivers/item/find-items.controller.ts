import { Controller, Get, Logger, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { FindItemsInput } from '../../application/item/dtos/find-items.input';
import { Item } from '../../application/item/dtos/item.dto';
import {
    FindItemsQuery,
    FindItemsResult,
} from '../../application/item/queries/find-items.query';

@ApiTags('Items')
@Controller({ version: '1', path: 'items' })
export class FindItemsController {
  private readonly logger = new Logger(FindItemsController.name);

  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({
    summary: 'Searches for existing items',
    description:
      'Seaches for items using a given criteria or returns everything',
  })
  @ApiOkResponse({ type: [Item] })
  @ApiInternalServerErrorResponse()
  async execute(@Query() query: FindItemsInput) {
    try {
      this.logger.log('FindItemsController - Requisição recebida');
      this.logger.log(
        `FindItemsController - Query parameters: ${JSON.stringify(query)}`,
      );
      this.logger.log(
        `FindItemsController - Request headers: ${JSON.stringify(process.env.LOG_LEVEL === 'debug' ? 'headers omitidos para brevidade' : 'disponível em debug')}`,
      );

      this.logger.log('FindItemsController - Executando query via QueryBus');
      const result = await this.queryBus.execute<
        FindItemsQuery,
        FindItemsResult
      >(new FindItemsQuery(query));

      this.logger.log(
        `FindItemsController - Query executada com sucesso. Dados retornados: ${result?.data?.length || 0} items`,
      );
      this.logger.log(
        `FindItemsController - Estrutura do resultado: ${JSON.stringify(result?.data?.[0] || 'nenhum item')}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        'FindItemsController - Erro durante a execução:',
        error,
      );
      this.logger.error(`FindItemsController - Stack trace: ${error.stack}`);
      this.logger.error(
        `FindItemsController - Mensagem de erro: ${error.message}`,
      );
      this.logger.error(
        `FindItemsController - Tipo de erro: ${error.constructor.name}`,
      );
      throw error;
    }
  }
}
