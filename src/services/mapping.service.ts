import { Injectable } from '@nestjs/common';
import { DrugIndicationService } from './drug-indication.service';

interface ICD10Mapping {
  code: string;
  description: string;
  synonyms: string[];
}

interface MappedIndication {
  indication: string;
  icd10Codes: ICD10Mapping[];
  confidence: number;
}

interface DrugIndicationWithICD10 {
  drug: string;
  indications: string[];
  mappedIndications: MappedIndication[];
}

@Injectable()
export class MappingService {
  private readonly icd10Mappings: Map<string, ICD10Mapping[]> = new Map();

  constructor(private readonly drugIndicationService: DrugIndicationService) {
    this.initializeICD10Mappings();
  }

  private initializeICD10Mappings() {
    // Example mappings - in a real implementation, this would come from a database or external API
    this.icd10Mappings.set('Asthma', [
      {
        code: 'J45.901',
        description: 'Unspecified asthma with (acute) exacerbation',
        synonyms: ['Bronchial Asthma', 'Asthma Attack'],
      },
    ]);

    this.icd10Mappings.set('Chronic Obstructive Pulmonary Disease (COPD)', [
      {
        code: 'J44.9',
        description: 'Chronic obstructive pulmonary disease, unspecified',
        synonyms: ['COPD', 'Chronic Bronchitis', 'Emphysema'],
      },
    ]);

    this.icd10Mappings.set('Dermatology - Dermatitis / Eczema / Rosacea', [
      {
        code: 'L30.9',
        description: 'Dermatitis, unspecified',
        synonyms: ['Eczema', 'Dermatitis', 'Rosacea'],
      },
      {
        code: 'L71.9',
        description: 'Rosacea, unspecified',
        synonyms: ['Acne Rosacea', 'Rosacea'],
      },
    ]);

    this.icd10Mappings.set('Severe Asthma', [
      {
        code: 'J45.902',
        description: 'Severe asthma with (acute) exacerbation',
        synonyms: ['Severe Persistent Asthma', 'Refractory Asthma'],
      },
    ]);

    this.icd10Mappings.set('Dermatology - Atopic Dermatitis', [
      {
        code: 'L20.9',
        description: 'Atopic dermatitis, unspecified',
        synonyms: ['Atopic Eczema', 'AD', 'Eczema'],
      },
    ]);

    this.icd10Mappings.set(
      'Chronic Rhinosinusitis with Nasal Polyposis (CRSwNP)',
      [
        {
          code: 'J33.8',
          description: 'Other polyp of sinus',
          synonyms: ['CRSwNP', 'Nasal Polyps', 'Chronic Sinusitis with Polyps'],
        },
      ],
    );

    this.icd10Mappings.set('Eosinophilic Esophagitis', [
      {
        code: 'K20.0',
        description: 'Eosinophilic esophagitis',
        synonyms: ['EoE', 'Allergic Esophagitis'],
      },
    ]);

    this.icd10Mappings.set('Dermatology - Prurigo Nodularis (PN)', [
      {
        code: 'L28.1',
        description: 'Prurigo nodularis',
        synonyms: ['PN', "Hyde's Disease", 'Nodular Prurigo'],
      },
    ]);

    // Add more mappings as needed
  }

  private findBestMatch(indication: string): MappedIndication {
    let bestMatch: MappedIndication | null = null;
    let highestConfidence = 0;

    for (const [key, mappings] of this.icd10Mappings) {
      // Check exact match
      if (key.toLowerCase() === indication.toLowerCase()) {
        return {
          indication: key,
          icd10Codes: mappings,
          confidence: 1.0,
        };
      }

      // Check synonyms
      for (const mapping of mappings) {
        const synonymMatch = mapping.synonyms.some(
          (synonym) => synonym.toLowerCase() === indication.toLowerCase(),
        );
        if (synonymMatch) {
          return {
            indication: key,
            icd10Codes: mappings,
            confidence: 0.9,
          };
        }
      }

      // Check partial matches
      const words = indication.toLowerCase().split(/\s+/);
      const keyWords = key.toLowerCase().split(/\s+/);
      const commonWords = words.filter((word) => keyWords.includes(word));
      const confidence =
        commonWords.length / Math.max(words.length, keyWords.length);

      if (confidence > highestConfidence && confidence > 0.5) {
        highestConfidence = confidence;
        bestMatch = {
          indication: key,
          icd10Codes: mappings,
          confidence,
        };
      }
    }

    return (
      bestMatch || {
        indication,
        icd10Codes: [],
        confidence: 0,
      }
    );
  }

  async mapDrugIndicationsToICD10(
    drugName: string,
  ): Promise<DrugIndicationWithICD10 | null> {
    const drugIndication =
      await this.drugIndicationService.getDrugIndicationsByName(drugName);
    if (!drugIndication) {
      return null;
    }

    const mappedIndications = drugIndication.indications.map((indication) =>
      this.findBestMatch(indication),
    );

    return {
      drug: drugIndication.drug,
      indications: drugIndication.indications,
      mappedIndications,
    };
  }

  async mapIndicationToICD10(indication: string): Promise<MappedIndication> {
    // In a real implementation, this might involve async operations like API calls
    // For now, we'll just return the synchronous result
    return Promise.resolve(this.findBestMatch(indication));
  }
}
