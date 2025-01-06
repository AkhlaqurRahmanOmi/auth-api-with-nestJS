import { Module,forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '../v1/jwt/jwt.module';
import { EmployeeModule } from './employee/employee.module';
import { PrismaModule } from '../../../prisma/prisma.module';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmployerController } from './employer/employer.controller';
import { EmployerService } from './employer/employer.service';
import { CandidateModule } from './candidate/candidate.module';
import { OtpService } from './otp_verification/otp_verification.service';
import { Otp_verificationModule } from './otp_verification/otp_verification.module';

@Module({
  imports: [
    EmployeeModule,
    PrismaModule,
    CandidateModule,
    JwtModule,
    forwardRef(() => Otp_verificationModule)
  ],
  controllers: [AuthController, EmployerController],
  providers: [AuthService, EmployerService,PrismaService,OtpService],
  exports: [AuthService, JwtModule], // Export JwtModule and AuthService if used elsewhere
})
export class AuthModule {}
