import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { StructuredProductLabeling } from './entities/structured-product-labeling.entity';
import { dataSourceOptions } from './config/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([StructuredProductLabeling]),
  ],
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
