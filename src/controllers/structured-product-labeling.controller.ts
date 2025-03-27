import {
  Controller,
  Get,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { StructuredProductLabelingService } from '../services/structured-product-labeling.service';
import { SPLResponse } from '../services/structured-product-labeling.service';

@Controller('structured-product-labeling')
export class StructuredProductLabelingController {
  constructor(
    private readonly structuredProductLabelingService: StructuredProductLabelingService,
  ) {}

  @Get()
  async getBySetId(@Query('setid') setId: string): Promise<SPLResponse> {
    if (!setId || setId.trim().length === 0) {
      throw new BadRequestException('Invalid setid format');
    }

    try {
      const result = await this.structuredProductLabelingService.findBySetId(setId);

      if (!result || !result.data) {
        throw new NotFoundException(
          `No product labeling found for setid: ${setId}`,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error processing request');
    }
  }
}
