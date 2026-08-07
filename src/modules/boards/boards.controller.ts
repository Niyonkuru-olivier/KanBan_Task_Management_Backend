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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
@ApiTags('boards')
@ApiBearerAuth() // For JWT guarded
@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a board' })
  @ApiResponse({ status: 201, description: 'Board created' })
  create(@Body() createBoardDto: CreateBoardDto, @CurrentUser() user: any) {
    return this.boardsService.create(createBoardDto, user);
  }

  @Get('workspace/:workspaceId')
  @ApiOperation({ summary: 'Get boards by workspace' })
  findAllByWorkspace(@Param('workspaceId') workspaceId: number, @CurrentUser() user: any) {
    return this.boardsService.findAllByWorkspace(workspaceId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one board' })
  findOne(@Param('id') id: number, @CurrentUser() user: any) {
    return this.boardsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a board' })
  patchBoard(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBoardDto,
    @CurrentUser() user: any,
  ) {
    return this.boardsService.update(id, dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Replace a board' })
  putBoard(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBoardDto,
    @CurrentUser() user: any,
  ) {
    return this.boardsService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a board' })
  remove(@Param('id') id: number, @CurrentUser() user: any) {
    return this.boardsService.remove(id, user);
  }

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get activity logs for a board' })
  getBoardActivity(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.boardsService.getBoardActivity(id, user);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get analytics for a board' })
  getBoardAnalytics(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.boardsService.getBoardAnalytics(id, user);
  }
}
