import { Controller, Get, Query } from '@nestjs/common';
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
  async getDrugIndications(
    @Query('drugName') drugName?: string,
  ): Promise<ApiResponse<DrugIndication | DrugIndication[]>> {
    try {
      if (drugName) {
        const drugIndication =
          await this.drugIndicationService.getDrugIndicationsByName(drugName);
        if (!drugIndication) {
          return {
            success: false,
            error: `Drug "${drugName}" not found`,
          };
        }
        return {
          success: true,
          data: drugIndication,
        };
      }

      return {
        success: false,
        error: 'Drug name is required to parse and infer drug indications',
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
