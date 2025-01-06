import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Expose PrismaService to be used in other parts of the module
})
export class PrismaModule {}
