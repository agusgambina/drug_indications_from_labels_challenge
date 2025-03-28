import { Injectable } from '@nestjs/common';
import { StructuredProductLabelingService } from './structured-product-labeling.service';
import {
  DrugIndicationService,
  ProgramOutput,
} from './drug-indication.service';

export interface ICD10Mapping {
  code: string;
  description: string;
  confidence: number;
}

export interface MappingResponse {
  setid: string;
  drugName?: string;
  indications: {
    original: string;
    icd10Codes: ICD10Mapping[];
    unmappedTerms?: string[];
  }[];
  lastUpdateDate: string;
  eligibilityRequirements?: {
    name: string;
    value: string;
  }[];
}

@Injectable()
export class MappingService {
  constructor(
    private readonly splService: StructuredProductLabelingService,
    private readonly drugIndicationService: DrugIndicationService,
  ) {}

  async getMapping(setid: string, drugName?: string): Promise<MappingResponse> {
    // Get the SPL data
    const splData = await this.splService.findBySetId(setid);

    // Extract individual indications from the text
    const indications = this.extractIndividualIndications(
      splData.data.indications,
    );

    // Map each indication to ICD-10 codes
    const mappedIndications = await Promise.all(
      indications.map(async (indication) => {
        const icd10Codes = await this.mapToICD10(indication);
        const unmappedTerms = this.extractUnmappedTerms(indication, icd10Codes);

        return {
          original: indication,
          icd10Codes,
          ...(unmappedTerms.length > 0 && { unmappedTerms }),
        };
      }),
    );

    // Filter out indications with empty ICD-10 codes
    const filteredIndications = mappedIndications.filter(
      (indication) => indication.icd10Codes.length > 0,
    );

    // Get eligibility requirements if drug name is provided
    let eligibilityRequirements: MappingResponse['eligibilityRequirements'];
    if (drugName) {
      try {
        const programInfo: ProgramOutput =
          await this.drugIndicationService.parseAndInferDrugIndications(
            drugName,
          );
        // Ensure requirements are properly structured
        eligibilityRequirements = programInfo.requirements.map((req) => ({
          name: req.name,
          value: req.value,
        }));
      } catch (error) {
        console.warn('Failed to get eligibility requirements:', error);
        // Continue without eligibility requirements
      }
    }

    const mappingResponse: MappingResponse = {
      setid,
      drugName,
      indications: filteredIndications,
      lastUpdateDate: splData.data.lastUpdateDate,
      ...(eligibilityRequirements && { eligibilityRequirements }),
    };

    // Save the mapping to the database
    await this.splService.saveMapping(mappingResponse);

    return mappingResponse;
  }

  private extractIndividualIndications(indicationsText: string): string[] {
    // Split the text into individual indications based on common patterns
    return indicationsText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => {
        // Skip empty lines and section headers
        if (!line || line.match(/^\d+\.?\d*\s*INDICATIONS?/i)) {
          return false;
        }
        // Skip lines that are just numbers or section markers
        if (line.match(/^\d+\.?\d*$/) || line === '•' || line === '-') {
          return false;
        }
        return true;
      })
      .map((line) => line.replace(/^\d+\.?\d*\s*/, '').trim());
  }

  private mapToICD10(indication: string): Promise<ICD10Mapping[]> {
    // Map common indications to their ICD-10 codes
    const indicationMap: Record<string, ICD10Mapping[]> = {
      'atopic dermatitis': [
        {
          code: 'L20.89',
          description: 'Other atopic dermatitis and related conditions',
          confidence: 0.9,
        },
        {
          code: 'L20.9',
          description: 'Atopic dermatitis, unspecified',
          confidence: 0.8,
        },
      ],
      asthma: [
        {
          code: 'J45.901',
          description: 'Unspecified asthma with (acute) exacerbation',
          confidence: 0.9,
        },
        {
          code: 'J45.902',
          description: 'Unspecified asthma with status asthmaticus',
          confidence: 0.8,
        },
      ],
      'chronic rhinosinusitis with nasal polyps': [
        {
          code: 'J33.9',
          description: 'Nasal polyp, unspecified',
          confidence: 0.9,
        },
        {
          code: 'J32.9',
          description: 'Chronic sinusitis, unspecified',
          confidence: 0.8,
        },
      ],
      'eosinophilic esophagitis': [
        {
          code: 'K20.0',
          description: 'Eosinophilic esophagitis',
          confidence: 0.9,
        },
      ],
      'prurigo nodularis': [
        {
          code: 'L28.1',
          description: 'Prurigo nodularis',
          confidence: 0.9,
        },
      ],
      'chronic obstructive pulmonary disease': [
        {
          code: 'J44.9',
          description: 'Chronic obstructive pulmonary disease, unspecified',
          confidence: 0.9,
        },
      ],
    };

    // Convert indication to lowercase for case-insensitive matching
    const lowerIndication = indication.toLowerCase();

    // Find matching codes based on indication text
    const matches: ICD10Mapping[] = [];

    for (const [key, codes] of Object.entries(indicationMap)) {
      if (lowerIndication.includes(key)) {
        matches.push(...codes);
      }
    }

    // If no matches found, return empty array
    if (matches.length === 0) {
      return Promise.resolve([]);
    }

    return Promise.resolve(matches);
  }

  private extractUnmappedTerms(
    indication: string,
    mappings: ICD10Mapping[],
  ): string[] {
    // Extract medical terms from the indication
    const medicalTerms = indication.match(/\b\w+(?:\s+\w+)*\b/g) || [];

    // If we have mappings, we can consider the terms mapped
    if (mappings.length > 0) {
      return [];
    }

    // Return terms that weren't mapped
    return medicalTerms;
  }
}
