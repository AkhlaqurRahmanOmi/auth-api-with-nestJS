import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import {OtpService} from './otp_verification/otp_verification.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller("api/v1")
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly otpService: OtpService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint', description: 'Returns a greeting from the server.' })
  @ApiResponse({ status: 200, description: 'Success response.' })
  getHello(): string {
    return this.authService.getHello();
  }

  //get all users
  @Get('users')
  @ApiOperation({
    summary: 'Retrieve all users',
    description: 'Fetches a list of all users in the database.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '64c8a234f1b9c824c6d66cbb' },
          email: { type: 'string', example: 'user@example.com' },
          fullName: { type: 'string', example: 'John Doe' },
          isEnabled: { type: 'boolean', example: true },
          isCertified: { type: 'boolean', example: false },
          createdAt: { type: 'string', example: '2025-01-01T12:00:00.000Z' },
          updatedAt: { type: 'string', example: '2025-01-01T12:00:00.000Z' },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async getAllUsers() {
    return this.authService.getAllUsers();
  }
  //signup method
  @Post('signUp')
  @ApiOperation({
    summary: 'Sign up a new user',
    description: 'Creates a new user account with the provided details.',
  })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiBody({ type: SignUpDto })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  //sign in method
  @Post('signIn')
  @ApiOperation({
    summary: 'Sign in an existing user',
    description: 'Authenticates a user with email and password and returns a token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated.',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid credentials.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  async login(@Body() user: { email: string; password: string }) {
    return this.authService.login(user);
  }

  //OTP generation method
  // @Post('generate')
  // @ApiOperation({
  //   summary: 'Generate and send OTP',
  //   description: 'Generates a One-Time Password (OTP) and sends it to the provided email.',
  // })
  // @ApiResponse({ status: 200, description: 'OTP sent successfully.' })
  // @ApiBody({ type: GenerateOtpDto })
  // async generateOtp(@Body() generateOtpDto: GenerateOtpDto) {
  //   console.log('Received Email:', generateOtpDto.email); // Debug log
  //   const { email }  = generateOtpDto;

  //   // Ensure the email exists in the request body
  //   if (!email) {
  //     throw new Error('Email not provided'); // Add error handling if email is missing
  //   }

  //   // Call the OtpService correctly
  //   await this.otpService.generateAndSendOtp(email);

  //   return { message: 'OTP sent successfully.' };
  // }

}
