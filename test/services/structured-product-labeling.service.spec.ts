import { Test, TestingModule } from '@nestjs/testing';
import { StructuredProductLabelingService } from '../../src/services/structured-product-labeling.service';
import { NotFoundException } from '@nestjs/common';

describe('StructuredProductLabelingService', () => {
  let service: StructuredProductLabelingService;
  let fetchMock: jest.Mock;

  beforeEach(async () => {
    // Setup fetch mock
    fetchMock = jest.fn();
    global.fetch = fetchMock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [StructuredProductLabelingService],
    }).compile();

    service = module.get<StructuredProductLabelingService>(
      StructuredProductLabelingService,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findBySetId', () => {
    it('should return structured product labeling data for a given setId', async () => {
      const mockSetId = '123456';
      const mockResponse = {
        title: 'Test Medicine',
        indications: 'Test indications',
        activeIngredients: ['ingredient1', 'ingredient2'],
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.findBySetId(mockSetId);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining(mockSetId),
      );
      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle errors when the API call fails', async () => {
      const mockSetId = 'invalid-id';
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(service.findBySetId(mockSetId)).rejects.toThrow(
        NotFoundException,
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining(mockSetId),
      );
    });
  });
});
