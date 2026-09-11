/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-012 -- Cash Drawer Management
 * FILE TYPE:    CONTROLLER
 * MODULE:       cash-drawer
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       CODER-085
 * GENERATED:    2026-03-17T13:10:40.374Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  UsePipes,
  ValidationPipe,
  Req,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { CashDrawerService } from './cash-drawer.service';
import { CreateCashDrawerDto, UpdateCashDrawerDto, DepositWithdrawalDto, CloseCashDrawerDto } from './dto/cash-drawer.dto';

type RequestWithUser = any;

@ApiBearerAuth()
@ApiTags('Cash Drawers')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('cash-drawers')
export class CashDrawerController {
  constructor(private readonly cashDrawerService: CashDrawerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new cash drawer' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The cash drawer has been successfully created.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  async create(
    @Req() req: RequestWithUser,
    @Body() createCashDrawerDto: CreateCashDrawerDto,
  ) {
    return (this.cashDrawerService as any).create(req.user.tenantId, req.user.userId, createCashDrawerDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all cash drawers for the tenant' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrieved cash drawers.' })
  async findAll(@Req() req: RequestWithUser) {
    return (this.cashDrawerService as any).findAll(req.user.tenantId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a specific cash drawer by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrieved cash drawer.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cash drawer not found.' })
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return (this.cashDrawerService as any).findOne(req.user.tenantId, id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing cash drawer' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The cash drawer has been successfully updated.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cash drawer not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateCashDrawerDto: UpdateCashDrawerDto,
  ) {
    return (this.cashDrawerService as any).update(req.user.tenantId, req.user.userId, id, updateCashDrawerDto);
  }

  @Patch(':id/deposit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deposit funds into a cash drawer' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Funds successfully deposited.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cash drawer not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid amount or drawer is closed.' })
  async deposit(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() depositDto: DepositWithdrawalDto,
  ) {
    return (this.cashDrawerService as any).deposit(req.user.tenantId, req.user.userId, id, depositDto);
  }

  @Patch(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw funds from a cash drawer' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Funds successfully withdrawn.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cash drawer not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid amount, insufficient funds, or drawer is closed.' })
  async withdraw(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() withdrawalDto: DepositWithdrawalDto,
  ) {
    return (this.cashDrawerService as any).withdraw(req.user.tenantId, req.user.userId, id, withdrawalDto);
  }

  @Patch(':id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close a cash drawer' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cash drawer successfully closed.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cash drawer not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Drawer already closed or invalid final balance.' })
  async close(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() closeDto: CloseCashDrawerDto,
  ) {
    return (this.cashDrawerService as any).closeCashDrawer(req.user.tenantId, req.user.userId, id, closeDto);
  }

  @Patch(':id/open')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Open a cash drawer' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cash drawer successfully opened.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cash drawer not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Drawer already open.' })
  async open(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return (this.cashDrawerService as any).openCashDrawer(req.user.tenantId, req.user.userId, id);
  }
}




