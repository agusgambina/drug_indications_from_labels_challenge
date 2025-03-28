import { Controller, Get, Query } from '@nestjs/common';
import {
  DrugIndicationService,
  ProgramOutput,
} from '../services/drug-indication.service';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

@Controller('drug-indications')
export class DrugIndicationController {
  constructor(private readonly drugIndicationService: DrugIndicationService) {}

  @Get()
  async getDrugIndications(
    @Query('drugName') drugName?: string,
  ): Promise<ApiResponse<ProgramOutput>> {
    try {
      const drugIndications =
        await this.drugIndicationService.parseAndInferDrugIndications(drugName);
      return {
        success: true,
        data: drugIndications,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
