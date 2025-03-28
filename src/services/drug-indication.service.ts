import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { OllamaService } from './ollama.service';

interface Requirement {
  name: string;
  value: string;
}

interface Benefit {
  name: string;
  value: string;
}

interface Form {
  name: string;
  link: string;
}

interface Funding {
  evergreen: string;
  current_funding_level: string;
}

interface Detail {
  eligibility: string;
  program: string;
  renewal: string;
  income: string;
}

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export interface ProgramOutput {
  program_name: string;
  coverage_eligibilities: string[];
  program_type: string;
  requirements: Requirement[];
  benefits: Benefit[];
  forms: Form[];
  funding: Funding;
  details: Detail[];
}

interface DrugProgramData {
  ProgramName: string;
  CoverageEligibilities: string[];
  AssistanceType: string;
  EligibilityDetails: string;
  AnnualMax: string;
  OfferRenewable: boolean;
  AddRenewalDetails: string;
  ProgramDetails: string;
  IncomeReq: boolean;
  IncomeDetails: string;
  ProgramURL: string;
}

@Injectable()
export class DrugIndicationService {
  constructor(private readonly ollamaService: OllamaService) {}

  /**
   * Parse the drug indication JSON file and return the program information
   * @param drugName Optional drug name to filter results
   * @returns Promise containing the parsed program information
   */
  async parseAndInferDrugIndications(
    drugName?: string,
  ): Promise<ProgramOutput> {
    try {
      // Read and parse the JSON file
      const jsonPath = path.join(
        process.cwd(),
        'challenge',
        `${drugName}.json`,
      );
      const jsonData = await fs.promises.readFile(jsonPath, 'utf-8');
      const programData = JSON.parse(jsonData) as DrugProgramData;

      // Use Ollama to parse and structure eligibility details
      let requirements: Requirement[] = [];
      try {
        const prompt = `Parse the following eligibility details into structured key-value pairs. 
        Focus on extracting specific requirements like age limits, residency requirements, insurance requirements, 
        and any other specific conditions. Format the response as JSON with "name" and "value" pairs.
        
        Eligibility Details:
        ${programData.EligibilityDetails}
        
        Return only the JSON array of requirements, nothing else.`;

        const ollamaResponse = await this.ollamaService.generate(
          'llama2',
          prompt,
        );

        if (ollamaResponse?.response) {
          try {
            // Extract JSON from the response
            const jsonMatch = ollamaResponse.response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const parsedRequirements = JSON.parse(
                jsonMatch[0],
              ) as Requirement[];
              if (Array.isArray(parsedRequirements)) {
                requirements = parsedRequirements;
              }
            }
          } catch (parseError) {
            console.warn(
              'Failed to parse Ollama response as JSON:',
              parseError,
            );
          }
        }
      } catch (error) {
        console.warn(
          'Failed to generate structured requirements from Ollama:',
          error,
        );
        // Fallback to basic parsing if AI parsing fails
        const eligibilityLines = programData.EligibilityDetails.split('\n');
        for (const line of eligibilityLines) {
          if (line.startsWith('-')) {
            const requirement = line.substring(1).trim();
            if (requirement.toLowerCase().includes('us resident')) {
              requirements.push({ name: 'us_residency', value: 'true' });
            }
            if (requirement.toLowerCase().includes('commercial insurance')) {
              requirements.push({ name: 'insurance_coverage', value: 'true' });
            }
            if (requirement.toLowerCase().includes('fda-approved')) {
              requirements.push({ name: 'fda_approved', value: 'true' });
            }
          }
        }
      }

      // Extract benefits from program data
      const benefits: Benefit[] = [];
      if (programData.AnnualMax) {
        const maxSavings = programData.AnnualMax.replace(/[^0-9.]/g, '');
        benefits.push({ name: 'max_annual_savings', value: maxSavings });
      }

      // Extract forms from program data
      const forms: Form[] = [];
      if (programData.ProgramURL) {
        forms.push({
          name: 'Enrollment Form',
          link: programData.ProgramURL,
        });
      }

      // Use Ollama to infer additional details if needed
      let ollamaResponse: OllamaResponse | undefined;
      try {
        ollamaResponse = await this.ollamaService.generate(
          'llama2',
          `Based on the following program details, infer the minimum age requirement if any: ${programData.ProgramDetails}`,
        );
      } catch (error) {
        console.warn('Failed to generate age requirement from Ollama:', error);
        // Continue without age requirement
      }

      // Parse the response to extract minimum age if present
      if (ollamaResponse?.response) {
        const ageMatch = ollamaResponse.response.match(/minimum age.*?(\d+)/i);
        if (ageMatch) {
          requirements.push({ name: 'minimum_age', value: ageMatch[1] });
        }
      }

      // Transform the data to match the expected output schema
      const programOutput: ProgramOutput = {
        program_name: programData.ProgramName,
        coverage_eligibilities: programData.CoverageEligibilities,
        program_type: programData.AssistanceType,
        requirements,
        benefits,
        forms,
        funding: {
          evergreen: programData.OfferRenewable.toString(),
          current_funding_level: 'Data Not Available',
        },
        details: [
          {
            eligibility: programData.EligibilityDetails,
            program: programData.ProgramDetails,
            renewal: programData.AddRenewalDetails,
            income: programData.IncomeReq
              ? programData.IncomeDetails
              : 'Not required',
          },
        ],
      };

      return programOutput;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to parse program information: ${errorMessage}`);
    }
  }
}
