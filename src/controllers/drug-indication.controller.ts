import { Controller, Get } from '@nestjs/common';
import { DrugIndicationService } from '../services/drug-indication.service';

interface DrugIndication {
  drug: string;
  indications: string[];
  inferredIndications?: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

@Controller('drug-indications')
export class DrugIndicationController {
  constructor(private readonly drugIndicationService: DrugIndicationService) {}

  @Get()
  async getDrugIndications(): Promise<ApiResponse<DrugIndication[]>> {
    try {
      const drugIndications =
        await this.drugIndicationService.parseAndInferDrugIndications();
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
