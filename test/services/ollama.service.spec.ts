import { Test, TestingModule } from '@nestjs/testing';
import { OllamaService } from '../../src/services/ollama.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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

describe('OllamaService', () => {
  let service: OllamaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OllamaService],
    }).compile();

    service = module.get<OllamaService>(OllamaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('should successfully generate a response', async () => {
      const mockResponse: OllamaResponse = {
        model: 'llama2',
        response: 'Test response',
        done: true,
      };
      const axiosResponse = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          url: 'http://localhost:11434/api/generate',
          method: 'post',
          headers: {},
          data: {},
        },
      };
      mockedAxios.post.mockResolvedValueOnce(axiosResponse);

      const result = await service.generate('llama2', 'Test prompt');

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:11434/api/generate',
        {
          model: 'llama2',
          prompt: 'Test prompt',
        },
      );
    });

    it('should handle errors during generation', async () => {
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(service.generate('llama2', 'Test prompt')).rejects.toThrow(
        'Failed to generate response from Ollama: Network error',
      );
    });

    it('should include additional options in the request', async () => {
      const mockResponse: OllamaResponse = {
        model: 'llama2',
        response: 'Test response',
        done: true,
      };
      const axiosResponse = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          url: 'http://localhost:11434/api/generate',
          method: 'post',
          headers: {},
          data: {},
        },
      };
      mockedAxios.post.mockResolvedValueOnce(axiosResponse);

      const options = { temperature: 0.7, max_tokens: 100 };
      await service.generate('llama2', 'Test prompt', options);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:11434/api/generate',
        {
          model: 'llama2',
          prompt: 'Test prompt',
          ...options,
        },
      );
    });
  });

  describe('listModels', () => {
    it('should successfully list available models', async () => {
      const mockModels: OllamaModel[] = [
        {
          name: 'llama2',
          size: 1000,
          digest: 'abc123',
          modified_at: '2024-01-01',
        },
      ];
      const axiosResponse = {
        data: { models: mockModels },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          url: 'http://localhost:11434/api/tags',
          method: 'get',
          headers: {},
          data: {},
        },
      };
      mockedAxios.get.mockResolvedValueOnce(axiosResponse);

      const result = await service.listModels();

      expect(result).toEqual(mockModels);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:11434/api/tags',
      );
    });

    it('should handle errors when listing models', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(service.listModels()).rejects.toThrow(
        'Failed to list models from Ollama: Network error',
      );
    });
  });

  describe('pullModel', () => {
    it('should successfully pull a model', async () => {
      const mockResponse = { status: 'success' };
      const axiosResponse = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          url: 'http://localhost:11434/api/pull',
          method: 'post',
          headers: {},
          data: {},
        },
      };
      mockedAxios.post.mockResolvedValueOnce(axiosResponse);

      const result = await service.pullModel('llama2');

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:11434/api/pull',
        {
          name: 'llama2',
        },
      );
    });

    it('should handle errors when pulling a model', async () => {
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(service.pullModel('llama2')).rejects.toThrow(
        'Failed to pull model from Ollama: Network error',
      );
    });
  });

  describe('isModelAvailable', () => {
    it('should return true when model is available', async () => {
      const mockModels: OllamaModel[] = [
        {
          name: 'llama2',
          size: 1000,
          digest: 'abc123',
          modified_at: '2024-01-01',
        },
      ];
      const axiosResponse = {
        data: { models: mockModels },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          url: 'http://localhost:11434/api/tags',
          method: 'get',
          headers: {},
          data: {},
        },
      };
      mockedAxios.get.mockResolvedValueOnce(axiosResponse);

      const result = await service.isModelAvailable('llama2');

      expect(result).toBe(true);
    });

    it('should return false when model is not available', async () => {
      const mockModels: OllamaModel[] = [
        {
          name: 'mistral',
          size: 1000,
          digest: 'abc123',
          modified_at: '2024-01-01',
        },
      ];
      const axiosResponse = {
        data: { models: mockModels },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          url: 'http://localhost:11434/api/tags',
          method: 'get',
          headers: {},
          data: {},
        },
      };
      mockedAxios.get.mockResolvedValueOnce(axiosResponse);

      const result = await service.isModelAvailable('llama2');

      expect(result).toBe(false);
    });

    it('should return false when there is an error listing models', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValueOnce(error);

      const result = await service.isModelAvailable('llama2');

      expect(result).toBe(false);
    });
  });
});
