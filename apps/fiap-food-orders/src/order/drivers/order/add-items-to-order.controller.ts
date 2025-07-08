import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AddItemsToOrderCommand } from '../../application/order/commands/add-items-to-order.command';
import { AddItemsToOrderInput } from '../../application/order/dtos/add-items-to-order.input';
import { ObjectIdValidationPipe } from '../../infra/pipes/object-id-validation.pipe';

@ApiTags('Orders')
@Controller({ version: '1', path: 'orders' })
export class AddItemsToOrderController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Adds items to existing order',
    description: 'Adds items to existing order',
  })
  @ApiNoContentResponse()
  @ApiBadRequestResponse()
  @ApiUnprocessableEntityResponse()
  @ApiInternalServerErrorResponse()
  async execute(
    @Param('id', new ObjectIdValidationPipe()) id: string,
    @Body() data: AddItemsToOrderInput,
  ) {
    data.id = id;
    await this.commandBus.execute(new AddItemsToOrderCommand(data));
  }
}
