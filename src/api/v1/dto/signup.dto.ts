import { IsEmail, IsOptional, IsString, MinLength, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User country', example: 'USA' })
  @IsString()
  country: string;

  @ApiProperty({ description: 'Password (min length 6)', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  @IsString()
  @MinLength(10)
  fullName: string;

  @ApiPropertyOptional({ description: 'User type ID', example: '12345' })
  @IsOptional()
  @IsString()
  userTypeId?: string;

  @ApiPropertyOptional({ description: 'Onboarding steps', example: ['step1', 'step2'] })
  @IsOptional()
  @IsArray()
  onboardingSteps?: string[];

  @ApiPropertyOptional({ description: 'Indicates if the user is enabled', example: true })
  @IsOptional()
  @IsBoolean()
  isEnable?: boolean;

  @ApiPropertyOptional({ description: 'Indicates if the user is certified', example: false })
  @IsOptional()
  @IsBoolean()
  isCertified?: boolean;
}
