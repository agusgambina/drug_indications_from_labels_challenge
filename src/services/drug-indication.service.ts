import { Injectable } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import * as fs from 'fs';
import * as path from 'path';

interface DrugIndication {
  drug: string;
  indications: string[];
  inferredIndications?: string[];
}

interface DupixentJsonData {
  Drugs: string[];
  TherapeuticAreas: string[];
}

@Injectable()
export class DrugIndicationService {
  constructor(private readonly ollamaService: OllamaService) {}

  /**
   * Parse the drug indication JSON file and infer missing information using Ollama
   * @returns Promise containing the parsed and inferred drug indications
   */
  async parseAndInferDrugIndications(): Promise<DrugIndication[]> {
    try {
      // Read and parse the JSON file
      const jsonPath = path.join(process.cwd(), 'challenge', 'dupixent.json');
      const jsonData = JSON.parse(
        fs.readFileSync(jsonPath, 'utf-8'),
      ) as DupixentJsonData;

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
          if (ollamaResponse && ollamaResponse.response) {
            const inferredIndications = ollamaResponse.response
              .split(',')
              .map((indication: string) => indication.trim())
              .filter((indication: string) => indication.length > 0);

            drugIndication.inferredIndications = inferredIndications;
          }
        } catch (error) {
          console.error(
            `Failed to infer indications for ${drugIndication.drug}:`,
            error,
          );
        }
      }

      return drugIndications;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to parse drug indications: ${errorMessage}`);
    }
  }
}
