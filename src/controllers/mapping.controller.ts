import { Controller, Get, Query } from '@nestjs/common';
import { MappingService, MappingResponse } from '../services/mapping.service';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

@Controller('mapping')
export class MappingController {
  constructor(private readonly mappingService: MappingService) {}

  @Get()
  async getMapping(
    @Query('setid') setid: string,
    @Query('drugName') drugName: string,
  ): Promise<ApiResponse<MappingResponse>> {
    try {
      const mapping = await this.mappingService.getMapping(setid, drugName);
      return {
        success: true,
        data: mapping,
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
