import { Body, Controller, Get, Param, Post,Put,Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import {OtpService} from './otp_verification/otp_verification.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/updateUser.dto';

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
  // Update user details
  @Put('user/:id')
  @ApiOperation({
    summary: 'Update user details',
    description: 'Update the details of an existing user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User details updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateUser(id, updateUserDto);
  }

  // Soft delete user by updating deletedAt
  @Delete('user/:id')
  @ApiOperation({
    summary: 'Soft delete a user',
    description: 'Marks a user as deleted by updating the deletedAt field.',
  })
  @ApiResponse({
    status: 200,
    description: 'User soft-deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

}
