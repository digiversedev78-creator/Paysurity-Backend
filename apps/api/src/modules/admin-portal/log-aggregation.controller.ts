import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { LogAggregationService, GetLogAggregationDto, GetLogsDto } from './log-aggregation.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Admin/Log Aggregation')
@ApiBearerAuth()
@Controller('admin/log-aggregation')
export class LogAggregationController {
  constructor(private readonly logAggregationService: LogAggregationService) {}

  @Get('/')
  @ApiOperation({ summary: 'Retrieve aggregated logs for admin' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved aggregated logs.' })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., invalid date range).' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiQuery({ name: 'startDate', type: String, required: false, description: 'Start date for log aggregation (ISO 8601 string)' })
  @ApiQuery({ name: 'endDate', type: String, required: false, description: 'End date for log aggregation (ISO 8601 string)' })
  @ApiQuery({ name: 'level', type: String, required: false, description: 'Log level (e.g., INFO, WARN, ERROR, DEBUG, VERBOSE)' })
  @ApiQuery({ name: 'serviceName', type: String, required: false, description: 'Name of the service that generated the log' })
  @ApiQuery({ name: 'userId', type: String, required: false, description: 'ID of the user related to the log' })
  @ApiQuery({ name: 'entityType', type: String, required: false, description: 'Type of entity involved (e.g., User, Payment, Transaction)' })
  @ApiQuery({ name: 'entityId', type: String, required: false, description: 'ID of the entity involved' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Maximum number of logs to return', example: 50 })
  @ApiQuery({ name: 'offset', type: Number, required: false, description: 'Offset for pagination', example: 0 })
  async getAggregatedLogs(@Query() query: GetLogAggregationDto) {
    if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format for startDate or endDate. Use ISO 8601.');
      }
      if (startDate > endDate) {
        throw new BadRequestException('startDate cannot be after endDate');
      }
    }
    return (this.logAggregationService as any).getAggregatedLogs(query);
  }

  /**
   * GET /admin/log-aggregation/logs
   * Returns paginated individual audit-log rows for the Live Audit Feed.
   */
  @Get('logs')
  @ApiOperation({ summary: 'Retrieve individual audit log events for the live feed' })
  @ApiResponse({ status: 200, description: 'Paginated audit log events.' })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', type: Number, required: false, example: 50 })
  @ApiQuery({ name: 'userId', type: String, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  async getLogs(@Query() query: GetLogsDto) {
    return (this.logAggregationService as any).getLogs({ ...query, pageSize: Math.min(query.pageSize ?? 50, 100) });
  }
}

