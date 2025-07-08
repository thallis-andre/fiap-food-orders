import { Controller, Get, Query } from '@nestjs/common';
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
    const result = await this.queryBus.execute<FindItemsQuery, FindItemsResult>(
      new FindItemsQuery(query),
    );

    return result;
  }
}
