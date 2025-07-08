import { WithRoles } from '@fiap-food/setup';
import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateItemCommand } from '../../application/item/commands/update-item.command';
import { UpdateItemInput } from '../../application/item/dtos/update-item.input';
import { ObjectIdValidationPipe } from '../../infra/pipes/object-id-validation.pipe';

@ApiTags('Items')
@Controller({ version: '1', path: 'items' })
export class UpdateItemController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put(':id')
  @WithRoles('ADMIN')
  @ApiOperation({
    summary: 'Updates an existing item',
    description: 'Updates values of an existing item',
  })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  @HttpCode(204)
  async execute(
    @Param('id', new ObjectIdValidationPipe()) id: string,
    @Body() data: UpdateItemInput,
  ) {
    data.id = id;
    await this.commandBus.execute(new UpdateItemCommand(data));
  }
}
