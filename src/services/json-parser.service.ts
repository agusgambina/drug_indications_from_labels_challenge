import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class JsonParserService {
  /**
   * Parses a JSON file from the given path
   * @param filePath - The path to the JSON file
   * @returns Promise with the parsed JSON data
   * @throws Error if file cannot be read or JSON is invalid
   */
  async parseJsonFile<T>(filePath: string): Promise<T> {
    try {
      const absolutePath = path.resolve(filePath);
      const fileContent = await fs.readFile(absolutePath, 'utf-8');
      return JSON.parse(fileContent) as T;
    } catch (error: unknown) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in file ${filePath}: ${error.message}`);
      }
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        throw new Error(`File not found: ${filePath}`);
      }
      throw new Error(
        `Error parsing JSON file ${filePath}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Validates if a string is valid JSON
   * @param jsonString - The string to validate
   * @returns boolean indicating if the string is valid JSON
   */
  isValidJson(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Parses a JSON string
   * @param jsonString - The JSON string to parse
   * @returns The parsed JSON data
   * @throws Error if the string is not valid JSON
   */
  parseJsonString<T>(jsonString: string): T {
    try {
      return JSON.parse(jsonString) as T;
    } catch (error: unknown) {
      throw new Error(
        `Invalid JSON string: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
} 