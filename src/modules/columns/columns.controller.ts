import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
@ApiTags('columns') // Swagger tag for this controller
@Controller('columns')
@UseGuards(JwtAuthGuard)
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new column' })
  create(@Body() createColumnDto: CreateColumnDto, @CurrentUser() user: any) {
    return this.columnsService.create(createColumnDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all columns by board ID' })
  findAllByBoard(@Query('boardId', ParseIntPipe) boardId: number, @CurrentUser() user: any) {
    return this.columnsService.findAllByBoard(boardId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single column by ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.columnsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a column by ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateColumnDto: UpdateColumnDto,
    @CurrentUser() user: any,
  ) {
    return this.columnsService.update(id, updateColumnDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a column by ID' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.columnsService.remove(id, user);
  }
}