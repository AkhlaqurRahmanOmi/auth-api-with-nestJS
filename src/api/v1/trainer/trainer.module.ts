import { Module } from '@nestjs/common';
import { TrainerController } from './trainer.controller';
import { TrainerService } from './trainer.service';

@Module({
  imports: [],
  controllers: [TrainerController],
  providers: [TrainerService],
})
export class TrainerModule {}
