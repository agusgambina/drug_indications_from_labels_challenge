import { Test, TestingModule } from '@nestjs/testing';
import { JsonParserService } from '../../src/services/json-parser.service';
import * as fs from 'fs/promises';
import * as path from 'path';

jest.mock('fs/promises');
jest.mock('path');

describe('JsonParserService', () => {
  let service: JsonParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JsonParserService],
    }).compile();

    service = module.get<JsonParserService>(JsonParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseJsonFile', () => {
    const mockFilePath = 'test.json';
    const mockAbsolutePath = '/absolute/path/test.json';
    const mockJsonContent = '{"name": "test", "value": 123}';
    const mockParsedData = { name: 'test', value: 123 };

    beforeEach(() => {
      (path.resolve as jest.Mock).mockReturnValue(mockAbsolutePath);
    });

    it('should successfully parse a valid JSON file', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(mockJsonContent);

      const result = await service.parseJsonFile<typeof mockParsedData>(mockFilePath);

      expect(result).toEqual(mockParsedData);
      expect(fs.readFile).toHaveBeenCalledWith(mockAbsolutePath, 'utf-8');
      expect(path.resolve).toHaveBeenCalledWith(mockFilePath);
    });

    it('should throw error when file is not found', async () => {
      const error = new Error('File not found');
      (error as NodeJS.ErrnoException).code = 'ENOENT';
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      await expect(service.parseJsonFile(mockFilePath)).rejects.toThrow(
        `File not found: ${mockFilePath}`,
      );
    });

    it('should throw error when JSON is invalid', async () => {
      const invalidJson = '{invalid json}';
      (fs.readFile as jest.Mock).mockResolvedValue(invalidJson);

      await expect(service.parseJsonFile(mockFilePath)).rejects.toThrow(
        `Invalid JSON in file ${mockFilePath}`,
      );
    });
  });

  describe('isValidJson', () => {
    it('should return true for valid JSON string', () => {
      const validJson = '{"name": "test", "value": 123}';
      expect(service.isValidJson(validJson)).toBe(true);
    });

    it('should return false for invalid JSON string', () => {
      const invalidJson = '{invalid json}';
      expect(service.isValidJson(invalidJson)).toBe(false);
    });

    it('should return true for valid JSON array', () => {
      const validJsonArray = '[1, 2, 3]';
      expect(service.isValidJson(validJsonArray)).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(service.isValidJson('')).toBe(false);
    });
  });

  describe('parseJsonString', () => {
    interface TestData {
      name: string;
      value: number;
    }

    it('should successfully parse a valid JSON string', () => {
      const validJson = '{"name": "test", "value": 123}';
      const expected = { name: 'test', value: 123 };

      const result = service.parseJsonString<TestData>(validJson);
      expect(result).toEqual(expected);
    });

    it('should throw error for invalid JSON string', () => {
      const invalidJson = '{invalid json}';
      expect(() => service.parseJsonString<TestData>(invalidJson)).toThrow(
        'Invalid JSON string',
      );
    });

    it('should successfully parse JSON array', () => {
      const validJsonArray = '[1, 2, 3]';
      const result = service.parseJsonString<number[]>(validJsonArray);
      expect(result).toEqual([1, 2, 3]);
    });
  });
}); 