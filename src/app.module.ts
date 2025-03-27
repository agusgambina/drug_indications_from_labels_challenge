import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { StructuredProductLabelingController } from './controllers/structured-product-labeling.controller';
import { AppService } from './services/app.service';
import { StructuredProductLabelingService } from './services/structured-product-labeling.service';

@Module({
  imports: [],
  controllers: [AppController, StructuredProductLabelingController],
  providers: [AppService, StructuredProductLabelingService],
})
export class AppModule {}
