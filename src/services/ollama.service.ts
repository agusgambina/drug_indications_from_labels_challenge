import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

interface OllamaStreamResponse {
  model: string;
  response: string;
  done: boolean;
}

@Injectable()
export class OllamaService {
  private readonly baseUrl = 'http://localhost:11434';

  constructor() {}

  /**
   * Generate a response from Ollama using a specific model
   * @param model The name of the model to use (e.g., 'llama2', 'mistral')
   * @param prompt The input prompt
   * @param options Additional options for the generation
   * @returns The generated response
   */
  async generate(
    model: string,
    prompt: string,
    options: Record<string, unknown> = {},
  ): Promise<OllamaResponse> {
    try {
      const response = await axios.post<OllamaStreamResponse | OllamaStreamResponse[]>(
        `${this.baseUrl}/api/generate`,
        {
          model,
          prompt,
          ...options,
        },
      );
      
      // Handle streaming response
      if (Array.isArray(response.data)) {
        // Combine all response chunks into a single response
        const combinedResponse = response.data.reduce<OllamaResponse>((acc, chunk) => {
          if (chunk.response) {
            acc.response = (acc.response || '') + chunk.response;
          }
          return acc;
        }, { model, response: '', done: true });
        
        return combinedResponse;
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to generate response from Ollama: ${errorMessage}`,
      );
    }
  }

  /**
   * List all available models
   * @returns List of available models
   */
  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await axios.get<{ models: OllamaModel[] }>(
        `${this.baseUrl}/api/tags`,
      );
      return response.data.models;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to list models from Ollama: ${errorMessage}`);
    }
  }

  /**
   * Pull a model from Ollama
   * @param model The name of the model to pull
   * @returns Status of the pull operation
   */
  async pullModel(model: string): Promise<{ status: string }> {
    try {
      const response = await axios.post<{ status: string }>(
        `${this.baseUrl}/api/pull`,
        {
          name: model,
        },
      );
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to pull model from Ollama: ${errorMessage}`);
    }
  }

  /**
   * Check if a model is available locally
   * @param model The name of the model to check
   * @returns Whether the model is available
   */
  async isModelAvailable(model: string): Promise<boolean> {
    try {
      const models = await this.listModels();
      return models.some((m) => m.name === model);
    } catch {
      return false;
    }
  }
} 