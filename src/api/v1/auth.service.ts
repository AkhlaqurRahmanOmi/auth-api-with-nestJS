import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaClient,Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/signup.dto'; // Ensure SignUpDto is properly created
import { JwtService } from '../v1/jwt/jwt.service';
import { LoginDto } from './dto/login.dto'; // Import JwtService
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class AuthService {
  private prisma = new PrismaClient();

  constructor(private readonly jwtService: JwtService) {
    // Optional: Validate database connection at startup
    this.checkDatabaseConnection();
  }

  // Check Database Connection
  private async checkDatabaseConnection(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('Database connection successful');
    } catch (error) {
      console.error('Database connection failed:', error);
    }
  }

  // Disconnect Prisma client on application shutdown
  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  //get all user method
  async getAllUsers(): Promise<any> {
    return await this.prisma.user.findMany();
  }


  // Sign Up Method
  async signUp(signUpDto: SignUpDto) {
    const { email, country, password, fullName, userTypeId, isEnable, isCertified } = signUpDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    let parsedUserTypeId: string = userTypeId;

    // Create the new user in the database
    const newUser = await this.prisma.user.create({
      data: {
        email,
        country,
        fullName,
        password: hashedPassword,
        userTypeId: parsedUserTypeId, // Save the userTypeId (foreign key to UserType table)
        isEnabled: isEnable ?? false,  // Default to false if not provided
        isCertified: isCertified ?? false,  // Default to false if not provided
      },
    });

    // Fetch onboarding steps related to the userType
    const onboardingStepsForUserType = await this.prisma.onboardingSteps.findFirst({
      where: {
        userTypeId: userTypeId,  // Fetch steps based on userTypeId
      },
      include: {
        StepOfOnBoarding: true,  // Include steps related to this onboarding step
      },
    });

    return {
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        country: newUser.country,
        name: newUser.fullName,
        userTypeId: newUser.userTypeId,
        onboardingSteps: onboardingStepsForUserType?.StepOfOnBoarding || [],  // Include the steps for the user type
        isEnable: newUser.isEnabled,
        isCertified: newUser.isCertified,
      },
    };
  }



  //for update the user status is verified or not
  async updateUserVerificationStatus(email: string, isEnabled: boolean): Promise<void> {
    await this.prisma.user.update({
      where: { email },
      data: { isEnabled },
    });
  }

  // Login Method
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user in the database, including userType relation
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userType: true, // Include userType relation to access the title
        onboardingSteps: true, // Include the onboarding steps
      },
    });

    // Check if user exists
    if (!existingUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if the user is enabled
    if (!existingUser.isEnabled) {
      throw new UnauthorizedException(
        'Your account is not verified. Please verify your email.'
      );
    }

    // Create JWT payload
    const payload = { email: existingUser.email, userId: existingUser.id };

    // Generate JWT token
    const token = this.jwtService.generateToken(payload);

    // Decode the token to extract the payload (optional, if needed for response)
    const decodedToken = this.jwtService.decodeToken(token);

    // Return the user data along with the token
    return {
      access_token: token,
      decodedData: decodedToken,
      userType: existingUser.userType?.title || null,
      isCertified: existingUser.isCertified,
      onboardingSteps: existingUser.onboardingSteps,
      currentStep: existingUser.currentStep,
      nextStep: existingUser.nextStep,
      isOnboardingCompleted: existingUser.isOnBoardingCompleted,
    };
  }


  // Complete Onboarding Step

  async completeOnboardingStep(userId: string): Promise<any> {
    // Find the user by ID, including the related userType and onboardingSteps
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userType: true, // Include userType to access the related OnboardingSteps
        onboardingSteps: {
          include: {
            StepOfOnBoarding: true, // Include steps related to onboarding
          },
        },
      },
    });

    if (!user || !user.onboardingSteps) {
      throw new UnauthorizedException('User not found or no onboarding steps');
    }

    // Check if the user has already completed all steps
    if (user.isOnBoardingCompleted) {
      return { message: 'Onboarding already completed' };
    }

    // Find the current step index in the onboardingSteps
    const currentStepIndex = user.onboardingSteps.StepOfOnBoarding.findIndex(
      (step) => step.type === user.currentStep
    );

    if (currentStepIndex === -1) {
      throw new Error('Current step not found');
    }

    // If there is a next step, update currentStep and nextStep
    if (currentStepIndex + 1 < user.onboardingSteps.StepOfOnBoarding.length) {
      const nextStep = user.onboardingSteps.StepOfOnBoarding[currentStepIndex + 1];
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          currentStep: nextStep?.type, // Set the next step as current
          nextStep: user.onboardingSteps.StepOfOnBoarding[currentStepIndex + 2]?.type || null, // Set next step
        },
      });
    } else {
      // If all steps are done, mark onboarding as completed
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isOnBoardingCompleted: true,
        },
      });
    }

    return { message: 'Onboarding step updated successfully' };
  }

  //update user functionality
  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new Error('User not found');
      }

      // Update user and Prisma will handle `updatedAt`
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          ...updateUserDto,
        },
      });

      return updatedUser;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Soft delete user by updating deletedAt
  async deleteUser(id: string) {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new Error('User not found');
      }

      // Soft delete by updating deletedAt field
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(), // Set current date as deletedAt
        },
      });

      return {
        message: 'User soft-deleted successfully',
        user: updatedUser,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }


  // Placeholder Method
  getHello(): string {
    return 'Hello World!';
  }
}
