import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StructuredProductLabelingController } from '../../src/controllers/structured-product-labeling.controller';
import {
  StructuredProductLabelingService,
  SPLResponse,
} from '../../src/services/structured-product-labeling.service';

describe('StructuredProductLabelingController', () => {
  let controller: StructuredProductLabelingController;
  let service: jest.Mocked<StructuredProductLabelingService>;

  beforeEach(async () => {
    const mockService = {
      findBySetId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StructuredProductLabelingController],
      providers: [
        {
          provide: StructuredProductLabelingService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<StructuredProductLabelingController>(
      StructuredProductLabelingController,
    );
    service = module.get<StructuredProductLabelingService>(
      StructuredProductLabelingService,
    ) as jest.Mocked<StructuredProductLabelingService>;
  });

  describe('getBySetId', () => {
    const mockSetId = '12345';
    const mockSPLResponse: SPLResponse = {
      data: {
        setId: mockSetId,
        title: 'Test Product',
        version: '1',
      },
    };

    it('should return product labeling data for valid setid', async () => {
      const findBySetId = jest.spyOn(service, 'findBySetId');
      findBySetId.mockResolvedValue(mockSPLResponse);

      const result = await controller.getBySetId(mockSetId);

      expect(result).toEqual(mockSPLResponse);
      expect(findBySetId).toHaveBeenCalledWith(mockSetId);
      expect(findBySetId).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when setid not found', async () => {
      const findBySetId = jest.spyOn(service, 'findBySetId');
      findBySetId.mockResolvedValue({ data: null });

      await expect(controller.getBySetId(mockSetId)).rejects.toThrow(
        NotFoundException,
      );
      expect(findBySetId).toHaveBeenCalledWith(mockSetId);
      expect(findBySetId).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException for empty setid', async () => {
      const findBySetId = jest.spyOn(service, 'findBySetId');

      await expect(controller.getBySetId('')).rejects.toThrow(
        BadRequestException,
      );
      expect(findBySetId).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for whitespace setid', async () => {
      const findBySetId = jest.spyOn(service, 'findBySetId');

      await expect(controller.getBySetId('   ')).rejects.toThrow(
        BadRequestException,
      );
      expect(findBySetId).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when service throws an error', async () => {
      const findBySetId = jest.spyOn(service, 'findBySetId');
      findBySetId.mockRejectedValue(new Error('Service error'));

      await expect(controller.getBySetId(mockSetId)).rejects.toThrow(
        BadRequestException,
      );
      expect(findBySetId).toHaveBeenCalledWith(mockSetId);
      expect(findBySetId).toHaveBeenCalledTimes(1);
    });
  });
});
