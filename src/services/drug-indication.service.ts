import { Injectable } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import * as fs from 'fs';
import * as path from 'path';

interface DrugIndication {
  drug: string;
  indications: string[];
  inferredIndications?: string[];
}

interface DrugJsonData {
  Drugs: string[];
  TherapeuticAreas: string[];
}

@Injectable()
export class DrugIndicationService {
  constructor(private readonly ollamaService: OllamaService) {}

  /**
   * Parse the drug indication JSON file and infer missing information using Ollama
   * @param drugName The name of the drug to process
   * @returns Promise containing the parsed and inferred drug indications
   */
  async parseAndInferDrugIndications(
    drugName: string,
  ): Promise<DrugIndication[]> {
    try {
      // Read and parse the JSON file
      const jsonPath = path.join(
        process.cwd(),
        'challenge',
        `${drugName.toLowerCase()}.json`,
      );
      const jsonData = JSON.parse(
        fs.readFileSync(jsonPath, 'utf-8'),
      ) as DrugJsonData;

      // Extract drugs and therapeutic areas
      const drugs = jsonData.Drugs || [];
      const therapeuticAreas = jsonData.TherapeuticAreas || [];

      // Create drug indication objects
      const drugIndications: DrugIndication[] = drugs.map((drug: string) => ({
        drug,
        indications: therapeuticAreas,
      }));

      // Use Ollama to infer additional indications
      for (const drugIndication of drugIndications) {
        const prompt = `Based on the drug "${drugIndication.drug}" and its known indications: ${drugIndication.indications.join(', ')}. 
        What are additional potential indications or uses for this drug? Consider related conditions and off-label uses. 
        Please provide a list of potential indications, separated by commas.`;

        try {
          const ollamaResponse = await this.ollamaService.generate(
            'llama2',
            prompt,
          );

          if (ollamaResponse?.response) {
            drugIndication.inferredIndications = ollamaResponse.response
              .split(',')
              .map((indication: string) => indication.trim())
              .filter(Boolean);
          } else {
            console.warn(
              `No response received from Ollama for ${drugIndication.drug}`,
            );
            drugIndication.inferredIndications = therapeuticAreas;
          }
        } catch (error) {
          console.error(
            `Error inferring indications for ${drugIndication.drug}:`,
            error,
          );
          drugIndication.inferredIndications = [];
        }
      }

      return drugIndications;
    } catch (error) {
      console.error('Error parsing drug indications:', error);
      throw error;
    }
  }

  /**
   * Get drug indications for a specific drug
   * @param drugName The name of the drug to get indications for
   * @returns Promise containing the drug indication for the specified drug
   */
  async getDrugIndicationsByName(
    drugName: string,
  ): Promise<DrugIndication | null> {
    const allIndications = await this.parseAndInferDrugIndications(drugName);
    return (
      allIndications.find(
        (drug) => drug.drug.toLowerCase() === drugName.toLowerCase(),
      ) || null
    );
  }
}
