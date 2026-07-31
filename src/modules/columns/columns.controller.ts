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

@ApiTags('columns') // Swagger tag for this controller
@Controller('columns')
@UseGuards(JwtAuthGuard)
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new column' }) // Swagger operation summary
  create(@Body() createColumnDto: CreateColumnDto) {
    return this.columnsService.create(createColumnDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all columns by board ID' }) // Swagger operation summary
  findAllByBoard(@Query('boardId', ParseIntPipe) boardId: number) {
    return this.columnsService.findAllByBoard(boardId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single column by ID' }) // Swagger operation summary
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.columnsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a column by ID' }) // Swagger operation summary
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateColumnDto: UpdateColumnDto,
  ) {
    return this.columnsService.update(id, updateColumnDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a column by ID' }) // Swagger operation summary
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.columnsService.remove(id);
  }
}