import { Injectable } from '@nestjs/common';
import {
  DailyMedService,
  DailyMedResponse,
} from '../external/dailymed.service';

export type SPLResponse = DailyMedResponse;

@Injectable()
export class StructuredProductLabelingService {
  constructor(private readonly dailyMedService: DailyMedService) {}

  async findBySetId(setId: string): Promise<SPLResponse> {
    const productInfo =
      await this.dailyMedService.getProductLabelingBySetId(setId);
    return { data: productInfo };
  }

  async getSetIdByDrugName(drugName: string): Promise<string> {
    return await this.dailyMedService.getSetIdByDrugName(drugName);
  }
}
