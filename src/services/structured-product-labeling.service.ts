import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StructuredProductLabeling } from '../entities/structured-product-labeling.entity';
import {
  DailyMedService,
  DailyMedResponse,
} from '../external/dailymed.service';
import { MappingResponse } from './mapping.service';

export type SPLResponse = DailyMedResponse;

@Injectable()
export class StructuredProductLabelingService {
  constructor(
    private readonly dailyMedService: DailyMedService,
    @InjectRepository(StructuredProductLabeling)
    private readonly splRepository: Repository<StructuredProductLabeling>,
  ) {}

  async findBySetId(setId: string): Promise<SPLResponse> {
    const productInfo =
      await this.dailyMedService.getProductLabelingBySetId(setId);
    return { data: productInfo };
  }

  async saveMapping(
    mapping: MappingResponse,
  ): Promise<StructuredProductLabeling> {
    const existingMapping = await this.splRepository.findOne({
      where: { setId: mapping.setid },
    });

    if (existingMapping) {
      // Update existing mapping
      existingMapping.drugName = mapping.drugName;
      existingMapping.indications = mapping.indications;
      existingMapping.lastUpdateDate = new Date(
        mapping.lastUpdateDate.substring(0, 4) + '-' +
          mapping.lastUpdateDate.substring(4, 6) + '-' +
          mapping.lastUpdateDate.substring(6, 8),
      );
      existingMapping.eligibilityRequirements = mapping.eligibilityRequirements;
      return this.splRepository.save(existingMapping);
    }

    // Create new mapping
    const newMapping = this.splRepository.create({
      setId: mapping.setid,
      drugName: mapping.drugName,
      indications: mapping.indications,
      lastUpdateDate: new Date(
        mapping.lastUpdateDate.substring(0, 4) + '-' +
          mapping.lastUpdateDate.substring(4, 6) + '-' +
          mapping.lastUpdateDate.substring(6, 8),
      ),
      eligibilityRequirements: mapping.eligibilityRequirements,
    });

    return this.splRepository.save(newMapping);
  }

  async getMapping(setId: string): Promise<StructuredProductLabeling | null> {
    return this.splRepository.findOne({
      where: { setId },
    });
  }
}
