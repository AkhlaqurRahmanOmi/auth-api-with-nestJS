import { Controller, Post, Body,Get } from '@nestjs/common';
import { OtpService } from './otp_verification.service';
import { GenerateOtpDto } from './dtos/generate-otp.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import {AuthService} from '../auth.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('api/v1/signUp/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService, private authService: AuthService) {}

  // just for testing
  //this is a get method for testing
  @Get()
  @ApiOperation({ summary: 'Health check endpoint', description: 'Returns a greeting from the server.' })
  @ApiResponse({ status: 200, description: 'Success response.' })
  getHello(): string {
    return 'Hello World!';
  }

  //OTP generation method
  @Post('generate')
  @ApiOperation({
    summary: 'Generate an OTP for email verification',
    description: 'Generates a one-time password (OTP) and sends it to the user’s email address.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'OTP sent successfully.' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email or error in sending OTP.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  async generateOtp(@Body() generateOtpDto: GenerateOtpDto) {
    const { email } = generateOtpDto;
    await this.otpService.generateAndSendOtp(email);
    return { message: 'OTP sent successfully.' };
  }

  //OTP verification method
  @Post('verify')
  @ApiOperation({
    summary: 'Verify the OTP sent to the user',
    description: 'Verifies the OTP entered by the user for email verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP successfully verified.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'OTP verified successfully.' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid OTP.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        otp: { type: 'string', example: '123456' },
      },
    },
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;
    const isVerified = await this.otpService.verifyOtp(email, otp);

    if (isVerified) {
      // Update the user's isVerified status
      await this.authService.updateUserVerificationStatus(email, true);

      return { message: 'OTP verified successfully.' };
    } else {
      return { message: 'Invalid or expired OTP.', statusCode: 400 };
    }
  }
}
