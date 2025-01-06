import { Module,forwardRef } from '@nestjs/common';
import {OtpService} from './otp_verification.service';
import {OtpController} from './otp_verification.controller';
import { AuthModule } from '../auth.module';

@Module({
  imports: [Otp_verificationModule, forwardRef(() => AuthModule)],
  controllers: [OtpController],
  providers: [OtpService],
})
export class Otp_verificationModule {}
