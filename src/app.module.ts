import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { StructuredProductLabelingController } from './controllers/structured-product-labeling.controller';
import { DrugIndicationController } from './controllers/drug-indication.controller';
import { AppService } from './services/app.service';
import { StructuredProductLabelingService } from './services/structured-product-labeling.service';
import { DailyMedService } from './external/dailymed.service';
import { OllamaService } from './services/ollama.service';
import { DrugIndicationService } from './services/drug-indication.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    StructuredProductLabelingController,
    DrugIndicationController,
  ],
  providers: [
    AppService,
    StructuredProductLabelingService,
    DailyMedService,
    OllamaService,
    DrugIndicationService,
  ],
})
export class AppModule {}
