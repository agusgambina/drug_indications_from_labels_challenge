import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { StructuredProductLabelingService } from '../services/structured-product-labeling.service';
import { SPLResponse } from '../services/structured-product-labeling.service';
import { OllamaService } from '../services/ollama.service';
import { DailyMedService } from '../external/dailymed.service';

@Controller('structured-product-labeling')
export class StructuredProductLabelingController {
  constructor(
    private readonly structuredProductLabelingService: StructuredProductLabelingService,
    private readonly ollamaService: OllamaService,
    private readonly dailyMedService: DailyMedService,
  ) {}

  @Get('by-drug-name')
  async getByDrugName(@Query('setid') drugName: string): Promise<SPLResponse> {
    if (!drugName || drugName.trim().length === 0) {
      throw new BadRequestException('Drug name is required');
    }

    try {
      const setId = await this.dailyMedService.getSetIdByDrugName(drugName);
      const result = await this.structuredProductLabelingService.findBySetId(setId);

      if (!result || !result.data) {
        throw new NotFoundException(
          `No product labeling found for drug: ${drugName}`,
        );
      }

      return result;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error processing request');
    }
  }

  @Get()
  async getBySetId(@Query('setid') setId: string): Promise<SPLResponse> {
    if (!setId || setId.trim().length === 0) {
      throw new BadRequestException('Invalid setid format');
    }

    try {
      const result =
        await this.structuredProductLabelingService.findBySetId(setId);

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

  @Post('generate')
  async generateResponse(
    @Body() body: { model: string; prompt: string },
  ): Promise<{ response: string }> {
    if (!body.model || !body.prompt) {
      throw new BadRequestException('Model and prompt are required');
    }

    try {
      // Check if the model is available
      const isAvailable = await this.ollamaService.isModelAvailable(body.model);
      if (!isAvailable) {
        // Pull the model if it's not available
        await this.ollamaService.pullModel(body.model);
      }

      // Generate the response
      const result = await this.ollamaService.generate(body.model, body.prompt);
      return { response: result.response };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Error generating response',
      );
    }
  }
}
