import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { StructuredProductLabelingController } from './controllers/structured-product-labeling.controller';
import { DrugIndicationController } from './controllers/drug-indication.controller';
import { MappingController } from './controllers/mapping.controller';
import { AppService } from './services/app.service';
import { StructuredProductLabelingService } from './services/structured-product-labeling.service';
import { DailyMedService } from './external/dailymed.service';
import { OllamaService } from './services/ollama.service';
import { DrugIndicationService } from './services/drug-indication.service';
import { MappingService } from './services/mapping.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    StructuredProductLabelingController,
    DrugIndicationController,
    MappingController,
  ],
  providers: [
    AppService,
    StructuredProductLabelingService,
    DailyMedService,
    OllamaService,
    DrugIndicationService,
    MappingService,
  ],
})
export class AppModule {}
