import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { StructuredProductLabelingController } from './controllers/structured-product-labeling.controller';
import { AppService } from './services/app.service';
import { StructuredProductLabelingService } from './services/structured-product-labeling.service';
import { DailyMedService } from './external/dailymed.service';
@Module({
  imports: [],
  controllers: [AppController, StructuredProductLabelingController],
  providers: [AppService, StructuredProductLabelingService, DailyMedService],
})
export class AppModule {}
