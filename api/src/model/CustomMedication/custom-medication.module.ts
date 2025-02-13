import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomMedicationController } from './custom-medication.controller';
import { CustomMedicationService } from './custom-medication.service';
import { CustomMedication } from './custom-medication.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ClientModule } from '../Client/client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomMedication]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/prescriptions',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
    ClientModule,
  ],
  controllers: [CustomMedicationController],
  providers: [CustomMedicationService],
})
export class CustomMedicationModule {}