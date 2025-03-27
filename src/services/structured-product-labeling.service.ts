import { Injectable, NotFoundException } from '@nestjs/common';

export interface SPLResponse {
  data: unknown; // We can make this more specific once we know the exact response structure
}

@Injectable()
export class StructuredProductLabelingService {
  private readonly baseUrl =
    'https://dailymed.nlm.nih.gov/dailymed/services/v2';

  async findBySetId(setId: string): Promise<SPLResponse> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/spls/${setId}`);
    } catch (error) {
      throw new Error(
        `Failed to fetch SPL data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundException(
          `No product labeling found for setId: ${setId}`,
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    try {
      const data = (await response.json()) as unknown;
      return { data };
    } catch (error) {
      throw new Error(
        `Failed to parse SPL data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
