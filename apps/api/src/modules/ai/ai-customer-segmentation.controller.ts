import { Controller, Post, Get, Put, Delete, Param, Body, NotFoundException, ParseUUIDPipe, HttpStatus, HttpCode, createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AiCustomerSegmentationService } from './ai-customer-segmentation.service';
type CreateAiCustomerSegmentationDto = any; type UpdateAiCustomerSegmentationDto = any; type AiCustomerSegmentationDto = any;

// Custom decorator to extract companyId from the authenticated user's payload
const CurrentCompanyId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Assuming the JWT payload, after authentication, attaches user information to req.user
    // and that the user object contains a companyId field, which serves as the tenantId.
    return request.user?.companyId;
  },
);

@Controller('ai') // Changed base path to 'ai' to cover all requested analytics routes
export class AiCustomerSegmentationController {
  constructor(private readonly aiCustomerSegmentationService: AiCustomerSegmentationService) {}

  /**
   * Creates a new AI customer segmentation definition.
   * Path: POST /ai/customer-segmentation
   * @param companyId The ID of the company making the request (extracted from JWT).
   * @param createDto The data transfer object containing the details for the new segmentation.
   * @returns The created AI customer segmentation object.
   */
  @Post('customer-segmentation')
  async create(
    @CurrentCompanyId() companyId: string,
    @Body() createDto: CreateAiCustomerSegmentationDto,
  ) {
    if (!companyId) {
      throw new NotFoundException('Company ID not found in authentication token.');
    }
    return (this.aiCustomerSegmentationService as any).create(companyId, createDto);
  }

  /**
   * Retrieves all AI customer segmentation definitions for the authenticated company.
   * Path: GET /ai/customer-segmentation
   * @param companyId The ID of the company making the request (extracted from JWT).
   * @returns An array of AI customer segmentation objects.
   */
  @Get('customer-segmentation')
  async findAll(@CurrentCompanyId() companyId: string) {
    if (!companyId) {
      throw new NotFoundException('Company ID not found in authentication token.');
    }
    return (this.aiCustomerSegmentationService as any).findAll(companyId);
  }

  /**
   * Retrieves a single AI customer segmentation definition by its ID.
   * Path: GET /ai/customer-segmentation/:id
   * @param companyId The ID of the company making the request (extracted from JWT).
   * @param id The UUID of the segmentation definition to retrieve.
   * @returns The AI customer segmentation object if found.
   * @throws NotFoundException if the segmentation with the given ID is not found for the company.
   */
  @Get('customer-segmentation/:id')
  async findOne(
    @CurrentCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (!companyId) {
      throw new NotFoundException('Company ID not found in authentication token.');
    }
    const segmentation = await (this.aiCustomerSegmentationService as any).findOne(companyId, id);
    if (!segmentation) {
      throw new NotFoundException(`AI Customer Segmentation with ID "${id}" not found.`);
    }
    return segmentation;
  }

  /**
   * Updates an existing AI customer segmentation definition.
   * Path: PUT /ai/customer-segmentation/:id
   * @param companyId The ID of the company making the request (extracted from JWT).
   * @param id The UUID of the segmentation definition to update.
   * @param updateDto The data transfer object containing the updated details for the segmentation.
   * @returns The updated AI customer segmentation object.
   * @throws NotFoundException if the segmentation with the given ID is not found for the company.
   */
  @Put('customer-segmentation/:id')
  async update(
    @CurrentCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAiCustomerSegmentationDto,
  ) {
    if (!companyId) {
      throw new NotFoundException('Company ID not found in authentication token.');
    }
    const updatedSegmentation = await (this.aiCustomerSegmentationService as any).update(companyId, id, updateDto);
    if (!updatedSegmentation) {
      throw new NotFoundException(`AI Customer Segmentation with ID "${id}" not found.`);
    }
    return updatedSegmentation;
  }

  /**
   * Deletes an AI customer segmentation definition.
   * Path: DELETE /ai/customer-segmentation/:id
   * @param companyId The ID of the company making the request (extracted from JWT).
   * @param id The UUID of the segmentation definition to delete.
   * @returns No content on successful deletion.
   * @throws NotFoundException if the segmentation with the given ID is not found for the company.
   */
  @Delete('customer-segmentation/:id')
  @HttpCode(HttpStatus.NO_CONTENT) // Indicate successful deletion with 204 No Content
  async remove(
    @CurrentCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (!companyId) {
      throw new NotFoundException('Company ID not found in authentication token.');
    }
    const deleted = await (this.aiCustomerSegmentationService as any).remove(companyId, id);
    if (!deleted) {
      throw new NotFoundException(`AI Customer Segmentation with ID "${id}" not found.`);
    }
    // No content is returned for 204
  }
}

