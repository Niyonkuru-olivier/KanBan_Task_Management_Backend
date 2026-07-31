import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('boards')
@ApiBearerAuth() // For JWT guarded
@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a board' })
  @ApiResponse({ status: 201, description: 'Board created' })
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(createBoardDto);
  }

  @Get('workspace/:workspaceId')
  @ApiOperation({ summary: 'Get boards by workspace' })
  findAllByWorkspace(@Param('workspaceId') workspaceId: number) {
    return this.boardsService.findAllByWorkspace(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one board' })
  findOne(@Param('id') id: number) {
    return this.boardsService.findOne(id);
  }

  @Patch(':id')
@ApiOperation({ summary: 'Partially update a board' })
patchBoard(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateBoardDto,
) {
  return this.boardsService.update(id, dto);
}

@Put(':id')
@ApiOperation({ summary: 'Replace a board' })
putBoard(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateBoardDto,
) {
  return this.boardsService.update(id, dto);
}

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a board' })
  remove(@Param('id') id: number) {
    return this.boardsService.remove(id);
  }
}
