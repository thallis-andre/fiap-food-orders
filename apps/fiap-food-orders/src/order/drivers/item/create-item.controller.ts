import { WithRoles } from '@fiap-food/setup';
import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  CreateItemCommand,
  CreateItemResult,
} from '../../application/item/commands/create-item.command';
import { CreateItemInput } from '../../application/item/dtos/create-item.input';
import { CreateItemOutput } from '../../application/item/dtos/create-item.output';

@ApiTags('Items')
@Controller({ version: '1', path: 'items' })
export class CreateItemController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @WithRoles('ADMIN')
  @ApiOperation({
    summary: 'Creates a new Item',
    description:
      'Adds a new item to the list of items that can be used to request an order',
  })
  @ApiCreatedResponse({ type: CreateItemOutput })
  @ApiBadRequestResponse()
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  async execute(@Body() data: CreateItemInput) {
    const result = await this.commandBus.execute<
      CreateItemCommand,
      CreateItemResult
    >(new CreateItemCommand(data));

    return result;
  }
}
