import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Item } from '../../application/item/dtos/item.dto';
import {
  GetItemByIdQuery,
  GetItemByIdResult,
} from '../../application/item/queries/get-item-by-id.query';
import { ObjectIdValidationPipe } from '../../infra/pipes/object-id-validation.pipe';

@ApiTags('Items')
@Controller({ version: '1', path: 'items' })
export class GetItemByIdController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Find an item with its id',
    description: 'Returns an existing item by querying it with its id',
  })
  @ApiOkResponse({ type: Item })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  async execute(@Param('id', new ObjectIdValidationPipe()) id: string) {
    const result = await this.queryBus.execute<
      GetItemByIdQuery,
      GetItemByIdResult
    >(new GetItemByIdQuery(id));

    return result.data;
  }
}
